"use client";

// Shared kiosk UI primitives: large touch targets, serif headings,
// soft shadows — sized for an iPad at arm's length.

export function ScreenHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="text-center mb-8">
      <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-charcoal">
        {title}
      </h1>
      <div className="gold-rule mx-auto mt-4" aria-hidden="true" />
      {subtitle && (
        <p className="mt-4 text-lg md:text-xl text-charcoal-soft max-w-2xl mx-auto">{subtitle}</p>
      )}
    </header>
  );
}

export function BigButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "min-h-14 px-8 py-4 rounded-2xl text-lg md:text-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";
  const variants = {
    primary: "bg-charcoal text-cream shadow-soft hover:bg-charcoal-soft",
    secondary:
      "bg-cream text-charcoal border border-blush shadow-card hover:border-gold",
    ghost: "text-charcoal-soft hover:text-charcoal underline-offset-4 hover:underline",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function ChoiceCard({
  label,
  sublabel,
  selected,
  onClick,
  className = "",
}: {
  label: string;
  sublabel?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full min-h-16 px-6 py-4 rounded-2xl text-left text-lg md:text-xl transition-all duration-200 active:scale-[0.99] border ${
        selected
          ? "bg-charcoal text-cream border-charcoal shadow-soft"
          : "bg-cream text-charcoal border-blush shadow-card hover:border-gold"
      } ${className}`}
    >
      <span className="block font-medium">{label}</span>
      {sublabel && (
        <span className={`block text-sm mt-1 ${selected ? "text-cream/70" : "text-charcoal-soft"}`}>
          {sublabel}
        </span>
      )}
    </button>
  );
}

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-12 px-5 py-2.5 rounded-full text-base md:text-lg transition-all duration-150 border ${
        selected
          ? "bg-gold text-cream border-gold shadow-card"
          : "bg-cream text-charcoal border-blush hover:border-gold"
      }`}
    >
      {label}
    </button>
  );
}

export function Field({
  label,
  optional,
  optionalWord,
  error,
  children,
  htmlFor,
}: {
  label: string;
  optional?: boolean;
  optionalWord?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-base md:text-lg font-medium text-charcoal mb-2">
        {label}
        {optional && (
          <span className="ml-2 text-sm font-normal text-charcoal-soft italic">
            {optionalWord ?? "optional"}
          </span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { invalid, className = "", ...rest } = props;
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={`w-full min-h-14 px-5 py-3.5 rounded-xl bg-cream text-lg md:text-xl text-charcoal placeholder:text-charcoal-soft/50 border shadow-card focus:border-gold focus:outline-none ${
        invalid ? "border-red-400" : "border-blush"
      } ${className}`}
    />
  );
}

export function NavRow({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext?: () => void;
  backLabel: string;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      {onBack ? (
        <BigButton variant="secondary" onClick={onBack}>
          ← {backLabel}
        </BigButton>
      ) : (
        <span />
      )}
      {onNext && nextLabel && (
        <BigButton onClick={onNext} disabled={nextDisabled}>
          {nextLabel} →
        </BigButton>
      )}
    </div>
  );
}

export function YesNo({
  value,
  onChange,
  yesLabel,
  noLabel,
}: {
  value: "yes" | "no" | "";
  onChange: (v: "yes" | "no") => void;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <div className="flex gap-3">
      <Chip label={yesLabel} selected={value === "yes"} onClick={() => onChange("yes")} />
      <Chip label={noLabel} selected={value === "no"} onClick={() => onChange("no")} />
    </div>
  );
}

export function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === step ? "w-6 h-2 bg-gold" : "w-2 h-2 bg-blush"
          }`}
        />
      ))}
    </div>
  );
}
