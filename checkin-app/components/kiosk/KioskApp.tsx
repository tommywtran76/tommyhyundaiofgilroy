"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import type { VisitType } from "@/lib/services";
import { normalizePhone } from "@/lib/validation";
import { EMPTY_FORM, type KioskForm, type KioskStep } from "./types";
import WelcomeScreen from "./WelcomeScreen";
import InfoScreen from "./InfoScreen";
import ServicesScreen from "./ServicesScreen";
import DetailsScreen from "./DetailsScreen";
import ReferralScreen from "./ReferralScreen";
import ConsentScreen from "./ConsentScreen";
import ReviewScreen from "./ReviewScreen";
import ConfirmScreen from "./ConfirmScreen";
import { BigButton, ProgressDots } from "./ui";

// Kiosk privacy timers:
//  - 60s of inactivity mid-flow shows a "still there?" prompt; 15s later the
//    kiosk resets and all entered data is discarded.
//  - The confirmation screen auto-returns after 15s (handled in ConfirmScreen).
// The welcome screen never times out.
const INACTIVITY_MS = 60_000;
const WARNING_MS = 15_000;

const STEP_ORDER: KioskStep[] = ["welcome", "info", "services", "details", "referral", "consent", "review"];

export default function KioskApp() {
  const [lang, setLang] = useState<Lang>("en");
  const [step, setStep] = useState<KioskStep>("welcome");
  const [form, setForm] = useState<KioskForm>(EMPTY_FORM);
  const [showWarning, setShowWarning] = useState(false);
  // Snapshot shown on the confirmation screen after the form is cleared
  const [done, setDone] = useState<{ firstName: string; services: string[]; appointmentTime?: string } | null>(null);

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((patch: Partial<KioskForm>) => {
    setForm((f) => ({ ...f, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setForm(EMPTY_FORM);
    setDone(null);
    setShowWarning(false);
    setStep("welcome");
  }, []);

  // ----- inactivity handling -----
  const armTimers = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setShowWarning(false);
    inactivityTimer.current = setTimeout(() => {
      setShowWarning(true);
      warningTimer.current = setTimeout(reset, WARNING_MS);
    }, INACTIVITY_MS);
  }, [reset]);

  useEffect(() => {
    const active = step !== "welcome" && step !== "done";
    if (!active) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      setShowWarning(false);
      return;
    }
    armTimers();
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const onActivity = () => armTimers();
    events.forEach((e) => window.addEventListener(e, onActivity));
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [step, armTimers]);

  // ----- navigation -----
  const stepIndex = STEP_ORDER.indexOf(step);
  const next = useCallback(() => {
    setStep((s) => STEP_ORDER[Math.min(STEP_ORDER.indexOf(s) + 1, STEP_ORDER.length - 1)]);
  }, []);
  const back = useCallback(() => {
    setStep((s) => STEP_ORDER[Math.max(STEP_ORDER.indexOf(s) - 1, 0)]);
  }, []);

  function startFlow(visitType: VisitType) {
    setForm({ ...EMPTY_FORM, visitType, preferredLanguage: lang });
    setStep("info");
  }

  // ----- submit -----
  async function submit() {
    const payload = {
      visitType: form.visitType,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: normalizePhone(form.phone),
      email: form.email.trim(),
      birthday: form.birthday,
      preferredLanguage: form.preferredLanguage,
      isFirstVisit: form.isFirstVisit === true,
      language: lang,
      services: form.services,
      otherService: form.otherService,
      hasAppointment: form.hasAppointment ?? "NOT_SURE",
      appointmentTime: form.appointmentTime,
      staffMember: form.staffMember,
      serviceBooked: form.serviceBooked,
      bookingHelp: form.bookingHelp,
      answers: {
        removal: {
          tattooColor: form.tattooColor || undefined,
          tattooAge: form.tattooAge || undefined,
          triedLaser: form.triedLaser || undefined,
          triedSaline: form.triedSaline || undefined,
          goal: form.removalGoal || undefined,
        },
        facial: {
          skinConcerns: form.skinConcerns.length ? form.skinConcerns : undefined,
          prescriptionSkincare: form.prescriptionSkincare || undefined,
          recentTreatment: form.recentTreatment || undefined,
        },
        bodyScrub: form.services.includes("body-scrub")
          ? {
              confirmFemale: form.confirmFemale,
              skinContraindications: form.skinContraindications || undefined,
            }
          : undefined,
      },
      safetyNotes: form.safetyNotes,
      referralSource: form.referralSource,
      referralName: form.referralName,
      smsConsent: form.smsConsent,
      emailConsent: form.emailConsent,
      signature: form.signature,
      photo: form.photo,
    };

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Check-in failed: ${res.status}`);

    // Keep only what the confirmation screen shows; clear everything else
    // immediately so no previous customer data lingers on the device.
    setDone({
      firstName: form.firstName.trim(),
      services: form.services,
      appointmentTime: form.hasAppointment === "YES" ? form.appointmentTime : undefined,
    });
    setForm(EMPTY_FORM);
    setStep("done");
  }

  const d = t(lang);

  return (
    <main className="kiosk-root min-h-screen bg-ivory">
      {step === "welcome" && <WelcomeScreen lang={lang} setLang={setLang} onSelect={startFlow} />}

      {step !== "welcome" && step !== "done" && (
        <div className="min-h-screen flex flex-col">
          <div className="pt-6">
            <ProgressDots step={stepIndex - 1} total={STEP_ORDER.length - 1} />
          </div>
          <div className="flex-1">
            {step === "info" && (
              <InfoScreen lang={lang} form={form} update={update} next={next} back={back} />
            )}
            {step === "services" && (
              <ServicesScreen lang={lang} form={form} update={update} next={next} back={back} />
            )}
            {step === "details" && (
              <DetailsScreen lang={lang} form={form} update={update} next={next} back={back} />
            )}
            {step === "referral" && (
              <ReferralScreen lang={lang} form={form} update={update} next={next} back={back} />
            )}
            {step === "consent" && (
              <ConsentScreen lang={lang} form={form} update={update} next={next} back={back} />
            )}
            {step === "review" && (
              <ReviewScreen
                lang={lang}
                form={form}
                update={update}
                back={back}
                goTo={setStep}
                onSubmit={submit}
              />
            )}
          </div>
        </div>
      )}

      {step === "done" && done && (
        <ConfirmScreen
          lang={lang}
          firstName={done.firstName}
          services={done.services}
          appointmentTime={done.appointmentTime}
          onDone={reset}
        />
      )}

      {showWarning && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label={d.common.stillThere}
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm"
        >
          <div className="bg-cream rounded-3xl shadow-soft px-10 py-8 text-center max-w-md mx-6">
            <p className="font-serif text-3xl text-charcoal">{d.common.stillThere}</p>
            <p className="mt-3 text-charcoal-soft">{d.common.resetNotice}</p>
            <div className="mt-6 flex gap-4 justify-center">
              <BigButton onClick={armTimers}>{d.common.continue}</BigButton>
              <BigButton variant="secondary" onClick={reset}>
                {d.common.startOver}
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
