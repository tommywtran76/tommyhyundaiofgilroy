"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const inputCls =
  "w-full min-h-12 px-4 rounded-xl bg-cream border border-blush shadow-card focus:border-gold focus:outline-none";

function SetupForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don’t match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Setup failed.");
        setLoading(false);
        return;
      }
      onDone();
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <h1 className="font-serif text-4xl text-charcoal text-center">Welcome, Aileen</h1>
      <p className="text-center text-charcoal-soft mt-3 mb-8 text-sm">
        Let’s create the owner account for your dashboard. This screen only appears once.
      </p>

      <label htmlFor="s-name" className="block text-sm font-medium text-charcoal mb-1.5">
        Your name
      </label>
      <input
        id="s-name" required value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className={`${inputCls} mb-4`}
      />

      <label htmlFor="s-email" className="block text-sm font-medium text-charcoal mb-1.5">
        Email (this will be your sign-in)
      </label>
      <input
        id="s-email" type="email" autoComplete="username" required value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className={`${inputCls} mb-4`}
      />

      <label htmlFor="s-pass" className="block text-sm font-medium text-charcoal mb-1.5">
        Password (at least 10 characters)
      </label>
      <input
        id="s-pass" type="password" autoComplete="new-password" required minLength={10}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className={`${inputCls} mb-4`}
      />

      <label htmlFor="s-confirm" className="block text-sm font-medium text-charcoal mb-1.5">
        Repeat password
      </label>
      <input
        id="s-confirm" type="password" autoComplete="new-password" required minLength={10}
        value={form.confirm}
        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        className={inputCls}
      />

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-800 text-center">{error}</p>
      )}

      <button
        type="submit" disabled={loading}
        className="mt-6 w-full min-h-12 rounded-xl bg-charcoal text-cream font-medium hover:bg-charcoal-soft transition-colors disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create Owner Account"}
      </button>
    </form>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"loading" | "login" | "setup">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/bootstrap")
      .then((r) => r.json())
      .then((d) => setMode(d.needed ? "setup" : "login"))
      .catch(() => setMode("login"));
  }, []);

  function goIn() {
    const from = params.get("from");
    router.replace(from && from.startsWith("/admin") ? from : "/admin");
  }

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
      goIn();
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  if (mode === "loading") {
    return <p className="text-charcoal-soft text-sm">Loading…</p>;
  }
  if (mode === "setup") {
    return <SetupForm onDone={goIn} />;
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
        id="email" type="email" autoComplete="username" required value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`${inputCls} mb-4`}
      />

      <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1.5">
        Password
      </label>
      <input
        id="password" type="password" autoComplete="current-password" required value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputCls}
      />

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-800 text-center">{error}</p>
      )}

      <button
        type="submit" disabled={loading}
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
