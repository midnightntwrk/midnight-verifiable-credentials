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
assert.equal(summary.runs[0].batchCount, 6);
assert.equal(summary.runs[1].batchCount, 3);
assert.ok(summary.runs[0].phaseTotalsMs.compile > 0);
assert.ok(summary.runs[0].phaseAverageMs.sign >= 0);
assert.ok(summary.runs[1].credentialsPerSecond > 0);
assert.ok([2, 4].includes(summary.fastestBatchSizeByCredentialsPerSecond));

const markdown = renderUniversityBatchSweepMarkdown(summary);
assert.match(markdown, /^# University Batch Sweep Summary/m);
assert.match(markdown, /\| batch size \| batches \| issued \| wall clock ms \|/m);
assert.match(markdown, /\| 2 \| 6 \| 12 \|/m);

console.log("University batch-sweep contract passed.");
