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

test("adds deep conversational guidance only for casual strong rewrites", () => {
  const strong = buildHumanizeInstructions({
    text: "Original",
    tone: "casual",
    intensity: 3,
    preserveMarkdown: false,
  });
  const balanced = buildHumanizeInstructions({
    text: "Original",
    tone: "casual",
    intensity: 2,
    preserveMarkdown: false,
  });

  assert.match(strong, /strongly conversational rewrite/);
  assert.match(strong, /Okay, so/);
  assert.match(strong, /hands-on stuff/);
  assert.doesNotMatch(balanced, /strongly conversational rewrite/);
});
