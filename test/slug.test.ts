import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const SLUG_BIN = path.resolve(import.meta.dir, "..", "bin", "gstack-slug");

let repo: string;

function git(...args: string[]) {
  const r = spawnSync("git", args, { cwd: repo, encoding: "utf-8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${r.stderr}`);
}

function runSlug() {
  return spawnSync(SLUG_BIN, [], { cwd: repo, encoding: "utf-8" });
}

function parse(stdout: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of stdout.trim().split("\n")) {
    const m = line.match(/^([A-Z]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

beforeEach(() => {
  repo = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "gstack-slug-")));
  git("init", "-q");
  git("commit", "--allow-empty", "-q", "-m", "init");
});

afterEach(() => {
  fs.rmSync(repo, { recursive: true, force: true });
});

describe("gstack-slug", () => {
  // Regression: a repo without an `origin` remote used to make the script exit
  // non-zero and print nothing (git's failure propagated through `set -o pipefail`
  // and tripped `set -e`), breaking `eval "$(gstack-slug)"` consumers.
  test("exits 0 and emits a non-empty slug when there is no origin remote", () => {
    const r = runSlug();
    expect(r.status).toBe(0);
    const vars = parse(r.stdout);
    expect(vars.SLUG).toBe(path.basename(repo)); // falls back to repo dir basename
    expect(vars.SLUG.length).toBeGreaterThan(0);
    expect(vars.BRANCH.length).toBeGreaterThan(0);
  });

  test("derives owner-repo slug from origin remote", () => {
    git("remote", "add", "origin", "git@github.com:foo/bar.git");
    const r = runSlug();
    expect(r.status).toBe(0);
    expect(parse(r.stdout).SLUG).toBe("foo-bar");
  });

  test("sanitizes branch names with slashes", () => {
    git("checkout", "-q", "-b", "feat/x");
    const r = runSlug();
    expect(r.status).toBe(0);
    // gstack-slug strips any char outside [a-zA-Z0-9._-] via `tr -cd`, so the
    // slash is removed entirely (not converted to a dash): feat/x -> featx.
    expect(parse(r.stdout).BRANCH).toBe("featx");
  });
});
