"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { isValidPhone, EMAIL_RE, formatPhone } from "@/lib/validation";
import type { ScreenProps } from "./types";
import { Chip, Field, NavRow, ScreenHeading, TextInput, BigButton } from "./ui";

export default function InfoScreen({ lang, form, update, next, back }: ScreenProps) {
  const d = t(lang);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const [foundName, setFoundName] = useState("");

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = d.info.errors.firstName;
    if (!form.lastName.trim()) e.lastName = d.info.errors.lastName;
    if (!isValidPhone(form.phone)) e.phone = d.info.errors.phone;
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) e.email = d.info.errors.email;
    if (form.isFirstVisit === null) e.firstVisit = d.info.firstVisit;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function lookup() {
    if (!isValidPhone(form.phone)) {
      setErrors((p) => ({ ...p, phone: d.info.errors.phone }));
      return;
    }
    setLookupState("loading");
    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });
      const data = await res.json();
      if (res.ok && data.found) {
        update({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email ?? "",
          birthday: data.birthday ?? "",
          preferredLanguage: data.preferredLanguage ?? form.preferredLanguage,
        });
        setFoundName(data.firstName);
        setLookupState("found");
      } else {
        setLookupState("notfound");
      }
    } catch {
      setLookupState("notfound");
    }
  }

  const showLookup = form.isFirstVisit === false;

  return (
    <div className="screen-in w-full max-w-2xl mx-auto px-6 py-10">
      <ScreenHeading title={d.info.title} subtitle={d.info.subtitle} />

      <div className="mb-8">
        <p className="text-base md:text-lg font-medium text-charcoal mb-2">{d.info.firstVisit}</p>
        <div className="flex gap-3">
          <Chip
            label={d.info.yes}
            selected={form.isFirstVisit === true}
            onClick={() => update({ isFirstVisit: true })}
          />
          <Chip
            label={d.info.no}
            selected={form.isFirstVisit === false}
            onClick={() => update({ isFirstVisit: false })}
          />
        </div>
        {errors.firstVisit && form.isFirstVisit === null && (
          <p role="alert" className="mt-1.5 text-sm text-red-800">{errors.firstVisit}</p>
        )}
      </div>

      {showLookup && (
        <div className="mb-8 rounded-2xl bg-blush-soft border border-blush p-5">
          <p className="text-base text-charcoal mb-3">{d.info.returningPrompt}</p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <TextInput
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="(650) 555-0100"
              value={form.phone}
              onChange={(e) => update({ phone: e.target.value })}
              aria-label={d.info.phone}
            />
            <BigButton variant="secondary" onClick={lookup} disabled={lookupState === "loading"}>
              {lookupState === "loading" ? d.info.lookingUp : d.info.findMe}
            </BigButton>
          </div>
          {lookupState === "found" && (
            <p className="mt-3 text-gold-deep font-medium" role="status">
              {d.info.welcomeBack.replace("{name}", foundName)}
            </p>
          )}
          {lookupState === "notfound" && (
            <p className="mt-3 text-charcoal-soft" role="status">
              {d.info.notFound}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={d.info.firstName} error={errors.firstName} htmlFor="k-first">
          <TextInput
            id="k-first"
            autoComplete="off"
            value={form.firstName}
            invalid={!!errors.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
          />
        </Field>
        <Field label={d.info.lastName} error={errors.lastName} htmlFor="k-last">
          <TextInput
            id="k-last"
            autoComplete="off"
            value={form.lastName}
            invalid={!!errors.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
          />
        </Field>
        <Field label={d.info.phone} error={errors.phone} htmlFor="k-phone">
          <TextInput
            id="k-phone"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="(650) 555-0100"
            value={form.phone}
            invalid={!!errors.phone}
            onChange={(e) => update({ phone: e.target.value })}
            onBlur={() => isValidPhone(form.phone) && update({ phone: formatPhone(form.phone) })}
          />
        </Field>
        <Field label={d.info.email} error={errors.email} htmlFor="k-email">
          <TextInput
            id="k-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="you@example.com"
            value={form.email}
            invalid={!!errors.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </Field>
        <Field label={d.info.birthday} optional optionalWord={d.info.optional} htmlFor="k-bday">
          <TextInput
            id="k-bday"
            type="date"
            value={form.birthday}
            onChange={(e) => update({ birthday: e.target.value })}
          />
        </Field>
        <Field label={d.info.preferredLanguage}>
          <div className="flex flex-wrap gap-2">
            {(["en", "vi", "es", "other"] as const).map((l) => (
              <Chip
                key={l}
                label={d.info.languages[l]}
                selected={form.preferredLanguage === l}
                onClick={() => update({ preferredLanguage: l })}
              />
            ))}
          </div>
        </Field>
      </div>

      <NavRow
        onBack={back}
        onNext={() => validate() && next()}
        backLabel={d.common.back}
        nextLabel={d.common.continue}
      />
    </div>
  );
}
