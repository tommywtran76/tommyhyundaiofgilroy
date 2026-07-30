"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Automatic logout: refreshes the session token while the user is active and
// signs out after IDLE_MINUTES with no interaction (session timeout).
const IDLE_MINUTES = 30;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function SessionKeeper() {
  const router = useRouter();
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    const markActivity = () => {
      lastActivity.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, markActivity, { passive: true }));

    const iv = setInterval(async () => {
      const idleMs = Date.now() - lastActivity.current;
      if (idleMs >= IDLE_MINUTES * 60 * 1000) {
        await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
        router.replace("/admin/login");
        return;
      }
      // Active recently → slide the server-side session forward.
      const res = await fetch("/api/admin/refresh", { method: "POST" }).catch(() => null);
      if (res && res.status === 401) router.replace("/admin/login");
    }, REFRESH_INTERVAL_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActivity));
      clearInterval(iv);
    };
  }, [router]);

  return null;
}
