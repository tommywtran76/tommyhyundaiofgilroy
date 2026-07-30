"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/roles";
import { Card } from "./ui-client";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
}

export default function UserManager({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "FRONT_DESK" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    setBusy(false);
    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => null) : null;
      setError(data?.error ?? "Could not create user.");
      return;
    }
    setForm({ email: "", name: "", password: "", role: "FRONT_DESK" });
    router.refresh();
  }

  async function patchUser(id: string, patch: Record<string, unknown>) {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    }).catch(() => null);
    setBusy(false);
    if (res && !res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Update failed.");
    }
    router.refresh();
  }

  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl text-charcoal mb-3">Staff accounts</h2>

      <ul className="divide-y divide-blush/50 mb-5">
        {users.map((u) => (
          <li key={u.id} className="py-2.5 flex items-center justify-between gap-3 text-sm flex-wrap">
            <div>
              <p className="font-medium text-charcoal">
                {u.name} {u.id === currentUserId && <span className="text-charcoal-soft">(you)</span>}
              </p>
              <p className="text-xs text-charcoal-soft">
                {u.email} · last sign-in{" "}
                {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "never"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                aria-label={`Role for ${u.email}`}
                value={u.role}
                disabled={busy || u.id === currentUserId}
                onChange={(e) => patchUser(u.id, { role: e.target.value })}
                className="text-xs px-2 py-1.5 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none disabled:opacity-50"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ")}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy || u.id === currentUserId}
                onClick={() => patchUser(u.id, { active: !u.active })}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-blush bg-cream hover:border-gold disabled:opacity-50"
              >
                {u.active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={createUser} className="grid sm:grid-cols-2 gap-3 text-sm">
        <input
          required
          type="email"
          placeholder="Email"
          aria-label="New user email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="px-3 py-2 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
        />
        <input
          required
          placeholder="Name"
          aria-label="New user name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="px-3 py-2 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
        />
        <input
          required
          type="password"
          minLength={10}
          placeholder="Password (10+ characters)"
          aria-label="New user password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="px-3 py-2 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
        />
        <select
          aria-label="New user role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="px-3 py-2 rounded-lg border border-blush bg-cream focus:border-gold focus:outline-none"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace("_", " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={busy}
          className="sm:col-span-2 min-h-10 rounded-xl bg-charcoal text-cream font-medium hover:bg-charcoal-soft transition-colors disabled:opacity-50"
        >
          Add staff account
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}

      <p className="mt-4 text-xs text-charcoal-soft">
        Roles — <strong>Owner</strong>: everything, including users, backups, and deletion.{" "}
        <strong>Staff</strong> and <strong>Front Desk</strong>: day-to-day check-in and customer
        management. <strong>Read Only</strong>: view without changes.
      </p>
    </Card>
  );
}
