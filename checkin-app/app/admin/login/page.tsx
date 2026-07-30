"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign-in failed.");
        setLoading(false);
        return;
      }
      const from = params.get("from");
      router.replace(from && from.startsWith("/admin") ? from : "/admin");
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <h1 className="font-serif text-4xl text-charcoal text-center">Aileen’s Beauty</h1>
      <p className="text-center text-charcoal-soft mt-2 mb-8 uppercase tracking-[0.25em] text-xs">
        Staff Dashboard
      </p>

      <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full min-h-12 px-4 rounded-xl bg-cream border border-blush shadow-card focus:border-gold focus:outline-none mb-4"
      />

      <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1.5">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full min-h-12 px-4 rounded-xl bg-cream border border-blush shadow-card focus:border-gold focus:outline-none"
      />

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-800 text-center">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full min-h-12 rounded-xl bg-charcoal text-cream font-medium hover:bg-charcoal-soft transition-colors disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>

      <p className="mt-6 text-xs text-center text-charcoal-soft">
        Authorized staff only. All activity is logged.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ivory px-6">
      <div className="bg-cream/60 border border-blush rounded-3xl shadow-soft px-10 py-12">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
