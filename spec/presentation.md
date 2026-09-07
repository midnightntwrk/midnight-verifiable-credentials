# Presentation

The verifier creates a request containing an unpredictable challenge and the
exact configuration, disclosures, predicates, and status requirements. The
holder creates a presentation for that request and no other request.

A presentation MUST bind:

- the exact request and challenge;
- the exact credential/schema configuration;
- every disclosed claim and predicate result;
- the selected holder binding;
- applicable status evidence; and
- a presentation-context proof.

Challenge substitution, replay, schema substitution, omitted required
disclosures, altered predicate inputs, and holder-binding substitution MUST be
rejected.

Transport response modes, redirects, QR codes, wallet sessions, and business
authorization are outside this ceremony. The complete high-level presentation
API remains unsupported until positive and negative round-trip vectors exist.

