# Components

This area contains thin adapters between core VC packages and external runtime
APIs.

It must not contain applications, agents, workflow/session orchestration,
transport protocols, storage engines, or deployment harnesses.

Adapters may depend on `packages/core/` and their explicit external SDKs. Core
packages must not depend on adapters.
