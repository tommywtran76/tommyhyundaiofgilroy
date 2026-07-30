"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./ui-client";

interface Template {
  id: string;
  name: string;
  channel: string;
  body: string;
}

export default function TemplateManager({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", channel: "SMS", body: "" });
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});
    setBusy(false);
    setForm({ name: "", channel: "SMS", body: "" });
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    await fetch(`/api/admin/templates?id=${id}`, { method: "DELETE" }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl text-charcoal mb-1">Message templates</h2>
      <p className="text-xs text-charcoal-soft mb-4">
        Placeholders: <code>[First Name]</code> and <code>[Service]</code>. Promotional messages may
        only be sent to customers with matching marketing consent.
      </p>

      <ul className="divide-y divide-blush/50 mb-5">
        {templates.map((t) => (
          <li key={t.id} className="py-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-charcoal">
                {t.name} <span className="text-xs text-charcoal-soft">({t.channel})</span>
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(t.id)}
                className="text-xs text-red-800 underline underline-offset-2 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
            <p className="text-charcoal-soft mt-1">{t.body}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={create} className="grid gap-3 text-sm">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <input
            required
            placeholder="Template name"
            aria-label="Template name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
          />
          <select
            aria-label="Channel"
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
            className="px-3 py-2 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
          >
            <option value="SMS">SMS</option>
            <option value="EMAIL">Email</option>
          </select>
        </div>
        <textarea
          required
          rows={3}
          placeholder="Hi [First Name], …"
          aria-label="Template body"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className="px-3 py-2 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="min-h-10 rounded-xl bg-charcoal text-cream font-medium hover:bg-charcoal-soft transition-colors disabled:opacity-50"
        >
          Add template
        </button>
      </form>
    </Card>
  );
}
