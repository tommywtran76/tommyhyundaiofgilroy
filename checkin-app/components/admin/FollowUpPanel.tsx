"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FOLLOW_UP_STAGES } from "@/lib/services";
import { Card } from "./ui-client";

export interface FollowUpRow {
  id: string;
  stage: string;
  dueDate: string | null;
  notes: string;
  preferredContact: string;
  estimatedValue: number;
  lastContactAt: string | null;
  nextAction: string;
  done: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead",
  CONTACT_TODAY: "Contact Today",
  WAITING_REPLY: "Waiting for Reply",
  CONSULT_SCHEDULED: "Consultation Scheduled",
  BOOKED: "Appointment Booked",
  NOT_READY: "Not Ready",
  DO_NOT_CONTACT: "Do Not Contact",
};

export { STAGE_LABELS as FOLLOW_UP_STAGE_LABELS };

function FollowUpEditor({
  followUp,
  onSaved,
  readOnly,
}: {
  followUp: FollowUpRow;
  onSaved: () => void;
  readOnly?: boolean;
}) {
  const [f, setF] = useState(followUp);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  function patch(p: Partial<FollowUpRow>) {
    setF((s) => ({ ...s, ...p }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/followups/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage: f.stage,
        dueDate: f.dueDate,
        notes: f.notes,
        preferredContact: f.preferredContact,
        estimatedValue: f.estimatedValue,
        lastContactAt: f.lastContactAt,
        nextAction: f.nextAction,
        done: f.done,
      }),
    }).catch(() => null);
    setSaving(false);
    if (res?.ok) {
      setDirty(false);
      onSaved();
    }
  }

  if (readOnly) {
    return (
      <div className="text-sm text-charcoal-soft">
        <p className="font-medium text-charcoal">{STAGE_LABELS[f.stage] ?? f.stage}</p>
        {f.nextAction && <p>Next: {f.nextAction}</p>}
        {f.notes && <p>{f.notes}</p>}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-blush p-4 ${f.done ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Follow-up stage">
        {FOLLOW_UP_STAGES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={f.stage === s}
            onClick={() => patch({ stage: s })}
            className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
              f.stage === s
                ? "bg-charcoal text-cream border-charcoal"
                : "bg-cream text-charcoal-soft border-blush hover:border-gold"
            }`}
          >
            {STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <label className="grid gap-1">
          <span className="text-charcoal-soft">Follow-up date</span>
          <input
            type="date"
            value={f.dueDate ? f.dueDate.slice(0, 10) : ""}
            onChange={(e) =>
              patch({ dueDate: e.target.value ? new Date(e.target.value + "T12:00:00").toISOString() : null })
            }
            className="px-2 py-1.5 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-charcoal-soft">Preferred contact method</span>
          <select
            value={f.preferredContact}
            onChange={(e) => patch({ preferredContact: e.target.value })}
            className="px-2 py-1.5 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
          >
            <option value="">—</option>
            <option value="call">Call</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-charcoal-soft">Estimated service value ($)</span>
          <input
            type="number"
            min={0}
            value={f.estimatedValue}
            onChange={(e) => patch({ estimatedValue: Math.max(0, Number(e.target.value) || 0) })}
            className="px-2 py-1.5 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-charcoal-soft">Last contact date</span>
          <input
            type="date"
            value={f.lastContactAt ? f.lastContactAt.slice(0, 10) : ""}
            onChange={(e) =>
              patch({
                lastContactAt: e.target.value ? new Date(e.target.value + "T12:00:00").toISOString() : null,
              })
            }
            className="px-2 py-1.5 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
          />
        </label>
        <label className="grid gap-1 sm:col-span-2">
          <span className="text-charcoal-soft">Next action</span>
          <input
            value={f.nextAction}
            onChange={(e) => patch({ nextAction: e.target.value })}
            className="px-2 py-1.5 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
          />
        </label>
        <label className="grid gap-1 sm:col-span-2">
          <span className="text-charcoal-soft">Notes</span>
          <textarea
            rows={2}
            value={f.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            className="px-2 py-1.5 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="min-h-9 px-4 rounded-lg bg-charcoal text-cream text-xs font-medium hover:bg-charcoal-soft disabled:opacity-40"
        >
          {saving ? "Saving…" : dirty ? "Save" : "Saved"}
        </button>
        <label className="flex items-center gap-1.5 text-xs text-charcoal-soft">
          <input
            type="checkbox"
            checked={f.done}
            onChange={(e) => patch({ done: e.target.checked })}
            className="h-4 w-4 accent-[#b89b72]"
          />
          Done
        </label>
      </div>
    </div>
  );
}

export default function FollowUpPanel({
  customerId,
  followUps,
  readOnly,
}: {
  customerId: string;
  followUps: FollowUpRow[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function create() {
    setCreating(true);
    await fetch("/api/admin/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    }).catch(() => {});
    setCreating(false);
    router.refresh();
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-charcoal">Follow-up</h2>
        {!readOnly && (
          <button
            type="button"
            onClick={create}
            disabled={creating}
            className="text-sm text-gold-deep underline underline-offset-2 disabled:opacity-50"
          >
            + New follow-up
          </button>
        )}
      </div>
      {followUps.length === 0 ? (
        <p className="text-sm text-charcoal-soft">No follow-up tasks for this customer.</p>
      ) : (
        <div className="grid gap-3">
          {followUps.map((f) => (
            <FollowUpEditor key={f.id} followUp={f} onSaved={() => router.refresh()} readOnly={readOnly} />
          ))}
        </div>
      )}
    </Card>
  );
}
