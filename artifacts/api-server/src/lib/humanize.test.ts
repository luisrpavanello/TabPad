import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHumanizeInstructions,
  extractOutputText,
  extractUsage,
} from "./humanize.ts";

test("builds instructions for tone, intensity, and Markdown", () => {
  const instructions = buildHumanizeInstructions({
    text: "Original",
    tone: "professional",
    intensity: 2,
    preserveMarkdown: true,
    context: "A short product explanation",
    audience: "Non-technical readers",
    intention: "Explain without sounding promotional",
    voiceSample: "I tend to get straight to the point, but I don't mind a quick aside.",
  });
  assert.match(instructions, /professional/);
  assert.match(instructions, /Rewrite moderately/);
  assert.match(instructions, /Preserve Markdown/);
  assert.match(instructions, /Non-technical readers/);
  assert.match(instructions, /Voice sample written by the author/);
  assert.match(instructions, /Vary sentence length and cadence/);
});

test("extracts text and token usage from an Ollama result", () => {
  const response = {
    response: " Better text. ",
    prompt_eval_count: 12,
    eval_count: 8,
  };
  assert.equal(extractOutputText(response), "Better text.");
  assert.deepEqual(extractUsage(response), {
    inputTokens: 12,
    outputTokens: 8,
    totalTokens: 20,
  });
});
