"use client";

import { useRef } from "react";
import { t } from "@/lib/i18n";
import { isFacialService, isRemovalService } from "@/lib/services";
import type { ScreenProps } from "./types";
import { BigButton, Chip, Field, NavRow, ScreenHeading, TextInput, YesNo } from "./ui";

const COLOR_KEYS = ["black", "gray", "blue", "green", "red", "orange", "brown", "mixed", "notSure"] as const;
const CONCERN_KEYS = [
  "dryness", "acne", "melasma", "fineLines", "wrinkles", "unevenTone",
  "pores", "sagging", "darkSpots", "sensitive", "maintenance",
] as const;

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export default function DetailsScreen({ lang, form, update, next, back }: ScreenProps) {
  const d = t(lang);
  const fileRef = useRef<HTMLInputElement>(null);

  const showRemoval = form.services.some(isRemovalService);
  const showFacial = form.services.some(isFacialService);
  const showBodyScrub = form.services.includes("body-scrub");

  function toggleConcern(key: string) {
    update({
      skinConcerns: form.skinConcerns.includes(key)
        ? form.skinConcerns.filter((c) => c !== key)
        : [...form.skinConcerns, key],
    });
  }

  function onPhotoChosen(file: File | undefined) {
    if (!file || file.size > MAX_PHOTO_BYTES) return;
    const reader = new FileReader();
    reader.onload = () => update({ photo: String(reader.result || "") });
    reader.readAsDataURL(file);
  }

  const bodyScrubBlocked = showBodyScrub && !form.confirmFemale;

  return (
    <div className="screen-in w-full max-w-2xl mx-auto px-6 py-10">
      <ScreenHeading title={d.details.title} />

      {showRemoval && (
        <section className="mb-10">
          <h2 className="font-serif text-2xl text-charcoal mb-4">{d.details.removalHeading}</h2>
          <div className="grid gap-6">
            <Field label={d.details.tattooColor}>
              <div className="flex flex-wrap gap-2">
                {COLOR_KEYS.map((c) => (
                  <Chip
                    key={c}
                    label={d.details.colors[c]}
                    selected={form.tattooColor === c}
                    onClick={() => update({ tattooColor: c })}
                  />
                ))}
              </div>
            </Field>
            <Field label={d.details.tattooAge} htmlFor="k-tattoo-age">
              <TextInput
                id="k-tattoo-age"
                placeholder={d.details.tattooAgePlaceholder}
                value={form.tattooAge}
                onChange={(e) => update({ tattooAge: e.target.value })}
              />
            </Field>
            <Field label={d.details.triedLaser}>
              <YesNo
                value={form.triedLaser}
                onChange={(v) => update({ triedLaser: v })}
                yesLabel={d.details.yes}
                noLabel={d.details.no}
              />
            </Field>
            <Field label={d.details.triedSaline}>
              <YesNo
                value={form.triedSaline}
                onChange={(v) => update({ triedSaline: v })}
                yesLabel={d.details.yes}
                noLabel={d.details.no}
              />
            </Field>
            <Field label={d.details.photoPrompt}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPhotoChosen(e.target.files?.[0])}
              />
              {form.photo ? (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.photo}
                    alt={d.details.photoChosen}
                    className="h-20 w-20 object-cover rounded-xl border border-blush"
                  />
                  <span className="text-charcoal">{d.details.photoChosen}</span>
                  <button
                    type="button"
                    className="text-sm text-charcoal-soft underline"
                    onClick={() => {
                      update({ photo: "" });
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    {d.details.photoRemove}
                  </button>
                </div>
              ) : (
                <BigButton variant="secondary" onClick={() => fileRef.current?.click()}>
                  {d.details.photoButton}
                </BigButton>
              )}
            </Field>
            <Field label={d.details.goal}>
              <div className="flex flex-wrap gap-2">
                <Chip label={d.details.goals.complete} selected={form.removalGoal === "complete-removal"} onClick={() => update({ removalGoal: "complete-removal" })} />
                <Chip label={d.details.goals.lighten} selected={form.removalGoal === "lighten"} onClick={() => update({ removalGoal: "lighten" })} />
                <Chip label={d.details.goals.correct} selected={form.removalGoal === "color-correct"} onClick={() => update({ removalGoal: "color-correct" })} />
                <Chip label={d.details.goals.advice} selected={form.removalGoal === "advice"} onClick={() => update({ removalGoal: "advice" })} />
              </div>
            </Field>
          </div>
        </section>
      )}

      {showFacial && (
        <section className="mb-10">
          <h2 className="font-serif text-2xl text-charcoal mb-4">{d.details.facialHeading}</h2>
          <div className="grid gap-6">
            <Field label={d.details.skinConcern}>
              <div className="flex flex-wrap gap-2">
                {CONCERN_KEYS.map((c) => (
                  <Chip
                    key={c}
                    label={d.details.concerns[c]}
                    selected={form.skinConcerns.includes(c)}
                    onClick={() => toggleConcern(c)}
                  />
                ))}
              </div>
            </Field>
            <Field label={d.details.prescription}>
              <YesNo
                value={form.prescriptionSkincare}
                onChange={(v) => update({ prescriptionSkincare: v })}
                yesLabel={d.details.yes}
                noLabel={d.details.no}
              />
            </Field>
            <Field label={d.details.recentTreatment}>
              <YesNo
                value={form.recentTreatment}
                onChange={(v) => update({ recentTreatment: v })}
                yesLabel={d.details.yes}
                noLabel={d.details.no}
              />
            </Field>
          </div>
        </section>
      )}

      {showBodyScrub && (
        <section className="mb-10">
          <h2 className="font-serif text-2xl text-charcoal mb-2">{d.details.bodyScrubHeading}</h2>
          <p className="text-charcoal-soft mb-4">{d.details.femaleOnly}</p>
          <div className="grid gap-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.confirmFemale}
                onChange={(e) => update({ confirmFemale: e.target.checked })}
                className="mt-1.5 h-6 w-6 accent-[#b89b72]"
              />
              <span className="text-lg text-charcoal">{d.details.femaleConfirm}</span>
            </label>
            <Field label={d.details.contraindications}>
              <YesNo
                value={form.skinContraindications}
                onChange={(v) => update({ skinContraindications: v })}
                yesLabel={d.details.yes}
                noLabel={d.details.no}
              />
            </Field>
          </div>
        </section>
      )}

      <section>
        <Field label={d.details.safetyQuestion} htmlFor="k-safety">
          <textarea
            id="k-safety"
            rows={3}
            placeholder={d.details.safetyPlaceholder}
            value={form.safetyNotes}
            onChange={(e) => update({ safetyNotes: e.target.value })}
            className="w-full px-5 py-3.5 rounded-xl bg-cream text-lg text-charcoal placeholder:text-charcoal-soft/50 border border-blush shadow-card focus:border-gold focus:outline-none"
          />
        </Field>
        <p className="mt-3 text-sm text-charcoal-soft italic">{d.details.safetyDisclaimer}</p>
      </section>

      <NavRow
        onBack={back}
        onNext={next}
        backLabel={d.common.back}
        nextLabel={d.common.continue}
        nextDisabled={bodyScrubBlocked}
      />
    </div>
  );
}
