# autoresearch-mini

A **real, CPU-scale replica of [karpathy/autoresearch](https://github.com/karpathy/autoresearch)** —
an autonomous "AI research org" where a coding agent improves a machine-learning
training setup by editing the training code, measuring a metric, and keeping only
what helps.

Packaged as a **standalone Claude Code skill** you can drop into any repository.

## Why this exists

The upstream repo needs an NVIDIA GPU because it trains a nanochat-scale
transformer on FineWeb with a 5-minute budget. That scale is the *only* thing
that requires a GPU — the **method** doesn't. This replica swaps the trained
model for one small enough to train on **CPU in ~1.6 seconds**, so the exact
propose → train → measure → keep loop runs anywhere.

Two separate "LLMs" are involved, and only one needs the GPU upstream:

| Role | Upstream | Here |
|------|----------|------|
| **Agent** (does the research) | any coding LLM | your Claude Code agent |
| **Subject** (the model being trained) | nanochat transformer on H100 | a char-level MLP LM in numpy on CPU |

Nothing is faked: `train.py` is a real neural language model with manual
backprop and SGD, trained on real text, reporting a real held-out cross-entropy.

## Layout

The installable skill is the self-contained `skill/` folder — copy THAT into a
repo's `.claude/skills/`. The top-level `README.md` (this file) is package docs
and is not part of the skill.

- `skill/SKILL.md` — the standalone Claude Code skill (the propose → measure →
  keep methodology). Self-contained: no external deps, no API key for training.
- `skill/train.py` — the workload the agent edits. A Bengio-2003 / makemore-style
  char-level MLP language model in pure numpy. Prints one metric: `VAL_LOSS`.
- `skill/data/input.txt` — the corpus (tinyshakespeare). Override with `AR_DATA`.
- `skill/RESEARCH_LOG.md` — the log of one real run: **val loss 2.4929 → 2.2410**
  across 11 agent-proposed experiments (7 kept, 4 reverted).

## Install into another repo (Claude Code)

Copy the `skill/` folder into the target repo's skills directory. Claude Code
discovers the skill from `SKILL.md`'s frontmatter, then `/autoresearch-mini`
runs the loop.

```bash
# From inside the repo where you want the skill:
mkdir -p .claude/skills
cp -R /path/to/autoresearch-mini/skill .claude/skills/autoresearch-mini
# Then, in Claude Code:  /autoresearch-mini
```

### Copy-paste bootstrap (no source folder handy)

Run this from the root of any repo. It creates the skill, fetches a corpus, and
writes `train.py`. Then invoke `/autoresearch-mini` in Claude Code.

```bash
set -e
SKILL_DIR=".claude/skills/autoresearch-mini"
mkdir -p "$SKILL_DIR/data"

# 1. Corpus (any UTF-8 text works; tinyshakespeare is the default).
curl -sL https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt \
  -o "$SKILL_DIR/data/input.txt"

# 2. The training workload the agent optimizes.
cat > "$SKILL_DIR/train.py" <<'PY'
"""CPU-scale replica of karpathy/autoresearch's train.py.
Char-level MLP LM in pure numpy. Prints one metric: VAL_LOSS (nats/char).
The agent edits everything below the harness contract; keep an edit iff VAL_LOSS drops."""
import os
import numpy as np

# ── Harness contract (do NOT change — keeps experiments comparable) ──
SEED = 1337
MAX_STEPS = 2000
VAL_FRACTION = 0.1
EVAL_BATCHES = 50

# ── Research knobs (edit these + the model code below) ──
block_size = int(os.environ.get('AR_BLOCK_SIZE', 8))
n_embd = int(os.environ.get('AR_N_EMBD', 32))
n_hidden = int(os.environ.get('AR_N_HIDDEN', 384))
batch_size = int(os.environ.get('AR_BATCH', 64))
learning_rate = float(os.environ.get('AR_LR', 0.3))
lr_decay_at = int(os.environ.get('AR_LR_DECAY_AT', 1500))

rng = np.random.default_rng(SEED)
CORPUS = os.environ.get('AR_DATA', os.path.join(os.path.dirname(__file__), 'data', 'input.txt'))

def load_data():
    text = open(CORPUS, 'r', encoding='utf-8').read()
    chars = sorted(set(text))
    stoi = {c: i for i, c in enumerate(chars)}
    data = np.array([stoi[c] for c in text], dtype=np.int32)
    n_val = int(len(data) * VAL_FRACTION)
    return data[:-n_val], data[-n_val:], len(chars)

def make_batch(data, bs):
    ix = rng.integers(0, len(data) - block_size - 1, size=bs)
    X = np.stack([data[i:i + block_size] for i in ix])
    Y = np.array([data[i + block_size] for i in ix])
    return X, Y

def init_params(vocab):
    C = rng.normal(0, 1.0, (vocab, n_embd)) * 0.1
    W1 = rng.normal(0, 1.0, (block_size * n_embd, n_hidden)) * (1.0 / np.sqrt(block_size * n_embd))
    b1 = np.zeros(n_hidden)
    W2 = rng.normal(0, 1.0, (n_hidden, vocab)) * (1.0 / np.sqrt(n_hidden))
    b2 = np.zeros(vocab)
    return {'C': C, 'W1': W1, 'b1': b1, 'W2': W2, 'b2': b2}

def forward(p, X, Y=None):
    emb = p['C'][X].reshape(X.shape[0], -1)
    h = np.tanh(emb @ p['W1'] + p['b1'])
    logits = h @ p['W2'] + p['b2']
    logits = logits - logits.max(axis=1, keepdims=True)
    counts = np.exp(logits)
    probs = counts / counts.sum(axis=1, keepdims=True)
    cache = (emb, h, probs, X, Y)
    if Y is None:
        return None, cache
    loss = -np.log(probs[np.arange(len(Y)), Y] + 1e-12).mean()
    return loss, cache

def backward(p, cache):
    emb, h, probs, X, Y = cache
    B = len(Y)
    dlogits = probs.copy()
    dlogits[np.arange(B), Y] -= 1
    dlogits /= B
    dW2 = h.T @ dlogits
    db2 = dlogits.sum(0)
    dh = dlogits @ p['W2'].T
    dhraw = (1 - h ** 2) * dh
    dW1 = emb.T @ dhraw
    db1 = dhraw.sum(0)
    demb = dhraw @ p['W1'].T
    dC = np.zeros_like(p['C'])
    demb3 = demb.reshape(B, block_size, n_embd)
    for b in range(B):
        for t in range(block_size):
            dC[X[b, t]] += demb3[b, t]
    return {'C': dC, 'W1': dW1, 'b1': db1, 'W2': dW2, 'b2': db2}

def evaluate(p, val):
    losses = []
    for _ in range(EVAL_BATCHES):
        X, Y = make_batch(val, batch_size)
        loss, _ = forward(p, X, Y)
        losses.append(loss)
    return float(np.mean(losses))

def main():
    train, val, vocab = load_data()
    p = init_params(vocab)
    lr = learning_rate
    for step in range(MAX_STEPS):
        if step == lr_decay_at:
            lr *= 0.1
        X, Y = make_batch(train, batch_size)
        loss, cache = forward(p, X, Y)
        grads = backward(p, cache)
        for k in p:
            p[k] -= lr * grads[k]
    print(f"VAL_LOSS {evaluate(p, val):.6f}")

if __name__ == '__main__':
    main()
PY

echo "Installed. In Claude Code, run:  /autoresearch-mini"
python3 "$SKILL_DIR/train.py"   # sanity check → VAL_LOSS ~2.24
```

## The loop

1. Agent proposes an edit to `train.py` (architecture / hyperparameters).
2. `python3 train.py` trains under a fixed, deterministic budget → `VAL_LOSS`.
3. Keep the edit iff val loss dropped; otherwise revert.
4. Repeat until several proposals in a row revert (signal exhausted).

The `# Harness contract` knobs in `train.py` (seed, step budget, val split) are
fixed so experiments stay comparable — the agent optimizes everything else.

## Run it directly (no agent)

```bash
python3 train.py                 # needs only python3 + numpy; ~1.6s
AR_DATA=/path/to/any.txt python3 train.py   # optimize on your own corpus
```
