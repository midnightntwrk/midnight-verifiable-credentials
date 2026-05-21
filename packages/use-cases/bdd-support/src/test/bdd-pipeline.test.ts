import { describe, expect, it } from "vitest";

import { runBddScenarioReportPipeline } from "../bdd-pipeline.ts";

describe("BDD report pipeline support", () => {
  it("runs clean, execute, summary, and report scripts in order", async () => {
    const calls: string[] = [];
    const exitCode = await runBddScenarioReportPipeline({
      executeScript: "test:execute:smoke",
      runner: async (scriptName) => {
        calls.push(scriptName);
        return 0;
      },
    });

    expect(exitCode).toBe(0);
    expect(calls).toEqual([
      "clean",
      "test:execute:smoke",
      "summary",
      "test:report",
    ]);
  });

  it("still generates summary and report artifacts after scenario failure", async () => {
    const calls: string[] = [];
    const exitCode = await runBddScenarioReportPipeline({
      executeScript: "test:execute",
      runner: async (scriptName) => {
        calls.push(scriptName);
        return scriptName === "test:execute" ? 7 : 0;
      },
    });

    expect(exitCode).toBe(7);
    expect(calls).toEqual(["clean", "test:execute", "summary", "test:report"]);
  });

  it("stops early when the clean step fails", async () => {
    const calls: string[] = [];
    const exitCode = await runBddScenarioReportPipeline({
      executeScript: "test:execute",
      runner: async (scriptName) => {
        calls.push(scriptName);
        return 1;
      },
    });

    expect(exitCode).toBe(1);
    expect(calls).toEqual(["clean"]);
  });
});
