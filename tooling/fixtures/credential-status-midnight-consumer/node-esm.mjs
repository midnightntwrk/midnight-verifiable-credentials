import { InMemoryStatusRegistryContractV1 } from "@midnight-ntwrk/credential-status-midnight-contract";
import { deriveStatusHandleDigestV1 } from "@midnight-ntwrk/credential-status-midnight-verifier";
import { createStatusRegistryAuthorityGateV1 } from "@midnight-ntwrk/credential-status-midnight-authority";

if (typeof InMemoryStatusRegistryContractV1 !== "function") throw new Error("contract export missing");
if (!deriveStatusHandleDigestV1(new Uint8Array([1])).startsWith("sha256:")) throw new Error("verifier export missing");
if (typeof createStatusRegistryAuthorityGateV1 !== "function") throw new Error("authority export missing");
console.log("status-midnight clean Node consumer passed");
