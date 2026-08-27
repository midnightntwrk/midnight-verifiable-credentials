import { describe, expect, it } from "vitest";

import {
  assertPresentationSubmissionMatchesDefinition,
  createFieldPath,
  createMidnightCompactDescriptor,
  createPresentationDefinition,
  createVpAuthorizationRequest,
  createVpAuthorizationResponse,
  legacyPresentationRequestUri,
  presentationRequestUri,
} from "../index.js";

describe("OID4VP-inspired Midnight presentation schemas", () => {
  it("models a verifier request for multiple Midnight presentations", () => {
    const definition = createPresentationDefinition({
      id: "private-growth-note-requirements",
      name: "Private Growth Note eligibility",
      purpose: "Prove age and compliance without disclosing raw identity data.",
      input_descriptors: [
        {
          id: "passport-age-over-18",
          format: { midnight_compact_vp: {} },
          constraints: {
            limit_disclosure: "required",
            fields: [
              {
                path: [createFieldPath("body.disclosed.ageThresholdYears")],
                filter: { const: 18 },
              },
            ],
          },
        },
        {
          id: "compliance-pass",
          format: { midnight_compact_vp: {} },
          constraints: {
            fields: [
              {
                path: [createFieldPath("body.disclosed.screeningResult")],
                filter: { const: "PASS" },
              },
            ],
          },
        },
      ],
    });

    const request = createVpAuthorizationRequest({
      response_type: "vp_token",
      client_id: "did:midnight:verifier:private-growth-note",
      response_mode: "direct_post",
      nonce: "verifier-nonce-1",
      state: "checkout-123",
      presentation_definition: definition,
      midnight: {
        verifierDomain: "private-growth-note.example",
        challenge: "0xcafe01",
        acceptedCredentialFamilies: ["passport-secret", "compliance"],
        requireSameHolder: true,
        predicateHints: ["midnight:predicate:age-over", "midnight:predicate:screening-pass"],
      },
    });

    const submission = {
      id: "submission-1",
      definition_id: definition.id,
      descriptor_map: [
        createMidnightCompactDescriptor({
          id: "passport-age-over-18",
          path: "$.vp_token[0]",
        }),
        createMidnightCompactDescriptor({
          id: "compliance-pass",
          path: "$.vp_token[1]",
        }),
      ],
    };
    const response = createVpAuthorizationResponse({
      state: request.state,
      vp_token: [
        { format: "midnight_compact_vp", presentationFamily: "passport-secret" },
        { format: "midnight_compact_vp", presentationFamily: "compliance" },
      ],
      presentation_submission: submission,
    });

    assertPresentationSubmissionMatchesDefinition({ definition, submission });
    expect(request.midnight?.requireSameHolder).toBe(true);
    expect(response.presentation_submission?.descriptor_map).toHaveLength(2);
  });

  it("rejects presentation submissions that reference unknown descriptors", () => {
    const definition = createPresentationDefinition({
      id: "single-requirement",
      input_descriptors: [{ id: "known", constraints: { fields: [] } }],
    });

    expect(() =>
      assertPresentationSubmissionMatchesDefinition({
        definition,
        submission: {
          id: "submission-1",
          definition_id: definition.id,
          descriptor_map: [
            createMidnightCompactDescriptor({ id: "unknown", path: "$.vp_token" }),
          ],
        },
      }),
    ).toThrow(/unknown input descriptor/);
  });

  it("rejects duplicate and incomplete descriptor submissions", () => {
    const definition = createPresentationDefinition({
      id: "two-descriptors",
      input_descriptors: [
        { id: "first", constraints: { fields: [] } },
        { id: "second", constraints: { fields: [] } },
      ],
    });

    expect(() =>
      assertPresentationSubmissionMatchesDefinition({
        definition,
        submission: {
          id: "submission-duplicate",
          definition_id: definition.id,
          descriptor_map: [
            createMidnightCompactDescriptor({ id: "first", path: "$.vp_token[0]" }),
            createMidnightCompactDescriptor({ id: "first", path: "$.vp_token[1]" }),
          ],
        },
      }),
    ).toThrow(/duplicate/);

    expect(() =>
      assertPresentationSubmissionMatchesDefinition({
        definition,
        submission: {
          id: "submission-incomplete",
          definition_id: definition.id,
          descriptor_map: [
            createMidnightCompactDescriptor({ id: "first", path: "$.vp_token[0]" }),
          ],
        },
      }),
    ).toThrow(/every input descriptor/);
  });

  it("rejects malformed descriptor formats and paths", () => {
    const definition = createPresentationDefinition({
      id: "compact-definition",
      format: { midnight_compact_vp: {} },
      input_descriptors: [{ id: "compact", constraints: { fields: [] } }],
    });
    expect(() => assertPresentationSubmissionMatchesDefinition({
      definition,
      submission: {
        id: "bad-format",
        definition_id: definition.id,
        descriptor_map: [{ id: "compact", format: "jwt_vc_json", path: "$.vp_token[0]" }],
      },
    })).toThrow(/format/);
    expect(() => assertPresentationSubmissionMatchesDefinition({
      definition,
      submission: {
        id: "bad-path",
        definition_id: definition.id,
        descriptor_map: [{ id: "compact", format: "midnight_compact_vp", path: "$.vp_token_evil" }],
      },
    })).toThrow(/exact vp_token/);

    const contradictoryFormats = createPresentationDefinition({
      id: "contradictory-formats",
      format: { midnight_compact_vp: {} },
      input_descriptors: [{
        id: "compact",
        format: { jwt_vc_json: {} },
        constraints: { fields: [] },
      }],
    });
    expect(() => assertPresentationSubmissionMatchesDefinition({
      definition: contradictoryFormats,
      submission: {
        id: "descriptor-format-mismatch",
        definition_id: contradictoryFormats.id,
        descriptor_map: [{ id: "compact", format: "midnight_compact_vp", path: "$.vp_token[0]" }],
      },
    })).toThrow(/format/);
  });

  it("creates a request-uri launcher for wallet UX", () => {
    expect(
      legacyPresentationRequestUri({
        requestUri: "https://verifier.example/request/123",
        clientId: "did:midnight:verifier:1",
      }),
    ).toContain("openid4vp://authorize");
    expect(
      presentationRequestUri({
        requestReference: "https://verifier.example/request/one-time-1",
        clientId: "did:midnight:verifier:1",
      }),
    ).toContain("request_uri");
    expect(() =>
      presentationRequestUri({ requestReference: "x", clientId: "client" }),
    ).toThrow();
    expect(() =>
      presentationRequestUri({ requestReference: `https://verifier.example/${"x".repeat(500)}`, clientId: "client" }),
    ).toThrow(/short/);
  });
});
