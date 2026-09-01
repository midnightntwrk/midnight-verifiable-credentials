# Two-family Compact composition fixture

This checked-in fixture compiles the canonical
`@midnight-ntwrk/credential-compact` shared composition surface once, followed
by the public composition entrypoints for the private birth and hello-family
evidence packages.

It demonstrates only that:

- each family still has an independently compilable standalone root;
- both family composables can share one canonical VC/VP core without duplicate
  declarations; and
- family VC/VP aliases and module helpers are prefixed rather than exported as
  collision-prone `Credential` or `Presentation` names.

**This is explicitly non-authoritative compile/composition evidence.** It does
not bind the issuer, trust, status, time, or result-authority chain for either
credential; it does not create an aggregate multi-credential decision; and it
does not authorize a ledger or business mutation. Aggregate authority remains
out of scope until its separately governed roadmap stage.

Run the deterministic check with:

```bash
pnpm run check:compact-composition-surfaces
```

The command compiles into an operating-system temporary directory and reports
artifact byte sizes. Because every fixture circuit is pure, it must report
`k` as not applicable and must produce no prover/verifier keys, ZKIR, or BZKIR.
