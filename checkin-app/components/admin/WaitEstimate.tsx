"use client";

import { useState } from "react";

// Small inline editor for the "estimated wait" the guest sees on the
// confirmation screen and staff see on the board.
export default function WaitEstimate({
  checkInId,
  value,
  readOnly,
}: {
  checkInId: string;
  value: string;
  readOnly?: boolean;
}) {
  const [text, setText] = useState(value);
  const [saved, setSaved] = useState(true);

  async function save() {
    if (readOnly || saved) return;
    await fetch(`/api/admin/checkins/${checkInId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waitEstimate: text }),
    }).catch(() => {});
    setSaved(true);
  }

  if (readOnly) {
    return text ? <p className="text-xs text-charcoal-soft">Wait: {text}</p> : null;
  }

  return (
    <label className="flex items-center gap-2 text-xs text-charcoal-soft">
      Est. wait
      <input
        value={text}
        placeholder="e.g. 10 min"
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="w-24 px-2 py-1 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
      />
      {!saved && <span className="text-gold-deep">…</span>}
    </label>
  );
}
