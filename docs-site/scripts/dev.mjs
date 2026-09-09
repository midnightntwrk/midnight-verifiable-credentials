#!/usr/bin/env node

import { spawn } from "node:child_process";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const processes = [
  spawn(process.execPath, ["scripts/watch-content.mjs"], {
    stdio: "inherit",
  }),
  spawn(
    command,
    ["exec", "vitepress", "dev", ".", "--host", "127.0.0.1", "--port", "4173"],
    { stdio: "inherit" },
  ),
];

let stopping = false;
const stop = (signal = "SIGTERM") => {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (!child.killed) child.kill(signal);
  }
};

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => stop(signal));
}

const exitCode = await Promise.race(
  processes.map(
    (child) =>
      new Promise((resolve) => {
        child.on("exit", (code, signal) => resolve(signal ? 0 : (code ?? 1)));
        child.on("error", () => resolve(1));
      }),
  ),
);

stop();
process.exitCode = exitCode;
