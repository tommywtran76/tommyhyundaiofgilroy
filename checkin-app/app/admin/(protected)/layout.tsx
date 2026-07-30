import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SessionKeeper from "@/components/admin/SessionKeeper";
import NotificationBell from "@/components/admin/NotificationBell";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Today’s Check-Ins" },
  { href: "/admin/appointments", label: "Upcoming Appointments" },
  { href: "/admin/leads", label: "Walk-In Leads" },
  { href: "/admin/consultations", label: "Consultations" },
  { href: "/admin/customers", label: "Customer Directory" },
  { href: "/admin/consent", label: "Marketing Consent" },
  { href: "/admin/followups", label: "Follow-Up Tasks" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-ivory flex flex-col lg:flex-row">
      <SessionKeeper />

      <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-blush bg-cream/50">
        <div className="px-6 py-6">
          <p className="font-serif text-2xl text-charcoal">Aileen’s Beauty</p>
          <p className="text-xs uppercase tracking-[0.25em] text-gold-deep mt-1">Dashboard</p>
        </div>
        <nav className="px-3 pb-4 flex lg:flex-col gap-1 overflow-x-auto" aria-label="Dashboard sections">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap px-3 py-2.5 rounded-xl text-sm text-charcoal-soft hover:bg-blush-soft hover:text-charcoal transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-blush bg-cream/30">
          <p className="text-sm text-charcoal-soft">
            Signed in as <span className="font-medium text-charcoal">{session.name}</span>{" "}
            <span className="ml-1 text-xs uppercase tracking-wide bg-blush-soft border border-blush rounded-full px-2 py-0.5">
              {session.role.replace("_", " ").toLowerCase()}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <LogoutButton />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
