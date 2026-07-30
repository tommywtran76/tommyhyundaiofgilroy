"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./ui-client";

interface ConsentRow {
  id: string;
  channel: string;
  granted: boolean;
  source: string;
  createdAt: string;
  revokedAt: string | null;
}

// Consent history plus staff-recorded changes (e.g. customer calls to opt out).
// Changes append a new record — history is never edited.
export default function ConsentPanel({
  customerId,
  records,
  readOnly,
}: {
  customerId: string;
  records: ConsentRow[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const current = (channel: string) =>
    records.find((r) => r.channel === channel && !r.revokedAt)?.granted ?? false;

  async function record(channel: "SMS" | "EMAIL", granted: boolean) {
    setBusy(true);
    await fetch("/api/admin/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, channel, granted }),
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl text-charcoal mb-4">Marketing consent</h2>

      <div className="flex gap-6 flex-wrap mb-4">
        {(["SMS", "EMAIL"] as const).map((ch) => (
          <div key={ch} className="text-sm">
            <p className="text-charcoal-soft">{ch === "SMS" ? "Text messages" : "Email"}</p>
            <p className={`font-medium ${current(ch) ? "text-emerald-700" : "text-stone-500"}`}>
              {current(ch) ? "Opted in" : "Not opted in"}
            </p>
            {!readOnly && (
              <button
                type="button"
                disabled={busy}
                onClick={() => record(ch, !current(ch))}
                className="mt-1 text-xs text-gold-deep underline underline-offset-2 disabled:opacity-50"
              >
                Record {current(ch) ? "withdrawal" : "opt-in"}
              </button>
            )}
          </div>
        ))}
      </div>

      <details>
        <summary className="text-sm text-charcoal-soft cursor-pointer">
          Consent history ({records.length})
        </summary>
        <ul className="mt-2 text-xs text-charcoal-soft space-y-1 max-h-48 overflow-y-auto">
          {records.map((r) => (
            <li key={r.id}>
              {new Date(r.createdAt).toLocaleString()} — {r.channel}{" "}
              {r.granted ? "granted" : "declined"} via {r.source}
              {r.revokedAt ? ` (superseded ${new Date(r.revokedAt).toLocaleDateString()})` : ""}
            </li>
          ))}
        </ul>
      </details>
    </Card>
  );
}
