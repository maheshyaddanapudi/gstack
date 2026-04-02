# autoresearch — gstack skill quality optimization

This is an autoresearch experiment to improve gstack's skill template quality,
measured by the project's native LLM-as-judge eval system.

## Setup

1. **Branch**: `claude/review-autoresearch-video-FCh50`
2. **Read these files for context**:
   - `CLAUDE.md` — project rules, commands, structure
   - `SKILL.md.tmpl` — main skill template (editable)
   - `browse/SKILL.md.tmpl` — browse skill template (editable)
   - `qa/SKILL.md.tmpl` — QA skill template (editable)
   - `cso/SKILL.md.tmpl` — security audit template (editable)
   - `test/skill-llm-eval.test.ts` — the LLM judge eval (read-only)
   - `test/helpers/llm-judge.ts` — judge scoring function (read-only)
   - `browse/src/commands.ts` — command registry (read-only for template work)
   - `browse/src/snapshot.ts` — snapshot flags (read-only for template work)
3. **Initialize results.tsv**: Header row + baseline.
4. **Confirm and go**.

## What you CAN modify

- `SKILL.md.tmpl` — main skill template
- `browse/SKILL.md.tmpl` — browse reference template
- `qa/SKILL.md.tmpl` — QA workflow template
- `qa-only/SKILL.md.tmpl` — QA report-only template
- `cso/SKILL.md.tmpl` — security audit template
- `review/SKILL.md.tmpl` — PR review template
- `design-review/SKILL.md.tmpl` — design review template

After editing a `.tmpl` file, always run:
```bash
bun run gen:skill-docs
```

## What you CANNOT modify

- `test/skill-llm-eval.test.ts` — the eval is the ground truth
- `test/helpers/llm-judge.ts` — the judge is the ground truth
- `browse/src/commands.ts` — command registry (source of truth)
- `browse/src/snapshot.ts` — snapshot flags (source of truth)
- `scripts/gen-skill-docs.ts` — the template generator
- Any test files or helpers

## Metrics

The primary metrics come from `EVALS=1 EVALS_ALL=1 bun test test/skill-llm-eval.test.ts`:

1. **clarity** (1-5): Can an agent understand what each command/flag does?
2. **completeness** (1-5): Are arguments, valid values, and behaviors documented?
3. **actionability** (1-5): Can an agent construct correct invocations?
4. **aggregate**: Sum of all judge scores across all eval tests

Higher is better. The goal is to maximize all scores while keeping all tests passing.

Secondary angles (validated by Tier 3 E2E, run at baseline and end):
- **QA bug detection rate** (detection_rate in planted-bug tests)
- **E2E cost efficiency** (cost_usd per test)
- **Agent turns** (turns_used per test)
- **CSO security detection** (findings count)
- **Browse reliability** (browse_errors count)

## Correctness gate

Before measuring the metric, run:
```bash
bun test
```
This is free (<2s) and validates:
- All `$B` commands in SKILL.md match the command registry
- All snapshot flags are valid
- Generated SKILL.md structure is correct

If `bun test` fails, the change broke something fundamental — revert immediately.

## Output format

The LLM judge prints scores like:
```
Command reference scores: {"clarity": 4, "completeness": 3, "actionability": 4, "reasoning": "..."}
Snapshot flags scores: {"clarity": 5, "completeness": 4, "actionability": 5, "reasoning": "..."}
```

## Logging results

Log to `results.tsv` (tab-separated, untracked by git):

```
commit	aggregate_score	status	description
```

1. git commit hash (short, 7 chars)
2. aggregate_score: sum of all clarity+completeness+actionability scores across tests
3. status: `keep`, `discard`, or `crash`
4. short description of what was tried

## The experiment loop

LOOP FOREVER (time-boxed to 1 hour):

1. Read current state: which template, what scores look like
2. Propose ONE targeted improvement to a SKILL.md.tmpl file
3. Run `bun run gen:skill-docs` to regenerate
4. Run `bun test` (free gate — must pass)
5. If gate fails → revert, log "crash"
6. Git commit the .tmpl + generated .md files
7. Run `EVALS=1 EVALS_ALL=1 bun test test/skill-llm-eval.test.ts` (~30-60s, ~$0.15)
8. Extract scores from output
9. If aggregate improved → keep commit, log "keep"
10. If aggregate same/worse → `git reset --hard HEAD~1`, log "discard"
11. Record in results.tsv
12. Loop

**Types of improvements to try:**
- Add missing argument documentation to command tables
- Clarify ambiguous command descriptions
- Add valid values for enum-like parameters (e.g., snapshot flags)
- Add concrete usage examples
- Improve workflow step clarity in QA/review templates
- Add edge case documentation
- Improve health score rubric precision
- Strengthen anti-refusal language in QA template
- Improve cross-skill consistency

**Simplicity criterion**: Clearer and shorter is better than longer and detailed.
If you can improve a score by removing unnecessary words, that's a great outcome.

**NEVER STOP**: Run until the time budget expires or you are manually interrupted.
