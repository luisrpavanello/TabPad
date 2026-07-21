import assert from "node:assert/strict";
import test from "node:test";
import {
  applyTextTool,
  findMatches,
  getCursorPosition,
  replaceAllText,
} from "./editor-tools";

test("formats and cleans text", () => {
  assert.equal(applyTextTool("removeDuplicateLines", "b\na\nb"), "b\na");
  assert.equal(
    applyTextTool("formatJson", '{"ok":true}'),
    '{\n  "ok": true\n}',
  );
});

test("finds and replaces case-insensitively", () => {
  assert.deepEqual(findMatches("Tab tab TAB", "tab"), [0, 4, 8]);
  assert.equal(replaceAllText("Tab tab", "tab", "Pad"), "Pad Pad");
});

test("calculates cursor line and column", () => {
  assert.deepEqual(getCursorPosition("one\ntwo", 6), { line: 2, column: 3 });
});
