import { TextEncoder } from "node:util";

import { pureCircuits as familyPureCircuits } from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { beforeAll, describe, expect, it } from "vitest";

import type {
  StudentRecord,
  UniversityProtocolMessage,
} from "../model.js";
import { encodeUniversityProtocolTransportValue } from "../process-transport.js";
import { UniversityProtocolFlowRunner } from "../testing.js";

/**
 * Repro + regression test for issue #267:
 * "reveal* booleans don't hide anything; all fields readable from
 * credential.claims".
 *
 * The `presentation:submission` protocol message is the trust boundary between
 * holder and verifier. This test serializes every submission with the repo's
 * own transport encoder and asserts that the plaintext of every claim the
 * request did NOT ask to reveal appears NOWHERE in the submission — not as
 * padded fixed-width bytes, not as raw UTF-8, not as a raw string, not as a
 * numeric leaf. Hidden claims may only be present as salted commitments.
 *
 * On the pre-fix code this test is RED: the submission ships the full
 * plaintext-claims credential (proof-backend.ts `credential:
 * options.storedCredential.credential`) so hidden values are found verbatim.
 */

type LooseRecord = Record<string, unknown>;

const PUBLIC_ROUTING_FIELDS = new Set([
  "universityName",
  "awardName",
  "graduationYear",
]);

type TextClaimField = {
  readonly field:
    | "diplomaId"
    | "studentId"
    | "graduateName"
    | "universityName"
    | "facultyName"
    | "awardName"
    | "honorsCode";
  readonly kind: "text";
  readonly pad: number;
  readonly requireFlag: string;
};

type NumericClaimField = {
  readonly field:
    | "graduationYear"
    | "graduationMonth"
    | "finalGrade"
    | "creditsEarned";
  readonly kind: "numeric";
  readonly requireFlag: string;
};

type ClaimField = TextClaimField | NumericClaimField;

const CLAIM_FIELDS: readonly ClaimField[] = [
  { field: "diplomaId", kind: "text", pad: 32, requireFlag: "requireDiplomaIdDisclosure" },
  { field: "studentId", kind: "text", pad: 16, requireFlag: "requireStudentIdDisclosure" },
  { field: "graduateName", kind: "text", pad: 32, requireFlag: "requireGraduateNameDisclosure" },
  { field: "universityName", kind: "text", pad: 32, requireFlag: "requireUniversityNameDisclosure" },
  { field: "facultyName", kind: "text", pad: 32, requireFlag: "requireFacultyNameDisclosure" },
  { field: "awardName", kind: "text", pad: 32, requireFlag: "requireAwardNameDisclosure" },
  { field: "honorsCode", kind: "text", pad: 16, requireFlag: "requireHonorsCodeDisclosure" },
  { field: "graduationYear", kind: "numeric", requireFlag: "requireGraduationYearDisclosure" },
  { field: "graduationMonth", kind: "numeric", requireFlag: "requireGraduationMonthDisclosure" },
  { field: "finalGrade", kind: "numeric", requireFlag: "requireFinalGradeDisclosure" },
  { field: "creditsEarned", kind: "numeric", requireFlag: "requireCreditsEarnedDisclosure" },
];

const padText = (value: string, length: number): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

type ScanLeaves = {
  readonly buffers: Buffer[];
  readonly strings: string[];
  readonly bigints: bigint[];
};

const collectLeaves = (encoded: unknown, leaves: ScanLeaves): void => {
  if (encoded === null || encoded === undefined) {
    return;
  }
  if (typeof encoded === "string") {
    leaves.strings.push(encoded);
    return;
  }
  if (typeof encoded === "number" || typeof encoded === "boolean") {
    return;
  }
  if (Array.isArray(encoded)) {
    for (const entry of encoded) {
      collectLeaves(entry, leaves);
    }
    return;
  }
  const record = encoded as LooseRecord;
  const tag = record["__midnightUniversityProtocolTransportType"];
  if (tag === "bytes" && typeof record["value"] === "string") {
    leaves.buffers.push(Buffer.from(record["value"] as string, "base64"));
    return;
  }
  if (tag === "bigint" && typeof record["value"] === "string") {
    leaves.bigints.push(BigInt(record["value"] as string));
    return;
  }
  if (tag === "undefined") {
    return;
  }
  for (const entry of Object.values(record)) {
    collectLeaves(entry, leaves);
  }
};

const scan = (value: unknown): ScanLeaves => {
  const leaves: ScanLeaves = { buffers: [], strings: [], bigints: [] };
  collectLeaves(encodeUniversityProtocolTransportValue(value), leaves);
  return leaves;
};

const anyBufferContains = (leaves: ScanLeaves, needle: Uint8Array): boolean =>
  leaves.buffers.some((buffer) => buffer.indexOf(Buffer.from(needle)) !== -1);

const anyStringContains = (leaves: ScanLeaves, needle: string): boolean =>
  leaves.strings.some((value) => value.includes(needle));

const anyBigintEquals = (leaves: ScanLeaves, needle: bigint): boolean =>
  leaves.bigints.some((value) => value === needle);

const submissionsOf = (
  messages: readonly UniversityProtocolMessage[],
): UniversityProtocolMessage[] =>
  messages.filter((message) => message.type === "presentation:submission");

describe("issue #267 — hidden claims must not ship in presentation submissions", () => {
  let runner: UniversityProtocolFlowRunner;
  let result: ReturnType<UniversityProtocolFlowRunner["runAll"]>;
  let studentsById: Map<string, StudentRecord>;
  let allSubmissions: UniversityProtocolMessage[];

  beforeAll(() => {
    setNetworkId("undeployed");
    runner = new UniversityProtocolFlowRunner();
    result = runner.runAll();
    studentsById = new Map(
      runner.students.map((student) => [student.studentId, student]),
    );
    allSubmissions = [
      ...submissionsOf(result.jobApplications.messages),
      ...submissionsOf(result.discounts.messages),
    ];
  });

  const studentForSubmission = (body: LooseRecord): StudentRecord => {
    // Correlate the submission back to the fixture student via the
    // presentation-proof challenge thread recorded in the request phase.
    const request = body["request"] as LooseRecord;
    const challengeHex = Buffer.from(
      request["verifierChallengeHash"] as Uint8Array,
    ).toString("hex");
    for (const messages of [
      result.jobApplications.messages,
      result.discounts.messages,
    ]) {
      for (const message of messages) {
        if (message.type !== "presentation:request") {
          continue;
        }
        const requestBody = message.body as unknown as LooseRecord;
        const requestValue = requestBody["request"] as LooseRecord;
        const hex = Buffer.from(
          requestValue["verifierChallengeHash"] as Uint8Array,
        ).toString("hex");
        if (hex === challengeHex) {
          const student = studentsById.get(requestBody["studentId"] as string);
          if (student) {
            return student;
          }
        }
      }
    }
    throw new Error("Could not correlate submission to a fixture student");
  };

  it("runs the flow with all job applications accepted and threshold-based discounts", () => {
    expect(allSubmissions.length).toBeGreaterThan(0);
    expect(result.jobApplications.acceptedCount).toEqual(runner.students.length);
    expect(result.discounts.acceptedCount).toBeGreaterThan(0);
    expect(result.discounts.rejectedCount).toBeGreaterThan(0);
  });

  it("byte-level: hidden claim plaintexts appear nowhere in any serialized submission body", () => {
    for (const message of allSubmissions) {
      const body = message.body as unknown as LooseRecord;
      const student = studentForSubmission(body);
      const claims = student.diplomaClaimValues;
      const request = body["request"] as LooseRecord;
      const leaves = scan(body);
      const numericLeaves = scan({
        credential: body["credential"],
        presentation: body["presentation"],
      });

      // Values legitimately revealed in THIS submission (per request policy)
      // can contain short hidden values as substrings (e.g. facultyName
      // "Science" inside revealed awardName "BSc Data Science"). The
      // raw-substring probes skip those scanner false positives; the padded
      // fixed-width probe — the actual wire encoding of a claim — always runs.
      const revealedPlaintexts = CLAIM_FIELDS.filter(
        (candidate) =>
          candidate.kind === "text" &&
          (PUBLIC_ROUTING_FIELDS.has(candidate.field) ||
            request[candidate.requireFlag] === true),
      ).map((candidate) => claims[candidate.field as TextClaimField["field"]]);

      for (const claimField of CLAIM_FIELDS) {
        if (PUBLIC_ROUTING_FIELDS.has(claimField.field)) {
          continue;
        }
        const required = request[claimField.requireFlag] === true;
        if (required) {
          continue;
        }
        const label = `${message.from}:${String(body["kind"])}:${claimField.field}`;
        if (claimField.kind === "text") {
          const raw = claims[claimField.field];
          expect(
            anyBufferContains(leaves, padText(raw, claimField.pad)),
            `hidden padded plaintext leaked: ${label}`,
          ).toBe(false);
          const isSubstringOfRevealed = revealedPlaintexts.some((revealed) =>
            revealed.includes(raw),
          );
          if (!isSubstringOfRevealed) {
            expect(
              anyBufferContains(leaves, new TextEncoder().encode(raw)),
              `hidden raw-bytes plaintext leaked: ${label}`,
            ).toBe(false);
            expect(
              anyStringContains(leaves, raw),
              `hidden string plaintext leaked: ${label}`,
            ).toBe(false);
          }
        } else {
          expect(
            anyBigintEquals(numericLeaves, BigInt(claims[claimField.field])),
            `hidden numeric plaintext leaked: ${label}`,
          ).toBe(false);
        }
      }
    }
  });

  it("positive control: required disclosures ARE found by the same scanner", () => {
    let checkedRevealedFields = 0;
    for (const message of allSubmissions) {
      const body = message.body as unknown as LooseRecord;
      const student = studentForSubmission(body);
      const claims = student.diplomaClaimValues;
      const request = body["request"] as LooseRecord;
      const leaves = scan(body);

      for (const claimField of CLAIM_FIELDS) {
        const required = request[claimField.requireFlag] === true;
        if (!required) {
          continue;
        }
        checkedRevealedFields += 1;
        const label = `${message.from}:${String(body["kind"])}:${claimField.field}`;
        if (claimField.kind === "text") {
          expect(
            anyBufferContains(
              leaves,
              padText(claims[claimField.field], claimField.pad),
            ),
            `revealed value not found (scanner broken?): ${label}`,
          ).toBe(true);
        } else {
          expect(
            anyBigintEquals(leaves, BigInt(claims[claimField.field])),
            `revealed value not found (scanner broken?): ${label}`,
          ).toBe(true);
        }
      }
    }
    expect(checkedRevealedFields).toBeGreaterThan(0);
  });

  it("structural: the submitted credential carries only public routing claims plus commitments", () => {
    for (const message of allSubmissions) {
      const body = message.body as unknown as LooseRecord;
      const credential = body["credential"] as LooseRecord;
      const claims = credential["claims"] as LooseRecord;
      expect(
        Object.keys(claims).sort(),
        `submission credential.claims must contain ONLY public routing fields (${message.from})`,
      ).toEqual(["awardName", "graduationYear", "universityName"]);

      const commitments = credential["claimCommitments"] as LooseRecord;
      const commitmentKeys = [
        "diplomaIdCommitment",
        "studentIdCommitment",
        "graduateNameCommitment",
        "facultyNameCommitment",
        "honorsCodeCommitment",
        "graduationMonthCommitment",
        "finalGradeCommitment",
        "creditsEarnedCommitment",
      ];
      for (const key of commitmentKeys) {
        const value = commitments[key];
        expect(
          value instanceof Uint8Array && value.length === 32,
          `credential.claimCommitments.${key} must be a 32-byte commitment (${message.from})`,
        ).toBe(true);
      }
    }
  });

  it("hiding: the shipped finalGrade commitment cannot be brute-forced without the salt", () => {
    const mallSubmission = submissionsOf(result.discounts.messages).at(0);
    expect(mallSubmission).toBeDefined();
    const body = mallSubmission!.body as unknown as LooseRecord;
    const credential = body["credential"] as LooseRecord;
    const commitments = credential["claimCommitments"] as LooseRecord;
    const shipped = commitments["finalGradeCommitment"] as Uint8Array;
    expect(shipped instanceof Uint8Array && shipped.length === 32).toBe(true);

    const shippedHex = Buffer.from(shipped).toString("hex");
    const zeroSalt = new Uint8Array(32);
    let matches = 0;
    for (let grade = 0; grade <= 255; grade += 1) {
      const guess = familyPureCircuits.universityDiplomaFinalGradeCommitment(
        BigInt(grade),
        zeroSalt,
      );
      if (Buffer.from(guess).toString("hex") === shippedHex) {
        matches += 1;
      }
    }
    expect(
      matches,
      "salted persistentCommit must defeat small-domain brute force",
    ).toBe(0);
  });

  it("soundness: tampering with a disclosed opening makes the verifier reject", () => {
    const jobSubmission = submissionsOf(result.jobApplications.messages).at(0);
    expect(jobSubmission).toBeDefined();
    const body = jobSubmission!.body as unknown as LooseRecord;
    const presentation = body["presentation"] as LooseRecord;
    const disclosed = presentation["disclosed"] as LooseRecord;
    const opening = disclosed["graduateNameOpening"];
    expect(
      opening instanceof Uint8Array && opening.length === 32,
      "revealed committed field must ship a (value, opening) pair",
    ).toBe(true);

    const flippedOpening = new Uint8Array(opening as Uint8Array);
    flippedOpening[0] ^= 0xff;
    const tampered = {
      ...(body as object),
      presentation: {
        ...(presentation as object),
        disclosed: {
          ...(disclosed as object),
          graduateNameOpening: flippedOpening,
        },
      },
    };
    expect(() =>
      runner.proofExecutionBackend.verifyJobApplication({
        submission: tampered as never,
      }),
    ).toThrow();
  });
});
