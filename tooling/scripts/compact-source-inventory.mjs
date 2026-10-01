export const stripCompactComments = (source) => {
  let output = "";
  let state = "code";
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (state === "line-comment") {
      if (character === "\n") {
        state = "code";
        output += character;
      } else {
        output += " ";
      }
    } else if (state === "block-comment") {
      if (character === "*" && next === "/") {
        output += "  ";
        index += 1;
        state = "code";
      } else {
        output += character === "\n" ? character : " ";
      }
    } else if (state === "string") {
      output += character;
      if (character === "\\" && next !== undefined) {
        output += next;
        index += 1;
      } else if (character === '"') {
        state = "code";
      }
    } else if (character === "/" && next === "/") {
      output += "  ";
      index += 1;
      state = "line-comment";
    } else if (character === "/" && next === "*") {
      output += "  ";
      index += 1;
      state = "block-comment";
    } else {
      output += character;
      if (character === '"') state = "string";
    }
  }
  return output;
};

const stripCompactStrings = (source) =>
  source.replace(/"(?:\\.|[^"\\])*"/gsu, (value) =>
    value.replace(/[^\n]/gu, " "),
  );

export const collectExportedCircuitSymbols = (source) => [
  ...stripCompactStrings(stripCompactComments(source)).matchAll(
    /^\s*export\s+(?:pure\s+)?circuit\s+([A-Za-z][A-Za-z0-9_]*)\s*\(/gmu,
  ),
].map((match) => match[1]);

export const compactCircuitKey = ({ source, symbol }) =>
  `${source}#${symbol}`;
