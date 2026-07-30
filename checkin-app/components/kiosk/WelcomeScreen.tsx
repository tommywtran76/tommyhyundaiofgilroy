"use client";

import { t, type Lang, DICTS } from "@/lib/i18n";
import type { VisitType } from "@/lib/services";
import { ChoiceCard } from "./ui";

export default function WelcomeScreen({
  lang,
  setLang,
  onSelect,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  onSelect: (visitType: VisitType) => void;
}) {
  const d = t(lang);
  const options: { key: VisitType; label: string }[] = [
    { key: "APPOINTMENT", label: d.welcome.appointment },
    { key: "CONSULTATION", label: d.welcome.consultation },
    { key: "WALK_IN", label: d.welcome.walkIn },
    { key: "GIFT_CARD", label: d.welcome.giftCard },
    { key: "ACCOMPANYING", label: d.welcome.withSomeone },
  ];

  return (
    <div className="screen-in flex flex-col items-center justify-center min-h-screen px-6 py-10">
      <div className="w-full max-w-2xl text-center">
        <p className="uppercase tracking-[0.35em] text-gold text-sm mb-6">
          Campbell · San Jose
        </p>
        <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight text-charcoal">
          {d.welcome.title}
        </h1>
        <div className="gold-rule mx-auto mt-6" aria-hidden="true" />
        <p className="mt-6 text-xl md:text-2xl text-charcoal-soft">{d.welcome.subtitle}</p>

        <div className="mt-10 grid gap-4">
          {options.map((o) => (
            <ChoiceCard key={o.key} label={o.label} onClick={() => onSelect(o.key)} className="text-center" />
          ))}
        </div>

        <p className="mt-10 text-sm text-charcoal-soft/80 max-w-lg mx-auto">{d.welcome.privacy}</p>

        <div className="mt-8 flex items-center justify-center gap-2" role="group" aria-label="Language">
          {(Object.keys(DICTS) as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`min-h-11 px-4 py-2 rounded-full text-sm border transition-colors ${
                lang === l
                  ? "border-gold text-gold-deep bg-blush-soft"
                  : "border-transparent text-charcoal-soft hover:text-charcoal"
              }`}
            >
              {DICTS[l].langName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
