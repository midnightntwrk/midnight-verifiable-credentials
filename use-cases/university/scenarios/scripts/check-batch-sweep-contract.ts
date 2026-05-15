import assert from "node:assert/strict";

import {
  buildUniversityBatchSweepSummary,
  renderUniversityBatchSweepMarkdown,
} from "./batch-sweep-lib.ts";

const summary = await buildUniversityBatchSweepSummary({
  studentCount: 8,
  batchSizes: [2, 4],
  artifactTargetDir: "tmp/test-batch-sweep",
});

assert.equal(
  summary.schemaVersion,
  "midnight-university-batch-sweep-summary.v2",
);
assert.deepEqual(summary.sweepConfig.batchSizes, [2, 4]);
assert.deepEqual(summary.sweepConfig.compileConcurrencyLevels, [1, 2, 4]);
assert.equal(summary.runs.length, 2);
assert.deepEqual(
  summary.runs.map((run) => run.batchSize),
  [2, 4],
);
const batchSizeTwoRun = summary.runs.find((run) => run.batchSize === 2);
const batchSizeFourRun = summary.runs.find((run) => run.batchSize === 4);
assert.equal(batchSizeTwoRun?.batchCount, 4);
assert.equal(batchSizeFourRun?.batchCount, 2);
assert.ok(batchSizeTwoRun!.phaseTotalsMs.compile > 0);
assert.ok(batchSizeTwoRun!.phaseAverageMs.sign >= 0);
assert.ok(
  batchSizeTwoRun!.phaseMaxMs.compile >=
    batchSizeTwoRun!.phaseAverageMs.compile,
);
assert.ok(
  batchSizeTwoRun!.phaseMaxMs.sign >= batchSizeTwoRun!.phaseAverageMs.sign,
);
assert.ok(batchSizeTwoRun!.wallClockCredentialsPerSecond > 0);
assert.ok(batchSizeFourRun!.credentialsPerSecond > 0);
assert.deepEqual(
  batchSizeTwoRun!.compileConcurrencyProjections.map(
    (projection) => projection.compileConcurrency,
  ),
  [1, 2, 4],
);
assert.deepEqual(
  batchSizeFourRun!.compileConcurrencyProjections.map(
    (projection) => projection.compileConcurrency,
  ),
  [1, 2],
);
const sequentialProjection =
  batchSizeTwoRun!.compileConcurrencyProjections.find(
    (projection) => projection.compileConcurrency === 1,
  );
const twoWorkerProjection = batchSizeTwoRun!.compileConcurrencyProjections.find(
  (projection) => projection.compileConcurrency === 2,
);
assert.ok(sequentialProjection!.estimatedCompileWallClockMs > 0);
assert.ok(twoWorkerProjection!.estimatedCompileWallClockMs > 0);
assert.ok(
  twoWorkerProjection!.estimatedCompileWallClockMs <=
    sequentialProjection!.estimatedCompileWallClockMs,
);
assert.ok(twoWorkerProjection!.projectedCredentialsPerSecond > 0);
assert.ok(twoWorkerProjection!.compileEfficiency > 0);
assert.equal(
  twoWorkerProjection!.workerLoadsMs.length,
  twoWorkerProjection!.compileConcurrency,
);
assert.ok(
  [2, 4].includes(summary.fastestBatchSizeByWallClockCredentialsPerSecond),
);
assert.equal(summary.artifactRetention.targetDir, "tmp/test-batch-sweep");
await assert.rejects(
  () => buildUniversityBatchSweepSummary({ batchSizes: [] }),
  /At least one batch size is required/,
);
await assert.rejects(
  () => buildUniversityBatchSweepSummary({ compileConcurrencyLevels: [] }),
  /At least one compile concurrency level is required/,
);

const markdown = renderUniversityBatchSweepMarkdown(summary);
assert.match(markdown, /^# University Batch Sweep Summary/m);
assert.match(
  markdown,
  /\| batch size \| batches \| issued \| wall clock ms \| queue wait avg ms \|/m,
);
assert.match(markdown, /\| 2 \| 4 \| 8 \|/m);
assert.match(markdown, /^## Phase Maximums \(ms\)$/m);
assert.match(markdown, /^## Compile Concurrency Projection$/m);
assert.match(markdown, /\| batch size \| compile concurrency \|/m);

console.log("University batch-sweep contract passed.");
