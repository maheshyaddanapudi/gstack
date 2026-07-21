# Autoresearch run log

A faithful, CPU-scale replica of [karpathy/autoresearch](https://github.com/karpathy/autoresearch).
The **agent is a remote Anthropic model** (Claude, this session); the **workload**
is a real char-level neural language model (`train.py`), trained on real text
(tinyshakespeare), measured by a real held-out validation loss. No GPU, nothing
faked — the only change from the upstream repo is the *scale* of the trained
model (small enough to train on CPU in ~1.6 s instead of an H100 in ~5 min).

**Method (identical to autoresearch):** the agent proposes an edit to `train.py`
→ the harness trains under a fixed, deterministic compute budget → reports
`VAL_LOSS` → the edit is **kept only if val loss drops**, else reverted.

**Objective:** mean validation cross-entropy (nats/char) on a held-out 10% split.
Fixed seed (1337) + fixed step budget (2000) make runs comparable.

## Experiment log

| # | Hypothesis (agent-proposed) | val_loss | decision |
|---|------------------------------|----------|----------|
| 0 | baseline: block 3, embd 16, hidden 64, lr 0.1, batch 32 | 2.4929 | — |
| 1 | more context: block 3→8 | 2.5602 | revert (worse alone) |
| 2 | block 8 + hidden 64→128 | 2.5382 | revert |
| 3 | block 8 + hidden 128 + embd 16→24 | **2.4468** | **keep** |
| 4 | + lr 0.1→0.2 | **2.3469** | **keep** |
| 5 | + lr 0.3, decay@1200 | **2.3301** | **keep** |
| 6 | + hidden 128→256 | **2.3032** | **keep** |
| 7 | + batch 32→64 | **2.2818** | **keep** |
| 8 | + embd 24→32 | 2.3101 | revert |
| 9 | + embd 32 + lr 0.3 (retry embd with higher lr) | **2.2755** | **keep** |
| 10 | + block 8→6 | 2.2854 | revert |
| 11 | + hidden 256→384 | **2.2410** | **keep** |

**Result:** 2.4929 → **2.2410**, a 10.1% reduction in validation cross-entropy.

## What the loop actually discovered (real findings, not a grid search)

- **Context helps only when paired with capacity.** Enlarging `block_size`
  alone (#1, #2) *raised* loss — under a fixed step budget the bigger input
  layer trains too slowly to pay off. Only once embedding+hidden width grew
  alongside it (#3) did the larger context become a net win. Each step's result
  informed the next hypothesis — that's research, not sweeping.
- **The optimizer mattered more than raw size.** The single biggest drop came
  from the learning-rate change (#4, −0.10 nats), not from adding parameters.
- **Diminishing returns + real reverts.** Steps 8 and 10 were genuine dead ends
  the metric rejected, exactly as an overnight autoresearch run discards most of
  its ~100 experiments.

## Reproduce

```bash
cd autoresearch-mini
python3 train.py                       # baked-in best config → VAL_LOSS 2.241048
AR_BLOCK_SIZE=3 AR_N_EMBD=16 AR_N_HIDDEN=64 AR_LR=0.1 AR_BATCH=32 python3 train.py  # original baseline → 2.492861
```

Requires only Python 3 + numpy (no torch, no GPU). Each run ~1.6 s.
