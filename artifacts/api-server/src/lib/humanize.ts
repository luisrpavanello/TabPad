export const humanizeTones = [
  "natural",
  "professional",
  "casual",
  "academic",
] as const;
export type HumanizeTone = (typeof humanizeTones)[number];

export interface HumanizeInput {
  text: string;
  tone: HumanizeTone;
  intensity: number;
  preserveMarkdown: boolean;
}

const toneGuidance: Record<HumanizeTone, string> = {
  natural:
    "Use a natural, clear, conversational voice without forced informality.",
  professional:
    "Use a polished, direct, professional voice that remains approachable.",
  casual:
    "Use a relaxed, friendly voice with natural contractions and varied rhythm.",
  academic:
    "Use a precise, cohesive academic voice without unnecessary jargon.",
};

const intensityGuidance = [
  "Make light edits. Preserve nearly all wording and focus on rhythm and readability.",
  "Rewrite moderately. Vary sentence structure and remove formulaic repetition while preserving meaning.",
  "Rewrite substantially. Rebuild awkward passages and vary paragraph rhythm while preserving every fact and claim.",
];

export function buildHumanizeInstructions(input: HumanizeInput) {
  return [
    "You are a careful text editor. Rewrite the supplied text so it reads naturally and clearly.",
    "Preserve the original meaning, facts, names, numbers, citations, and language. Do not add claims.",
    toneGuidance[input.tone],
    intensityGuidance[input.intensity - 1],
    "Break dense reasoning into readable paragraphs at semantic boundaries. Never split at a fixed character count.",
    input.preserveMarkdown
      ? "Preserve Markdown structure, links, headings, lists, blockquotes, tables, and fenced code exactly where practical. Never rewrite code."
      : "Return plain text unless formatting is essential to the meaning.",
    "Return only the rewritten text, with no introduction, commentary, quotation marks, or labels.",
  ].join("\n");
}

export function extractOutputText(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const response = (data as { response?: unknown }).response;
  return typeof response === "string" ? response.trim() : "";
}

export function extractUsage(data: unknown) {
  const response =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const number = (key: string) =>
    typeof response[key] === "number" ? (response[key] as number) : 0;

  const inputTokens = number("prompt_eval_count");
  const outputTokens = number("eval_count");
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}
