import assert from "node:assert/strict";

import { UniversityProtocolFlowRunner } from "@midnight-ntwrk/midnight-did-university-protocol/testing";

import {
  createUniversityScenarioBackend,
  loadUniversityScenarioBackendMode,
  type UniversityScenarioBackendMode,
} from "../features/support/university-scenario-backend.ts";

const originalBackendMode = process.env.UNIVERSITY_BDD_BACKEND;

const acceptedCases: ReadonlyArray<
  readonly [
    rawMode: string | undefined,
    expected: UniversityScenarioBackendMode,
  ]
> = [
  [undefined, "simulator"],
  ["", "simulator"],
  [" simulator ", "simulator"],
  ["standalone-hybrid", "standalone-hybrid"],
  ["proof-server-contract", "proof-server-contract"],
];

try {
  for (const [rawMode, expected] of acceptedCases) {
    if (rawMode === undefined) {
      delete process.env.UNIVERSITY_BDD_BACKEND;
    } else {
      process.env.UNIVERSITY_BDD_BACKEND = rawMode;
    }

    assert.equal(loadUniversityScenarioBackendMode(), expected);
  }

  process.env.UNIVERSITY_BDD_BACKEND = "proof-server";
  assert.throws(
    () => loadUniversityScenarioBackendMode(),
    /Unsupported UNIVERSITY_BDD_BACKEND=proof-server/,
  );

  const proofServerBackend = createUniversityScenarioBackend(
    "proof-server-contract",
  );
  const proofServerContext = await proofServerBackend.initialize();
  await assert.rejects(
    () => proofServerBackend.initialize(),
    /Proof-server contract university backend already initialized/,
  );

  new UniversityProtocolFlowRunner({
    dataPaths: proofServerContext.dataPaths,
    partyRuntime: proofServerContext.protocol.partyRuntime,
    proofExecutionBackend: proofServerContext.protocol.proofExecutionBackend,
  }).runAll();

  const exchanges =
    proofServerContext.protocol.proofServerRecorder?.snapshotExchanges() ?? [];
  const operationCounts: Record<string, number> = {};
  for (const exchange of exchanges) {
    operationCounts[exchange.request.operationKind] =
      (operationCounts[exchange.request.operationKind] ?? 0) + 1;
  }

  assert.deepEqual(operationCounts, {
    issueDiplomaCredential: 10,
    buildJobApplicationRequest: 10,
    buildPresentationSubmission: 15,
    verifyJobApplication: 10,
    buildMallDiscountRequest: 5,
    verifyMallDiscount: 5,
  });
} finally {
  if (originalBackendMode === undefined) {
    delete process.env.UNIVERSITY_BDD_BACKEND;
  } else {
    process.env.UNIVERSITY_BDD_BACKEND = originalBackendMode;
  }
}
