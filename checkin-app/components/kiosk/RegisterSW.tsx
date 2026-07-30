"use client";

import { useEffect } from "react";

// Registers the kiosk service worker (production only) so the iPad app keeps
// its shell through brief network drops.
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
