// Minimal compile-time contract copied from
// @earendil-works/pi-coding-agent 0.84.2. The runtime remains provided by Pi;
// this declaration keeps strict extension checks deterministic in clean CI.
declare module "@earendil-works/pi-coding-agent" {
  export type ExtensionMode = "tui" | "rpc" | "json" | "print";

  export interface ExtensionContext {
    mode: ExtensionMode;
    sessionManager: {
      getBranch(): readonly unknown[];
    };
    ui: {
      setStatus(key: string, message: string | undefined): void;
    };
    isProjectTrusted(): boolean;
  }

  export interface ExtensionAPI {
    appendEntry<T = unknown>(customType: string, data?: T): void;
    exec(
      command: string,
      args: string[],
      options?: { signal?: AbortSignal; timeout?: number },
    ): Promise<{ code: number; stdout: string }>;
    on(
      event: "message_end" | "session_shutdown" | "session_start",
      handler: (event: unknown, ctx: ExtensionContext) => unknown,
    ): void;
    sendUserMessage(
      content: string,
      options?: { deliverAs?: "steer" | "followUp"; expandPromptTemplates?: boolean },
    ): void;
  }
}
