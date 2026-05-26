import { spawn } from "node:child_process";

export type BddScenarioReportPipelineOptions = {
  readonly executeScript: string;
  readonly cleanScript?: string;
  readonly summaryScript?: string;
  readonly reportScript?: string;
  readonly runner?: BddPipelineRunner;
};

export type BddPipelineRunner = (scriptName: string) => Promise<number>;

const runPnpmScript: BddPipelineRunner = (scriptName) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["run", scriptName], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });

export const runBddScenarioReportPipeline = async ({
  executeScript,
  cleanScript = "clean",
  summaryScript = "summary",
  reportScript = "test:report",
  runner = runPnpmScript,
}: BddScenarioReportPipelineOptions): Promise<number> => {
  const cleanExitCode = await runner(cleanScript);
  if (cleanExitCode !== 0) {
    return cleanExitCode;
  }

  const executeExitCode = await runner(executeScript);
  const summaryExitCode = await runner(summaryScript);
  const shouldSkipReport = process.env.SKIP_BDD_REPORT === "1";
  const reportExitCode = shouldSkipReport ? 0 : await runner(reportScript);

  // Preserve the original scenario failure code after still attempting summary
  // and report generation, because the failing scenarios are the primary cause.
  if (executeExitCode !== 0) {
    return executeExitCode;
  }
  if (summaryExitCode !== 0) {
    return summaryExitCode;
  }
  return reportExitCode;
};

export const runBddScenarioReportPipelineCli = async (
  argv: readonly string[] = process.argv.slice(2),
): Promise<void> => {
  const executeScript = argv[0];
  if (!executeScript) {
    throw new Error("Usage: run-bdd-pipeline.ts <test:execute-script>");
  }

  process.exitCode = await runBddScenarioReportPipeline({ executeScript });
};
