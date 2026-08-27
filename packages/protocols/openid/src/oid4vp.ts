import { z } from "zod";

import { MidnightPresentationRequestExtensionSchema } from "./midnight.js";
import {
  DcqlQuerySchema,
  VpRequestBindingSchema,
} from "./profile.js";
import {
  JsonObjectSchema,
  JsonValueSchema,
  NonEmptyStringSchema,
  UrlSchema,
} from "./shared.js";

export const ClaimFormatDesignationSchema = z.object({
  alg: z.array(NonEmptyStringSchema).optional(),
  proof_type: z.array(NonEmptyStringSchema).optional(),
});
export type ClaimFormatDesignation = z.infer<
  typeof ClaimFormatDesignationSchema
>;

export const PresentationDefinitionFieldSchema = z.object({
  id: NonEmptyStringSchema.optional(),
  path: z.array(NonEmptyStringSchema).min(1),
  purpose: NonEmptyStringSchema.optional(),
  filter: JsonObjectSchema.optional(),
});
export type PresentationDefinitionField = z.infer<
  typeof PresentationDefinitionFieldSchema
>;

export const PresentationDefinitionConstraintsSchema = z.object({
  limit_disclosure: z.enum(["required", "preferred"]).optional(),
  fields: z.array(PresentationDefinitionFieldSchema).default([]),
});
export type PresentationDefinitionConstraints = z.infer<
  typeof PresentationDefinitionConstraintsSchema
>;

export const InputDescriptorSchema = z.object({
  id: NonEmptyStringSchema,
  name: NonEmptyStringSchema.optional(),
  purpose: NonEmptyStringSchema.optional(),
  format: z.record(NonEmptyStringSchema, ClaimFormatDesignationSchema).optional(),
  constraints: PresentationDefinitionConstraintsSchema.default({ fields: [] }),
});
export type InputDescriptor = z.infer<typeof InputDescriptorSchema>;

export const PresentationDefinitionSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema.optional(),
    purpose: NonEmptyStringSchema.optional(),
    format: z.record(NonEmptyStringSchema, ClaimFormatDesignationSchema).optional(),
    input_descriptors: z.array(InputDescriptorSchema).min(1),
  })
  .superRefine((definition, context) => {
    const ids = definition.input_descriptors.map((descriptor) => descriptor.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: "custom", path: ["input_descriptors"], message: "Input descriptor ids must be unique" });
    }
  });
export type PresentationDefinition = z.infer<
  typeof PresentationDefinitionSchema
>;

export const VpAuthorizationRequestSchema = z
  .object({
    response_type: z.literal("vp_token"),
    client_id: NonEmptyStringSchema,
    redirect_uri: UrlSchema.optional(),
    response_mode: z
      .enum(["direct_post", "direct_post.jwt", "fragment"])
      .optional(),
    state: NonEmptyStringSchema.optional(),
    nonce: NonEmptyStringSchema,
    presentation_definition: PresentationDefinitionSchema.optional(),
    dcql_query: DcqlQuerySchema.optional(),
    request_uri: UrlSchema.optional(),
    request_digest: VpRequestBindingSchema.shape.request_digest.optional(),
    client_metadata: JsonObjectSchema.optional(),
    midnight: MidnightPresentationRequestExtensionSchema.optional(),
  })
  .refine(
    (request) =>
      request.presentation_definition !== undefined ||
      request.dcql_query !== undefined ||
      request.request_uri !== undefined,
    {
      message:
        "VP authorization request requires a presentation definition, DCQL query, or request_uri",
      path: ["presentation_definition"],
    },
  );
export type VpAuthorizationRequest = z.infer<
  typeof VpAuthorizationRequestSchema
>;

export type DescriptorMap = {
  readonly id: string;
  readonly format: string;
  readonly path: string;
  readonly path_nested?: DescriptorMap;
};

export const DescriptorMapSchema: z.ZodType<DescriptorMap> = z.object({
  id: NonEmptyStringSchema,
  format: NonEmptyStringSchema,
  path: NonEmptyStringSchema,
  path_nested: z.lazy(() => DescriptorMapSchema).optional(),
});

export const PresentationSubmissionSchema = z.object({
  id: NonEmptyStringSchema,
  definition_id: NonEmptyStringSchema,
  descriptor_map: z.array(DescriptorMapSchema).min(1),
});
export type PresentationSubmission = z.infer<
  typeof PresentationSubmissionSchema
>;

export const VpAuthorizationResponseSchema = z.object({
  state: NonEmptyStringSchema.optional(),
  vp_token: JsonValueSchema,
  presentation_submission: PresentationSubmissionSchema.optional(),
  request_digest: VpRequestBindingSchema.shape.request_digest.optional(),
});
export type VpAuthorizationResponse = z.infer<
  typeof VpAuthorizationResponseSchema
>;

export const createPresentationDefinition = (
  input: PresentationDefinition,
): PresentationDefinition => PresentationDefinitionSchema.parse(input);

export const createVpAuthorizationRequest = (
  input: VpAuthorizationRequest,
): VpAuthorizationRequest => VpAuthorizationRequestSchema.parse(input);

export const createVpAuthorizationResponse = (
  input: VpAuthorizationResponse,
): VpAuthorizationResponse => VpAuthorizationResponseSchema.parse(input);

/** @deprecated Legacy helper; it accepts arbitrary request URIs. */
export const legacyPresentationRequestUri = (input: {
  readonly requestUri: string;
  readonly clientId?: string;
}): string => {
  const url = new URL("openid4vp://authorize");
  url.searchParams.set("request_uri", input.requestUri);
  if (input.clientId) url.searchParams.set("client_id", input.clientId);
  return url.toString();
};

export const presentationRequestUri = (input: {
  readonly requestReference: string;
  readonly clientId: string;
}): string => {
  const reference = new URL(input.requestReference);
  if (reference.protocol !== "https:" || reference.username || reference.password) {
    throw new Error("Presentation request reference must be an HTTPS URL without credentials");
  }
  if (input.requestReference.length > 512 || /[\r\n]/u.test(input.requestReference)) {
    throw new Error("Presentation request reference must be short and opaque");
  }
  const url = new URL("openid4vp://authorize");
  url.searchParams.set("request_uri", input.requestReference);
  url.searchParams.set("client_id", input.clientId);
  return url.toString();
};

export const parseVpAuthorizationRequest = (
  input: unknown,
): VpAuthorizationRequest => VpAuthorizationRequestSchema.parse(input);

export const assertPresentationSubmissionMatchesDefinition = (input: {
  readonly definition: PresentationDefinition;
  readonly submission: PresentationSubmission;
}): void => {
  if (input.submission.definition_id !== input.definition.id) {
    throw new Error("Presentation submission definition_id does not match the request");
  }
  const descriptorIds = new Set(
    input.definition.input_descriptors.map((descriptor) => descriptor.id),
  );
  const submittedIds = input.submission.descriptor_map.map(
    (descriptor) => descriptor.id,
  );
  if (new Set(submittedIds).size !== submittedIds.length) {
    throw new Error("Presentation submission contains duplicate descriptor ids");
  }
  for (const descriptor of input.submission.descriptor_map) {
    const inputDescriptor = input.definition.input_descriptors.find((candidate) => candidate.id === descriptor.id);
    if (!inputDescriptor) {
      throw new Error(
        `Presentation submission references unknown input descriptor "${descriptor.id}"`,
      );
    }
    const definitionFormats = Object.keys(input.definition.format ?? {});
    const descriptorFormats = Object.keys(inputDescriptor.format ?? {});
    if (
      (definitionFormats.length > 0 && !definitionFormats.includes(descriptor.format)) ||
      (descriptorFormats.length > 0 && !descriptorFormats.includes(descriptor.format))
    ) {
      throw new Error(`Presentation submission format does not match descriptor "${descriptor.id}"`);
    }
    const assertDescriptorPath = (current: DescriptorMap, parent?: DescriptorMap): void => {
      if (current.format === "midnight_compact_vp" && !/^\$\.vp_token(?:\[\d+\])?$/u.test(current.path)) {
        throw new Error(`Midnight descriptor path is not an exact vp_token path for "${descriptor.id}"`);
      }
      if (parent && current.path === parent.path) {
        throw new Error(`Nested descriptor path must differ for "${descriptor.id}"`);
      }
      if (current.path_nested) assertDescriptorPath(current.path_nested, current);
    };
    assertDescriptorPath(descriptor);
  }
  if (submittedIds.length !== descriptorIds.size) {
    throw new Error("Presentation submission does not cover every input descriptor");
  }
};

export const createMidnightCompactDescriptor = (input: {
  readonly id: string;
  readonly path: string;
}): DescriptorMap =>
  DescriptorMapSchema.parse({
    id: input.id,
    format: "midnight_compact_vp",
    path: input.path,
  });

export const createFieldPath = (path: string): string =>
  path.startsWith("$.") ? path : `$.${path}`;
