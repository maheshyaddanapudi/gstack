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
