import {
  aggregateDecisionDomainV1,
  hashAggregateChildSetV1,
  zeroBytes32V1,
} from "@midnight-ntwrk/midnight-did-credentials";
import { pureCircuits as credentialsPureCircuits } from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import { describe, expect, it } from "vitest";

import { proveBlindedAggregateSameHolderBindingV1 } from "../index.js";

const bytes = (value: number): Uint8Array => new Uint8Array(32).fill(value);
const hex = (value: Uint8Array): string =>
  Array.from(value, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 12);

const fixture = (holderSecret = bytes(11)) => {
  const challenge = bytes(12);
  const entries = [
    { opening: bytes(13), blinding: bytes(14), nonce: bytes(15) },
    { opening: bytes(16), blinding: bytes(17), nonce: bytes(18) },
  ] as const;
  const bindings = entries.map(({ opening, blinding, nonce }) => {
    const commitment = credentialsPureCircuits.secretHolderBindingCommitment(
      holderSecret,
      opening,
    );
    return {
      blindedHolderSecretCommitment:
        credentialsPureCircuits.blindedSecretHolderCommitment(
          commitment,
          nonce,
          blinding,
        ),
      issuerNonce: nonce,
      requestChallengeResponse:
        credentialsPureCircuits.secretHolderBindingChallengeResponse(
          holderSecret,
          challenge,
        ),
    };
  });
  const childDigests = [bytes(31), bytes(32)];
  const childSetDigest = hashAggregateChildSetV1({
    domain: aggregateDecisionDomainV1("childSet"),
    version: 1n,
    childCount: 2n,
    firstChildDigest: childDigests[0],
    secondChildDigest: childDigests[1],
    thirdChildDigest: zeroBytes32V1(),
  });
  return {
    verifierContractDigest: bytes(10),
    verifierChallengeHash: challenge,
    holderSecret,
    bindings,
    openings: entries.map((entry) => entry.opening),
    blindingFactors: entries.map((entry) => entry.blinding),
    childSetDigest,
    childDigests,
  };
};

describe("aggregate same-holder authority bridge", () => {
  it("proves the private pair before emitting only scoped aggregate evidence", () => {
    const result = proveBlindedAggregateSameHolderBindingV1(fixture());
    expect({
      mode: result.mode,
      count: result.childCount,
      childSet: hex(result.childSetDigest),
      verifier: hex(result.verifierContractDigest),
      challenge: hex(result.challengeDigest),
      first: hex(result.firstHolderBindingDigest),
      second: hex(result.secondHolderBindingDigest),
      proof: hex(result.proofDigest),
    }).toMatchInlineSnapshot(`
      {
        "challenge": "0c0c0c0c0c0c",
        "childSet": "e229c8aa4da5",
        "count": 2n,
        "first": "0b46f86a7b32",
        "mode": 1n,
        "proof": "5d1c21d80b27",
        "second": "dbd257f6735c",
        "verifier": "0a0a0a0a0a0a",
      }
    `);
    expect(Object.keys(result)).not.toContain("holderSecret");
    expect(Object.keys(result)).not.toContain("openings");
    expect(result.proofDigest).not.toEqual(bytes(1));
  });

  it("rejects a proof receipt scoped to different aggregate child digests", () => {
    const input = fixture();
    input.childDigests[0].fill(99);
    expect(() => proveBlindedAggregateSameHolderBindingV1(input)).toThrow(
      /exact aggregate child set/,
    );
  });

  it("does not emit aggregate same-holder evidence when one witness differs", () => {
    const input = fixture();
    input.bindings[1].requestChallengeResponse =
      credentialsPureCircuits.secretHolderBindingChallengeResponse(
        bytes(99),
        input.verifierChallengeHash,
      );
    expect(() => proveBlindedAggregateSameHolderBindingV1(input)).toThrow();
  });
});
