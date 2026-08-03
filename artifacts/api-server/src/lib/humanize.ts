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
  context?: string;
  audience?: string;
  intention?: string;
  voiceSample?: string;
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
    "You are an expert human editor. Rewrite the supplied text so it sounds authored by a real person with a distinct, context-appropriate voice, not like generic polished copy.",
    "Preserve the original meaning, facts, names, numbers, citations, and language. Do not add claims.",
    toneGuidance[input.tone],
    intensityGuidance[input.intensity - 1],
    "Vary sentence length and cadence. Mix concise statements with longer reflective sentences when natural.",
    "Prefer concrete, idiomatic wording. Remove stock transitions, repetitive summaries, inflated formality, symmetrical lists, and other formulaic phrasing.",
    "Use occasional conversational bridges, contractions, qualifications, or brief asides only when they fit the selected tone and source language. Never force slang.",
    "Let paragraphs follow shifts in thought. Break dense reasoning at semantic boundaries, and avoid making every paragraph or sentence look equally structured.",
    "Do not deliberately add spelling mistakes, broken grammar, random punctuation, fake anecdotes, or unsupported personal experiences.",
    input.context ? `Writing context: ${input.context}` : "",
    input.audience ? `Intended audience: ${input.audience}` : "",
    input.intention ? `Author's intention: ${input.intention}` : "",
    input.voiceSample
      ? `Voice sample written by the author:\n---\n${input.voiceSample}\n---\nMatch its cadence, vocabulary, formality, and conversational habits without copying its subject matter or phrases.`
      : "",
    input.preserveMarkdown
      ? "Preserve Markdown structure, links, headings, lists, blockquotes, tables, and fenced code exactly where practical. Never rewrite code."
      : "Return plain text unless formatting is essential to the meaning.",
    "Return only the rewritten text, with no introduction, commentary, quotation marks, or labels.",
  ]
    .filter(Boolean)
    .join("\n");
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
