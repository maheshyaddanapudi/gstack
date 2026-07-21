# autoresearch-mini

A **real, CPU-scale replica of [karpathy/autoresearch](https://github.com/karpathy/autoresearch)** —
an autonomous "AI research org" where a coding agent improves a machine-learning
training setup by editing the training code, measuring a metric, and keeping only
what helps.

## Why this exists

The upstream repo needs an NVIDIA GPU because it trains a nanochat-scale
transformer on FineWeb with a 5-minute budget. That scale is the *only* thing
that requires a GPU — the **method** doesn't. This replica swaps the trained
model for one small enough to train on **CPU in ~1.6 seconds**, so the exact
propose → train → measure → keep loop runs anywhere.

Two separate "LLMs" are involved, and only one needs the GPU upstream:

| Role | Upstream | Here |
|------|----------|------|
| **Agent** (does the research) | any coding LLM | a remote **Anthropic** model |
| **Subject** (the model being trained) | nanochat transformer on H100 | a char-level MLP LM in numpy on CPU |

Nothing is faked: `train.py` is a real neural language model with manual
backprop and SGD, trained on real text, reporting a real held-out cross-entropy.

## Files

- `train.py` — the workload the agent edits. A Bengio-2003 / makemore-style
  char-level MLP language model in pure numpy. Prints one metric: `VAL_LOSS`.
- `data/input.txt` — the corpus (tinyshakespeare).
- `RESEARCH_LOG.md` — the log of one real run: **val loss 2.4929 → 2.2410**
  across 11 agent-proposed experiments (7 kept, 4 reverted).

## The loop

1. Agent proposes an edit to `train.py` (architecture / hyperparameters).
2. `python3 train.py` trains under a fixed, deterministic budget → `VAL_LOSS`.
3. Keep the edit iff val loss dropped; otherwise revert.
4. Repeat.

The `# Harness contract` knobs in `train.py` (seed, step budget, val split) are
fixed so experiments stay comparable — the agent optimizes everything else.

## Run it

```bash
python3 train.py     # needs only python3 + numpy; ~1.6s
```
