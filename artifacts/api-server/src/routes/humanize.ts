import { Router, type IRouter } from "express";
import { humanizeTones, type HumanizeInput } from "../lib/humanize";
import { humanizeWithFallback } from "../lib/humanize-providers";

const router: IRouter = Router();
const maxTextLength = 12_000;
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

  if (
    !text ||
    text.length > maxTextLength ||
    !tone ||
    ![1, 2, 3].includes(intensity) ||
    typeof preserveMarkdown !== "boolean"
  ) {
    res.status(400).json({
      error: `Send 1-${maxTextLength} characters, a valid tone, intensity from 1 to 3, and preserveMarkdown.`,
    });
    return;
  }

  const input: HumanizeInput = { text, tone, intensity, preserveMarkdown };
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
