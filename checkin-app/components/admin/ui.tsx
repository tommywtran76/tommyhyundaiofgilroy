import Link from "next/link";

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-3xl text-charcoal">{title}</h1>
      {subtitle && <p className="text-sm text-charcoal-soft mt-1">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-cream border border-blush shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-charcoal-soft">{label}</p>
      <p className="font-serif text-3xl text-charcoal mt-1">{value}</p>
      {hint && <p className="text-xs text-charcoal-soft mt-1">{hint}</p>}
    </Card>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Card className="px-6 py-12 text-center">
      <p className="text-charcoal-soft">{message}</p>
    </Card>
  );
}

const STATUS_STYLES: Record<string, string> = {
  WAITING: "bg-amber-50 text-amber-900 border-amber-200",
  IN_CONSULTATION: "bg-blush-soft text-charcoal border-blush",
  IN_SERVICE: "bg-emerald-50 text-emerald-900 border-emerald-200",
  COMPLETED: "bg-stone-100 text-stone-600 border-stone-200",
  NO_SHOW: "bg-red-50 text-red-900 border-red-200",
  FOLLOW_UP_NEEDED: "bg-indigo-50 text-indigo-900 border-indigo-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-xs px-2.5 py-1 rounded-full border ${
        STATUS_STYLES[status] ?? "bg-stone-100 text-stone-600 border-stone-200"
      }`}
    >
      {status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blush-soft border border-blush text-charcoal-soft">
      {children}
    </span>
  );
}

export function CustomerLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Link href={`/admin/customers/${id}`} className="font-medium text-charcoal hover:text-gold-deep underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}

export function ConsentDots({ sms, email }: { sms: boolean; email: boolean }) {
  return (
    <span className="text-xs text-charcoal-soft whitespace-nowrap">
      <span className={sms ? "text-emerald-700" : "text-stone-400"}>SMS {sms ? "✓" : "✗"}</span>
      {" · "}
      <span className={email ? "text-emerald-700" : "text-stone-400"}>Email {email ? "✓" : "✗"}</span>
    </span>
  );
}
