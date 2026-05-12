import assert from "node:assert/strict";

import {
  buildUniversityBatchSweepSummary,
  renderUniversityBatchSweepMarkdown,
} from "./batch-sweep-lib.ts";

const summary = await buildUniversityBatchSweepSummary({
  studentCount: 12,
  batchSizes: [2, 4],
});

assert.equal(summary.schemaVersion, "midnight-university-batch-sweep-summary.v1");
assert.deepEqual(summary.sweepConfig.batchSizes, [2, 4]);
assert.equal(summary.runs.length, 2);
assert.deepEqual(
  summary.runs.map((run) => run.batchSize),
  [2, 4],
);
const batchSizeTwoRun = summary.runs.find((run) => run.batchSize === 2);
const batchSizeFourRun = summary.runs.find((run) => run.batchSize === 4);
assert.equal(batchSizeTwoRun?.batchCount, 6);
assert.equal(batchSizeFourRun?.batchCount, 3);
assert.ok(batchSizeTwoRun!.phaseTotalsMs.compile > 0);
assert.ok(batchSizeTwoRun!.phaseAverageMs.sign >= 0);
assert.ok(batchSizeTwoRun!.wallClockCredentialsPerSecond > 0);
assert.ok(batchSizeFourRun!.credentialsPerSecond > 0);
assert.ok([2, 4].includes(summary.fastestBatchSizeByCredentialsPerSecond));
await assert.rejects(
  () => buildUniversityBatchSweepSummary({ batchSizes: [] }),
  /At least one batch size is required/,
);

const markdown = renderUniversityBatchSweepMarkdown(summary);
assert.match(markdown, /^# University Batch Sweep Summary/m);
assert.match(
  markdown,
  /\| batch size \| batches \| issued \| wall clock ms \| queue wait avg ms \|/m,
);
assert.match(markdown, /\| 2 \| 6 \| 12 \|/m);

console.log("University batch-sweep contract passed.");
