export type ToolAction =
  | "uppercase"
  | "lowercase"
  | "titleCase"
  | "removeEmptyLines"
  | "removeDuplicateLines"
  | "sortLines"
  | "trimLines"
  | "formatJson";

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function applyTextTool(action: ToolAction, value: string) {
  const normalizedValue = value.replace(/\r\n?/g, "\n");

  switch (action) {
    case "uppercase":
      return value.toUpperCase();
    case "lowercase":
      return value.toLowerCase();
    case "titleCase":
      return toTitleCase(value);
    case "removeEmptyLines":
      return normalizedValue
        .split("\n")
        .filter((line) => line.trim())
        .join("\n");
    case "removeDuplicateLines":
      return Array.from(new Set(normalizedValue.split("\n"))).join("\n");
    case "sortLines":
      return normalizedValue
        .split("\n")
        .sort((a, b) => a.localeCompare(b))
        .join("\n");
    case "trimLines":
      return normalizedValue
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .replace(/^\n+|\n+$/g, "");
    case "formatJson":
      return value.trim()
        ? JSON.stringify(JSON.parse(value.trim()), null, 2)
        : value;
  }
}

export function findMatches(content: string, query: string, matchCase = false) {
  if (!query) return [];
  const haystack = matchCase ? content : content.toLocaleLowerCase();
  const needle = matchCase ? query : query.toLocaleLowerCase();
  const matches: number[] = [];
  let offset = 0;
  while ((offset = haystack.indexOf(needle, offset)) !== -1) {
    matches.push(offset);
    offset += Math.max(needle.length, 1);
  }
  return matches;
}

export function replaceAllText(
  content: string,
  query: string,
  replacement: string,
  matchCase = false,
) {
  const matches = findMatches(content, query, matchCase);
  if (!matches.length) return content;
  let result = "";
  let cursor = 0;
  for (const index of matches) {
    result += content.slice(cursor, index) + replacement;
    cursor = index + query.length;
  }
  return result + content.slice(cursor);
}

export function getCursorPosition(content: string, offset: number) {
  const beforeCursor = content.slice(0, Math.max(0, offset));
  const lines = beforeCursor.split("\n");
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 };
}
