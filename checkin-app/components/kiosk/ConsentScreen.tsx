"use client";

import { t } from "@/lib/i18n";
import { EMAIL_CONSENT_WORDING, SMS_CONSENT_WORDING } from "@/lib/consent";
import type { ScreenProps } from "./types";
import { NavRow, ScreenHeading } from "./ui";

// Marketing consent. Both boxes start unchecked and are fully optional —
// check-in continues either way (no dark patterns).

export default function ConsentScreen({ lang, form, update, next, back }: ScreenProps) {
  const d = t(lang);

  return (
    <div className="screen-in w-full max-w-2xl mx-auto px-6 py-10">
      <ScreenHeading title={d.consent.title} subtitle={d.consent.subtitle} />

      <div className="grid gap-5">
        <label className="flex items-start gap-4 rounded-2xl bg-cream border border-blush shadow-card p-6 cursor-pointer hover:border-gold transition-colors">
          <input
            type="checkbox"
            checked={form.smsConsent}
            onChange={(e) => update({ smsConsent: e.target.checked })}
            className="mt-1 h-7 w-7 shrink-0 accent-[#b89b72]"
          />
          <span>
            <span className="block font-medium text-lg text-charcoal mb-1">{d.consent.smsLabel}</span>
            <span className="block text-charcoal-soft leading-relaxed">
              {SMS_CONSENT_WORDING[lang]}
            </span>
          </span>
        </label>

        <label className="flex items-start gap-4 rounded-2xl bg-cream border border-blush shadow-card p-6 cursor-pointer hover:border-gold transition-colors">
          <input
            type="checkbox"
            checked={form.emailConsent}
            onChange={(e) => update({ emailConsent: e.target.checked })}
            className="mt-1 h-7 w-7 shrink-0 accent-[#b89b72]"
          />
          <span>
            <span className="block font-medium text-lg text-charcoal mb-1">{d.consent.emailLabel}</span>
            <span className="block text-charcoal-soft leading-relaxed">
              {EMAIL_CONSENT_WORDING[lang]}
            </span>
          </span>
        </label>
      </div>

      <p className="mt-6 text-sm text-charcoal-soft text-center">{d.consent.note}</p>

      <p className="mt-4 text-sm text-center space-x-4">
        <a href="/privacy" target="_blank" className="text-gold-deep underline underline-offset-2">
          {d.consent.privacyPolicy}
        </a>
        <a href="/terms" target="_blank" className="text-gold-deep underline underline-offset-2">
          {d.consent.terms}
        </a>
        <a href="/sms-terms" target="_blank" className="text-gold-deep underline underline-offset-2">
          {d.consent.smsTerms}
        </a>
      </p>

      <NavRow onBack={back} onNext={next} backLabel={d.common.back} nextLabel={d.common.continue} />
    </div>
  );
}
