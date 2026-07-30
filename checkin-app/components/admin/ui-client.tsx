"use client";

// Client-safe versions of small presentational pieces (the ones in ui.tsx are
// server components because they import next/link).

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-cream border border-blush shadow-card ${className}`}>
      {children}
    </div>
  );
}
