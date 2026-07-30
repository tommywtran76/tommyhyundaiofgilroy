"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./ui-client";

// Customer data rights: export a copy of their data, mark a deletion request,
// and (owner only) permanently delete the record.
export default function DangerZone({
  customerId,
  customerName,
  deletionRequested,
  isOwner,
}: {
  customerId: string;
  customerName: string;
  deletionRequested: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function markDeletionRequested() {
    setBusy(true);
    await fetch(`/api/admin/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletionRequested: true }),
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  async function hardDelete() {
    setBusy(true);
    const res = await fetch(`/api/admin/customers/${customerId}`, { method: "DELETE" }).catch(
      () => null,
    );
    setBusy(false);
    if (res?.ok) router.push("/admin/customers");
  }

  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl text-charcoal mb-4">Data requests</h2>
      <div className="flex flex-wrap gap-3 text-sm">
        <a
          href={`/api/admin/customers/${customerId}/export`}
          className="min-h-10 inline-flex items-center px-4 rounded-xl border border-blush bg-cream hover:border-gold transition-colors"
        >
          Download copy of their data
        </a>
        {!deletionRequested && (
          <button
            type="button"
            disabled={busy}
            onClick={markDeletionRequested}
            className="min-h-10 px-4 rounded-xl border border-blush bg-cream hover:border-gold transition-colors disabled:opacity-50"
          >
            Mark deletion requested
          </button>
        )}
        {isOwner &&
          (confirmDelete ? (
            <span className="inline-flex items-center gap-2">
              <span className="text-red-900">Permanently delete {customerName}?</span>
              <button
                type="button"
                disabled={busy}
                onClick={hardDelete}
                className="min-h-10 px-4 rounded-xl bg-red-700 text-cream hover:bg-red-800 disabled:opacity-50"
              >
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="min-h-10 px-3 text-charcoal-soft underline"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="min-h-10 px-4 rounded-xl border border-red-200 text-red-800 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Delete customer permanently
            </button>
          ))}
      </div>
      <p className="mt-3 text-xs text-charcoal-soft">
        Deletion permanently removes the customer’s profile, visit history, photos, signatures, and
        consent records. Export a copy first if the customer requested one.
      </p>
    </Card>
  );
}
