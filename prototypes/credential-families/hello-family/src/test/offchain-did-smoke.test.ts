import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits as offchainPureCircuits } from "../managed/hello-family-offchain-credential/contract/index.js";
import { createHelloFamilyOffchainDidFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("hello-family offchain DID smoke path", () => {
  it("derives an offchain DID holder binding and verifies the VC flow", () => {
    const fixture = createHelloFamilyOffchainDidFixture({
      revealBytesValue: true,
    });

    expect(fixture.portableDidUrl.startsWith("did:midnight:offchain:")).toBe(
      true,
    );
    expect(fixture.resolvedHolder.did).toEqual(
      fixture.portableDidUrl.split("?", 1)[0],
    );
    expect(fixture.resolvedHolder.method.id).toEqual("#holder-key-1");

    expect(() =>
      offchainPureCircuits.assertHelloFamilyOffchainPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("rejects a presentation whose DID-derived holder binding no longer matches", () => {
    const fixture = createHelloFamilyOffchainDidFixture();

    expect(() =>
      offchainPureCircuits.assertHelloFamilyOffchainPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        {
          ...fixture.presentation,
          holderBinding: {
            ...fixture.presentation.holderBinding,
            holderMethodId: new Uint8Array(32).fill(3),
          },
        },
        fixture.presentationProof,
      ),
    ).toThrow(
      /Offchain Midnight holder method id does not match the credential holder binding/,
    );
  });
});
