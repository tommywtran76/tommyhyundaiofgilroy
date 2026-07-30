"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CUSTOMER_TAGS } from "@/lib/services";
import { Card } from "./ui-client";

export default function CustomerEditor({
  customerId,
  notes,
  tags,
  estimatedValue,
  doNotContact,
  readOnly,
}: {
  customerId: string;
  notes: string;
  tags: string[];
  estimatedValue: number;
  doNotContact: boolean;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState({ notes, tags, estimatedValue, doNotContact });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function patch(p: Partial<typeof state>) {
    setState((s) => ({ ...s, ...p }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    }).catch(() => null);
    setSaving(false);
    if (!res || !res.ok) {
      setError("Could not save. Please try again.");
      return;
    }
    setDirty(false);
    router.refresh();
  }

  if (readOnly) {
    return (
      <Card className="p-5">
        <h2 className="font-serif text-xl text-charcoal mb-2">Notes</h2>
        <p className="text-sm text-charcoal-soft whitespace-pre-wrap">{notes || "No notes."}</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl text-charcoal mb-4">Notes & tags</h2>

      <label htmlFor="cust-notes" className="block text-sm font-medium text-charcoal mb-1.5">
        Notes
      </label>
      <textarea
        id="cust-notes"
        rows={4}
        value={state.notes}
        onChange={(e) => patch({ notes: e.target.value })}
        className="w-full px-3 py-2 rounded-xl bg-cream border border-blush text-sm focus:border-gold focus:outline-none"
      />

      <p className="text-sm font-medium text-charcoal mt-4 mb-2">Tags</p>
      <div className="flex flex-wrap gap-1.5">
        {CUSTOMER_TAGS.map((t) => {
          const on = state.tags.includes(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() =>
                patch({ tags: on ? state.tags.filter((x) => x !== t) : [...state.tags, t] })
              }
              className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                on
                  ? "bg-gold text-cream border-gold"
                  : "bg-cream text-charcoal-soft border-blush hover:border-gold"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-6 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-charcoal">
          Estimated value $
          <input
            type="number"
            min={0}
            value={state.estimatedValue}
            onChange={(e) => patch({ estimatedValue: Math.max(0, Number(e.target.value) || 0) })}
            className="w-24 px-2 py-1.5 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={state.doNotContact}
            onChange={(e) => patch({ doNotContact: e.target.checked })}
            className="h-4 w-4 accent-[#b89b72]"
          />
          Do not contact
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={!dirty || saving}
        className="mt-4 min-h-10 px-5 rounded-xl bg-charcoal text-cream text-sm font-medium hover:bg-charcoal-soft transition-colors disabled:opacity-40"
      >
        {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
      </button>
    </Card>
  );
}
