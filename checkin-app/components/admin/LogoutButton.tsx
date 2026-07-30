"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
        router.replace("/admin/login");
      }}
      className="text-sm text-charcoal-soft hover:text-charcoal underline underline-offset-2 min-h-10 px-2"
    >
      Sign out
    </button>
  );
}
