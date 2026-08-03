import {
  buildHumanizeInstructions,
  extractOutputText,
  extractUsage,
  type HumanizeInput,
} from "./humanize";

export type HumanizeResult = {
  result: string;
  usage: ReturnType<typeof extractUsage>;
  provider: "gemini" | "groq" | "ollama";
};

function usage(
  inputTokens = 0,
  outputTokens = 0,
  totalTokens = inputTokens + outputTokens,
) {
  return { inputTokens, outputTokens, totalTokens };
}

async function callGemini(
  input: HumanizeInput,
  apiKey: string,
): Promise<HumanizeResult> {
  const model = process.env["GEMINI_MODEL"]?.trim() || "gemini-3.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildHumanizeInstructions(input) }],
        },
        contents: [{ role: "user", parts: [{ text: input.text }] }],
        generationConfig: {
          maxOutputTokens: 4096,
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
      signal: AbortSignal.timeout(60_000),
    },
  );
  const data = (await response.json().catch(() => null)) as any;
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const result = data?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part?.text ?? "")
    .join("")
    .trim();
  if (!result) throw new Error("Gemini returned an empty result");
  const tokens = data?.usageMetadata ?? {};
  return {
    result,
    usage: usage(
      tokens.promptTokenCount,
      tokens.candidatesTokenCount,
      tokens.totalTokenCount,
    ),
    provider: "gemini",
  };
}

async function callGroq(
  input: HumanizeInput,
  apiKey: string,
): Promise<HumanizeResult> {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env["GROQ_MODEL"]?.trim() || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: buildHumanizeInstructions(input) },
          { role: "user", content: input.text },
        ],
        max_tokens: 4096,
      }),
      signal: AbortSignal.timeout(60_000),
    },
  );
  const data = (await response.json().catch(() => null)) as any;
  if (!response.ok) throw new Error(`Groq ${response.status}`);
  const result = data?.choices?.[0]?.message?.content?.trim();
  if (!result) throw new Error("Groq returned an empty result");
  const tokens = data?.usage ?? {};
  return {
    result,
    usage: usage(
      tokens.prompt_tokens,
      tokens.completion_tokens,
      tokens.total_tokens,
    ),
    provider: "groq",
  };
}

async function callOllama(input: HumanizeInput): Promise<HumanizeResult> {
  const baseUrl = (
    process.env["OLLAMA_BASE_URL"]?.trim() || "http://127.0.0.1:11434"
  ).replace(/\/$/, "");
  const model = process.env["OLLAMA_MODEL"]?.trim() || "gemma3:4b";
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system: buildHumanizeInstructions(input),
      prompt: input.text,
      stream: false,
      keep_alive: "5m",
      options: { num_predict: 4096 },
    }),
    signal: AbortSignal.timeout(120_000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Ollama ${response.status}`);
  const result = extractOutputText(data);
  if (!result) throw new Error("Ollama returned an empty result");
  return { result, usage: extractUsage(data), provider: "ollama" };
}

export async function humanizeWithFallback(input: HumanizeInput) {
  const preferred = process.env["AI_PROVIDER"]?.trim() || "auto";
  const attempts: Array<() => Promise<HumanizeResult>> = [];
  const geminiKey = process.env["GEMINI_API_KEY"]?.trim();
  const groqKey = process.env["GROQ_API_KEY"]?.trim();
  if ((preferred === "auto" || preferred === "gemini") && geminiKey)
    attempts.push(() => callGemini(input, geminiKey));
  if ((preferred === "auto" || preferred === "groq") && groqKey)
    attempts.push(() => callGroq(input, groqKey));
  if (
    preferred === "ollama" ||
    (preferred === "auto" && process.env["NODE_ENV"] !== "production")
  )
    attempts.push(() => callOllama(input));
  if (!attempts.length) throw new Error("No cloud AI provider is configured.");
  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("All AI providers failed.");
}
