import type { HumanizeTone } from "./humanizer-prompt";

export type BrowserModelStatus =
  | "idle"
  | "downloading"
  | "generating"
  | "ready"
  | "error";
export type BrowserProgress = {
  status: BrowserModelStatus;
  percent: number;
  detail: string;
};

let worker: Worker | null = null;

export function getBrowserAiSupport() {
  const hasWebGpu = typeof navigator !== "undefined" && "gpu" in navigator;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  return {
    supported: hasWebGpu && (memory === undefined || memory >= 4),
    hasWebGpu,
    memory,
  };
}

export function humanizeInBrowser(
  text: string,
  tone: HumanizeTone,
  intensity: number,
  preserveMarkdown: boolean,
  onProgress: (progress: BrowserProgress) => void,
) {
  worker ??= new Worker(
    new URL("../workers/humanizer.worker.ts", import.meta.url),
    { type: "module" },
  );
  const id = crypto.randomUUID();
  const instructions = buildBrowserInstructions(
    tone,
    intensity,
    preserveMarkdown,
  );

  return new Promise<string>((resolve, reject) => {
    const listener = (event: MessageEvent) => {
      const message = event.data as Record<string, unknown>;
      if (message.type === "progress") {
        const update = message.update as Record<string, unknown> | undefined;
        const raw = typeof update?.progress === "number" ? update.progress : 0;
        onProgress({
          status: "downloading",
          percent: Math.round(raw),
          detail:
            typeof update?.file === "string" ? update.file : "Qwen 3.5 2B",
        });
      }
      if (message.id !== id) return;
      if (message.type === "generating")
        onProgress({
          status: "generating",
          percent: 100,
          detail: "Qwen 3.5 2B",
        });
      if (message.type === "result") {
        cleanup();
        resolve(String(message.result ?? ""));
      }
      if (message.type === "error") {
        cleanup();
        reject(new Error(String(message.error ?? "Browser model failed")));
      }
    };
    const cleanup = () => worker?.removeEventListener("message", listener);
    worker!.addEventListener("message", listener);
    worker!.postMessage({ id, prompt: text, instructions });
  });
}

function buildBrowserInstructions(
  tone: HumanizeTone,
  intensity: number,
  preserveMarkdown: boolean,
) {
  return [
    "Rewrite the text naturally without changing its language, facts, names, numbers, or meaning.",
    `Tone: ${tone}. Editing intensity: ${intensity} of 3.`,
    "Vary sentence rhythm and split dense paragraphs only at semantic boundaries.",
    preserveMarkdown
      ? "Preserve Markdown and never rewrite code."
      : "Return plain text.",
    "Return only the rewritten text.",
  ].join("\n");
}
