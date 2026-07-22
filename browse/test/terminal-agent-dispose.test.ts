import { describe, test, expect } from 'bun:test';
import { disposeSession, type PtySession } from '../src/terminal-agent';

// Regression for the disposeSession SIGKILL-escalation defect.
//
// disposeSession sends SIGINT, then is supposed to escalate to SIGKILL after
// a grace window if the process is still alive. The bug: `session.proc = null`
// runs synchronously at the end of disposeSession, while the SIGKILL timer
// fires later. The original timer read `session.proc` at fire time — always
// null by then — so SIGKILL was never sent. A claude PTY that ignores SIGINT
// (blocked in a syscall / mid tool-call) leaked forever.
//
// The fix captures the proc reference in a local BEFORE nulling session.proc,
// so the escalation timer closes over the live subprocess. The grace window
// is env-overridable (GSTACK_PTY_SIGKILL_DELAY_MS) matching the module's other
// timer knobs so this test doesn't have to wait the full 3s.

function fakeProc() {
  const signals: string[] = [];
  return {
    pid: 4242,
    killed: false, // simulates a process that ignores SIGINT and stays alive
    signals,
    terminal: { close() {} },
    kill(sig: string) {
      signals.push(sig);
    },
  };
}

function sessionWith(proc: any): PtySession {
  return {
    proc,
    cols: 80,
    rows: 24,
    cookie: 'c',
    liveWs: null,
    sessionId: 's',
    spawned: true,
    pingInterval: null,
    ringBuffer: [],
    ringBufferBytes: 0,
    altScreenActive: false,
    detached: false,
    detachTimer: null,
  };
}

describe('disposeSession SIGKILL escalation', () => {
  test('escalates to SIGKILL after the grace window when SIGINT is ignored', async () => {
    process.env.GSTACK_PTY_SIGKILL_DELAY_MS = '20';
    try {
      const proc = fakeProc();
      const session = sessionWith(proc);

      disposeSession(session);

      // session.proc is nulled synchronously.
      expect(session.proc).toBeNull();
      expect(session.spawned).toBe(false);
      // SIGINT is sent immediately.
      expect(proc.signals).toContain('SIGINT');
      // SIGKILL has NOT been sent yet — it's on the grace timer.
      expect(proc.signals).not.toContain('SIGKILL');

      // Wait past the grace window.
      await new Promise((r) => setTimeout(r, 80));

      // With the defect, the timer read session.proc (null) and never sent
      // SIGKILL, so this array would still be just ['SIGINT']. With the fix,
      // the timer closes over the captured proc and force-kills it.
      expect(proc.signals).toContain('SIGKILL');
    } finally {
      delete process.env.GSTACK_PTY_SIGKILL_DELAY_MS;
    }
  });

  test('does not send SIGKILL when the process already exited (killed=true)', async () => {
    process.env.GSTACK_PTY_SIGKILL_DELAY_MS = '20';
    try {
      const proc = fakeProc();
      const session = sessionWith(proc);
      disposeSession(session);
      // Process exited on SIGINT before the grace window elapsed.
      proc.killed = true;

      await new Promise((r) => setTimeout(r, 80));

      expect(proc.signals).toContain('SIGINT');
      expect(proc.signals).not.toContain('SIGKILL');
    } finally {
      delete process.env.GSTACK_PTY_SIGKILL_DELAY_MS;
    }
  });
});
