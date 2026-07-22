import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const ROOT = path.resolve(import.meta.dir, '..');
const DIFF_SCOPE = path.join(ROOT, 'bin', 'gstack-diff-scope');

let repoDir: string;

function git(...args: string[]) {
  const r = spawnSync('git', ['-C', repoDir, ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout;
}

function writeFile(rel: string, content = 'x') {
  const abs = path.join(repoDir, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}

// Run diff-scope against `main` inside the temp repo, return SCOPE_* as a map.
function runScope(): Record<string, string> {
  const r = spawnSync('bash', [DIFF_SCOPE, 'main'], { cwd: repoDir, encoding: 'utf8', timeout: 5000 });
  const out: Record<string, string> = {};
  for (const line of r.stdout.trim().split('\n')) {
    const m = line.match(/^(SCOPE_[A-Z]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

// Create a feature branch off main containing exactly `files`, commit, checkout.
function branchWithFiles(files: string[]) {
  git('checkout', '-q', 'main');
  git('checkout', '-q', '-B', 'feature');
  for (const f of files) writeFile(f);
  git('add', '-A');
  git('commit', '-q', '-m', 'feature');
}

describe('gstack-diff-scope', () => {
  beforeEach(() => {
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gstack-diffscope-'));
    git('init', '-q');
    git('config', 'user.email', 't@t.com');
    git('config', 'user.name', 't');
    git('checkout', '-q', '-b', 'main');
    writeFile('README.md', 'base');
    git('add', '-A');
    git('commit', '-q', '-m', 'base');
  });

  afterEach(() => {
    fs.rmSync(repoDir, { recursive: true, force: true });
  });

  // Regression: a test written in a frontend-framework extension (.test.tsx)
  // matches *.tsx in the case statement and stops before the test patterns,
  // so SCOPE_TESTS used to be reported as false for a test-only change.
  test('frontend-extension test file sets SCOPE_TESTS=true', () => {
    branchWithFiles(['src/Button.test.tsx']);
    const scope = runScope();
    expect(scope.SCOPE_TESTS).toBe('true');
    expect(scope.SCOPE_FRONTEND).toBe('true'); // legitimately also frontend
  });

  test('.spec.jsx and .test.vue test files also set SCOPE_TESTS=true', () => {
    branchWithFiles(['a.spec.jsx', 'b.test.vue']);
    expect(runScope().SCOPE_TESTS).toBe('true');
  });

  test('plain backend test file sets SCOPE_TESTS=true', () => {
    branchWithFiles(['src/util.test.ts']);
    expect(runScope().SCOPE_TESTS).toBe('true');
  });

  test('non-test frontend file does not set SCOPE_TESTS', () => {
    branchWithFiles(['src/Button.tsx']);
    const scope = runScope();
    expect(scope.SCOPE_FRONTEND).toBe('true');
    expect(scope.SCOPE_TESTS).toBe('false');
  });
});
