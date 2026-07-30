"use client";

import { useEffect, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { serviceLabel } from "@/lib/services";
import { BigButton } from "./ui";

const AUTO_RETURN_SECONDS = 15;

export default function ConfirmScreen({
  lang,
  firstName,
  services,
  appointmentTime,
  waitMessage,
  onDone,
}: {
  lang: Lang;
  firstName: string;
  services: string[];
  appointmentTime?: string;
  waitMessage?: string;
  onDone: () => void;
}) {
  const d = t(lang);
  const [seconds, setSeconds] = useState(AUTO_RETURN_SECONDS);

  useEffect(() => {
    const iv = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(iv);
          onDone();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [onDone]);

  return (
    <div className="screen-in flex flex-col items-center justify-center min-h-screen px-6 py-10 text-center">
      <div
        className="h-20 w-20 rounded-full border-2 border-gold flex items-center justify-center mb-8"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4.5 12.5l5 5 10-11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="font-serif text-5xl md:text-6xl font-medium text-charcoal">
        {d.confirmation.title}
      </h1>
      <div className="gold-rule mx-auto mt-6" aria-hidden="true" />
      <p className="mt-6 text-xl text-charcoal-soft max-w-xl">{d.confirmation.subtitle}</p>

      <div className="mt-10 rounded-2xl bg-cream border border-blush shadow-card px-10 py-8 max-w-md w-full">
        <p className="font-serif text-3xl text-charcoal">{firstName}</p>
        {services.length > 0 && (
          <p className="mt-3 text-lg text-charcoal-soft">
            {d.confirmation.service}: {services.map((s) => serviceLabel(s, lang)).join(", ")}
          </p>
        )}
        {appointmentTime && (
          <p className="mt-1 text-lg text-charcoal-soft">
            {d.confirmation.appointmentTime}: {appointmentTime}
          </p>
        )}
        <p className="mt-3 text-gold-deep">{waitMessage || d.confirmation.waitMessage}</p>
      </div>

      <div className="mt-10">
        <BigButton onClick={onDone}>{d.confirmation.returnButton}</BigButton>
        <p className="mt-4 text-sm text-charcoal-soft" aria-live="polite">
          {d.confirmation.autoReturn.replace("{seconds}", String(seconds))}
        </p>
      </div>
    </div>
  );
}
