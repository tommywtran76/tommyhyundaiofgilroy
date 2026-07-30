"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { REFERRAL_LABELS, serviceLabel, type ReferralSource } from "@/lib/services";
import { formatPhone } from "@/lib/validation";
import type { KioskForm, KioskStep } from "./types";
import SignaturePad from "./SignaturePad";
import { BigButton, ScreenHeading } from "./ui";

export default function ReviewScreen({
  lang,
  form,
  update,
  back,
  goTo,
  onSubmit,
}: {
  lang: Lang;
  form: KioskForm;
  update: (patch: Partial<KioskForm>) => void;
  back: () => void;
  goTo: (step: KioskStep) => void;
  onSubmit: () => Promise<void>;
}) {
  const d = t(lang);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      await onSubmit();
    } catch {
      setError(d.review.submitError);
      setSubmitting(false);
    }
  }

  const rows: { label: string; value: string; step: KioskStep }[] = [
    { label: d.review.name, value: `${form.firstName} ${form.lastName}`, step: "info" },
    { label: d.review.phone, value: formatPhone(form.phone), step: "info" },
    { label: d.review.email, value: form.email || "—", step: "info" },
    { label: d.review.birthday, value: form.birthday || "—", step: "info" },
    {
      label: d.review.firstVisit,
      value: form.isFirstVisit ? d.review.granted : d.review.declined,
      step: "info",
    },
    {
      label: d.review.visitType,
      value: form.visitType ? d.visitTypes[form.visitType] : "—",
      step: "welcome",
    },
    {
      label: d.review.services,
      value:
        form.services
          .map((s) => (s === "other" && form.otherService ? form.otherService : serviceLabel(s, lang)))
          .join(", ") || "—",
      step: "services",
    },
    {
      label: d.review.appointment,
      value:
        form.hasAppointment === "YES"
          ? [form.appointmentTime, form.staffMember, form.serviceBooked].filter(Boolean).join(" · ") ||
            d.review.granted
          : d.review.declined,
      step: "services",
    },
    {
      label: d.review.referral,
      value: form.referralSource
        ? REFERRAL_LABELS[form.referralSource as ReferralSource]?.[lang] ?? form.referralSource
        : "—",
      step: "referral",
    },
    {
      label: d.review.smsConsent,
      value: form.smsConsent ? d.review.granted : d.review.declined,
      step: "consent",
    },
    {
      label: d.review.emailConsent,
      value: form.emailConsent ? d.review.granted : d.review.declined,
      step: "consent",
    },
  ];

  return (
    <div className="screen-in w-full max-w-2xl mx-auto px-6 py-10">
      <ScreenHeading title={d.review.title} subtitle={d.review.subtitle} />

      <dl className="rounded-2xl bg-cream border border-blush shadow-card divide-y divide-blush/60 overflow-hidden">
        {rows.map((r) => (
          <div key={r.label + r.value} className="flex items-center gap-4 px-6 py-4">
            <dt className="w-36 shrink-0 text-sm uppercase tracking-wide text-charcoal-soft">
              {r.label}
            </dt>
            <dd className="flex-1 text-lg text-charcoal">{r.value}</dd>
            <button
              type="button"
              onClick={() => goTo(r.step)}
              className="text-sm text-gold-deep underline underline-offset-2 min-h-11 px-2"
            >
              {d.review.edit}
            </button>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <p className="text-lg font-medium text-charcoal mb-3">{d.review.signature}</p>
        <SignaturePad
          placeholder={d.review.signHere}
          clearLabel={d.review.clear}
          onChange={(sig) => update({ signature: sig })}
        />
      </div>

      <p className="mt-6 text-sm text-charcoal-soft leading-relaxed">{d.review.statement}</p>

      {error && (
        <p role="alert" className="mt-4 text-red-800 text-center">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <BigButton variant="secondary" onClick={back} disabled={submitting}>
          ← {d.review.back}
        </BigButton>
        <BigButton onClick={submit} disabled={submitting}>
          {submitting ? d.review.submitting : d.review.confirm}
        </BigButton>
      </div>
    </div>
  );
}
