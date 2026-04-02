/**
 * Unit tests for lib/ollama-config.ts.
 *
 * Tests config loading, tier routing, hybrid mode, codex backend resolution,
 * and environment variable building. Uses temp directories for full isolation.
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  loadOllamaConfig, resetConfigCache, getModelForTier, getModelForSkill,
  getSkillTier, getCodexBackend, buildOllamaEnv, SKILL_TIERS,
} from '../lib/ollama-config';

let stateDir: string;
let configFile: string;

/** Write a config.yaml with the given content. */
function writeConfig(content: string): void {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(configFile, content);
}

beforeEach(() => {
  stateDir = mkdtempSync(join(tmpdir(), 'ollama-config-test-'));
  configFile = join(stateDir, 'config.yaml');
  process.env.GSTACK_STATE_DIR = stateDir;
  resetConfigCache();
});

afterEach(() => {
  rmSync(stateDir, { recursive: true, force: true });
  delete process.env.GSTACK_STATE_DIR;
  resetConfigCache();
});

// ═══════════════════════════════════════════════════════════════
// loadOllamaConfig
// ═══════════════════════════════════════════════════════════════

describe('loadOllamaConfig', () => {
  test('returns null when config file does not exist', async () => {
    expect(loadOllamaConfig()).toBeNull();
  });

  test('returns null when ollama_enabled is not true', async () => {
    writeConfig('ollama_enabled: false\n');
    expect(loadOllamaConfig()).toBeNull();
  });

  test('returns null when ollama_enabled key is missing', async () => {
    writeConfig('some_other_key: value\n');
    expect(loadOllamaConfig()).toBeNull();
  });

  test('parses full config correctly', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_base_url: http://myhost:11434',
      'ollama_tier1_model: qwen3:32b',
      'ollama_tier2_model: qwen3:14b',
      'ollama_tier3_model: qwen3:7b',
      'ollama_num_ctx: 65536',
      'ollama_thinking: true',
      'provider_mode: local',
    ].join('\n'));

    const config = loadOllamaConfig();
    expect(config).not.toBeNull();
    expect(config!.enabled).toBe(true);
    expect(config!.baseUrl).toBe('http://myhost:11434');
    expect(config!.models[1]).toBe('qwen3:32b');
    expect(config!.models[2]).toBe('qwen3:14b');
    expect(config!.models[3]).toBe('qwen3:7b');
    expect(config!.numCtx).toBe(65536);
    expect(config!.thinking).toBe(true);
    expect(config!.providerMode).toBe('local');
  });

  test('uses defaults for missing optional fields', async () => {
    writeConfig('ollama_enabled: true\n');
    const config = loadOllamaConfig();
    expect(config).not.toBeNull();
    expect(config!.baseUrl).toBe('http://localhost:11434');
    expect(config!.models[1]).toBe('qwen3:32b');
    expect(config!.models[2]).toBe('qwen3:14b');
    expect(config!.models[3]).toBe('qwen3:7b');
    expect(config!.numCtx).toBe(32768);
    expect(config!.thinking).toBe(true);
    expect(config!.providerMode).toBe('local');
  });

  test('thinking defaults to true, set to false explicitly', async () => {
    writeConfig('ollama_enabled: true\nollama_thinking: false\n');
    const config = loadOllamaConfig();
    expect(config!.thinking).toBe(false);
  });

  test('parses hybrid mode with tier arrays', async () => {
    writeConfig([
      'ollama_enabled: true',
      'provider_mode: hybrid',
      'hybrid_cloud_tiers: [1]',
      'hybrid_local_tiers: [2, 3]',
    ].join('\n'));

    const config = loadOllamaConfig();
    expect(config!.providerMode).toBe('hybrid');
    expect(config!.hybridCloudTiers).toEqual([1]);
    expect(config!.hybridLocalTiers).toEqual([2, 3]);
  });

  test('returns null for invalid provider_mode', async () => {
    writeConfig('ollama_enabled: true\nprovider_mode: invalid\n');
    expect(loadOllamaConfig()).toBeNull();
  });

  test('ignores comment lines and blank lines', async () => {
    writeConfig([
      '# This is a comment',
      '',
      'ollama_enabled: true',
      '# Another comment',
      'ollama_tier1_model: mistral:32b',
    ].join('\n'));

    const config = loadOllamaConfig();
    expect(config).not.toBeNull();
    expect(config!.models[1]).toBe('mistral:32b');
  });

  test('caches config across calls', async () => {
    writeConfig('ollama_enabled: true\n');
    const first = loadOllamaConfig();
    // Overwrite config file — should still return cached value
    writeConfig('ollama_enabled: false\n');
    const second = loadOllamaConfig();
    expect(first).toBe(second); // same object reference
  });

  test('resetConfigCache clears the cache', async () => {
    writeConfig('ollama_enabled: true\n');
    const first = loadOllamaConfig();
    expect(first).not.toBeNull();

    writeConfig('ollama_enabled: false\n');
    resetConfigCache();
    const second = loadOllamaConfig();
    expect(second).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// getModelForTier
// ═══════════════════════════════════════════════════════════════

describe('getModelForTier', () => {
  test('returns null model when Ollama not configured', async () => {
    // No config file
    const result = getModelForTier(1);
    expect(result.model).toBeNull();
    expect(result.baseUrl).toBeUndefined();
  });

  test('returns model + baseUrl in local mode', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_base_url: http://localhost:11434',
      'ollama_tier1_model: qwen3:32b',
      'provider_mode: local',
    ].join('\n'));

    const result = getModelForTier(1);
    expect(result.model).toBe('qwen3:32b');
    expect(result.baseUrl).toBe('http://localhost:11434');
  });

  test('returns correct model per tier in local mode', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_tier1_model: big:32b',
      'ollama_tier2_model: med:14b',
      'ollama_tier3_model: small:7b',
      'provider_mode: local',
    ].join('\n'));

    expect(getModelForTier(1).model).toBe('big:32b');
    expect(getModelForTier(2).model).toBe('med:14b');
    expect(getModelForTier(3).model).toBe('small:7b');
  });

  test('returns null model for cloud tiers in hybrid mode', async () => {
    writeConfig([
      'ollama_enabled: true',
      'provider_mode: hybrid',
      'hybrid_cloud_tiers: [1]',
      'hybrid_local_tiers: [2, 3]',
      'ollama_tier2_model: med:14b',
      'ollama_tier3_model: small:7b',
    ].join('\n'));


    // Tier 1 → cloud (null model)
    expect(getModelForTier(1).model).toBeNull();
    // Tier 2 → local
    expect(getModelForTier(2).model).toBe('med:14b');
    // Tier 3 → local
    expect(getModelForTier(3).model).toBe('small:7b');
  });

  test('returns null for tiers not in either hybrid list', async () => {
    writeConfig([
      'ollama_enabled: true',
      'provider_mode: hybrid',
      'hybrid_cloud_tiers: [1]',
      'hybrid_local_tiers: [3]',
    ].join('\n'));


    // Tier 2 is in neither list — defaults to cloud
    expect(getModelForTier(2).model).toBeNull();
  });

  test('returns null in cloud provider mode', async () => {
    writeConfig([
      'ollama_enabled: true',
      'provider_mode: cloud',
    ].join('\n'));

    expect(getModelForTier(1).model).toBeNull();
    expect(getModelForTier(2).model).toBeNull();
    expect(getModelForTier(3).model).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// getModelForSkill
// ═══════════════════════════════════════════════════════════════

describe('getModelForSkill', () => {
  test('maps known Tier 1 skills correctly', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_tier1_model: big:32b',
      'provider_mode: local',
    ].join('\n'));


    for (const skill of ['review', 'qa', 'ship', 'autoplan', 'plan-ceo-review']) {
      expect(getModelForSkill(skill).model).toBe('big:32b');
    }
  });

  test('maps known Tier 2 skills correctly', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_tier2_model: med:14b',
      'provider_mode: local',
    ].join('\n'));

    for (const skill of ['investigate', 'cso', 'retro', 'canary']) {
      expect(getModelForSkill(skill).model).toBe('med:14b');
    }
  });

  test('maps known Tier 3 skills correctly', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_tier3_model: small:7b',
      'provider_mode: local',
    ].join('\n'));

    for (const skill of ['browse', 'benchmark', 'freeze', 'guard', 'gstack-upgrade']) {
      expect(getModelForSkill(skill).model).toBe('small:7b');
    }
  });

  test('strips leading slash from skill names', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_tier1_model: big:32b',
      'provider_mode: local',
    ].join('\n'));

    expect(getModelForSkill('/review').model).toBe('big:32b');
    expect(getModelForSkill('/ship').model).toBe('big:32b');
  });

  test('case-insensitive skill matching', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_tier1_model: big:32b',
      'provider_mode: local',
    ].join('\n'));

    expect(getModelForSkill('REVIEW').model).toBe('big:32b');
    expect(getModelForSkill('Ship').model).toBe('big:32b');
  });

  test('unknown skills default to Tier 1', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_tier1_model: big:32b',
      'provider_mode: local',
    ].join('\n'));

    expect(getModelForSkill('unknown-skill').model).toBe('big:32b');
    expect(getModelForSkill('').model).toBe('big:32b');
  });
});

// ═══════════════════════════════════════════════════════════════
// getSkillTier
// ═══════════════════════════════════════════════════════════════

describe('getSkillTier', () => {
  test('returns correct tiers for known skills', async () => {

    expect(getSkillTier('review')).toBe(1);
    expect(getSkillTier('investigate')).toBe(2);
    expect(getSkillTier('browse')).toBe(3);
  });

  test('returns 1 for unknown skills', async () => {
    expect(getSkillTier('unknown')).toBe(1);
  });

  test('handles leading slash', async () => {
    expect(getSkillTier('/review')).toBe(1);
    expect(getSkillTier('/browse')).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════
// getCodexBackend
// ═══════════════════════════════════════════════════════════════

describe('getCodexBackend', () => {
  test('defaults to codex when no config', async () => {

    const result = getCodexBackend();
    expect(result.backend).toBe('codex');
  });

  test('defaults to codex when key is missing', async () => {
    writeConfig('ollama_enabled: true\n');

    const result = getCodexBackend();
    expect(result.backend).toBe('codex');
  });

  test('returns claude backend', async () => {
    writeConfig('codex_backend: claude\n');

    const result = getCodexBackend();
    expect(result.backend).toBe('claude');
  });

  test('returns ollama backend with model and baseUrl', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_base_url: http://myhost:11434',
      'codex_backend: ollama',
      'codex_ollama_model: deepseek:33b',
    ].join('\n'));

    const result = getCodexBackend();
    expect(result.backend).toBe('ollama');
    expect(result.model).toBe('deepseek:33b');
    expect(result.baseUrl).toBe('http://myhost:11434');
  });

  test('ollama backend falls back to tier1 model if codex_ollama_model missing', async () => {
    writeConfig([
      'ollama_enabled: true',
      'ollama_tier1_model: qwen3:32b',
      'codex_backend: ollama',
    ].join('\n'));

    const result = getCodexBackend();
    expect(result.backend).toBe('ollama');
    expect(result.model).toBe('qwen3:32b');
  });

  test('invalid backend value defaults to codex', async () => {
    writeConfig('codex_backend: gemini\n');

    const result = getCodexBackend();
    expect(result.backend).toBe('codex');
  });

  test('reads codex_backend even without ollama_enabled', async () => {
    writeConfig('codex_backend: claude\n');

    const result = getCodexBackend();
    expect(result.backend).toBe('claude');
  });
});

// ═══════════════════════════════════════════════════════════════
// buildOllamaEnv
// ═══════════════════════════════════════════════════════════════

describe('buildOllamaEnv', () => {
  test('returns unchanged env when model is null', async () => {

    const baseEnv = { PATH: '/usr/bin', HOME: '/home/user' };
    const result = buildOllamaEnv({ model: null }, baseEnv);
    expect(result.PATH).toBe('/usr/bin');
    expect(result.ANTHROPIC_BASE_URL).toBeUndefined();
  });

  test('returns unchanged env when baseUrl is undefined', async () => {
    const baseEnv = { PATH: '/usr/bin' };
    const result = buildOllamaEnv({ model: 'qwen3:32b' }, baseEnv);
    expect(result.ANTHROPIC_BASE_URL).toBeUndefined();
  });

  test('sets Ollama env vars when both model and baseUrl provided', async () => {
    const baseEnv = { PATH: '/usr/bin', EXISTING_VAR: 'keep' };
    const result = buildOllamaEnv(
      { model: 'qwen3:32b', baseUrl: 'http://localhost:11434' },
      baseEnv,
    );
    expect(result.ANTHROPIC_BASE_URL).toBe('http://localhost:11434');
    expect(result.ANTHROPIC_AUTH_TOKEN).toBe('ollama');
    expect(result.ANTHROPIC_API_KEY).toBe('');
    expect(result.PATH).toBe('/usr/bin');
    expect(result.EXISTING_VAR).toBe('keep');
  });

  test('does not mutate the input env object', async () => {
    const baseEnv = { PATH: '/usr/bin' };
    buildOllamaEnv(
      { model: 'qwen3:32b', baseUrl: 'http://localhost:11434' },
      baseEnv,
    );
    expect((baseEnv as any).ANTHROPIC_BASE_URL).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// SKILL_TIERS completeness
// ═══════════════════════════════════════════════════════════════

describe('SKILL_TIERS', () => {
  test('all known skills have a tier assigned', async () => {

    const knownSkills = [
      'review', 'qa', 'qa-only', 'ship', 'land-and-deploy', 'design-review',
      'autoplan', 'plan-ceo-review', 'plan-eng-review', 'plan-design-review',
      'design-consultation', 'office-hours', 'codex',
      'investigate', 'cso', 'retro', 'document-release', 'canary', 'setup-deploy',
      'browse', 'benchmark', 'gstack', 'setup-browser-cookies', 'connect-chrome',
      'careful', 'freeze', 'guard', 'unfreeze', 'gstack-upgrade',
    ];

    for (const skill of knownSkills) {
      expect(SKILL_TIERS[skill]).toBeDefined();
      expect([1, 2, 3]).toContain(SKILL_TIERS[skill]);
    }
  });

  test('tier values are only 1, 2, or 3', async () => {
    for (const [skill, tier] of Object.entries(SKILL_TIERS)) {
      expect([1, 2, 3]).toContain(tier);
    }
  });

  test('Tier 1 has 13 skills', async () => {
    const tier1 = Object.entries(SKILL_TIERS).filter(([, t]) => t === 1);
    expect(tier1.length).toBe(13);
  });

  test('Tier 2 has 6 skills', async () => {
    const tier2 = Object.entries(SKILL_TIERS).filter(([, t]) => t === 2);
    expect(tier2.length).toBe(6);
  });

  test('Tier 3 has 10 skills', async () => {
    const tier3 = Object.entries(SKILL_TIERS).filter(([, t]) => t === 3);
    expect(tier3.length).toBe(10);
  });
});

// ═══════════════════════════════════════════════════════════════
// parseTierArray edge cases (via hybrid config)
// ═══════════════════════════════════════════════════════════════

describe('tier array parsing edge cases', () => {
  test('handles arrays without brackets', async () => {
    writeConfig([
      'ollama_enabled: true',
      'provider_mode: hybrid',
      'hybrid_cloud_tiers: 1,2',
      'hybrid_local_tiers: 3',
    ].join('\n'));

    const config = loadOllamaConfig();
    expect(config!.hybridCloudTiers).toEqual([1, 2]);
    expect(config!.hybridLocalTiers).toEqual([3]);
  });

  test('ignores invalid tier numbers', async () => {
    writeConfig([
      'ollama_enabled: true',
      'provider_mode: hybrid',
      'hybrid_cloud_tiers: [1, 4, 5]',
      'hybrid_local_tiers: [0, 2, 3]',
    ].join('\n'));

    const config = loadOllamaConfig();
    expect(config!.hybridCloudTiers).toEqual([1]);
    expect(config!.hybridLocalTiers).toEqual([2, 3]);
  });

  test('handles empty tier arrays', async () => {
    writeConfig([
      'ollama_enabled: true',
      'provider_mode: hybrid',
    ].join('\n'));

    const config = loadOllamaConfig();
    expect(config!.hybridCloudTiers).toEqual([]);
    expect(config!.hybridLocalTiers).toEqual([]);
  });
});
