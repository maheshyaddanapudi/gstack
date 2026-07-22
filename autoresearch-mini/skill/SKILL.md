---
name: autoresearch-mini
description: >-
  Autonomous ML research loop you can run on a CPU, in any repo, with no GPU and
  no API key for the training itself. A CPU-scale replica of Karpathy's
  autoresearch: you (the agent) propose an edit to a real neural-net training
  script, a fixed deterministic budget measures validation loss, and the edit is
  KEPT only if the metric improves — otherwise reverted. Use when the user says
  "run autoresearch", "autoresearch-mini", "optimize this model", "propose /
  measure / keep loop", or wants to watch an agent genuinely improve an ML metric
  step by step (not a grid search) with an honest kept/reverted log.
---

# autoresearch-mini

A faithful, CPU-scale replica of [karpathy/autoresearch](https://github.com/karpathy/autoresearch).
The upstream project runs an "AI research org" that improves a nanochat-scale
transformer on a GPU under a 5-minute budget. The **method** needs no GPU — only
the *scale* does. This skill swaps the trained model for one small enough to
train on **CPU in ~1.6 seconds**, so the exact propose → train → measure → keep
loop runs anywhere.

Nothing is faked. `train.py` is a real char-level neural language model (numpy,
manual backprop, SGD) trained on real text, reporting a real held-out
cross-entropy. **You** are the researcher; the metric is the only arbiter.

## Files in this skill

| File | Role |
|------|------|
| `train.py` | The workload you edit. Prints one line: `VAL_LOSS <float>`. Pure numpy. |
| `data/input.txt` | The corpus (tinyshakespeare by default; override with `AR_DATA`). |
| `RESEARCH_LOG.md` | Example log of a real run: val loss 2.4929 → 2.2410, 7 kept / 4 reverted. |

## What you must do when invoked

You are running an autonomous research loop against **one scalar objective**:
minimize `VAL_LOSS` (mean validation cross-entropy, nats/char) printed by
`python3 train.py`. Follow this loop.

### Step 0 — Baseline

```bash
cd <this skill's directory>
python3 train.py          # needs only python3 + numpy; ~1.6s. Prints: VAL_LOSS <x>
```

Record that number. If numpy is missing: `pip install numpy`. If the corpus is
missing, `train.py` prints the exact `curl` command to fetch it — run that first.

Start a log (append to `RESEARCH_LOG.md` or a fresh table) with row 0 = baseline.

### Step 1 — Propose ONE change (a hypothesis, not a sweep)

Read `train.py`. You may edit **anything below the `# Research knobs` line and any
model code** — architecture, width, depth, learning rate, schedule, init, batch
size, activation, add layers, etc. State a one-sentence hypothesis first ("wider
hidden layer should help now that context grew"). Change ONE thing at a time so
the metric tells you what caused the move.

**Do NOT touch the `# Harness contract` block** (`SEED`, `MAX_STEPS`,
`VAL_FRACTION`, `EVAL_BATCHES`). Those keep every experiment comparable — moving
them invalidates the comparison and is cheating, not research.

You can edit the defaults in the file directly, OR pass a config via the `AR_*`
env vars (`AR_BLOCK_SIZE`, `AR_N_EMBD`, `AR_N_HIDDEN`, `AR_BATCH`, `AR_LR`,
`AR_LR_DECAY_AT`) to try a config without editing — but a KEPT change must be
written into the file so it persists.

### Step 2 — Measure

```bash
python3 train.py          # deterministic: same seed + step budget every run
```

### Step 3 — Keep or revert (the metric decides, not your taste)

- **Keep** iff `VAL_LOSS` dropped versus the current best. Write the change into
  `train.py`, update the best number, log the row as `keep`.
- **Revert** otherwise — restore the previous `train.py`, log the row as
  `revert`. A revert is a real result: it tells you that path is a dead end.

### Step 4 — Repeat until diminishing returns

Keep proposing. Each result should inform the next hypothesis (that is what makes
this research and not a grid search). **Stop** when several consecutive proposals
all revert — that is the honest signal that the easy signal is exhausted. Report
the final best, the total reduction, and which experiments were dead ends.

## Honesty rules (the entire point)

- The objective is the **only** arbiter. If `VAL_LOSS` did not drop, the change
  is not kept — no "it's cleaner anyway", no rounding in your favor.
- Never fabricate a metric or a run. Paste the actual `VAL_LOSS` line each time.
- A dry round reported honestly ("5 proposals, all reverted, signal exhausted at
  2.24") is worth more than a manufactured improvement.
- Reverts are expected and good. A real autoresearch run discards most of its
  ~100 overnight experiments; so will you.

## The harness contract (why runs are comparable)

`train.py` fixes the seed (1337), the step budget (2000 steps ≈ the upstream
5-minute analog), the validation split (last 10%), and the eval batch count.
Same seed + same compute every run means a `VAL_LOSS` delta is caused by your
edit and nothing else. This is the discipline that separates measurement from
wishful thinking.

## Adapting to a different corpus or model

- **Different data:** point `AR_DATA` at any UTF-8 text file (code, logs, prose):
  `AR_DATA=/path/to/mycorpus.txt python3 train.py`. The vocab and split adapt
  automatically. This is the fastest way to make the loop about *your* domain.
- **Bigger subject model:** the same loop works on any script that trains
  deterministically under a fixed budget and prints one scalar metric. Swap
  `train.py` for your own workload, keep a `# Harness contract` block, and keep
  the propose → measure → keep discipline. The methodology is the product; the
  numpy MLP is just a CPU-sized stand-in for the GPU transformer upstream.

## One-command reproduce

```bash
python3 train.py                    # baked-in best config → VAL_LOSS 2.241048
AR_BLOCK_SIZE=3 AR_N_EMBD=16 AR_N_HIDDEN=64 AR_LR=0.1 AR_BATCH=32 python3 train.py
#                                   # original baseline    → VAL_LOSS 2.492861
```

Requires only Python 3 + numpy. No torch, no GPU, no API key for the training loop.
