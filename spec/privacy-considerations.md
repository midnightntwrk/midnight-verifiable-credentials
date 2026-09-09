# Privacy Considerations

Credential families MUST classify each field as direct, selectively disclosed,
committed, or predicate-only. Direct claims are visible wherever the canonical
credential is visible. A commitment hides a value only while its opening and
correlated metadata remain secret.

Presentations SHOULD disclose only requested data. Verifier challenges,
pseudonym scopes, schema references, status handles, timestamps, and repeated
proof material can create linkability even when claims remain hidden.

Hidden-holder designs are outside this core and require explicit unlinkability
analysis and vectors in their owning credential-family repository.
Status lookups can reveal holder activity to a registry or network observer;
adapters SHOULD minimize correlatable queries and document their leakage.

Signer authorization descriptors expose stable authorization IDs, verification
methods, keys, roles, scopes, policy commitments, and logical versions wherever
they are materialized publicly. Applications SHOULD avoid reusing identifiers
or authority domains beyond the intended trust context.

Rendering, localization, telemetry, storage, backup, deletion, and user-consent
policy are application responsibilities. An adapter MUST preserve the core's
disclosure semantics and MUST NOT log private witnesses or claim openings.
