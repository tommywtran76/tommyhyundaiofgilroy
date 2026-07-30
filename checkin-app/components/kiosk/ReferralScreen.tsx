"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { REFERRAL_LABELS, REFERRAL_SOURCES } from "@/lib/services";
import type { ScreenProps } from "./types";
import { ChoiceCard, Field, NavRow, ScreenHeading, TextInput } from "./ui";

export default function ReferralScreen({ lang, form, update, next, back }: ScreenProps) {
  const d = t(lang);
  const [error, setError] = useState("");

  function validateAndNext() {
    if (!form.referralSource) {
      setError(d.referral.title);
      return;
    }
    next();
  }

  return (
    <div className="screen-in w-full max-w-3xl mx-auto px-6 py-10">
      <ScreenHeading title={d.referral.title} />

      <div className="grid gap-3 sm:grid-cols-2">
        {REFERRAL_SOURCES.map((key) => (
          <ChoiceCard
            key={key}
            label={REFERRAL_LABELS[key][lang]}
            selected={form.referralSource === key}
            onClick={() => {
              setError("");
              update({ referralSource: key });
            }}
          />
        ))}
      </div>

      {form.referralSource === "friend-family" && (
        <div className="mt-6 rounded-2xl bg-blush-soft border border-blush p-5">
          <Field label={d.referral.whoReferred} htmlFor="k-referrer">
            <TextInput
              id="k-referrer"
              placeholder={d.referral.whoReferredPlaceholder}
              value={form.referralName}
              onChange={(e) => update({ referralName: e.target.value })}
            />
          </Field>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-6 text-red-800 text-center">
          {error}
        </p>
      )}

      <NavRow onBack={back} onNext={validateAndNext} backLabel={d.common.back} nextLabel={d.common.continue} />
    </div>
  );
}
