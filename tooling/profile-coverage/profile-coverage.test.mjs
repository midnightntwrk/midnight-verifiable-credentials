import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  COVERAGE_AXES,
  FIXED_AXES,
  GENERATED_PATHS,
  MANDATORY_HIGHER_ORDER_IDS,
  enumerateAllowedCandidates,
  executeNegativeFixture,
  generateCoverageReport,
  loadPrototypeManifests,
  renderGeneratedOutputs,
  resolveCompactExportSource,
  resolveKnownCompactExportSource,
  validateEvidenceReference,
  validatePrototypeManifests,
} from "./profile-coverage.mjs";

const repoRoot = new URL("../../", import.meta.url);

const evidencePathExists = (reference) => validateEvidenceReference(reference);

test("all retained prototypes have complete validated #492 manifests", () => {
  const manifests = loadPrototypeManifests();
  assert.deepEqual(
    manifests.map((manifest) => manifest.prototype.id),
    [
      "birth",
      "birth-secret",
      "digital-passport",
      "dummy-claims",
      "hello-family",
      "mixed-claims",
      "university-diploma",
    ],
  );

  const resolved = validatePrototypeManifests(manifests);
  assert.equal(resolved.length, manifests.length);
  for (const [index, manifest] of manifests.entries()) {
    assert.equal(manifest.formatVersion, 1);
    assert.ok(manifest.prototype.hypothesis.length > 0);
    assert.ok(manifest.prototype.owner.length > 0);
    assert.ok(manifest.prototype.limitations.length > 0);
    assert.ok(manifest.prototype.exitCriterion.length > 0);
    assert.equal(resolved[index].profile.id, manifest.profile.id);
    assert.equal(resolved[index].conformance.fixtureId, manifest.profile.conformance.fixtureId);
    for (const reference of [
      manifest.familyDefinition,
      manifest.evidence.fixture,
      manifest.evidence.graph,
      manifest.evidence.happyPath,
      ...manifest.evidence.negatives,
    ]) {
      assert.ok(evidencePathExists(reference), `${reference} must resolve`);
    }
    for (const entrypoint of manifest.profile.requirements.compactEntrypoints) {
      assert.equal(
        resolveCompactExportSource(manifest.prototype.workspace, entrypoint),
        entrypoint.sourcePath,
        `${manifest.prototype.id} Compact export must map to its declared source`,
      );
    }
  }

  const hello = manifests.find((manifest) => manifest.prototype.id === "hello-family");
  assert.ok(hello);
  assert.equal(hello.profile.semantics.holderBinding.mode, "offchain-did");
  assert.equal(
    hello.profile.requirements.compactEntrypoints[0].sourcePath,
    "packages/prototypes/credential-families/hello-family/src/hello-family-offchain-credential.compact",
  );

  const dummyClaims = manifests.find((manifest) => manifest.prototype.id === "dummy-claims");
  assert.ok(dummyClaims);
  assert.ok(dummyClaims.profile.semantics.claims.every((claim) => claim.disclosure === "selective"));

  const drifted = structuredClone(manifests);
  drifted[0].profile.semantics.claims[0].claimId = "manifest-only-drift";
  assert.throws(
    () => validatePrototypeManifests(drifted),
    /profile claim semantics must exactly match the referenced family definition/u,
  );
});

test("coverage generation is deterministic and proves its exact bounded guarantees", () => {
  const first = generateCoverageReport();
  const second = generateCoverageReport();
  assert.deepEqual(first, second);

  assert.equal(first.guarantees.scope, "independently-selectable-axes-only");
  assert.equal(first.guarantees.exhaustiveCartesianCoverage, false);
  assert.equal(first.guarantees.uncoveredSupportedValues.length, 0);
  assert.equal(first.guarantees.uncoveredAllowedPairs.length, 0);
  assert.ok(first.guarantees.selectedPositiveRows < first.guarantees.allowedCandidateRows);

  for (const axis of COVERAGE_AXES) {
    for (const value of axis.values) {
      assert.ok(
        first.positiveRows.some((row) => row.values[axis.id] === value),
        `${axis.id}=${value} must be covered`,
      );
    }
  }

  const allowedCandidates = enumerateAllowedCandidates();
  assert.ok(
    allowedCandidates
      .filter((candidate) => candidate.values.holderBinding === "offchain-did")
      .every((candidate) => candidate.values.verification === "offchain-public-v1"),
    "offchain DID rows must remain offchain-only",
  );
  for (let leftIndex = 0; leftIndex < COVERAGE_AXES.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < COVERAGE_AXES.length; rightIndex += 1) {
      const left = COVERAGE_AXES[leftIndex];
      const right = COVERAGE_AXES[rightIndex];
      for (const leftValue of left.values) {
        for (const rightValue of right.values) {
          const allowed = allowedCandidates.some(
            (candidate) =>
              candidate.values[left.id] === leftValue &&
              candidate.values[right.id] === rightValue,
          );
          const covered = first.positiveRows.some(
            (row) =>
              row.values[left.id] === leftValue &&
              row.values[right.id] === rightValue,
          );
          assert.equal(
            covered,
            allowed,
            `${left.id}=${leftValue} × ${right.id}=${rightValue}`,
          );
        }
      }
    }
  }
});

test("fixed axes, mandatory higher-order rows, and forbidden negatives are explicit", () => {
  const report = generateCoverageReport();

  assert.deepEqual(report.fixedAxes, FIXED_AXES);
  const fixedValue = (row, axisId) => ({
    "issuance.credential": row.fixture.profile.semantics.issuance.credential,
    "presentation.preparation": row.fixture.profile.semantics.presentation.preparation,
    "did.method": row.fixture.profile.semantics.did.method,
    "trust.scope": row.fixture.profile.semantics.trust.scope,
  })[axisId];
  for (const axis of report.fixedAxes) {
    assert.ok(axis.rationale.length > 0);
    assert.ok(axis.securityInteractions.length > 0);
    assert.ok(axis.evidence.every(evidencePathExists));
    assert.ok(report.positiveRows.every((row) => fixedValue(row, axis.id) === axis.value));
    for (const interactionId of axis.securityInteractions) {
      const interaction = COVERAGE_AXES.find((candidate) => candidate.id === interactionId);
      assert.ok(interaction, `${axis.id} interaction ${interactionId} must be a varied axis`);
      for (const value of interaction.values) {
        assert.ok(
          report.positiveRows.some((row) => row.values[interactionId] === value && fixedValue(row, axis.id) === axis.value),
          `${axis.id} must interact with ${interactionId}=${value}`,
        );
      }
    }
  }

  assert.deepEqual(
    report.positiveRows.filter((row) => row.mandatoryHigherOrder !== null).map((row) => row.mandatoryHigherOrder),
    MANDATORY_HIGHER_ORDER_IDS,
  );
  assert.ok(MANDATORY_HIGHER_ORDER_IDS.includes("openid-protocol-capability-selection"));
  assert.ok(!MANDATORY_HIGHER_ORDER_IDS.includes("openid-transcript-binding"));
  assert.deepEqual(
    report.negativeRows.map((row) => row.rule),
    report.compatibilityDenyRules,
  );
  for (const row of report.positiveRows) {
    assert.ok(row.resolvedGraph.packages.some((entry) => entry.domain === "holder-binding"));
    assert.ok(row.resolvedGraph.providers.some((entry) => entry.role === "verification"));
    assert.ok(row.resolvedGraph.packages.some((entry) => entry.domain === "verification"));
    assert.ok(row.resolvedGraph.deployments.some((entry) => entry.domain === "verification"));
    assert.ok(row.resolvedGraph.compactEntrypoints.some((entry) => entry.id.endsWith(".verification")));
    for (const entrypoint of row.resolvedGraph.compactEntrypoints) {
      assert.equal(resolveKnownCompactExportSource(entrypoint), entrypoint.sourcePath);
    }
    for (const [enabled, domain, role, entrypointSuffix] of [
      [row.values.status !== "disabled", "status-registry", "status-registry", ".status"],
      [row.values.protocol !== "disabled", "protocol", "transport", null],
      [row.values.composition === "same-holder" || ["secret", "blinded-secret"].includes(row.values.holderBinding), "proof", "proof-executor", null],
      [row.values.mutation === "atomic-ledger", "replay", "replay", null],
    ]) {
      assert.equal(row.resolvedGraph.packages.some((entry) => entry.domain === domain), enabled);
      assert.equal(row.resolvedGraph.providers.some((entry) => entry.role === role), enabled);
      assert.equal(row.resolvedGraph.deployments.some((entry) => entry.domain === domain), enabled);
      if (entrypointSuffix !== null) {
        assert.equal(row.resolvedGraph.compactEntrypoints.some((entry) => entry.id.endsWith(entrypointSuffix)), enabled);
      }
    }
    assert.equal(
      row.resolvedGraph.compactEntrypoints.some((entry) => entry.id.endsWith(".same-holder")),
      row.values.composition === "same-holder",
    );
  }

  const protocolSelection = report.positiveRows.find(
    (row) => row.mandatoryHigherOrder === "openid-protocol-capability-selection",
  );
  assert.ok(protocolSelection);
  assert.match(protocolSelection.securityBoundary, /capability selection only/u);
  assert.match(protocolSelection.securityBoundary, /does not prove transcript binding/iu);

  const sameHolder = report.positiveRows.find(
    (row) => row.mandatoryHigherOrder === "same-holder-composition",
  );
  assert.ok(sameHolder);
  assert.equal(sameHolder.behaviorEvidence.kind, "two-binding-compact-circuit");
  assert.equal(sameHolder.behaviorEvidence.bindingCount, 2);
  assert.equal(sameHolder.behaviorEvidence.authoritative, false);
  assert.equal(new Set(sameHolder.behaviorEvidence.bindingIds).size, 2);
  assert.ok(evidencePathExists(sameHolder.behaviorEvidence.executableTest));

  for (const row of [...report.positiveRows, ...report.negativeRows]) {
    for (const reference of [
      row.evidence.fixture,
      row.evidence.graph,
      row.evidence.happyPath,
      ...row.evidence.negatives,
    ]) {
      assert.ok(evidencePathExists(reference), `${row.id}: ${reference} must resolve`);
    }
  }
  for (const row of report.negativeRows) {
    assert.equal(row.supported, false);
    assert.equal(row.unsupportedRationale.code, row.rule);
    assert.ok(row.unsupportedRationale.message.length > 0);
    assert.equal(row.fixture.id, `deny:${row.rule}`);
    assert.deepEqual(executeNegativeFixture(row.rule), row.assertion);
    assert.equal(row.assertion.thrownCode, row.rule);
    assert.ok(row.evidence.negatives[0].includes(`/negativeRows/${report.negativeRows.indexOf(row)}/assertion`));
  }
  assert.equal(new Set(report.negativeRows.map((row) => row.evidence.negatives[0])).size, report.negativeRows.length);
});

test("lint profile coverage preparation is Compact-toolchain-free and evidence fragments are exact", () => {
  const rootPackage = JSON.parse(readFileSync(new URL("package.json", repoRoot), "utf8"));
  assert.match(rootPackage.scripts["prepare:profile-coverage"], /packages\/core\/model\/tsconfig\.build\.json/u);
  assert.doesNotMatch(rootPackage.scripts["prepare:profile-coverage"], /compact|build:cone:foundation/iu);
  assert.doesNotMatch(rootPackage.scripts["check:profile-coverage"], /build:cone:foundation/iu);

  assert.throws(
    () => validateEvidenceReference("tooling/profile-coverage/profile-coverage.test.mjs#L999999"),
    /outside the file/u,
  );
  assert.throws(
    () => validateEvidenceReference("tooling/profile-coverage/generated/profile-coverage.json#/positiveRows/not-an-index"),
    /no JSON pointer target/u,
  );
});

test("generated JSON and markdown surfaces are drift-free and avoid overclaiming", () => {
  const outputs = renderGeneratedOutputs();
  assert.deepEqual(Object.keys(outputs).sort(), Object.values(GENERATED_PATHS).sort());
  for (const [relativePath, expected] of Object.entries(outputs)) {
    assert.equal(readFileSync(new URL(relativePath, repoRoot), "utf8"), expected, `${relativePath} drifted`);
  }

  const reportMarkdown = outputs[GENERATED_PATHS.reportMarkdown];
  assert.match(reportMarkdown, /every supported value and every allowed pair across independently selectable axes/);
  assert.match(reportMarkdown, /does not claim exhaustive Cartesian coverage/);
  assert.doesNotMatch(reportMarkdown, /whole-space pairwise coverage/iu);
  assert.match(reportMarkdown, /OpenID protocol-capability selection only/iu);
  assert.match(reportMarkdown, /two-binding circuit test.*non-authoritative/iu);

  const prototypeReadme = outputs[GENERATED_PATHS.prototypeReadme];
  for (const heading of [
    "Capability matrix",
    "Maturity matrix",
    "Package and artifact matrix",
    "Privacy and trust matrix",
    "Test evidence matrix",
  ]) {
    assert.match(prototypeReadme, new RegExp(`## ${heading}`));
  }
});
