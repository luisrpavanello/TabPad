import { useEffect, useState } from "react";

const storageKey = "tabpad.clientId";
const heartbeatMs = 30_000;

function getClientId() {
  const existing = localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const clientId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);

  localStorage.setItem(storageKey, clientId);
  return clientId;
}

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<number | null>(null);

  useEffect(() => {
    const clientId = getClientId();
    let isMounted = true;

    const sendHeartbeat = async () => {
      try {
        const response = await fetch("/api/online", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId }),
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { online?: unknown };

        if (isMounted && typeof data.online === "number") {
          setOnlineUsers(data.online);
        }
      } catch {
        if (isMounted) {
          setOnlineUsers(null);
        }
      }
    };

    void sendHeartbeat();
    const intervalId = window.setInterval(sendHeartbeat, heartbeatMs);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return onlineUsers;
}
