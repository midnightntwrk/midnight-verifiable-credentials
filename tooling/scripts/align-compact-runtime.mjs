/**
 * Add the runtime compatibility alias to generated managed contracts.
 *
 * Compact compilation can be skipped when ensure-compact-artifacts reuses a
 * validated output. Keep this post-processing idempotent so repeated package
 * builds cannot drift the committed fixture bytes.
 */
export function ensureProvableCircuitsAlias(source) {
  if (source.includes("this.provableCircuits = this.impureCircuits;")) return source;
  return source.replace(
    /(\s*this\.impureCircuits = \{\n[\s\S]*?\n\s*\};\n)/,
    "$1    this.provableCircuits = this.impureCircuits;\n",
  );
}
