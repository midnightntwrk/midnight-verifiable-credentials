import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/dummy-claims-credential/contract/index.js";
import { createDummyClaimsFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("dummy-claims validation guards", () => {
  it("rejects a tampered credential body under the issuer proof", () => {
    const fixture = createDummyClaimsFixture();

    expect(() =>
      pureCircuits.assertValidDummyClaimsCredential(
        {
          ...fixture.credential,
          claimRoot: new Uint8Array(32).fill(7),
        },
        fixture.credentialProof,
      ),
    ).toThrow(/Credential claim root mismatch/);
  });

  it("rejects a presentation whose holder binding no longer matches the credential", () => {
    const fixture = createDummyClaimsFixture();

    expect(() =>
      pureCircuits.assertValidDummyClaimsPresentation(
        fixture.credential,
        fixture.credentialProof,
        {
          ...fixture.presentation,
          holderBinding: {
            holderVerificationMethodRef: {
              ...fixture.presentation.holderBinding.holderVerificationMethodRef,
              methodId: new Uint8Array(32).fill(3),
            },
          },
        },
        fixture.presentationProof,
      ),
    ).toThrow(
      /Presentation holder method reference does not match credential holder binding/,
    );
  });

  it("rejects a presentation request without a verifier challenge", () => {
    const fixture = createDummyClaimsFixture();

    expect(() =>
      pureCircuits.assertValidDummyClaimsPresentationRequest({
        ...fixture.presentationRequest,
        verifierChallengeHash: new Uint8Array(32),
      }),
    ).toThrow(/Dummy-claims verifier challenge must be set/);
  });

  it("rejects a request whose challenge no longer matches the presentation proof", () => {
    const fixture = createDummyClaimsFixture();

    expect(() =>
      pureCircuits.assertDummyClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        {
          ...fixture.presentationRequest,
          verifierChallengeHash: new Uint8Array(32).fill(9),
        },
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /Dummy-claims presentation proof challenge does not match the request/,
    );
  });
});
