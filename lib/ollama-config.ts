/**
 * Ollama configuration reader, 3-tier model router, and codex backend resolver.
 *
 * Reads ~/.gstack/config.yaml for Ollama settings. When Ollama is enabled,
 * maps skills to model tiers (32B / 14B / 7B) and resolves the correct
 * model name + base URL for each call site.
 *
 * Supports three provider modes:
 *   - cloud:  Default. All calls use cloud providers (Claude/OpenAI). Ollama ignored.
 *   - local:  All calls use Ollama models based on tier.
 *   - hybrid: Some tiers use cloud, others use Ollama.
 *
 * Backward-compatible: when ollama_enabled is false or missing, all functions
 * return null/defaults so callers fall back to existing behavior.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// --- Types ---

export type ModelTier = 1 | 2 | 3;
export type ProviderMode = 'local' | 'hybrid' | 'cloud';

export interface OllamaConfig {
  enabled: boolean;
  baseUrl: string;
  models: Record<ModelTier, string>;
  numCtx: number;
  thinking: boolean;
  providerMode: ProviderMode;
  hybridCloudTiers: ModelTier[];
  hybridLocalTiers: ModelTier[];
}

export interface ModelResolution {
  /** Model name to use. null = use cloud defaults. */
  model: string | null;
  /** Base URL for Ollama. undefined = use cloud endpoint. */
  baseUrl?: string;
}

export interface CodexBackendConfig {
  backend: 'codex' | 'claude' | 'ollama';
  model?: string;
  baseUrl?: string;
}

// --- Skill → tier mapping ---

/**
 * Maps each skill to a cognitive complexity tier.
 *
 * Tier 1: Complex reasoning, code generation, architectural analysis.
 * Tier 2: Structured analysis, moderate reasoning, no heavy code gen.
 * Tier 3: Procedural, tool execution, simple formatting.
 */
export const SKILL_TIERS: Record<string, ModelTier> = {
  // Tier 1 — needs strong reasoning + code gen
  'review': 1,
  'qa': 1,
  'qa-only': 1,
  'ship': 1,
  'land-and-deploy': 1,
  'design-review': 1,
  'autoplan': 1,
  'plan-ceo-review': 1,
  'plan-eng-review': 1,
  'plan-design-review': 1,
  'design-consultation': 1,
  'office-hours': 1,
  'codex': 1,

  // Tier 2 — structured analysis, moderate reasoning
  'investigate': 2,
  'cso': 2,
  'retro': 2,
  'document-release': 2,
  'canary': 2,
  'setup-deploy': 2,

  // Tier 3 — procedural, tool execution
  'browse': 3,
  'benchmark': 3,
  'gstack': 3,
  'setup-browser-cookies': 3,
  'connect-chrome': 3,
  'careful': 3,
  'freeze': 3,
  'guard': 3,
  'unfreeze': 3,
  'gstack-upgrade': 3,
};

// --- Config loading ---

/** Get the config file path. Re-reads env each time for testability. */
function getConfigPath(): string {
  const stateDir = process.env.GSTACK_STATE_DIR ?? path.join(os.homedir(), '.gstack');
  return path.join(stateDir, 'config.yaml');
}

/** Simple YAML key-value parser (same flat format as gstack-config). */
function parseSimpleYaml(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    // Skip present-but-empty values (`key:` with no value). Otherwise the ''
    // is non-nullish and defeats every `kv[...] ?? default` fallback, so an
    // empty `ollama_tier2_model:` would yield model '' instead of the default.
    if (value === '') continue;
    result[key] = value;
  }
  return result;
}

/**
 * Parse a numeric config value, falling back to `fallback` when the value is
 * missing OR present-but-non-numeric. `parseInt(x ?? '32768')` alone is unsafe:
 * the `??` only guards `undefined`, so a present garbage value like `auto`
 * parses to NaN and silently violates the `numCtx: number` contract (and the
 * documented 32768 default). Same bug class as the empty-value skip in
 * parseSimpleYaml — guard the malformed case explicitly.
 */
function parseNumCtx(value: string | undefined, fallback = 32768): number {
  const parsed = parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/** Parse a YAML array value like "[1, 2]" or "1,2" into ModelTier[]. */
function parseTierArray(value: string | undefined): ModelTier[] {
  if (!value) return [];
  const cleaned = value.replace(/[\[\]]/g, '');
  return cleaned.split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => n === 1 || n === 2 || n === 3) as ModelTier[];
}

let cachedConfig: OllamaConfig | null | undefined;

/**
 * Load Ollama config from ~/.gstack/config.yaml.
 * Returns null if Ollama is not enabled or config doesn't exist.
 * Caches result for the lifetime of the process.
 */
export function loadOllamaConfig(): OllamaConfig | null {
  if (cachedConfig !== undefined) return cachedConfig;

  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf-8');
    const kv = parseSimpleYaml(raw);

    if (kv['ollama_enabled'] !== 'true') {
      cachedConfig = null;
      return null;
    }

    const providerMode = (kv['provider_mode'] ?? 'local') as ProviderMode;
    if (!['local', 'hybrid', 'cloud'].includes(providerMode)) {
      cachedConfig = null;
      return null;
    }

    cachedConfig = {
      enabled: true,
      baseUrl: kv['ollama_base_url'] ?? 'http://localhost:11434',
      models: {
        1: kv['ollama_tier1_model'] ?? 'qwen3:32b',
        2: kv['ollama_tier2_model'] ?? 'qwen3:14b',
        3: kv['ollama_tier3_model'] ?? 'qwen3:7b',
      },
      numCtx: parseNumCtx(kv['ollama_num_ctx']),
      thinking: kv['ollama_thinking'] !== 'false',
      providerMode,
      hybridCloudTiers: parseTierArray(kv['hybrid_cloud_tiers']),
      hybridLocalTiers: parseTierArray(kv['hybrid_local_tiers']),
    };
    return cachedConfig;
  } catch {
    cachedConfig = null;
    return null;
  }
}

/** Reset cached config (useful for tests). */
export function resetConfigCache(): void {
  cachedConfig = undefined;
}

// --- Model resolution ---

/**
 * Resolve model for a given tier. Returns { model, baseUrl } for Ollama,
 * or { model: null } to signal "use cloud defaults".
 */
export function getModelForTier(tier: ModelTier): ModelResolution {
  const config = loadOllamaConfig();
  if (!config) return { model: null };

  if (config.providerMode === 'cloud') return { model: null };

  if (config.providerMode === 'hybrid') {
    if (config.hybridCloudTiers.includes(tier)) return { model: null };
    if (config.hybridLocalTiers.includes(tier)) {
      return { model: config.models[tier], baseUrl: config.baseUrl };
    }
    // Tier not in either list — default to cloud
    return { model: null };
  }

  // providerMode === 'local'
  return { model: config.models[tier], baseUrl: config.baseUrl };
}

/**
 * Resolve model for a skill by name. Looks up the skill's tier,
 * then delegates to getModelForTier.
 *
 * Unknown skills default to Tier 1 (safest — use the strongest model).
 */
export function getModelForSkill(skillName: string): ModelResolution {
  const normalized = skillName.replace(/^\//, '').toLowerCase();
  const tier = resolveTier(normalized);
  return getModelForTier(tier);
}

/**
 * Map a skill OR E2E test-case name to a tier. Callers pass both: real skill
 * names ('browse', 'qa') and hyphenated test-case names ('browse-basic',
 * 'qa-quick', 'ship-local-workflow'). An exact match wins; otherwise fall back
 * to the LONGEST SKILL_TIERS key that is a dash-boundary prefix of the name, so
 * 'browse-basic' → 'browse' and 'ship-local-workflow' → 'ship'. Without this,
 * every test-case name missed the map and silently resolved to tier 1,
 * defeating the whole tier system whenever Ollama was enabled.
 */
export function resolveTier(normalized: string): ModelTier {
  const exact = SKILL_TIERS[normalized];
  if (exact !== undefined) return exact;

  let best: { key: string; tier: ModelTier } | null = null;
  for (const [key, tier] of Object.entries(SKILL_TIERS)) {
    if (normalized === key || normalized.startsWith(key + '-')) {
      if (!best || key.length > best.key.length) best = { key, tier };
    }
  }
  return best ? best.tier : 1;
}

/**
 * Get the tier for a skill name. Returns 1 for unknown skills.
 */
export function getSkillTier(skillName: string): ModelTier {
  const normalized = skillName.replace(/^\//, '').toLowerCase();
  return SKILL_TIERS[normalized] ?? 1;
}

// --- Codex backend ---

/**
 * Resolve the /codex skill backend. Reads codex_backend from config.
 * Defaults to 'codex' (original Codex CLI behavior).
 */
export function getCodexBackend(): CodexBackendConfig {
  const config = loadOllamaConfig();

  // Even without Ollama enabled, check for codex_backend config
  let kv: Record<string, string> = {};
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf-8');
    kv = parseSimpleYaml(raw);
  } catch {
    return { backend: 'codex' };
  }

  const backend = (kv['codex_backend'] ?? 'codex') as CodexBackendConfig['backend'];
  if (!['codex', 'claude', 'ollama'].includes(backend)) {
    return { backend: 'codex' };
  }

  if (backend === 'ollama') {
    const baseUrl = config?.baseUrl ?? kv['ollama_base_url'] ?? 'http://localhost:11434';
    const model = kv['codex_ollama_model'] ?? config?.models[1] ?? 'qwen3:32b';
    return { backend: 'ollama', model, baseUrl };
  }

  if (backend === 'claude') {
    return { backend: 'claude' };
  }

  return { backend: 'codex' };
}

// --- Environment helpers ---

/**
 * Build environment variables for spawning a subprocess that should use Ollama.
 * Merges with existing env. Returns unmodified env if resolution says "use cloud".
 */
export function buildOllamaEnv(
  resolution: ModelResolution,
  baseEnv: Record<string, string | undefined> = process.env,
): Record<string, string | undefined> {
  if (!resolution.model || !resolution.baseUrl) return { ...baseEnv };

  return {
    ...baseEnv,
    ANTHROPIC_BASE_URL: resolution.baseUrl,
    ANTHROPIC_AUTH_TOKEN: 'ollama',
    ANTHROPIC_API_KEY: '', // Clear to avoid accidental cloud billing
  };
}
