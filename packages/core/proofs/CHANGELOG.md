# Changelog

## 0.1.0

- Added the proof-job, provider, verifier, and artifact-resolver ports.
- Added the fail-closed hidden-holder public-surface scanner and byte-redacted snapshot helper.
- Added immutable versioned proof, build, and deployment manifest contracts with validation.
- Added scope-bound trusted-time evidence, ledger/attested adapter ports, and rollback/replay/freshness validation.
- Added #492-derived signed artifact/deployment authority verification, #494
  transcript binding, authoritative receipt ports, deterministic k/rows/size
  vectors, and classification parity evidence that preserves authority labels.

This package deliberately does not ship family circuits, proving or verifier
keys, ZKIR/BZKIR, deployment bundles, authority, verification-v1, or runtime
adapters.
- Promoted the package into the supported RC2 development surface.
