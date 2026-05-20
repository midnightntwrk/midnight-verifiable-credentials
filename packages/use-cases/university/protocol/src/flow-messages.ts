import type {
  UniversityPresentationResultBody,
  UniversityProtocolMessage,
} from "./model.js";

/** @internal Protocol-flow helper; not exported from the package public API. */
export type UniversityIssuanceRequestMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "issuance:request" }
>;
/** @internal Protocol-flow helper; not exported from the package public API. */
export type UniversityIssuanceResultMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "issuance:result" }
>;
/** @internal Protocol-flow helper; not exported from the package public API. */
export type UniversityPresentationRequestMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "presentation:request" }
>;
/** @internal Protocol-flow helper; not exported from the package public API. */
export type UniversityPresentationSubmissionMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "presentation:submission" }
>;
/** @internal Protocol-flow helper; not exported from the package public API. */
export type UniversityPresentationResultMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "presentation:result" }
>;

/** @internal Protocol-flow helper; not exported from the package public API. */
export const universityProtocolMessageIdHex = (value: Uint8Array): string =>
  Buffer.from(value).toString("hex");

/** @internal Protocol-flow helper; not exported from the package public API. */
export const isPresentationResultMessage = (
  message: UniversityProtocolMessage,
): message is UniversityPresentationResultMessage =>
  message.type === "presentation:result";

/** @internal Protocol-flow helper; not exported from the package public API. */
export const resultBodiesByStudent = (
  messages: readonly UniversityProtocolMessage[],
  kind: UniversityPresentationResultBody["kind"],
): Readonly<Record<string, readonly UniversityPresentationResultBody[]>> => {
  const grouped = new Map<string, UniversityPresentationResultBody[]>();
  for (const message of messages) {
    if (!isPresentationResultMessage(message) || message.body.kind !== kind) {
      continue;
    }
    const existing = grouped.get(message.body.studentId);
    if (existing) {
      existing.push(message.body);
    } else {
      grouped.set(message.body.studentId, [message.body]);
    }
  }
  return Object.fromEntries(grouped.entries());
};
