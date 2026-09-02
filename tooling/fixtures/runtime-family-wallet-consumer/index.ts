import {
  type HolderCredentialRecord,
  type HolderCredentialStore,
  IssuerAgent,
  VerifierAgent,
} from "@midnight-ntwrk/credential-exchange";

import { reference, registry, trustVerifier } from "./runtime-family.js";
import { createRuntimeHolder } from "./wallet.js";

class MemoryStore implements HolderCredentialStore {
  private record?: HolderCredentialRecord;

  load(): HolderCredentialRecord | undefined {
    return this.record === undefined ? undefined : structuredClone(this.record);
  }

  save(record: HolderCredentialRecord): void {
    this.record = structuredClone(record);
  }
}

const recipientId = "did:consumer:alice#holder";
const store = new MemoryStore();
const { holder, adapter } = await createRuntimeHolder(
  reference,
  [registry],
  trustVerifier,
  { recipientId, credentialStore: store },
);
const issuer = new IssuerAgent(adapter);
const issuanceRequest = holder.createIssuanceRequestWithClaimOpenings(
  issuer.createOffer(),
  ["legalName"],
);
holder.acceptIssuanceResult(
  issuer.issueWithClaimOpenings(issuanceRequest),
  issuanceRequest,
);

const { holder: restartedHolder } = await createRuntimeHolder(
  reference,
  [registry],
  trustVerifier,
  { recipientId, credentialStore: store },
);
restartedHolder.restoreCredential();
const recovered = new TextDecoder().decode(
  restartedHolder.recoverClaimOpenings(["legalName"]).payload,
);
if (!recovered.includes("runtime-opening")) {
  throw new Error("runtime-resolved holder did not recover its claim opening");
}

const verifier = new VerifierAgent(adapter);
const presentationRequest = verifier.createPresentationRequest();
const result = verifier.verify(
  restartedHolder.createPresentation(presentationRequest),
  presentationRequest,
);
if (!result.valid) throw new Error("runtime-resolved clean-consumer lifecycle failed");
if (new TextDecoder().decode(result.canonicalPresentation.payload).includes("opening")) {
  throw new Error("verifier-facing payload exposed holder claim openings");
}
console.log("[credential-exchange-runtime-consumer] OK");
