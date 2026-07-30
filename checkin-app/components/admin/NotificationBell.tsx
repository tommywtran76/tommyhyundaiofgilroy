"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Notice {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  readAt: string | null;
}

// Polls for new check-in notifications every 15s. Plays a soft chime when a
// new one arrives (toggleable, for the front-desk device).

export default function NotificationBell() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(true);
  const known = useRef<Set<string>>(new Set());
  const primed = useRef(false);
  const soundRef = useRef(true);
  soundRef.current = sound;

  const chime = useCallback(() => {
    try {
      type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
      const Ctor = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const notes = [880, 1174.66]; // A5 → D6, a gentle two-note bell
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + i * 0.18 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.18);
        osc.stop(ctx.currentTime + i * 0.18 + 0.65);
      });
    } catch {
      // Audio may be blocked before first user gesture; ignore.
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    async function poll() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok || stopped) return;
        const data: Notice[] = await res.json();
        const fresh = data.filter((n) => !known.current.has(n.id));
        data.forEach((n) => known.current.add(n.id));
        if (primed.current && fresh.length > 0) {
          if (soundRef.current) chime();
          router.refresh(); // new check-in → refresh the page data
        }
        primed.current = true;
        setNotices(data);
      } catch {
        // Network hiccup; next poll will retry.
      }
    }
    poll();
    const iv = setInterval(poll, 15_000);
    return () => {
      stopped = true;
      clearInterval(iv);
    };
  }, [chime, router]);

  const unread = notices.filter((n) => !n.readAt).length;

  async function markAllRead() {
    await fetch("/api/admin/notifications", { method: "PATCH" }).catch(() => {});
    setNotices((ns) => ns.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setSound((s) => !s)}
          title={sound ? "Sound on" : "Sound off"}
          aria-label={sound ? "Turn notification sound off" : "Turn notification sound on"}
          className="h-10 w-10 rounded-full hover:bg-blush-soft flex items-center justify-center text-charcoal-soft"
        >
          {sound ? "🔔" : "🔕"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            if (!open && unread) markAllRead();
          }}
          aria-label={`Notifications, ${unread} unread`}
          className="relative h-10 px-3 rounded-full hover:bg-blush-soft flex items-center justify-center text-sm text-charcoal"
        >
          Alerts
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-gold text-cream text-xs flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-[70vh] overflow-y-auto rounded-2xl bg-cream border border-blush shadow-soft z-40">
          {notices.length === 0 ? (
            <p className="p-6 text-sm text-charcoal-soft text-center">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-blush/60">
              {notices.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <p className="text-sm text-charcoal">{n.message}</p>
                  <p className="text-xs text-charcoal-soft mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
