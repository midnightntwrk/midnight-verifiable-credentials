import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  pureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials-birth/managed/birth-credential/contract/index.js";
import {
  createBirthCredentialProtocolFixtureForParticipants,
  createSigner,
} from "@midnight-ntwrk/midnight-did-credentials-birth/testing";
import { AccessDecision } from "@midnight-ntwrk/midnight-did-credentials-demo-contract";
import { CredentialsDemoSimulator } from "@midnight-ntwrk/midnight-did-credentials-demo-contract/testing";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

for (const relativePath of [
  "credentials-birth/dist/testing.js",
  "credentials-demo-contract/dist/testing.js",
]) {
  if (!existsSync(path.resolve(repoRoot, relativePath))) {
    console.error(
      `Missing build prerequisite: ${relativePath}. Run npm run test:serenity:smoke from the repo root first.`,
    );
    process.exit(1);
  }
}

const verifierChallengeHash = new Uint8Array(
  createHash("sha256").update("serenity:birth-age-gate").digest(),
);

const issuer = createSigner("serenity-issuer", 123456789n);
const holder = createSigner("serenity-holder", 987654321n);
const fixture = createBirthCredentialProtocolFixtureForParticipants(
  issuer,
  holder,
  verifierChallengeHash,
);

const simulator = new CredentialsDemoSimulator();
simulator.issueBirthCredential(
  fixture.credential,
  fixture.credentialProof,
  fixture.holder.publicKey,
);
simulator.setAgeWitness(
  fixture.witness.birthDateDays,
  fixture.witness.birthDateOpening,
);

const capability = simulator.issueAgeGateCapability(
  fixture.credential,
  fixture.credentialProof,
  fixture.presentation,
  fixture.presentationProof,
  fixture.verificationRequest.verifierChallengeHash,
  fixture.witness.currentDay,
);
const claimDecision = simulator.claimAgeGateCapability(capability);
const state = simulator.getLedger();
const expectedCredentialRoot = pureCircuits.birthCredentialBodyRoot(
  fixture.credential,
);

const toHex = (value) => Buffer.from(value).toString("hex");
const accessDecisionName = Object.entries(AccessDecision).find(
  ([, enumValue]) => enumValue === claimDecision,
)?.[0] ?? String(claimDecision);

console.log(
  JSON.stringify({
    scenario: "birth-credential-age-gate-happy-path",
    approved: claimDecision === AccessDecision.approved,
    claimDecision: accessDecisionName,
    issuedCredentialCount: Number(state.issuedCredentialCount),
    verifiedPresentationCount: Number(state.verifiedPresentationCount),
    consumedAccessCapabilityCount: Number(state.consumedAccessCapabilityCount),
    lastVerifiedCredentialRoot: toHex(state.lastVerifiedCredentialRoot),
    expectedCredentialRoot: toHex(expectedCredentialRoot),
    lastVerifiedRequestChallenge: toHex(state.lastVerifiedRequestChallenge),
  }),
);
