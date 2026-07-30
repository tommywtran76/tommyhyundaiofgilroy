"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FOLLOW_UP_STAGES } from "@/lib/services";
import { formatPhone } from "@/lib/validation";
import { Card } from "./ui-client";

interface Row {
  id: string;
  stage: string;
  dueDate: string | null;
  nextAction: string;
  estimatedValue: number;
  preferredContact: string;
  customerId: string;
  customerName: string;
  firstName: string;
  phone: string;
  service: string;
  smsOk: boolean;
  doNotContact: boolean;
}

interface Template {
  id: string;
  name: string;
  body: string;
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

function fillTemplate(body: string, row: Row): string {
  return body.replaceAll("[First Name]", row.firstName).replaceAll("[Service]", row.service);
}

export default function FollowUpBoard({
  rows,
  templates,
  readOnly,
}: {
  rows: Row[];
  templates: Template[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState("");

  async function setStage(id: string, stage: string) {
    if (readOnly) return;
    await fetch(`/api/admin/followups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    }).catch(() => {});
    router.refresh();
  }

  async function markDone(id: string) {
    if (readOnly) return;
    await fetch(`/api/admin/followups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true, lastContactAt: new Date().toISOString() }),
    }).catch(() => {});
    router.refresh();
  }

  async function copyMessage(row: Row, template: Template) {
    const text = fillTemplate(template.body, row);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(`${row.id}:${template.id}`);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      window.prompt("Copy this message:", text);
    }
  }

  const grouped = FOLLOW_UP_STAGES.map((stage) => ({
    stage,
    rows: rows.filter((r) => r.stage === stage),
  })).filter((g) => g.rows.length > 0);

  if (rows.length === 0) {
    return (
      <Card className="px-6 py-12 text-center">
        <p className="text-charcoal-soft">
          No open follow-ups. New leads are created automatically when a guest checks in without an
          appointment.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {grouped.map((g) => (
        <section key={g.stage}>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            {STAGE_LABELS[g.stage]} <span className="text-charcoal-soft text-sm">({g.rows.length})</span>
          </h2>
          <div className="grid gap-3">
            {g.rows.map((row) => (
              <Card key={row.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/customers/${row.customerId}`}
                      className="font-medium text-charcoal hover:text-gold-deep hover:underline underline-offset-2"
                    >
                      {row.customerName}
                    </Link>
                    <span className="ml-3 text-sm text-charcoal-soft">{formatPhone(row.phone)}</span>
                    {row.doNotContact && (
                      <span className="ml-3 text-xs text-red-800 border border-red-200 bg-red-50 rounded-full px-2 py-0.5">
                        do not contact
                      </span>
                    )}
                    <p className="text-sm text-charcoal-soft mt-1">
                      {row.service}
                      {row.estimatedValue ? ` · est. $${row.estimatedValue}` : ""}
                      {row.dueDate ? ` · due ${new Date(row.dueDate).toLocaleDateString()}` : ""}
                      {row.preferredContact ? ` · prefers ${row.preferredContact}` : ""}
                    </p>
                    {row.nextAction && <p className="text-sm text-charcoal mt-0.5">→ {row.nextAction}</p>}
                  </div>

                  {!readOnly && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        aria-label="Change stage"
                        value={row.stage}
                        onChange={(e) => setStage(row.id, e.target.value)}
                        className="text-sm px-2 py-1.5 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
                      >
                        {FOLLOW_UP_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {STAGE_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => markDone(row.id)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-blush bg-cream hover:border-gold transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {!readOnly && !row.doNotContact && row.stage !== "DO_NOT_CONTACT" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => copyMessage(row, t)}
                        title={row.smsOk ? undefined : "No promotional SMS consent — service messages only"}
                        className="text-xs px-2.5 py-1.5 rounded-full border border-blush bg-blush-soft/60 text-charcoal-soft hover:border-gold transition-colors"
                      >
                        {copied === `${row.id}:${t.id}` ? "Copied ✓" : `Copy: ${t.name}`}
                        {!row.smsOk && " ⚠"}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      ))}
      <p className="text-xs text-charcoal-soft">
        ⚠ marks customers without promotional SMS consent — only send them service-related messages
        (e.g. appointment questions they asked about), never promotions.
      </p>
    </div>
  );
}
