# Graph Report - .  (2026-07-18)

## Corpus Check
- 223 files · ~414,363 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1528 nodes · 2658 edges · 124 communities (91 shown, 33 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 87 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- E2E Test Harness
- Skill Doc Generators
- Cookie Import & Picker
- Browser Manager
- CLI & Server Lifecycle
- Browse Server & Buffers
- Sidebar Agent & Ollama
- Extension Side Panel UI
- Skill Docs Generator Core
- Browse Command Registry
- Skill Lifecycle Philosophy
- Security Audit Sources
- Chrome/Conductor Design Docs
- Extension Manifest
- Package Build Scripts
- Worktree Isolation
- Diff-Based Eval Selection
- Skill Parser & Dev Tools
- Design Review Skill
- Skill Catalog Concepts
- Eval Store & Compare
- Browser Daemon Architecture
- Performance Benchmark Skill
- Console/Network Buffers
- Eng Review Patterns
- Release History
- Ref System Rationale
- Global Session Discovery
- Ollama Setup Script
- QA Skill & Taxonomy
- Builder Ethos
- Snapshot & Refs
- Autoplan Pipeline
- Cookie Import Tests
- Shared Skill Preamble
- Retro & Telemetry
- Browse QA Fixtures
- Activity Feed
- Codex Doc Helpers
- Gemini E2E Tests
- Freeze/Unfreeze Skill
- Eval Summary CLI
- Codex E2E Tests
- Codex Skill Bundles
- Ship Outside Voice
- Analytics CLI
- Eval Observability
- Completeness Principle
- Codex Skill Modes
- Design Consultation
- Skill Discovery Scripts
- Eval Watch Heartbeat
- Preamble Generators
- Headed Mode & Extension Docs
- Extension Background Worker
- Eval List CLI
- Hook Script Tests
- Package Metadata
- Ship Test Audit
- Review Checklist
- Skill Routing E2E
- QA Planted-Bug Fixtures
- Land-and-Deploy Skill
- Package Keywords
- AI Slop Detection
- Setup Script
- Eval Collector
- Bun Polyfill
- URL Validation (SSRF)
- Community Site Design
- Extension Content Script
- Extension Popup
- QA Fix Loop
- Setup-Deploy Skill
- Greptile Triage
- Telemetry Tests
- File Drop Inbox
- Conductor Dev Workflow
- GitHub 2013 Heatmap
- GitHub 2026 Heatmap
- Review Eval Enum Fixture
- Review Eval Enum Diff
- Review Eval Vuln Fixture
- Codex Release Notes
- Snapshot Fixtures
- Canary & Review Pipeline
- Extension Icon 128px
- Extension Icon 16px
- Extension Icon 48px
- Browser Dependencies
- Sidebar Agent Tests
- Browser Handoff
- Coverage Audit Generators
- Anthropic SDK Dependency
- Repo Mode Script
- Update Check Script
- Project Instructions
- RLS Verify Script
- Approval Gate Concepts
- Chrome CDP Script
- Dev Setup Script
- Dev Teardown Script
- Analytics Script
- Community Dashboard Script
- Config Script
- Diff Scope Script
- Extension Script
- Review Log Script
- Review Read Script
- Slug Script
- Telemetry Log Script
- Telemetry Sync Script
- Find-Browse Script
- Remote Slug Script
- Node Server Build
- Polyfill Tests
- Careful Hook Script
- Freeze Hook Script
- Config Shell Script
- Telemetry Types
- Global Discover Tests

## God Nodes (most connected - your core abstractions)
1. `BrowserManager` - 59 edges
2. `scripts` - 25 edges
3. `bun` - 25 edges
4. `Skill Deep Dives (docs/skills.md hub)` - 23 edges
5. `start()` - 22 edges
6. `runSkillTest()` - 22 edges
7. `/ship Skill (Fully Automated Ship Workflow)` - 22 edges
8. `handleMetaCommand()` - 20 edges
9. `/cso Skill — Chief Security Officer Audit v2` - 19 edges
10. `/design-review Skill — Audit → Fix → Verify` - 19 edges

## Surprising Connections (you probably didn't know these)
- `/careful Skill (Destructive Command Guardrails)` --semantically_similar_to--> `Canary Alert Protocol (CRITICAL/HIGH/MEDIUM/LOW + AskUserQuestion)`  [AMBIGUOUS] [semantically similar]
  careful/SKILL.md → canary/SKILL.md
- `gstack 'G' letterform icon (16x16)` --semantically_similar_to--> `browse headless browser CLI (Playwright)`  [INFERRED] [semantically similar]
  extension/icons/icon-16.png → browse/src/commands.ts
- `Test Framework Bootstrap (detect runtime, install, TESTING.md, CI)` --semantically_similar_to--> `/ship Skill — Release Engineer (test bootstrap, coverage audit, review gate)`  [INFERRED] [semantically similar]
  design-review/SKILL.md → docs/skills.md
- `Regression Test (fails without fix, passes with fix)` --semantically_similar_to--> `/qa Skill — QA Lead (diff-aware testing, regression tests)`  [INFERRED] [semantically similar]
  investigate/SKILL.md → docs/skills.md
- `Chrome DevTools MCP Integration (P0)` --semantically_similar_to--> `Real Browser Mode (connect)`  [INFERRED] [semantically similar]
  TODOS.md → BROWSER.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SKILL.md Generation Pipeline (.tmpl → gen-skill-docs → committed .md, CI-validated)** — architecture_skill_md_template_system, claude_skill_md_workflow, contributing_dual_host_development, github_workflows_skill_docs_freshness_workflow, architecture_preamble [EXTRACTED 1.00]
- **Two-Tier CI Eval Infrastructure (gate PRs, weekly periodic, Docker on Ubicloud)** — github_workflows_evals_gate_workflow, github_workflows_evals_periodic_workflow, github_workflows_ci_image_build_workflow, github_workflows_ci_image_dockerfile_ci, claude_two_tier_test_system, github_workflows_evals_ubicloud_runners [EXTRACTED 1.00]
- **Builder Ethos Injected Into Every Skill Preamble** — ethos_boil_the_lake, ethos_search_before_building, architecture_preamble, autoplan_completeness_principle, skill_preamble_block [EXTRACTED 1.00]
- **Skills generated with the shared gstack preamble (update check, telemetry, completeness intro, plan footer)** — benchmark_skill, browse_skill, canary_skill, codex_skill, browse_skill_gstack_preamble [EXTRACTED 1.00]
- **Browse integration test fixture suite exercising browse commands** — browse_test_fixtures_basic_fixture, browse_test_fixtures_cursor_interactive_fixture, browse_test_fixtures_dialog_fixture, browse_test_fixtures_empty_fixture, browse_test_fixtures_forms_fixture, browse_test_fixtures_iframe_fixture, browse_test_fixtures_network_idle_fixture, browse_test_fixtures_responsive_fixture, browse_test_fixtures_snapshot_fixture, browse_test_fixtures_spa_fixture, browse_test_fixtures_states_fixture, browse_test_fixtures_upload_fixture, browse_skill [INFERRED 0.85]
- **QA eval fixtures with 5 numbered planted bugs each (ground truth for QA evals)** — browse_test_fixtures_qa_eval_fixture, browse_test_fixtures_qa_eval_spa_fixture, browse_test_fixtures_qa_eval_checkout_fixture, browse_test_fixtures_qa_eval_planted_bugs [EXTRACTED 1.00]
- **Plan Review Pipeline (office-hours → CEO → eng → design, tracked by readiness dashboard)** — office_hours_skill, plan_ceo_review_skill, docs_skills_plan_eng_review_skill, plan_design_review_skill, docs_skills_review_readiness_dashboard [EXTRACTED 0.95]
- **Headed Chrome + Side Panel System (browse connect, extension UI, Conductor integration designs)** — connect_chrome_skill, extension_sidepanel_extension_side_panel, extension_popup_extension_popup, docs_designs_chrome_vs_chromium_exploration_doc, docs_designs_conductor_chrome_sidebar_integration_doc, docs_designs_conductor_session_api_doc [EXTRACTED 0.90]
- **Cross-Model Outside Voices Pattern (Codex + Claude subagent second opinions)** — design_consultation_outside_voices, design_review_outside_voices, plan_design_review_outside_voices, office_hours_codex_cold_read, docs_skills_codex_skill [EXTRACTED 0.85]
- **Fix-First Review Pipeline (AUTO-FIX vs ASK across review surfaces)** — review_checklist_fix_first_heuristic, review_skill, ship_skill, review_design_checklist_doc, review_greptile_triage_doc [EXTRACTED 0.95]
- **Review Readiness Dashboard Flow (skills write gstack-review-log JSONL; /ship gates on it)** — plan_eng_review_gstack_review_log, plan_eng_review_review_readiness_dashboard, plan_eng_review_skill, review_skill, ship_skill [EXTRACTED 0.95]
- **QA Testing Ecosystem (taxonomy + template + test-plan artifacts feed /qa and /qa-only)** — qa_skill, qa_only_skill, qa_references_issue_taxonomy_doc, qa_templates_qa_report_template_doc, plan_eng_review_test_plan_artifact [EXTRACTED 0.90]

## Communities (124 total, 33 thin omitted)

### Community 0 - "E2E Test Harness"
Cohesion: 0.07
Nodes (62): FIXTURES_DIR, startTestServer(), getModelForSkill(), createCoverageAuditFixture(), browseBin, copyDirSync(), createEvalCollector(), createTestWorktree() (+54 more)

### Community 1 - "Skill Doc Generators"
Cohesion: 0.06
Nodes (55): generateBrowseSetup(), generateCommandReference(), generateSnapshotFlags(), AI_SLOP_BLACKLIST, OPENAI_HARD_REJECTIONS, OPENAI_LITMUS_CHECKS, generateDesignHardRules(), generateDesignMethodology() (+47 more)

### Community 2 - "Cookie Import & Picker"
Cohesion: 0.08
Nodes (44): BROWSER_REGISTRY, BrowserInfo, BrowserMatch, BrowserPlatform, chromiumEpochToUnix(), chromiumNow(), CookieImportError, decryptCookieValue() (+36 more)

### Community 4 - "CLI & Server Lifecycle"
Cohesion: 0.10
Nodes (32): acquireServerLock(), cleanupLegacyState(), config, ensureServer(), isProcessAlive(), isServerHealthy(), killServer(), main() (+24 more)

### Community 5 - "Browse Server & Buffers"
Cohesion: 0.08
Nodes (39): getSubscriberCount(), LogEntry, NetworkEntry, addChatEntry(), AUTH_TOKEN, BROWSE_BIN, BROWSE_PORT, browserManager (+31 more)

### Community 6 - "Sidebar Agent & Ollama"
Cohesion: 0.12
Nodes (29): askClaude(), countLines(), getGitRoot(), handleStreamEvent(), main(), poll(), QUEUE, readLine() (+21 more)

### Community 7 - "Extension Side Panel UI"
Cohesion: 0.11
Nodes (31): addChatEntry(), addEntry(), authHeaders(), chatMessages, closeDebug, commandHistory, commandInput, connectSSE() (+23 more)

### Community 8 - "Skill Docs Generator Core"
Cohesion: 0.06
Nodes (10): AI_SLOP_BLACKLIST, CoverageAuditMode, DRY_RUN, HOST, HOST_ARG, OPENAI_HARD_REJECTIONS, OPENAI_LITMUS_CHECKS, NOTE: design-checklist.md is a subset of this methodology for code-level detecti (+2 more)

### Community 9 - "Browse Command Registry"
Cohesion: 0.17
Nodes (20): BrowserState, META_COMMANDS, READ_COMMANDS, WRITE_COMMANDS, handleMetaCommand(), SAFE_DIRECTORIES, tokenizePipeSegment(), validateOutputPath() (+12 more)

### Community 10 - "Skill Lifecycle Philosophy"
Cohesion: 0.08
Nodes (28): /codex Skill — Multi-AI Second Opinion (review/challenge/consult), Cross-Model Analysis (overlap = high confidence, unique = blind spots), Full Lifecycle: office-hours → plan → implement → review → QA → ship → retro, Eureka Moment Logging (eureka.jsonl), Search Before Building / Three-Layer Synthesis (ETHOS.md), Mandatory Alternatives Generation (minimal viable / ideal / lateral), Anti-Sycophancy Rules + Pushback Patterns, Builder Mode — Enthusiastic Design Partner (+20 more)

### Community 11 - "Security Audit Sources"
Cohesion: 0.09
Nodes (27): afiqiqmal/claude-security-audit (AI/LLM checks, framework detection), Anthropic Claude Code Security (multi-stage verification, 500+ zero-days), @gus_aragon v1 Critique (stack detection, Grep mandate, head truncation), Daniel Miessler Personal AI Infrastructure (IR playbooks), Sentry Security Review (confidence-based reporting), Shannon by Keygraph (autonomous AI pentester, XBOW 96.15%), Snyk ToxicSkills Research (36% flawed, 13.4% malicious skills), Trail of Bits Skills (audit context building, variant analysis) (+19 more)

### Community 12 - "Chrome/Conductor Design Docs"
Cohesion: 0.12
Nodes (25): Sidebar Chat Gated Behind --chat Flag, Sidebar→Workspace Data Bridge (.context/sidebar-inbox, $B inbox), Rationale: real Chrome blocks --load-extension via Playwright (security feature), Original CDP Vision (connect to user's real Chrome), Rename + Dead Code Removal (connectCDP→launchHeaded, chrome-launcher.ts deleted), Need 1: Subscribe to Session Events (SSE/WebSocket), Need 2: Send Messages into Session from Sidebar, Sidebar as Window into Conductor Session (one agent, two views) (+17 more)

### Community 13 - "Extension Manifest"
Cohesion: 0.08
Nodes (24): action, default_icon, background, service_worker, content_scripts, 128, 16, 48 (+16 more)

### Community 14 - "Package Build Scripts"
Cohesion: 0.08
Nodes (25): scripts, analytics, build, dev, dev:skill, eval:compare, eval:list, eval:select (+17 more)

### Community 15 - "Worktree Isolation"
Cohesion: 0.13
Nodes (11): copyDirSync(), DedupIndex, getDedupPath(), git(), HarvestResult, loadDedupIndex(), saveDedupIndex(), WorktreeInfo (+3 more)

### Community 16 - "Diff-Based Eval Selection"
Cohesion: 0.15
Nodes (17): args, baseIdx, changedFiles, e2eSelection, jsonMode, llmSelection, ROOT, detectBaseBranch() (+9 more)

### Community 17 - "Skill Parser & Dev Tools"
Cohesion: 0.14
Nodes (16): ALL_COMMANDS, allCmds, COMMAND_DESCRIPTIONS, descKeys, regenerateAndValidate(), ROOT, SOURCE_FILES, TEMPLATES (+8 more)

### Community 18 - "Design Review Skill"
Cohesion: 0.10
Nodes (22): AI Slop Blacklist (10 anti-patterns), 80-Item Design Audit Checklist (10 categories), Dual Headline Scores (Design Score + AI Slop Score A-F), First Impression Structured Critique, Fix Loop (locate → minimal fix → atomic commit → re-verify), Design Hard Rules (marketing/app classifier, hard rejections, litmus checks), Design Outside Voices (Codex + subagent, design-review), design-baseline.json Regression Mode (+14 more)

### Community 19 - "Skill Catalog Concepts"
Cohesion: 0.14
Nodes (22): /careful Skill — Destructive Command Warnings (PreToolUse hook), Rationale: diagrams force hidden assumptions into the open, Greptile Integration (triage: valid / already-fixed / false positive, FP history), /plan-eng-review Skill — Eng Manager Mode (architecture, diagrams, tests), /qa Skill — QA Lead (diff-aware testing, regression tests), /retro Skill — Team-Aware Weekly Retro, Review Readiness Dashboard (per-review runs/status, Eng Review required gate), /review Skill — Paranoid Staff Engineer (fix-first, completeness gaps) (+14 more)

### Community 20 - "Eval Store & Compare"
Cohesion: 0.16
Nodes (18): afterResult, args, beforeResult, comparison, EVAL_DIR, compareEvalResults(), ComparisonResult, DEFAULT_EVAL_DIR (+10 more)

### Community 21 - "Browser Daemon Architecture"
Cohesion: 0.12
Nodes (20): Bearer Token Authentication, Persistent Browser Daemon Model, Command Dispatch (READ/WRITE/META), Cookie Security Design, Crash Recovery (Exit, Don't Self-Heal), Why Not a Browser Per Command, Errors for AI Agents Philosophy, Intentional Omissions (No MCP, No WebSocket) (+12 more)

### Community 22 - "Performance Benchmark Skill"
Cohesion: 0.14
Nodes (18): Rationale: Bundle Size Is the Leading Indicator (deterministic vs network-variable load time), Core Web Vitals Metrics (TTFB/FCP/LCP), Performance Baseline Capture (baseline.json), Performance Budget Check (industry budgets + grade), Regression Thresholds (timing >50%/500ms, bundle >25%), Rationale: Relative Thresholds Not Absolute (compare against YOUR baseline), /benchmark Skill (Performance Regression Detection), Performance Trend Analysis (--trend historical view) (+10 more)

### Community 23 - "Console/Network Buffers"
Cohesion: 0.22
Nodes (8): addConsoleEntry(), addDialogEntry(), addNetworkEntry(), CircularBuffer, consoleBuffer, dialogBuffer, DialogEntry, networkBuffer

### Community 24 - "Eng Review Patterns"
Cohesion: 0.13
Nodes (18): ASCII Diagrams in Plans and Code Comments, AskUserQuestion Format (Re-ground/Simplify/Recommend/Options), Cognitive Patterns — How Great Eng Managers Think, Completeness Principle — Boil the Lake, Completion Status Protocol (DONE/BLOCKED/escalation), Contributor Mode (field reports), Rationale: stale diagrams are worse than no diagrams — they actively mislead, Engineering Management Canon (Larson, McKinley, Fowler, Brooks, Google SRE, Team Topologies, Beck, Majors) (+10 more)

### Community 25 - "Release History"
Cohesion: 0.17
Nodes (17): actionlint Runner Labels (Root Config), v0.11.10.0 CI Evals on Ubicloud, v0.11.0.0 /cso Zero-Noise Security Audits, gstack Release History, v0.11.16.0 Gate/Periodic CI + Telemetry Security, v0.12.3.0 Voice Directive, CHANGELOG + VERSION Branch-Scoped Style, Two-Tier Test System (Gate/Periodic) (+9 more)

### Community 26 - "Ref System Rationale"
Cohesion: 0.14
Nodes (17): Why Bun (Compiled Binary + Native SQLite), Cursor-Interactive Refs (@c), Why Locators, Not DOM Mutation, Ref Staleness Detection (count() Check), Ref System (@e/@c Element Refs), Rationale: Bad Work Is Worse Than No Work, Escalation Protocol (stop after 3 attempts), browse CLI (Compiled Binary) (+9 more)

### Community 27 - "Global Session Discovery"
Cohesion: 0.21
Nodes (16): DiscoveryResult, extractCwdFromJsonl(), getGitRemote(), isGitRepo(), main(), normalizeRemoteUrl(), parseArgs(), printUsage() (+8 more)

### Community 28 - "Ollama Setup Script"
Cohesion: 0.28
Nodes (13): gstack-ollama script, check_ollama_running(), cmd_setup(), cmd_status(), cmd_test(), config_set(), fail(), info() (+5 more)

### Community 29 - "QA Skill & Taxonomy"
Cohesion: 0.20
Nodes (17): Test Plan Artifact (~/.gstack/projects/{slug}/*-test-plan-*.md), QA baseline.json Regression Mode, Browse Binary ($B headless browser CLI), CDP Mode (browse connected to real browser), QA Diff-Aware Mode (branch diff → affected pages), QA Health Score Rubric (weighted category scores), Rationale: report-only separation — never fix, never read source; use /qa for the fix loop, /qa-only Skill (Report-Only QA) (+9 more)

### Community 30 - "Builder Ethos"
Cohesion: 0.15
Nodes (16): Completeness Principle Block (in Autoplan), v0.9.5.0 Builder Ethos Release, AI Effort Compression Table, Search Before Building Rule, Contributor Mode (Self-Improving Field Reports), Boil the Lake (Completeness Principle), Boil the Ocean Essay (garryslist.org), The Eureka Moment (+8 more)

### Community 31 - "Snapshot & Refs"
Cohesion: 0.17
Nodes (13): RefEntry, handleSnapshot(), INTERACTIVE_ROLES, ParsedNode, parseLine(), parseSnapshotArgs(), SNAPSHOT_FLAGS, SnapshotOptions (+5 more)

### Community 32 - "Autoplan Pipeline"
Cohesion: 0.17
Nodes (15): Skill Catalog for AI Agents, The 6 Decision Principles, /autoplan Auto-Review Pipeline, Intake + Restore Point (Phase 0), Sequential Phase Execution (Mandatory), v0.10.0.0 Autoplan Release, /office-hours Skill, /plan-ceo-review Skill (+7 more)

### Community 33 - "Cookie Import Tests"
Cohesion: 0.19
Nodes (12): chromiumEpoch(), createFixtureDb(), createLinuxFixtureDb(), createMacFixtureDb(), encryptCookieValue(), FIXTURE_DB, FIXTURE_DIR, IV (+4 more)

### Community 34 - "Shared Skill Preamble"
Cohesion: 0.13
Nodes (15): AskUserQuestion Format (re-ground, simplify, recommend, options), Completeness Principle — Boil the Lake, Completion Status Protocol (DONE/BLOCKED/NEEDS_CONTEXT + escalation), Contributor Mode Field Reports, Repo Ownership Mode (solo vs collaborative), Shared Skill Preamble (update check, sessions, telemetry prompts), Telemetry Protocol (gstack-telemetry-log, community/anonymous/off), Inline Upgrade Flow (referenced by all skill preambles) (+7 more)

### Community 35 - "Retro & Telemetry"
Cohesion: 0.14
Nodes (15): GStack Shared Preamble (update check, sessions, telemetry, proactive), REPO_MODE Repo Ownership (solo vs collaborative), Telemetry Logging (gstack-telemetry-log), /retro global — Cross-Project Retro (all AI tools), gstack-global-discover (AI session discovery script), Retro History Snapshots (.context/retros/*.json, ~/.gstack/retros/), Work Session Detection (45-min gap threshold), /retro Skill (Weekly Engineering Retrospective) (+7 more)

### Community 36 - "Browse QA Fixtures"
Cohesion: 0.14
Nodes (14): Dialog Handling (dialog-accept/dismiss), Element State Assertions (is visible/enabled/checked/...), File Upload Command, Iframe Context Switching (frame command), Responsive Testing (mobile/tablet/desktop screenshots), /browse Skill (QA Testing & Dogfooding), Basic Test Fixture (nav, headings, hidden text), Dialog Fixture (alert/confirm/prompt buttons) (+6 more)

### Community 37 - "Activity Feed"
Cohesion: 0.23
Nodes (11): activityBuffer, ActivityEntry, ActivitySubscriber, emitActivity(), filterArgs(), getActivityAfter(), getActivityHistory(), SENSITIVE_COMMANDS (+3 more)

### Community 38 - "Codex Doc Helpers"
Cohesion: 0.23
Nodes (13): codexSkillName(), condenseOpenAIShortDescription(), extractHookSafetyProse(), extractNameAndDescription(), generateOpenAIYaml(), processTemplate(), transformFrontmatter(), codexSkillName() (+5 more)

### Community 39 - "Gemini E2E Tests"
Cohesion: 0.19
Nodes (8): GEMINI_AVAILABLE, GEMINI_E2E_TOUCHFILES, ROOT, GeminiResult, ParsedGeminiJSONL, parseGeminiJSONL(), runGeminiSkill(), FIXTURE_LINES

### Community 40 - "Freeze/Unfreeze Skill"
Cohesion: 0.19
Nodes (13): /unfreeze Skill — Remove Freeze Boundary, Rationale: accident prevention, not a security boundary (Bash/sed bypass), check-freeze.sh PreToolUse Hook (Edit/Write deny), /freeze Skill — Restrict Edits to a Directory, Freeze Boundary State File (~/.gstack/freeze-dir.txt, trailing slash), Hypothesis Testing with Sanitized External Search, Iron Law: No Fixes Without Root Cause Investigation, Known Bug Pattern Table (race, nil, cache, config drift) (+5 more)

### Community 41 - "Eval Summary CLI"
Cohesion: 0.15
Nodes (12): branchStats, detectionRates, e2eRuns, e2eTurns, EVAL_DIR, flakyTests, judgeRuns, results (+4 more)

### Community 42 - "Codex E2E Tests"
Cohesion: 0.23
Nodes (8): CODEX_AVAILABLE, CODEX_E2E_TOUCHFILES, ROOT, CodexResult, installSkillToTempHome(), parseCodexJSONL(), ParsedCodexJSONL, runCodexSkill()

### Community 43 - "Codex Skill Bundles"
Cohesion: 0.20
Nodes (12): Codex Host Conventions, Codex Skill Bundle Interface (agents/openai.yaml), Why Committed, Not Generated at Runtime, Universal Skill Preamble ({{PREAMBLE}}), SKILL.md Template System, Platform + Base Branch Detection (Step 0), v0.11.20.0 GitLab Support, SKILL.md Generation Workflow (.tmpl) (+4 more)

### Community 44 - "Ship Outside Voice"
Cohesion: 0.20
Nodes (12): Outside Voice — Independent Cross-Model Plan Challenge, Rationale: two AI models agreeing is stronger signal than one model's thorough review, Adversarial Review (auto-scaled by diff size), Codex CLI (OpenAI second-opinion reviewer), Cross-Model Synthesis (Claude + Codex findings merge), Bisectable Commit Splitting, Rationale: small logical commits serve git bisect and help LLMs understand what changed; each commit independently valid, CHANGELOG Auto-Generation (commit checklist cross-check) (+4 more)

### Community 45 - "Analytics CLI"
Cohesion: 0.32
Nodes (9): ANALYTICS_FILE, AnalyticsEvent, filterByPeriod(), formatReport(), main(), parseJSONL(), runScript(), SCRIPT (+1 more)

### Community 46 - "Eval Observability"
Cohesion: 0.22
Nodes (11): Eval Persistence (EvalCollector), E2E Observability Data Flow, E2E Session Runner (claude -p), Three-Tier Test System, v0.11.13.0 Worktree Isolation, Diff-Based Test Selection (Touchfiles), E2E Eval Failure Blame Protocol, E2E Observability Artifacts (~/.gstack-dev) (+3 more)

### Community 47 - "Completeness Principle"
Cohesion: 0.18
Nodes (11): Boil the Lake / Completeness Principle, Boil the Ocean Essay (garryslist.org), Contributor Mode (field reports), gstack-config CLI (telemetry/proactive/contributor settings), gstack Shared Skill Preamble, Proactive Skill Suggestion Mode, gstack Telemetry (consent modes + gstack-telemetry-log), Destructive Command Patterns (rm -rf, DROP TABLE, force-push, kubectl delete) (+3 more)

### Community 48 - "Codex Skill Modes"
Cohesion: 0.20
Nodes (11): Step 0: Platform + Base Branch Detection (GitHub/GitLab/git-native), Codex Challenge Mode (adversarial: edge cases, races, security holes), OpenAI Codex CLI (external binary, ChatGPT auth), Codex Consult Mode (ask anything, plan review), Rationale: Embed Plan Content, Don't Reference Path (sandbox cannot read ~/.claude/plans), Codex JSONL Streaming Parser (reasoning traces, tool calls, token usage), OpenAI Codex Issues #8545, #8402, #6931 (xhigh hangs), Per-Mode Reasoning Effort Defaults (high/high/medium, --xhigh override) (+3 more)

### Community 49 - "Design Consultation"
Cohesion: 0.20
Nodes (11): browse Binary ($B) Setup Check, Rationale: coherence is table stakes; risks make products memorable, Coherence Validation (nudge, never block), DESIGN.md — Project Design Source of Truth, Font Blacklist + Overused Fonts List, Design Outside Voices (Codex + Claude subagent, design-consultation), HTML Preview Page with Realistic Product Mockups, SAFE/RISK Breakdown (category literacy vs deliberate creative risks) (+3 more)

### Community 50 - "Skill Discovery Scripts"
Cohesion: 0.27
Nodes (9): discoverSkillFiles(), discoverTemplates(), SKIP, subdirs(), findTemplates(), AGENTS_DIR, ROOT, SKILL_FILES (+1 more)

### Community 51 - "Eval Watch Heartbeat"
Cohesion: 0.25
Nodes (7): formatDuration(), GSTACK_DEV_DIR, HEARTBEAT_PATH, HeartbeatData, PARTIAL_PATH, PartialData, renderDashboard()

### Community 52 - "Preamble Generators"
Cohesion: 0.18
Nodes (11): generateAskUserFormat(), generateCompletenessSection(), generateCompletionStatus(), generateContributorMode(), generateLakeIntro(), generatePreamble(), generatePreambleBash(), generateRepoModeSection() (+3 more)

### Community 53 - "Headed Mode & Extension Docs"
Cohesion: 0.27
Nodes (10): Chrome Extension (Side Panel), Real Browser Mode (connect), Sidebar Agent (Chat-Driven Child Claude), User Handoff (handoff/resume), v0.12.0.0 Headed Mode + Sidebar Agent, Build for Yourself, Garry Tan (Author, YC President), gstack (AI Engineering Workflow) (+2 more)

### Community 54 - "Extension Background Worker"
Cohesion: 0.36
Nodes (7): checkHealth(), executeCommand(), fetchAndRelayRefs(), getBaseUrl(), notifyContentScripts(), setConnected(), setDisconnected()

### Community 55 - "Eval List CLI"
Cohesion: 0.20
Nodes (9): args, displayed, EVAL_DIR, runs, RunSummary, totalCost, totalDur, totalTurns (+1 more)

### Community 56 - "Hook Script Tests"
Cohesion: 0.24
Nodes (6): CAREFUL_SCRIPT, carefulInput(), detectSafeRmWorks(), FREEZE_SCRIPT, ROOT, runHook()

### Community 57 - "Package Metadata"
Cohesion: 0.22
Nodes (8): bin, browse, description, engines, license, name, type, version

### Community 58 - "Ship Test Audit"
Cohesion: 0.25
Nodes (9): E2E Test Decision Matrix (unit vs E2E vs eval), ASCII Test Coverage Diagram (code paths + user flows), Coverage Warning (below-minimum threshold flag), Documentation Staleness Check, Plan Completion Audit (DONE/PARTIAL/NOT DONE/CHANGED), Scope Drift Detection (intent vs delivered), /review Skill (Pre-Landing PR Review), Coverage Gate (minimum/target thresholds with user override) (+1 more)

### Community 59 - "Review Checklist"
Cohesion: 0.22
Nodes (9): Pre-Landing Review Checklist, Enum & Value Completeness (read consumers outside the diff), Fix-First Heuristic (AUTO-FIX vs ASK), Rationale: mechanical fixes a senior engineer would apply without discussion → AUTO-FIX; anything reasonable engineers could disagree on → ASK, LLM Output Trust Boundary, Race Conditions & Concurrency Checks, SQL & Data Safety (Pass 1 critical), Review Suppressions (DO NOT flag list) (+1 more)

### Community 60 - "Skill Routing E2E"
Cohesion: 0.28
Nodes (5): createRoutingWorkDir(), initGitRepo(), installSkills(), ROOT, runId

### Community 61 - "QA Planted-Bug Fixtures"
Cohesion: 0.25
Nodes (8): Console Inspection (console --errors), Core QA Patterns (verify load, test flow, diff after action), Forms Fixture (login + profile forms), QA Eval Checkout Fixture (5 planted bugs: regex, NaN total, maxlength, required, undefined stripe), QA Eval Widget Dashboard Fixture (5 planted bugs: 404 link, disabled submit, overflow, missing alt, console error), Planted-Bug Ground Truth Pattern (numbered BUG comments for QA evals), QA Eval SPA Store Fixture (5 planted bugs: broken route, stale cart, async race, aria-current, listener leak), SPA Fixture (delayed JS render, console log/warn/error)

### Community 62 - "Land-and-Deploy Skill"
Cohesion: 0.25
Nodes (8): Deploy Report + JSONL Timing Log (.gstack/deploy-reports), First-Run Dry-Run Validation (infra detection, config fingerprint), Merge Queue Detection and Polling, Deploy Platform Detection (fly/render/vercel/netlify/heroku/railway), Revert Flow (git revert, revert PR under branch protections), /land-and-deploy Skill — Merge, Deploy, Verify, Staging-First Option (verify staging before production), Rationale: first run = teacher mode, builds trust through transparency

### Community 63 - "Package Keywords"
Cohesion: 0.25
Nodes (8): keywords, ai-agent, automation, browser, claude, cli, devtools, headless

### Community 64 - "AI Slop Detection"
Cohesion: 0.32
Nodes (8): AI Slop Detection (purple gradients, 3-column grids, centered everything), Rationale: telltale signs of AI-generated UI no designer at a respected studio would ship, Detection Confidence Tiers (HIGH/MEDIUM/LOW), DESIGN.md Calibration (project design system overrides universal rules), DESIGN_METHODOLOGY / generateDesignMethodology() in scripts/gen-skill-docs.ts, Design Review Checklist (Lite), Design Review Lite (diff-scoped, gstack-diff-scope gated), Design-Slop Planted-Bug Fixture (review eval HTML)

### Community 65 - "Setup Script"
Cohesion: 0.46
Nodes (7): setup script, create_agents_sidecar(), create_codex_runtime_root(), ensure_playwright_browser(), link_claude_skill_dirs(), link_codex_skill_dirs(), migrate_direct_codex_install()

### Community 66 - "Eval Collector"
Cohesion: 0.39
Nodes (3): EvalCollector, getGitInfo(), getVersion()

### Community 68 - "URL Validation (SSRF)"
Cohesion: 0.62
Nodes (5): BLOCKED_METADATA_HOSTS, isMetadataIp(), normalizeHostname(), resolvesToBlockedIp(), validateNavigationUrl()

### Community 69 - "Community Site Design"
Cohesion: 0.33
Nodes (7): Amber Accent Color System, Design Decisions Log, gstack Community Site Design System, Grain Texture Overlay, Industrial/Utilitarian Aesthetic, Typography (Satoshi, DM Sans, JetBrains Mono), /design-consultation Skill

### Community 70 - "Extension Content Script"
Cohesion: 0.48
Nodes (4): clearOverlays(), ensureContainer(), renderRefBadges(), renderRefPanel()

### Community 71 - "Extension Popup"
Cohesion: 0.29
Nodes (5): details, dot, portInput, sidePanelBtn, statusText

### Community 72 - "QA Fix Loop"
Cohesion: 0.29
Nodes (7): Regression Iron Rule (mandatory regression tests), QA Fix Loop (locate → fix → atomic commit → re-verify), QA Regression Test Generation (Phase 8e.5), WTF-Likelihood Self-Regulation Heuristic, Rationale: stop runaway fix loops — reverts and unrelated file touches signal loss of control, Verification Gate (Iron Law: no completion claims without fresh evidence), Rationale: claiming work complete without verification is dishonesty, not efficiency — confidence is not evidence

### Community 73 - "Setup-Deploy Skill"
Cohesion: 0.33
Nodes (7): Test Framework Bootstrap (detect runtime, install, TESTING.md, CI), CLAUDE.md as Project Config Source of Truth, Deploy Configuration Section in CLAUDE.md, /land-and-deploy Skill (consumer of deploy config), Deploy Platform Detection (Fly/Render/Vercel/Netlify/Heroku/Railway), /setup-deploy Skill (one-time deploy config), Eval Suites Gate (mandatory on prompt-file changes, EVAL_JUDGE_TIER=full)

### Community 74 - "Greptile Triage"
Cohesion: 0.33
Nodes (7): Greptile Signal Metric (catch vs false-positive ratio), Greptile Comment Triage Reference, Escalation Detection (prior GStack reply → Tier 2), greptile-apps[bot] (external PR review bot), Greptile History Files (per-project + global greptile-history.md), Greptile Reply Templates (Tier 1 friendly / Tier 2 firm, evidence required), Severity Assessment & Re-ranking

### Community 75 - "Telemetry Tests"
Cohesion: 0.38
Nodes (6): BIN, parseJsonl(), readJsonl(), ROOT, run(), setConfig()

### Community 77 - "Conductor Dev Workflow"
Cohesion: 0.33
Nodes (6): Vendored Symlink Awareness, Conductor Workspace Integration, Dev Mode (Symlinked Working Tree), Community PR Wave Triage Process, Conductor (conductor.build), 10-15 Parallel Sprints

### Community 78 - "GitHub 2013 Heatmap"
Cohesion: 0.40
Nodes (6): Trend: dense activity Jan-Aug (peaks Feb-May), sparse Sep-Dec, Calendar heatmap visualization (7-row weekday grid, 12-month columns), GitHub 2013 Contribution Graph (UI screenshot), Contribution settings dropdown control, Metric: 772 contributions in 2013, Less-to-More 5-step green intensity legend

### Community 79 - "GitHub 2026 Heatmap"
Cohesion: 0.40
Nodes (6): Activity burst: near-empty Mar-Dec, dense green Jan-Mar 2026, AI effort compression (CLAUDE.md): output velocity from CC+gstack workflow, 1,237 contributions in the last year, GitHub contribution heatmap screenshot (2026), ETHOS.md builder philosophy (Boil the Lake) — sustained shipping cadence, Less-to-More green intensity legend (5 levels)

### Community 83 - "Codex Release Notes"
Cohesion: 0.50
Nodes (5): Dual Voices (Codex + Claude Subagent), v0.12.5.0 Codex Hang Fixes, v0.11.5.2 Outside Voice (Cross-Model Review), /codex Skill (Multi-AI Second Opinion), Codex→Claude Reverse Buddy Check (P1)

### Community 84 - "Snapshot Fixtures"
Cohesion: 0.40
Nodes (5): Cursor-Interactive Detection (-C flag, @c refs), Snapshot Command (@e refs, accessibility tree, -D diff), Cursor-Interactive Fixture (divs with cursor:pointer/onclick/tabindex), Empty Page Fixture, Snapshot Fixture (forms, nested empty divs, non-interactive text)

### Community 85 - "Canary & Review Pipeline"
Cohesion: 0.50
Nodes (5): Canary Health Report (HEALTHY/DEGRADED/BROKEN verdict + JSONL log), Cross-Model Analysis (Claude /review vs Codex overlap rate), Codex Review Mode (diff review, [P1] pass/fail gate), gstack Review Pipeline (CEO/Eng/Design/Codex reviews + dashboard), Plan Status Footer (GSTACK REVIEW REPORT)

### Community 86 - "Extension Icon 128px"
Cohesion: 0.50
Nodes (5): Extension icon 128px: orange letter G on dark rounded square, G lettermark (gstack brand mark, amber/orange #f5a623-like on near-black), browse headless browser CLI (browse/src, Playwright) the extension surfaces, extension/manifest.json (declares icon-16/48/128 for action and app icons), gstack browse Chrome extension (MV3: side panel activity feed + @ref overlays)

### Community 87 - "Extension Icon 16px"
Cohesion: 0.50
Nodes (5): Browser extension toolbar/action icon role, gstack 'G' letterform icon (16x16), Orange/amber brand color background, browse headless browser CLI (Playwright), gstack browse Chrome extension (manifest v3)

### Community 88 - "Extension Icon 48px"
Cohesion: 0.50
Nodes (5): gstack browse extension icon (48px): orange letter G on dark rounded square, Letter 'G' brand mark in amber/orange on near-black background, gstack browse headless browser CLI (browse/) that the extension provides live feed and @ref overlays for, Chrome MV3 manifest 'gstack browse' declaring icon-48.png as action and app icon, Icon size variants: icon-16.png, icon-48.png, icon-128.png

### Community 89 - "Browser Dependencies"
Cohesion: 0.40
Nodes (5): dependencies, playwright, puppeteer-core, playwright, puppeteer-core

### Community 91 - "Browser Handoff"
Cohesion: 0.50
Nodes (4): Handoff Convergence (one headed mode via launchPersistentContext), /browse Skill — Persistent Chromium Daemon (Playwright), Browser Handoff (CAPTCHA/MFA headless→headed with state preserved), Playwright (Microsoft browser automation)

### Community 92 - "Coverage Audit Generators"
Cohesion: 0.50
Nodes (4): generateTestCoverageAuditInner(), generateTestCoverageAuditPlan(), generateTestCoverageAuditReview(), generateTestCoverageAuditShip()

### Community 93 - "Anthropic SDK Dependency"
Cohesion: 0.67
Nodes (3): @anthropic-ai/sdk, devDependencies, @anthropic-ai/sdk

### Community 96 - "Project Instructions"
Cohesion: 0.67
Nodes (3): Commit Bisection Style, Platform-Agnostic Skill Design, CLAUDE.md Project Instructions

## Ambiguous Edges - Review These
- `Snapshot Command (@e refs, accessibility tree, -D diff)` → `Empty Page Fixture`  [AMBIGUOUS]
  browse/test/fixtures/empty.html · relation: conceptually_related_to
- `Canary Alert Protocol (CRITICAL/HIGH/MEDIUM/LOW + AskUserQuestion)` → `/careful Skill (Destructive Command Guardrails)`  [AMBIGUOUS]
  careful/SKILL.md · relation: semantically_similar_to
- `Design System Extraction (computed styles via $B js)` → `Side Panel Refs Tab (snapshot element refs)`  [AMBIGUOUS]
  extension/sidepanel.html · relation: conceptually_related_to

## Knowledge Gaps
- **433 isolated node(s):** `Session`, `Repo`, `DiscoveryResult`, `build-node-server.sh script`, `ActivityEntry` (+428 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Snapshot Command (@e refs, accessibility tree, -D diff)` and `Empty Page Fixture`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Canary Alert Protocol (CRITICAL/HIGH/MEDIUM/LOW + AskUserQuestion)` and `/careful Skill (Destructive Command Guardrails)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Design System Extraction (computed styles via $B js)` and `Side Panel Refs Tab (snapshot element refs)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `bun` connect `CLI & Server Lifecycle` to `E2E Test Harness`, `Cookie Import & Picker`, `Browse Server & Buffers`, `Gemini E2E Tests`, `Browse Command Registry`, `Codex E2E Tests`, `Package Metadata`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `BrowserManager` connect `Browser Manager` to `Cookie Import & Picker`, `Browse Server & Buffers`, `Browse Command Registry`, `File Drop Inbox`, `Console/Network Buffers`, `Snapshot & Refs`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `startTestServer()` connect `E2E Test Harness` to `Browse Command Registry`, `CLI & Server Lifecycle`, `Console/Network Buffers`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `Session`, `Repo`, `DiscoveryResult` to the rest of the system?**
  _433 weakly-connected nodes found - possible documentation gaps or missing edges._