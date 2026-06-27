import { Router, type IRouter } from "express";

const router: IRouter = Router();
const activeClients = new Map<string, number>();
const activeWindowMs = 90_000;

function pruneInactiveClients(now = Date.now()) {
  for (const [clientId, lastSeen] of activeClients) {
    if (now - lastSeen > activeWindowMs) {
      activeClients.delete(clientId);
    }
  }
}

router.get("/online", (_req, res) => {
  pruneInactiveClients();
  res.json({ online: activeClients.size });
});

router.post("/online", (req, res) => {
  const clientId =
    typeof req.body?.clientId === "string" ? req.body.clientId.trim() : "";

  if (clientId.length === 0 || clientId.length > 128) {
    res.status(400).json({ error: "clientId is required" });
    return;
  }

  activeClients.set(clientId, Date.now());
  pruneInactiveClients();

  res.json({ online: activeClients.size });
});

export default router;
