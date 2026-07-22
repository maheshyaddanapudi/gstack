/**
 * Regression tests for the eval CLI scripts (eval-summary, eval-list).
 *
 * The `_partial-e2e.json` snapshot written by EvalCollector.savePartial() is
 * never cleaned up — it persists in the eval dir alongside finalized runs and
 * holds a duplicate of the most recent run's data. findPreviousRun() already
 * excludes it; these tests guard that the CLI scripts do too, so it isn't
 * counted as a phantom extra run (inflating counts, totals, and averages).
 */
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execFileSync } from 'child_process';

const ROOT = path.resolve(import.meta.dir, '..');

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-cli-test-'));
});

afterEach(() => {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
});

function makeRun(overrides: Record<string, any> = {}) {
  return {
    schema_version: 1, version: '1.0.0', branch: 'main', git_sha: 'abc',
    timestamp: '2026-07-20T10:00:00.000Z', hostname: 'h', tier: 'e2e',
    total_tests: 1, passed: 1, failed: 0,
    total_cost_usd: 1.0, total_duration_ms: 10000,
    tests: [{ name: 'foo', suite: 's', tier: 'e2e', passed: true, duration_ms: 10000, cost_usd: 1.0, turns_used: 5 }],
    ...overrides,
  };
}

function runScript(script: string): string {
  return execFileSync('bun', ['run', `scripts/${script}`], {
    cwd: ROOT,
    env: { ...process.env, GSTACK_EVAL_DIR: tmpDir },
    encoding: 'utf-8',
  });
}

describe('eval CLI scripts exclude the _partial snapshot', () => {
  beforeEach(() => {
    // One finalized run + its persistent partial snapshot (same run's data).
    fs.writeFileSync(path.join(tmpDir, '1.0.0-main-e2e-20260720-100000.json'), JSON.stringify(makeRun()));
    fs.writeFileSync(path.join(tmpDir, '_partial-e2e.json'), JSON.stringify(makeRun({ timestamp: '2026-07-20T10:05:00.000Z', _partial: true })));
  });

  test('eval-summary counts one run, not two, and does not double-count cost', () => {
    const out = runScript('eval-summary.ts');
    expect(out).toContain('Total runs:        1 (1 e2e, 0 llm-judge)');
    expect(out).toContain('Total spend:       $1.00');
    expect(out).not.toContain('Total runs:        2');
  });

  test('eval-list counts one run, not two', () => {
    const out = runScript('eval-list.ts');
    expect(out).toContain('Eval History (1 total runs)');
    expect(out).not.toContain('Eval History (2 total runs)');
  });
});
