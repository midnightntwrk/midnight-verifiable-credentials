import { describe, expect, it, vi } from "vitest";

import {
  parseExternalInteropCompletion,
  runExternalInterop,
  validateExternalInteropConfig,
} from "../index.js";

const config = () => ({
  implementation: "independent-wallet/1.0",
  issuerMetadataUrl: "https://issuer.example/.well-known/openid-credential-issuer",
  credentialOfferUri: "https://issuer.example/offers/one-time-reference",
  walletIssuanceAutomationUrl: "https://wallet.example/oid4vci/accept",
  verifierRequestUrl: "https://verifier.example/requests/one-time-reference",
  walletPresentationAutomationUrl: "https://wallet.example/oid4vp/present",
  timeoutMs: 15_000,
});

const jsonResponse = (value: unknown) => ({
  status: 200,
  contentType: "application/json; charset=utf-8",
  body: new TextEncoder().encode(JSON.stringify(value)),
});

describe("external interoperability runner contract", () => {
  it("validates dry-run configuration without contacting endpoints or claiming execution", async () => {
    const request = vi.fn();
    const result = await runExternalInterop({
      config: validateExternalInteropConfig(config()),
      dryRun: true,
      request,
    });
    expect(request).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      executed: false,
      oid4vci: { attempted: false, status: "not-run" },
      oid4vp: { attempted: false, status: "not-run" },
    });
  });

  it("rejects incomplete, credentialed, fragmented, and non-HTTPS configuration", () => {
    expect(() => validateExternalInteropConfig({ ...config(), implementation: "" })).toThrow(/implementation/);
    expect(() => validateExternalInteropConfig({ ...config(), issuerMetadataUrl: "http://issuer.example/metadata" })).toThrow(/HTTPS/);
    expect(() => validateExternalInteropConfig({ ...config(), verifierRequestUrl: "https://user@verifier.example/request" })).toThrow(/credentials/);
    expect(() => validateExternalInteropConfig({ ...config(), credentialOfferUri: "https://issuer.example/offer#fragment" })).toThrow(/fragment/);
    expect(() => validateExternalInteropConfig({ ...config(), timeoutMs: 0 })).toThrow(/timeoutMs/);
  });

  it("accepts only implementation-bound, protocol-bound completion evidence", () => {
    const valid = {
      completed: true,
      protocol: "oid4vci",
      result: "accepted",
      implementation: "independent-wallet/1.0",
      artifact_id: "issuance-123",
    };
    expect(parseExternalInteropCompletion(jsonResponse(valid), "oid4vci", "accepted", valid.implementation)).toEqual({
      implementation: valid.implementation,
      artifactId: valid.artifact_id,
      result: valid.result,
    });
    for (const mutation of [
      { completed: false },
      { protocol: "oid4vp" },
      { result: "verified" },
      { implementation: "different-wallet" },
      { artifact_id: "" },
    ]) {
      expect(parseExternalInteropCompletion(jsonResponse({ ...valid, ...mutation }), "oid4vci", "accepted", valid.implementation)).toBeNull();
    }
    expect(parseExternalInteropCompletion({ ...jsonResponse(valid), status: 202 }, "oid4vci", "accepted", valid.implementation)).toBeNull();
    expect(parseExternalInteropCompletion({ ...jsonResponse(valid), contentType: "text/plain" }, "oid4vci", "accepted", valid.implementation)).toBeNull();
  });

  it("marks both lanes passed only when endpoint and completion contracts succeed", async () => {
    const responses = [
      { status: 200, contentType: "application/json", body: new Uint8Array([1]) },
      jsonResponse({ completed: true, protocol: "oid4vci", result: "accepted", implementation: "independent-wallet/1.0", artifact_id: "issuance-123" }),
      { status: 200, contentType: "application/oauth-authz-req+jwt", body: new Uint8Array([2]) },
      jsonResponse({ completed: true, protocol: "oid4vp", result: "verified", implementation: "independent-wallet/1.0", artifact_id: "presentation-123" }),
    ];
    const request = vi.fn(async () => responses.shift()!);
    const result = await runExternalInterop({ config: validateExternalInteropConfig(config()), dryRun: false, request });
    expect(result.oid4vci.status).toBe("passed");
    expect(result.oid4vp.status).toBe("passed");
    expect(request).toHaveBeenCalledTimes(4);
  });
});
