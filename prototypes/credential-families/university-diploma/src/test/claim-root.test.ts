import { TextEncoder } from "node:util";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/university-diploma/contract/index.js";

setNetworkId("undeployed");

const padText = (value: string, length = 32): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length >= length) {
    return bytes.subarray(0, length);
  }
  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

const claims = () => ({
  subjectIdCommitment: pureCircuits.graduateSubjectIdCommitment(
    padText("graduate-123"),
    padText("open-subject"),
  ),
  legalNameCommitment: pureCircuits.graduateLegalNameCommitment(
    padText("Ana Lucia Ramirez Soto"),
    padText("open-legal-name"),
  ),
  documentTypeCommitment: pureCircuits.documentTypeCommitment(
    padText("DNI"),
    padText("open-document-type"),
  ),
  documentNumberCommitment: pureCircuits.documentNumberCommitment(
    padText("12345678"),
    padText("open-document-number"),
  ),
  degreeTitleCommitment: pureCircuits.degreeTitleCommitment(
    padText("Bachiller Sistemas"),
    padText("open-degree-title"),
  ),
  programCommitment: pureCircuits.programCommitment(
    padText("Ingenieria Sistemas"),
    padText("open-program"),
  ),
  facultyCommitment: pureCircuits.facultyCommitment(
    padText("Facultad FISI"),
    padText("open-faculty"),
  ),
  awardDateCommitment: pureCircuits.awardDateCommitment(
    20515n,
    padText("open-award-date"),
  ),
  graduationStatusCommitment: pureCircuits.graduationStatusCommitment(
    padText("completed"),
    padText("open-grad-status"),
  ),
  registryRecordIdCommitment: pureCircuits.registryRecordIdCommitment(
    padText("UNMSM-DIP-2026-4821"),
    padText("open-registry-record"),
  ),
  issuanceBatchIdCommitment: pureCircuits.issuanceBatchIdCommitment(
    padText("BATCH-2026-APR-03"),
    padText("open-batch-id"),
  ),
});

describe("university diploma claim root", () => {
  it("stays stable for identical claims and changes when diploma facts change", () => {
    const baselineClaims = claims();
    const baselineRoot =
      pureCircuits.universityDiplomaCredentialClaimRoot(baselineClaims);
    const sameRoot =
      pureCircuits.universityDiplomaCredentialClaimRoot(claims());

    expect(sameRoot).toEqual(baselineRoot);

    const changedClaims = {
      ...baselineClaims,
      degreeTitleCommitment: pureCircuits.degreeTitleCommitment(
        padText("Bachiller Derecho"),
        padText("open-degree-title"),
      ),
    };

    expect(
      pureCircuits.universityDiplomaCredentialClaimRoot(changedClaims),
    ).not.toEqual(baselineRoot);
  });
});
