import { createHash } from "node:crypto";

export interface ExternalInteropConfig {
  readonly implementation: string;
  readonly issuerMetadataUrl: string;
  readonly credentialOfferUri: string;
  readonly walletIssuanceAutomationUrl: string;
  readonly verifierRequestUrl: string;
  readonly walletPresentationAutomationUrl: string;
  readonly timeoutMs: number;
}

export interface ExternalInteropHttpResponse {
  readonly status: number;
  readonly contentType: string | null;
  readonly body: Uint8Array;
}

export interface ExternalInteropHttpRequest {
  (url: string, init?: {
    readonly method?: "POST";
    readonly headers?: Readonly<Record<string, string>>;
    readonly body?: string;
  }): Promise<ExternalInteropHttpResponse>;
}

export interface ExternalInteropCompletion {
  readonly implementation: string;
  readonly artifactId: string;
  readonly result: string;
}

export interface ExternalInteropEndpointEvidence {
  readonly status: number;
  readonly contentType: string | null;
  readonly bodyDigest: string;
}

export interface ExternalInteropResult {
  readonly schemaVersion: 1;
  readonly implementation: string;
  readonly executed: boolean;
  readonly oid4vci: {
    readonly attempted: boolean;
    readonly status: "not-run" | "passed" | "failed";
    readonly metadata?: ExternalInteropEndpointEvidence;
    readonly issuance?: ExternalInteropEndpointEvidence;
    readonly completion?: ExternalInteropCompletion | null;
  };
  readonly oid4vp: {
    readonly attempted: boolean;
    readonly status: "not-run" | "passed" | "failed";
    readonly verifierRequest?: ExternalInteropEndpointEvidence;
    readonly presentation?: ExternalInteropEndpointEvidence;
    readonly completion?: ExternalInteropCompletion | null;
  };
  readonly note: string;
}

const configUrlKeys = [
  "issuerMetadataUrl",
  "credentialOfferUri",
  "walletIssuanceAutomationUrl",
  "verifierRequestUrl",
  "walletPresentationAutomationUrl",
] as const;

export const validateExternalInteropConfig = (input: unknown): ExternalInteropConfig => {
  if (typeof input !== "object" || input === null || Array.isArray(input)) throw new Error("External interoperability config must be an object");
  const config = input as Record<string, unknown>;
  if (typeof config.implementation !== "string" || config.implementation.length === 0) throw new Error("Missing external interoperability config: implementation");
  for (const key of configUrlKeys) {
    if (typeof config[key] !== "string" || config[key].length === 0) throw new Error(`Missing external interoperability config: ${key}`);
    const url = new URL(config[key]);
    if (url.protocol !== "https:") throw new Error(`${key} must be an HTTPS URL`);
    if (url.username || url.password) throw new Error(`${key} must not contain credentials`);
    if (url.hash) throw new Error(`${key} must not contain a fragment`);
  }
  const timeoutMs = config.timeoutMs === undefined ? 15_000 : config.timeoutMs;
  if (typeof timeoutMs !== "number" || !Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new Error("timeoutMs must be a positive integer");
  return {
    implementation: config.implementation,
    issuerMetadataUrl: config.issuerMetadataUrl as string,
    credentialOfferUri: config.credentialOfferUri as string,
    walletIssuanceAutomationUrl: config.walletIssuanceAutomationUrl as string,
    verifierRequestUrl: config.verifierRequestUrl as string,
    walletPresentationAutomationUrl: config.walletPresentationAutomationUrl as string,
    timeoutMs,
  };
};

export const parseExternalInteropCompletion = (
  response: ExternalInteropHttpResponse,
  protocol: "oid4vci" | "oid4vp",
  acceptedResult: "accepted" | "verified",
  implementation: string,
): ExternalInteropCompletion | null => {
  if (response.status !== 200 || !response.contentType?.toLowerCase().startsWith("application/json")) return null;
  let completion: unknown;
  try {
    completion = JSON.parse(new TextDecoder().decode(response.body));
  } catch {
    return null;
  }
  if (typeof completion !== "object" || completion === null || Array.isArray(completion)) return null;
  const value = completion as Record<string, unknown>;
  if (
    value.completed !== true ||
    value.protocol !== protocol ||
    value.result !== acceptedResult ||
    value.implementation !== implementation ||
    typeof value.artifact_id !== "string" ||
    value.artifact_id.length === 0
  ) return null;
  return { implementation, artifactId: value.artifact_id, result: acceptedResult };
};

const evidence = (response: ExternalInteropHttpResponse): ExternalInteropEndpointEvidence => ({
  status: response.status,
  contentType: response.contentType,
  bodyDigest: createHash("sha256").update(response.body).digest("base64url"),
});

export const runExternalInterop = async (input: {
  readonly config: ExternalInteropConfig;
  readonly dryRun: boolean;
  readonly request: ExternalInteropHttpRequest;
}): Promise<ExternalInteropResult> => {
  if (input.dryRun) {
    return {
      schemaVersion: 1,
      implementation: input.config.implementation,
      executed: false,
      oid4vci: { attempted: false, status: "not-run" },
      oid4vp: { attempted: false, status: "not-run" },
      note: "Configuration validated only; no external interoperability claim.",
    };
  }

  const metadata = await input.request(input.config.issuerMetadataUrl);
  const issuance = await input.request(input.config.walletIssuanceAutomationUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ credential_offer_uri: input.config.credentialOfferUri }),
  });
  const verifierRequest = await input.request(input.config.verifierRequestUrl);
  const presentation = await input.request(input.config.walletPresentationAutomationUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ request_uri: input.config.verifierRequestUrl }),
  });
  const issuanceCompletion = parseExternalInteropCompletion(issuance, "oid4vci", "accepted", input.config.implementation);
  const presentationCompletion = parseExternalInteropCompletion(presentation, "oid4vp", "verified", input.config.implementation);
  return {
    schemaVersion: 1,
    implementation: input.config.implementation,
    executed: true,
    oid4vci: {
      attempted: true,
      status: metadata.status === 200 && issuanceCompletion ? "passed" : "failed",
      metadata: evidence(metadata),
      issuance: evidence(issuance),
      completion: issuanceCompletion,
    },
    oid4vp: {
      attempted: true,
      status: verifierRequest.status === 200 && presentationCompletion ? "passed" : "failed",
      verifierRequest: evidence(verifierRequest),
      presentation: evidence(presentation),
      completion: presentationCompletion,
    },
    note: "External endpoints were contacted by the repository runner.",
  };
};
