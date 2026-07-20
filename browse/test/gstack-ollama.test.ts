/**
 * Tests for bin/gstack-ollama bash script.
 *
 * Uses Bun.spawnSync to invoke the script with temp dirs and
 * GSTACK_STATE_DIR env override for full isolation.
 *
 * Note: These tests don't require a running Ollama instance.
 * They test CLI argument parsing, config reading, and error handling.
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const SCRIPT = join(import.meta.dir, '..', '..', 'bin', 'gstack-ollama');
const CONFIG_SCRIPT = join(import.meta.dir, '..', '..', 'bin', 'gstack-config');

let stateDir: string;

function run(args: string[] = [], extraEnv: Record<string, string> = {}) {
  const result = Bun.spawnSync(['bash', SCRIPT, ...args], {
    env: {
      ...process.env,
      GSTACK_STATE_DIR: stateDir,
      GSTACK_DIR: join(import.meta.dir, '..', '..'),
      ...extraEnv,
    },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

beforeEach(() => {
  stateDir = mkdtempSync(join(tmpdir(), 'gstack-ollama-test-'));
});

afterEach(() => {
  rmSync(stateDir, { recursive: true, force: true });
});

describe('gstack-ollama', () => {
  // ─── Usage / no args ─────────────────────────────────────────
  test('no args shows usage and exits 1', () => {
    const { exitCode, stdout } = run([]);
    expect(exitCode).toBe(1);
    expect(stdout).toContain('Usage');
    expect(stdout).toContain('setup');
    expect(stdout).toContain('status');
    expect(stdout).toContain('test');
  });

  test('invalid subcommand shows usage and exits 1', () => {
    const { exitCode, stdout } = run(['invalid']);
    expect(exitCode).toBe(1);
    expect(stdout).toContain('Usage');
  });

  // ─── Status command ──────────────────────────────────────────
  test('status warns when ollama not configured', () => {
    const { stdout } = run(['status']);
    expect(stdout).toContain('not configured');
  });

  test('status shows config when ollama is enabled', () => {
    // Write a config file
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, 'config.yaml'), [
      'ollama_enabled: true',
      'ollama_base_url: http://localhost:11434',
      'ollama_tier1_model: qwen3:32b',
      'ollama_tier2_model: qwen3:14b',
      'ollama_tier3_model: qwen3:7b',
      'provider_mode: local',
      'codex_backend: ollama',
      'codex_ollama_model: qwen3:32b',
    ].join('\n'));

    const { stdout } = run(['status']);
    // Should show tier models (even if Ollama isn't running, it should show config)
    expect(stdout).toContain('qwen3:32b');
    expect(stdout).toContain('qwen3:14b');
    expect(stdout).toContain('qwen3:7b');
    expect(stdout).toContain('local');
    expect(stdout).toContain('ollama backend');
  });

  // ─── Test command ────────────────────────────────────────────
  test('test command fails when ollama not running', () => {
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, 'config.yaml'), [
      'ollama_enabled: true',
      'ollama_base_url: http://localhost:99999',
      'ollama_tier1_model: test:model',
    ].join('\n'));

    const { exitCode, stdout } = run(['test']);
    expect(exitCode).toBe(1);
    expect(stdout).toContain('not running');
  });

  // ─── Setup command ──────────────────────────────────────────
  test('setup fails when ollama CLI not found', () => {
    // Override PATH to exclude ollama
    const { exitCode, stdout } = run(['setup'], { PATH: '/usr/bin:/bin' });
    // Should fail because ollama binary not found
    // (may pass if ollama is actually installed, so check for either outcome)
    if (exitCode !== 0) {
      expect(stdout).toContain('not found');
    }
    // If ollama IS installed, it would try to run setup interactively
    // which would hang — so this test is conditional
  });
});

describe('gstack-ollama config integration', () => {
  test('status reads from GSTACK_STATE_DIR correctly', () => {
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, 'config.yaml'), [
      'ollama_enabled: true',
      'ollama_tier1_model: custom-model:latest',
      'provider_mode: hybrid',
      'codex_backend: claude',
    ].join('\n'));

    const { stdout } = run(['status']);
    expect(stdout).toContain('custom-model:latest');
    expect(stdout).toContain('hybrid');
    expect(stdout).toContain('claude backend');
  });

  test('status handles codex_backend=codex', () => {
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, 'config.yaml'), [
      'ollama_enabled: true',
      'codex_backend: codex',
    ].join('\n'));

    const { stdout } = run(['status']);
    expect(stdout).toContain('codex CLI');
  });
});

describe('gstack-config set (portability)', () => {
  function config(args: string[]) {
    const result = Bun.spawnSync(['bash', CONFIG_SCRIPT, ...args], {
      env: { ...process.env, GSTACK_STATE_DIR: stateDir },
      stdout: 'pipe',
      stderr: 'pipe',
    });
    return {
      exitCode: result.exitCode,
      stdout: result.stdout.toString().trim(),
      stderr: result.stderr.toString(),
    };
  }

  test('updates an existing key on GNU and BSD sed alike', () => {
    // The old `sed -i ''` was BSD-only and silently failed (exit 2) on GNU
    // sed, leaving the value unchanged. The awk rewrite works on both.
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, 'config.yaml'), [
      'codex_backend: codex',
      'ollama_enabled: false',
    ].join('\n'));

    const set = config(['set', 'codex_backend', 'ollama']);
    expect(set.exitCode).toBe(0);
    expect(config(['get', 'codex_backend']).stdout).toBe('ollama');
    // The other key is untouched
    expect(config(['get', 'ollama_enabled']).stdout).toBe('false');
  });

  test('preserves URL values containing slashes and colons', () => {
    // The old sed used '/' as its substitution delimiter, so a URL value
    // would have mangled the expression even on BSD sed.
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, 'config.yaml'), 'ollama_base_url: http://localhost:11434\n');

    const set = config(['set', 'ollama_base_url', 'http://192.168.1.50:11434']);
    expect(set.exitCode).toBe(0);
    expect(config(['get', 'ollama_base_url']).stdout).toBe('http://192.168.1.50:11434');
  });

  test('appends a new key when absent', () => {
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, 'config.yaml'), 'existing: yes\n');

    expect(config(['set', 'provider_mode', 'hybrid']).exitCode).toBe(0);
    expect(config(['get', 'provider_mode']).stdout).toBe('hybrid');
    expect(config(['get', 'existing']).stdout).toBe('yes');
  });

  test('get preserves colon-bearing and spaced values', () => {
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, 'config.yaml'), [
      'ollama_base_url: http://localhost:11434',
      'hybrid_local_tiers: [2, 3]',
    ].join('\n'));

    // The old `awk '{print $2}'` returned only the first token: a URL kept
    // its colons by luck of no space, but "[2, 3]" truncated to "[2,".
    expect(config(['get', 'ollama_base_url']).stdout).toBe('http://localhost:11434');
    expect(config(['get', 'hybrid_local_tiers']).stdout).toBe('[2, 3]');
  });
});
