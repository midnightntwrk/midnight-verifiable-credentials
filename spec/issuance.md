# Issuance

The protocol-independent issuance ceremony has these logical operations:

1. validate the exact credential configuration;
2. create an issuance offer or inputs;
3. create and verify a holder request when the selected binding requires one;
4. issue a credential over the exact schema, claims, commitments, holder
   binding, status binding, and issuance context; and
5. let the holder validate and process the result before storage.

The issuer proof MUST be domain-separated from a presentation proof. An issuer
MUST validate a required holder request before issuing. A holder MUST reject a
credential whose schema/configuration, binding, proof, or requested claims do
not match the issuance context.

Message delivery, retries, sessions, storage, consent UI, authentication, and
transport framing are adapter responsibilities. The core does not prescribe
their sequence or persistence model.

The complete high-level issuance API is currently unsupported. The implemented
context-tag and low-level validation primitives are mapped in the conformance
manifest; they are not evidence of an end-to-end issuance claim.
