import {
  STATUS_OPENID_EVIDENCE_PROFILE,
  StatusOpenIdEvidenceRunner,
  resolveStatusOpenIdEvidenceProfile,
} from "@midnight-ntwrk/status-openid-production-evidence";

const resolved = resolveStatusOpenIdEvidenceProfile();
if (resolved.profile.id !== STATUS_OPENID_EVIDENCE_PROFILE.id) {
  throw new Error("clean consumer resolved the wrong profile");
}
const evidence = await new StatusOpenIdEvidenceRunner().run({
  correlationId: "clean-consumer",
  requestId: "clean-consumer-shift",
});
if (
  evidence.decision.outcome !== "access-granted" ||
  evidence.verification?.kind !== "ledger-receipt" ||
  evidence.productionApproved !== false ||
  evidence.externalInteroperability !== "not-run"
) {
  throw new Error("clean consumer did not observe the bounded evidence result");
}
process.stdout.write("status OpenID evidence clean consumer passed\n");
