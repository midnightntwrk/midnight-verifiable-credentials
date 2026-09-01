import { IssuerAgent, VerifierAgent } from "@midnight-ntwrk/credential-exchange";

import { reference, registry, trustVerifier } from "./runtime-family.js";
import { createRuntimeHolder } from "./wallet.js";

const { holder, adapter } = await createRuntimeHolder(
  reference,
  [registry],
  trustVerifier,
);
const issuer = new IssuerAgent(adapter);
const verifier = new VerifierAgent(adapter);
const issuanceRequest = holder.createIssuanceRequest(issuer.createOffer());
holder.acceptCredential(issuer.issue(issuanceRequest));
const presentationRequest = verifier.createPresentationRequest();
const result = verifier.verify(
  holder.createPresentation(presentationRequest),
  presentationRequest,
);
if (!result.valid) throw new Error("runtime-resolved clean-consumer lifecycle failed");
console.log("[credential-exchange-runtime-consumer] OK");
