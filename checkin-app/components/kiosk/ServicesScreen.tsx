"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { SERVICES } from "@/lib/services";
import type { ScreenProps } from "./types";
import { ChoiceCard, Chip, Field, NavRow, ScreenHeading, TextInput } from "./ui";

export default function ServicesScreen({ lang, form, update, next, back }: ScreenProps) {
  const d = t(lang);
  const [error, setError] = useState("");

  function toggle(key: string) {
    setError("");
    update({
      services: form.services.includes(key)
        ? form.services.filter((s) => s !== key)
        : [...form.services, key],
    });
  }

  function validateAndNext() {
    if (form.services.length === 0) {
      setError(d.services.errorNoService);
      return;
    }
    if (form.hasAppointment === null) {
      setError(d.services.hasAppointment);
      return;
    }
    next();
  }

  return (
    <div className="screen-in w-full max-w-3xl mx-auto px-6 py-10">
      <ScreenHeading title={d.services.title} subtitle={d.services.subtitle} />

      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <ChoiceCard
            key={s.key}
            label={s.label[lang]}
            selected={form.services.includes(s.key)}
            onClick={() => toggle(s.key)}
          />
        ))}
      </div>

      {form.services.includes("other") && (
        <div className="mt-4">
          <TextInput
            aria-label={d.services.title}
            placeholder="…"
            value={form.otherService}
            onChange={(e) => update({ otherService: e.target.value })}
          />
        </div>
      )}

      <div className="mt-10">
        <p className="text-lg md:text-xl font-medium text-charcoal mb-3">
          {d.services.hasAppointment}
        </p>
        <div className="flex flex-wrap gap-3">
          <Chip
            label={d.services.yes}
            selected={form.hasAppointment === "YES"}
            onClick={() => update({ hasAppointment: "YES" })}
          />
          <Chip
            label={d.services.no}
            selected={form.hasAppointment === "NO"}
            onClick={() => update({ hasAppointment: "NO" })}
          />
          <Chip
            label={d.services.notSure}
            selected={form.hasAppointment === "NOT_SURE"}
            onClick={() => update({ hasAppointment: "NOT_SURE" })}
          />
        </div>
      </div>

      {form.hasAppointment === "YES" && (
        <div className="mt-6 grid gap-5 sm:grid-cols-3 rounded-2xl bg-blush-soft border border-blush p-5">
          <Field label={d.services.appointmentTime} htmlFor="k-appt-time">
            <TextInput
              id="k-appt-time"
              type="time"
              value={form.appointmentTime}
              onChange={(e) => update({ appointmentTime: e.target.value })}
            />
          </Field>
          <Field label={d.services.staffMember} optional optionalWord={d.info.optional} htmlFor="k-staff">
            <TextInput
              id="k-staff"
              value={form.staffMember}
              onChange={(e) => update({ staffMember: e.target.value })}
            />
          </Field>
          <Field label={d.services.serviceBooked} htmlFor="k-booked">
            <TextInput
              id="k-booked"
              value={form.serviceBooked}
              onChange={(e) => update({ serviceBooked: e.target.value })}
            />
          </Field>
        </div>
      )}

      {form.hasAppointment === "NO" && (
        <div className="mt-6 rounded-2xl bg-blush-soft border border-blush p-5">
          <p className="text-lg font-medium text-charcoal mb-3">{d.services.bookingHelp}</p>
          <div className="flex flex-wrap gap-3">
            <Chip
              label={d.services.bookingYes}
              selected={form.bookingHelp === "YES"}
              onClick={() => update({ bookingHelp: "YES" })}
            />
            <Chip
              label={d.services.bookingLater}
              selected={form.bookingHelp === "MAYBE_LATER"}
              onClick={() => update({ bookingHelp: "MAYBE_LATER" })}
            />
            <Chip
              label={d.services.bookingInfo}
              selected={form.bookingHelp === "INFO_ONLY"}
              onClick={() => update({ bookingHelp: "INFO_ONLY" })}
            />
          </div>
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
