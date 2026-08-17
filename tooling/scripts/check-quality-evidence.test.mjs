import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const repoRoot = path.resolve(".");
const script = path.resolve("tooling/scripts/check-quality-evidence.mjs");
const manifestPath = path.resolve("docs/testing/quality-evidence.json");
const baseSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const priorBaseSha = execFileSync("git", ["rev-parse", "HEAD~1"], { encoding: "utf8" }).trim();
const olderBaseSha = execFileSync("git", ["rev-parse", "HEAD~3"], { encoding: "utf8" }).trim();

const withWorkflowDispatchRef = (run) => {
  const workflowDispatchBranch = `quality-evidence-workflow-dispatch-${randomBytes(6).toString("hex")}`;
  const workflowDispatchRef = `refs/heads/${workflowDispatchBranch}`;
  execFileSync("git", ["branch", "-f", workflowDispatchBranch, "HEAD"], { encoding: "utf8" });
  try {
    return run(workflowDispatchRef);
  } finally {
    try {
      execFileSync("git", ["branch", "-D", workflowDispatchBranch], { encoding: "utf8" });
    } catch {}
  }
};

const readManifest = () => JSON.parse(readFileSync(manifestPath, "utf8"));

const setLocalBase = (manifest, sha = baseSha, ref = "HEAD") => {
  manifest.baseRef = ref;
  manifest.baseSha = sha;
  return manifest;
};

const createLocalAncestryFixture = () => {
  const root = mkdtempSync(path.join(tmpdir(), "vc-quality-evidence-git-"));
  const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const commit = (filename, contents, message) => {
    writeFileSync(path.join(root, filename), contents);
    git(["add", filename]);
    git(["-c", "commit.gpgSign=false", "commit", "-m", message]);
    return git(["rev-parse", "HEAD"]);
  };

  git(["init", "--initial-branch=main"]);
  git(["config", "user.name", "Quality Evidence Test"]);
  git(["config", "user.email", "quality-evidence-test@example.invalid"]);
  git(["config", "commit.gpgSign", "false"]);
  const historicalBaseSha = commit("history.txt", "historical base\n", "historical base");
  git(["branch", "quality-base"]);
  commit("history.txt", "advanced base\n", "advance base");
  git(["checkout", "-b", "quality-feature", historicalBaseSha]);
  const featureOnlySha = commit("feature.txt", "feature-only\n", "feature-only commit");

  return {
    root,
    baseRef: "refs/heads/quality-base",
    historicalBaseSha,
    featureOnlySha,
  };
};

const runManifest = (manifest, eventName = "local", contract = {}, root = repoRoot) => {
  const directory = mkdtempSync(path.join(tmpdir(), "vc-quality-evidence-"));
  const fixture = path.join(directory, "quality-evidence.json");
  writeFileSync(fixture, JSON.stringify(manifest, null, 2));
  const env = { ...process.env, QUALITY_EVIDENCE_CI_EVENT: eventName };
  if (eventName !== "local") {
    env.QUALITY_EVIDENCE_BASE_REF = contract.baseRef ?? "HEAD";
    env.QUALITY_EVIDENCE_BASE_SHA = contract.baseSha ?? baseSha;
    if (eventName === "push") env.QUALITY_EVIDENCE_PUSH_BEFORE_SHA = contract.pushBeforeSha ?? contract.baseSha ?? baseSha;
  } else {
    delete env.QUALITY_EVIDENCE_BASE_REF;
    delete env.QUALITY_EVIDENCE_BASE_SHA;
  }
  if (contract.clearBase) {
    delete env.QUALITY_EVIDENCE_BASE_REF;
    delete env.QUALITY_EVIDENCE_BASE_SHA;
  }
  return spawnSync(process.execPath, [script, "--root", root, "--manifest", fixture], {
    cwd: root,
    encoding: "utf8",
    env,
  });
};

test("accepts the checked-in evidence catalog without claiming unavailable metrics", () => {
  const result = spawnSync(process.execPath, [script], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /quality evidence valid: 8 row\(s\)/u);
});

test("requires valid status, scope, command, metric, review, and budget fields", () => {
  const manifest = readManifest();
  setLocalBase(manifest);
  const row = manifest.evidence[0];
  row.status = "measured";
  row.commandStatus = "defined";
  row.metric.value = 1;
  row.evidence = {
    report: "tmp/evidence/core-credentials-tests.json",
    sha256: "sha256:" + "a".repeat(64),
    runId: "local-test",
  };
  row.review.status = "reviewed";
  row.review.reviewer = "security-reviewer";
  row.budget.status = "defined";
  row.budget.value = 100;
  assert.equal(runManifest(manifest).status, 0);

  const invalid = readManifest();
  setLocalBase(invalid);
  invalid.evidence[0].scope.id = "";
  const result = runManifest(invalid);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /scope\.id must be a non-empty string/u);
});

test("rejects a measured row without a numeric metric", () => {
  const manifest = readManifest();
  setLocalBase(manifest);
  manifest.evidence[0].status = "measured";
  manifest.evidence[0].metric.value = null;
  manifest.evidence[0].evidence = {
    report: "tmp/evidence/invalid-metric.json",
    sha256: "sha256:" + "b".repeat(64),
    runId: "local-test",
  };
  const result = runManifest(manifest);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /metric\.value must be a finite/u);
});

test("accepts a historical local catalog base SHA on the declared base-ref history", () => {
  const fixture = createLocalAncestryFixture();
  try {
    const manifest = readManifest();
    setLocalBase(manifest, fixture.historicalBaseSha, fixture.baseRef);
    const result = runManifest(manifest, "local", {}, fixture.root);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects a local feature-only base SHA outside the declared base-ref history", () => {
  const fixture = createLocalAncestryFixture();
  try {
    const manifest = readManifest();
    setLocalBase(manifest, fixture.featureOnlySha, fixture.baseRef);
    const result = runManifest(manifest, "local", {}, fixture.root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /baseSha .* not an ancestor of declared baseRef refs\/heads\/quality-base/u);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects a stale or unrelated base SHA", () => {
  const manifest = readManifest();
  setLocalBase(manifest, "0000000000000000000000000000000000000000");
  const result = runManifest(manifest);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /baseSha .* 40-character|baseSha .* stale|unable to resolve baseSha/u);
});

test("pull-request events require exact resolution of the workflow-provided base ref and SHA", () => {
  const manifest = readManifest();
  const missingBase = runManifest(manifest, "pull_request", { clearBase: true });
  assert.equal(missingBase.status, 1);
  assert.match(missingBase.stderr, /requires QUALITY_EVIDENCE_BASE_REF/u);

  const missingRef = runManifest(manifest, "pull_request", { baseRef: "refs/remotes/origin/missing-quality-base" });
  assert.equal(missingRef.status, 1);
  assert.match(missingRef.stderr, /unable to resolve baseRef/u);

});

test("push events use the pushed branch ref and pre-push SHA without remote-ref equality", () => {
  const manifest = readManifest();
  const developResult = runManifest(manifest, "push", { baseRef: "refs/heads/develop", baseSha: priorBaseSha });
  assert.equal(developResult.status, 0, developResult.stderr);
  const mainResult = runManifest(manifest, "push", { baseRef: "refs/heads/codex/vc-quality-evidence-catalog", baseSha: priorBaseSha });
  assert.equal(mainResult.status, 0, mainResult.stderr);

  const invalidRef = runManifest(manifest, "push", { baseRef: "origin/develop", baseSha: priorBaseSha });
  assert.equal(invalidRef.status, 1);
  assert.match(invalidRef.stderr, /pushed branch ref as refs\/heads/u);
  const malformedRef = runManifest(manifest, "push", { baseRef: "refs/headsXdevelop", baseSha: priorBaseSha });
  assert.equal(malformedRef.status, 1);
  assert.match(malformedRef.stderr, /pushed branch ref as refs\/heads/u);
});

test("workflow dispatch validates the selected ref and current SHA explicitly", () => {
  const manifest = readManifest();
  const result = withWorkflowDispatchRef((workflowDispatchRef) =>
    runManifest(manifest, "workflow_dispatch", { baseRef: workflowDispatchRef }),
  );
  assert.equal(result.status, 0, result.stderr);

  const stale = withWorkflowDispatchRef((workflowDispatchRef) =>
    runManifest(manifest, "workflow_dispatch", {
      baseRef: workflowDispatchRef,
      baseSha: "0".repeat(40), pushBeforeSha: "0".repeat(40),
    }),
  );
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /40-character|must equal selected ref HEAD/u);

  const invalidRef = withWorkflowDispatchRef(() =>
    runManifest(manifest, "workflow_dispatch", { baseRef: "origin/develop" }),
  );
  assert.equal(invalidRef.status, 1);
  assert.match(invalidRef.stderr, /selected refs\/heads\/|selected refs\/tags/u);
  const malformedRef = withWorkflowDispatchRef(() =>
    runManifest(manifest, "workflow_dispatch", { baseRef: "refs/headsXmain" }),
  );
  assert.equal(malformedRef.status, 1);
  assert.match(malformedRef.stderr, /selected refs\/heads\/|selected refs\/tags/u);
  const missingSelectedRef = withWorkflowDispatchRef(() =>
    runManifest(manifest, "workflow_dispatch", { baseRef: "refs/heads/missing-quality-base" }),
  );
  assert.equal(missingSelectedRef.status, 1);
  assert.match(missingSelectedRef.stderr, /unable to resolve workflow_dispatch baseRef/u);
});

test("fails closed for missing workflow inputs and unknown event names", () => {
  const manifest = readManifest();
  const missingDispatchBase = runManifest(manifest, "workflow_dispatch", { clearBase: true });
  assert.equal(missingDispatchBase.status, 1);
  assert.match(missingDispatchBase.stderr, /requires QUALITY_EVIDENCE_BASE_REF/u);

  const unknown = runManifest(manifest, "repository_dispatch", { baseRef: "refs/heads/develop" });
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /must be pull_request, push, workflow_dispatch, or local/u);
});

test("requires explicit command status and measured evidence provenance", () => {
  const manifest = readManifest();
  setLocalBase(manifest);
  manifest.evidence[0].commandStatus = "undefined";
  manifest.evidence[0].command = null;
  const undefinedCommand = runManifest(manifest);
  assert.equal(undefinedCommand.status, 0);

  const measured = readManifest();
  setLocalBase(measured);
  measured.evidence[0].status = "measured";
  measured.evidence[0].metric.value = 1;
  measured.evidence[0].review.status = "reviewed";
  measured.evidence[0].review.reviewer = "security-reviewer";
  measured.evidence[0].budget.status = "defined";
  measured.evidence[0].budget.value = 100;
  measured.evidence[0].evidence = undefined;
  const missingEvidence = runManifest(measured);
  assert.equal(missingEvidence.status, 1);
  assert.match(missingEvidence.stderr, /evidence must be an object/u);
});

test("rejects measured rows that retain a null budget or an unreviewed reviewer", () => {
  const manifest = readManifest();
  setLocalBase(manifest);
  manifest.evidence[0].status = "measured";
  manifest.evidence[0].metric.value = 1;
  manifest.evidence[0].evidence = {
    report: "tmp/evidence/review.json",
    sha256: "sha256:" + "c".repeat(64),
    runId: "local-test",
  };
  manifest.evidence[0].review.status = "reviewed";
  manifest.evidence[0].review.reviewer = "security-reviewer";
  manifest.evidence[0].budget.status = "defined";
  manifest.evidence[0].budget.value = null;
  const nullBudget = runManifest(manifest);
  assert.equal(nullBudget.status, 1);
  assert.match(nullBudget.stderr, /budget\.value must be a finite/u);

  manifest.evidence[0].budget.value = 100;
  manifest.evidence[0].review.reviewer = "unassigned";
  const result = runManifest(manifest);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /review\.reviewer must identify/u);
});

test("uses the effective CI base SHA for per-row provenance", () => {
  const manifest = readManifest();
  setLocalBase(manifest, baseSha);
  manifest.evidence[0].baseSha = priorBaseSha;
  const result = runManifest(manifest, "pull_request", {
    baseRef: "refs/remotes/origin/develop",
    baseSha: priorBaseSha,
  });
  assert.equal(result.status, 0, result.stderr);
});

test("rejects stale push boundaries and all-zero new-branch sentinels", () => {
  const manifest = readManifest();
  const stale = runManifest(manifest, "push", {
    baseRef: "refs/heads/develop",
    baseSha: olderBaseSha, pushBeforeSha: priorBaseSha,
  });
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /immutable GitHub push before SHA|prior tip|stale/u);

  const zero = runManifest(manifest, "push", {
    baseRef: "refs/heads/develop",
    baseSha: "0".repeat(40), pushBeforeSha: "0".repeat(40),
  });
  assert.equal(zero.status, 1);
  assert.match(zero.stderr, /all-zero/u);
});

test("rejects impossible calendar dates", () => {
  const manifest = readManifest();
  manifest.observedAt = "2024-02-30";
  const result = runManifest(manifest);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /observedAt must use YYYY-MM-DD/u);
});

test("rejects flag-looking option values", () => {
  const result = spawnSync(process.execPath, [script, "--root", "--help"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: process.env,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /non-flag value/u);
});

test("rejects placeholder reviewer names for reviewed evidence", () => {
  for (const reviewer of ["TBD", "n/a", "none", "pending", "todo"]) {
    const manifest = readManifest();
    setLocalBase(manifest);
    manifest.evidence[0].review.status = "reviewed";
    manifest.evidence[0].review.reviewer = reviewer;
    const result = runManifest(manifest);
    assert.equal(result.status, 1, reviewer);
    assert.match(result.stderr, /review\.reviewer must identify/u);
  }
});
