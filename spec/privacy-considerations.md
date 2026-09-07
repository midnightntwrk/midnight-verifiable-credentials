# Privacy Considerations

Credential families MUST classify each field as direct, selectively disclosed,
committed, or predicate-only. Direct claims are visible wherever the canonical
credential is visible. A commitment hides a value only while its opening and
correlated metadata remain secret.

Presentations SHOULD disclose only requested data. Verifier challenges,
pseudonym scopes, schema references, status handles, timestamps, and repeated
proof material can create linkability even when claims remain hidden.

Hidden-holder designs require explicit unlinkability analysis and vectors.
Status lookups can reveal holder activity to a registry or network observer;
adapters SHOULD minimize correlatable queries and document their leakage.

Rendering, localization, telemetry, storage, backup, deletion, and user-consent
policy are application responsibilities. An adapter MUST preserve the core's
disclosure semantics and MUST NOT log private witnesses or claim openings.
