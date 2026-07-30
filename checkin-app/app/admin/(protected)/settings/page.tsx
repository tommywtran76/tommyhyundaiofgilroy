import { prisma } from "@/lib/db";
import { getSession, isOwner } from "@/lib/auth";
import { fmtDateTime } from "@/lib/dates";
import { Card, PageTitle } from "@/components/admin/ui";
import UserManager from "@/components/admin/UserManager";
import TemplateManager from "@/components/admin/TemplateManager";

export const dynamic = "force-dynamic";

function EnvStatus({ label, on }: { label: string; on: boolean }) {
  return (
    <li className="flex items-center justify-between text-sm py-1.5">
      <span className="text-charcoal">{label}</span>
      <span className={on ? "text-emerald-700" : "text-stone-400"}>{on ? "Configured" : "Not configured"}</span>
    </li>
  );
}

export default async function SettingsPage() {
  const session = (await getSession())!;
  const owner = isOwner(session.role);

  const [users, templates, auditLogs] = await Promise.all([
    owner
      ? prisma.user.findMany({
          select: { id: true, email: true, name: true, role: true, active: true, lastLoginAt: true },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    prisma.messageTemplate.findMany({ orderBy: { createdAt: "asc" } }),
    owner
      ? prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
      : Promise.resolve([]),
  ]);

  return (
    <div>
      <PageTitle title="Settings" subtitle="Users, templates, integrations, audit history, and data tools" />

      <div className="grid lg:grid-cols-2 gap-6">
        {owner && (
          <UserManager
            currentUserId={session.id}
            users={users.map((u) => ({
              ...u,
              lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
            }))}
          />
        )}

        <TemplateManager templates={templates.map((t) => ({ id: t.id, name: t.name, channel: t.channel, body: t.body }))} />

        <Card className="p-5">
          <h2 className="font-serif text-xl text-charcoal mb-3">Integrations</h2>
          <p className="text-sm text-charcoal-soft mb-3">
            Configured through environment variables — see <code>docs/INTEGRATIONS.md</code> in the
            project for step-by-step setup of Twilio, Square, Google Calendar, and Zapier/Make.
          </p>
          <ul className="divide-y divide-blush/50">
            <EnvStatus label="Twilio owner SMS + STOP handling" on={Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)} />
            <EnvStatus label="Owner email notifications (Resend)" on={Boolean(process.env.RESEND_API_KEY && process.env.OWNER_EMAIL)} />
            <EnvStatus label="Outbound check-in webhook (Zapier/Make/CRM)" on={Boolean(process.env.CHECKIN_WEBHOOK_URL)} />
            <EnvStatus label="Integration API key (pull feeds)" on={Boolean(process.env.INTEGRATION_API_KEY)} />
            <EnvStatus label="Square booking webhook" on={Boolean(process.env.SQUARE_WEBHOOK_SIGNATURE_KEY)} />
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl text-charcoal mb-3">Data tools</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="/api/admin/export?type=customers" className="min-h-10 inline-flex items-center px-4 rounded-xl border border-blush bg-cream hover:border-gold transition-colors">Customers CSV</a>
            <a href="/api/admin/export?type=checkins" className="min-h-10 inline-flex items-center px-4 rounded-xl border border-blush bg-cream hover:border-gold transition-colors">Check-ins CSV</a>
            <a href="/api/admin/export?type=consents" className="min-h-10 inline-flex items-center px-4 rounded-xl border border-blush bg-cream hover:border-gold transition-colors">Consents CSV</a>
            <a href="/api/admin/export?type=followups" className="min-h-10 inline-flex items-center px-4 rounded-xl border border-blush bg-cream hover:border-gold transition-colors">Follow-ups CSV</a>
            {owner && (
              <a href="/api/admin/backup" className="min-h-10 inline-flex items-center px-4 rounded-xl border border-gold bg-blush-soft hover:bg-blush transition-colors">
                Full backup (JSON, owner only)
              </a>
            )}
          </div>
          <p className="mt-3 text-xs text-charcoal-soft">
            Customer deletion requests are handled from each customer’s profile page (Data requests
            section). Bulk CSV exports exclude health notes, signatures, and photos.
          </p>
        </Card>

        {owner && (
          <Card className="p-5 lg:col-span-2">
            <h2 className="font-serif text-xl text-charcoal mb-3">Audit history (last 100)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left uppercase tracking-wide text-charcoal-soft border-b border-blush">
                    <th className="py-2 pr-4">When</th>
                    <th className="py-2 pr-4">Who</th>
                    <th className="py-2 pr-4">Action</th>
                    <th className="py-2 pr-4">Entity</th>
                    <th className="py-2">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blush/40">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-1.5 pr-4 whitespace-nowrap">{fmtDateTime(log.createdAt)}</td>
                      <td className="py-1.5 pr-4">{log.userEmail ?? "—"}</td>
                      <td className="py-1.5 pr-4">{log.action}</td>
                      <td className="py-1.5 pr-4">{log.entity ? `${log.entity} ${log.entityId ?? ""}` : "—"}</td>
                      <td className="py-1.5 max-w-md truncate">{log.detail ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
