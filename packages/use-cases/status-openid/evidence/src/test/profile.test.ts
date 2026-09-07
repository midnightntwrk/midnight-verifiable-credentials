import { MIDNIGHT_OPENID_PROFILE_V1 } from "@midnight-ntwrk/midnight-did-credentials-openid";
import { describe, expect, it } from "vitest";

import { resolveStatusOpenIdEvidenceProfile, STATUS_OPENID_EVIDENCE_PROFILE } from "../index.js";

describe("status OpenID production-evidence profile", () => {
  it("resolves the status-enabled profile and exact public provider graph", () => {
    const resolved = resolveStatusOpenIdEvidenceProfile();
    expect(resolved.profile).toEqual({ id: STATUS_OPENID_EVIDENCE_PROFILE.id, version: "1.0.0" });
    expect(STATUS_OPENID_EVIDENCE_PROFILE.semantics).toMatchObject({
      status: { mode: "ledger-local", authenticated: true },
      trustedTime: { source: "ledger" },
      verification: { profile: "ledger-local-v1", commitState: "committed" },
      mutation: { location: "ledger", consumption: "atomic" },
      protocols: ["canonical-reference", "oid4vci-1.0-final", "oid4vp-1.0-final", "dcql"],
    });
    expect(resolved.providers.map(({ role }) => role).sort()).toEqual([
      "did-resolver",
      "key-custody",
      "network",
      "proof-executor",
      "replay",
      "session",
      "signing",
      "status-authority",
      "status-proof",
      "status-registry",
      "storage",
      "transport",
      "trust-resolver",
      "verification",
      "wallet",
    ]);
    expect(resolved.packages.map(({ name, exports }) => ({ name, exports })).sort((left, right) => left.name.localeCompare(right.name))).toEqual([
      "@midnight-ntwrk/credential-proofs",
      "@midnight-ntwrk/credential-status-midnight-authority",
      "@midnight-ntwrk/credential-status-midnight-contract",
      "@midnight-ntwrk/credential-status-midnight-verifier",
      "@midnight-ntwrk/midnight-did-credentials",
      "@midnight-ntwrk/midnight-did-credentials-openid",
      "@midnight-ntwrk/status-openid-production-evidence",
    ].map((name) => ({ name, exports: ["."] })));
    expect(resolved.assembly).toEqual({ id: "assembly.use-case.contractor-access-status-openid-v1", version: "1.0.0" });
    expect(MIDNIGHT_OPENID_PROFILE_V1).toBe("org.midnight.credentials.openid.v1");
  });
});
