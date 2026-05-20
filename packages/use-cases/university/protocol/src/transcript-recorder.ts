import { universityProtocolMessageIdHex } from "./flow-messages.js";
import type {
  UniversityProtocolMessage,
  UniversityProtocolTranscriptEntry,
} from "./model.js";

/** @internal Protocol-flow helper; not exported from the package public API. */
export class UniversityTranscriptRecorder {
  readonly entries: UniversityProtocolTranscriptEntry[] = [];

  record(
    phase: UniversityProtocolTranscriptEntry["phase"],
    message: UniversityProtocolMessage,
    summary: string,
  ): void {
    this.entries.push({
      phase,
      type: message.type,
      from: message.from,
      to: message.to,
      threadIdHex: universityProtocolMessageIdHex(message.envelope.threadId),
      messageIdHex: universityProtocolMessageIdHex(message.envelope.messageId),
      respondsToHex: universityProtocolMessageIdHex(
        message.envelope.respondsToMessageId,
      ),
      summary,
    });
  }
}
