import { Router, type IRouter } from "express";
import { humanizeTones, type HumanizeInput } from "../lib/humanize";
import { humanizeWithFallback } from "../lib/humanize-providers";

const router: IRouter = Router();
const maxTextLength = 12_000;
const maxContextLength = 500;
const maxVoiceSampleLength = 3_000;
const requestsPerWindow = 10;
const windowMs = 60_000;
const clients = new Map<string, number[]>();

function isRateLimited(client: string, now = Date.now()) {
  const recent = (clients.get(client) ?? []).filter(
    (time) => now - time < windowMs,
  );
  if (recent.length >= requestsPerWindow) {
    clients.set(client, recent);
    return true;
  }
  clients.set(client, [...recent, now]);
  return false;
}

router.post("/humanize", async (req, res) => {
  if (isRateLimited(req.ip ?? "unknown")) {
    res.status(429).json({
      error: "Too many requests. Please wait a minute and try again.",
    });
    return;
  }

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  const tone = humanizeTones.includes(req.body?.tone) ? req.body.tone : null;
  const intensity = Number(req.body?.intensity);
  const preserveMarkdown = req.body?.preserveMarkdown;
  const optionalText = (value: unknown, maxLength: number) => {
    if (value === undefined || value === null || value === "") return "";
    return typeof value === "string" && value.trim().length <= maxLength
      ? value.trim()
      : null;
  };
  const context = optionalText(req.body?.context, maxContextLength);
  const audience = optionalText(req.body?.audience, maxContextLength);
  const intention = optionalText(req.body?.intention, maxContextLength);
  const voiceSample = optionalText(req.body?.voiceSample, maxVoiceSampleLength);

  if (
    !text ||
    text.length > maxTextLength ||
    !tone ||
    ![1, 2, 3].includes(intensity) ||
    typeof preserveMarkdown !== "boolean" ||
    context === null ||
    audience === null ||
    intention === null ||
    voiceSample === null
  ) {
    res.status(400).json({
      error: `Send valid text, tone, intensity, Markdown preference, and optional writing context.`,
    });
    return;
  }

  const input: HumanizeInput = {
    text,
    tone,
    intensity,
    preserveMarkdown,
    context: context || undefined,
    audience: audience || undefined,
    intention: intention || undefined,
    voiceSample: voiceSample || undefined,
  };
  try {
    res.json(await humanizeWithFallback(input));
  } catch (error) {
    req.log.error({ err: error }, "Humanization request failed");
    res.status(503).json({
      error:
        error instanceof Error
          ? error.message
          : "AI providers are unavailable.",
    });
  }
});

export default router;
