"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CHECKIN_STATUSES } from "@/lib/services";

const LABELS: Record<string, string> = {
  WAITING: "Waiting",
  IN_CONSULTATION: "In Consultation",
  IN_SERVICE: "In Service",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
  FOLLOW_UP_NEEDED: "Follow-Up Needed",
};

// One-tap status changer for a check-in row.
export default function StatusControl({
  checkInId,
  status,
  readOnly,
}: {
  checkInId: string;
  status: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function setStatus(next: string) {
    if (readOnly || next === current || saving) return;
    const prev = current;
    setCurrent(next);
    setSaving(true);
    const res = await fetch(`/api/admin/checkins/${checkInId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    setSaving(false);
    if (!res || !res.ok) {
      setCurrent(prev);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Arrival status">
      {CHECKIN_STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => setStatus(s)}
          aria-pressed={current === s}
          className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors disabled:cursor-default ${
            current === s
              ? "bg-charcoal text-cream border-charcoal"
              : "bg-cream text-charcoal-soft border-blush hover:border-gold"
          }`}
        >
          {LABELS[s]}
        </button>
      ))}
    </div>
  );
}
