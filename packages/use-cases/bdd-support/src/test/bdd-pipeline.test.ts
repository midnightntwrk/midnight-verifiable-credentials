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

  it("returns the summary failure code when scenarios pass and summary fails", async () => {
    const exitCode = await runBddScenarioReportPipeline({
      executeScript: "test:execute",
      runner: async (scriptName) => (scriptName === "summary" ? 2 : 0),
    });

    expect(exitCode).toBe(2);
  });

  it("returns the report failure code when execute and summary pass", async () => {
    const exitCode = await runBddScenarioReportPipeline({
      executeScript: "test:execute",
      runner: async (scriptName) => (scriptName === "test:report" ? 3 : 0),
    });

    expect(exitCode).toBe(3);
  });

  it("skips report generation when SKIP_BDD_REPORT=1", async () => {
    const previousValue = process.env.SKIP_BDD_REPORT;
    process.env.SKIP_BDD_REPORT = "1";
    const calls: string[] = [];

    try {
      const exitCode = await runBddScenarioReportPipeline({
        executeScript: "test:execute",
        runner: async (scriptName) => {
          calls.push(scriptName);
          return 0;
        },
      });

      expect(exitCode).toBe(0);
      expect(calls).toEqual(["clean", "test:execute", "summary"]);
    } finally {
      if (previousValue === undefined) {
        delete process.env.SKIP_BDD_REPORT;
      } else {
        process.env.SKIP_BDD_REPORT = previousValue;
      }
    }
  });

  it("preserves the execute failure code when later reporting also fails", async () => {
    const exitCode = await runBddScenarioReportPipeline({
      executeScript: "test:execute",
      runner: async (scriptName) =>
        scriptName === "test:execute" ? 7 : scriptName === "summary" ? 2 : 0,
    });

    expect(exitCode).toBe(7);
  });
});
