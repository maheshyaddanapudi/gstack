"""
train.py — the workload the autoresearch agent edits (CPU-scale replica of
karpathy/autoresearch's train.py).

A char-level MLP language model (Bengio-2003 / makemore style) implemented in
pure numpy with manual backprop and SGD. It trains on a small text corpus for a
FIXED step budget and prints a single scalar metric: validation loss (mean
cross-entropy per character, in nats).

The autoresearch loop keeps an edit only if VAL_LOSS drops. The agent may change
architecture and hyperparameters (block_size, n_embd, n_hidden, learning rate,
schedule, init, batch size, activation, add layers, etc.) — anything EXCEPT the
knobs marked "harness contract" below, which keep experiments comparable.

Determinism: fixed seed + fixed step budget → runs are comparable across edits.
"""
import numpy as np

# ─── Harness contract (do NOT change — keeps experiments comparable) ──────────
SEED = 1337
MAX_STEPS = 2000          # fixed compute budget (the "5-minute" analog)
VAL_FRACTION = 0.1        # last 10% of the corpus is validation
EVAL_BATCHES = 50         # val-loss estimate uses this many minibatches

# ─── Research knobs (the agent MAY edit these and the model code below) ───────
# Env-overridable so the harness can record each proposed config as an
# experiment; editing the defaults here is equivalent (as in real autoresearch).
import os
# Defaults below are the BEST config the autoresearch loop discovered
# (val_loss 2.2410 vs the original 2.4929 baseline — see RESEARCH_LOG.md).
block_size = int(os.environ.get('AR_BLOCK_SIZE', 8))       # chars of context
n_embd = int(os.environ.get('AR_N_EMBD', 32))              # embedding dim
n_hidden = int(os.environ.get('AR_N_HIDDEN', 384))         # hidden layer width
batch_size = int(os.environ.get('AR_BATCH', 64))
learning_rate = float(os.environ.get('AR_LR', 0.3))
lr_decay_at = int(os.environ.get('AR_LR_DECAY_AT', 1500))  # step to drop LR 10x
# ──────────────────────────────────────────────────────────────────────────────

rng = np.random.default_rng(SEED)

# Corpus path is configurable so this drops into any repo: point AR_DATA at any
# UTF-8 text file (code, prose, logs). Defaults to the bundled tinyshakespeare.
CORPUS = os.environ.get('AR_DATA', os.path.join(os.path.dirname(__file__), 'data', 'input.txt'))


def load_data():
    try:
        text = open(CORPUS, 'r', encoding='utf-8').read()
    except FileNotFoundError:
        raise SystemExit(
            f"corpus not found: {CORPUS}\n"
            "Point AR_DATA at any UTF-8 text file, or fetch the default corpus:\n"
            "  mkdir -p data && curl -sL "
            "https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt "
            "-o data/input.txt"
        )
    if len(text) < 1000:
        raise SystemExit(f"corpus too small ({len(text)} chars); need >= 1000 for a meaningful split")
    chars = sorted(set(text))
    stoi = {c: i for i, c in enumerate(chars)}
    data = np.array([stoi[c] for c in text], dtype=np.int32)
    n_val = int(len(data) * VAL_FRACTION)
    return data[:-n_val], data[-n_val:], len(chars)


def make_batch(data, bs):
    # sample bs windows of length block_size+1
    ix = rng.integers(0, len(data) - block_size - 1, size=bs)
    X = np.stack([data[i:i + block_size] for i in ix])
    Y = np.array([data[i + block_size] for i in ix])
    return X, Y


def init_params(vocab):
    # Kaiming-ish scaled inits
    C = rng.normal(0, 1.0, (vocab, n_embd)) * 0.1
    W1 = rng.normal(0, 1.0, (block_size * n_embd, n_hidden)) * (1.0 / np.sqrt(block_size * n_embd))
    b1 = np.zeros(n_hidden)
    W2 = rng.normal(0, 1.0, (n_hidden, vocab)) * (1.0 / np.sqrt(n_hidden))
    b2 = np.zeros(vocab)
    return {'C': C, 'W1': W1, 'b1': b1, 'W2': W2, 'b2': b2}


def forward(p, X, Y=None):
    emb = p['C'][X].reshape(X.shape[0], -1)          # (B, block*embd)
    h = np.tanh(emb @ p['W1'] + p['b1'])             # (B, hidden)
    logits = h @ p['W2'] + p['b2']                   # (B, vocab)
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
    val_loss = evaluate(p, val)
    print(f"VAL_LOSS {val_loss:.6f}")


if __name__ == '__main__':
    main()
