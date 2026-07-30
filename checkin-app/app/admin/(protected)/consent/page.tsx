import { prisma } from "@/lib/db";
import { fmtDateTime } from "@/lib/dates";
import { Card, CustomerLink, PageTitle, StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// Marketing consent overview: current opt-in status per customer plus the
// full append-only record trail (wording included) for compliance.
export default async function ConsentPage() {
  const [customers, records] = await Promise.all([
    prisma.customer.findMany({
      where: { deletionRequestedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        doNotContact: true,
        consents: { where: { revokedAt: null }, orderBy: { createdAt: "desc" } },
      },
      orderBy: { lastVisitAt: "desc" },
      take: 500,
    }),
    prisma.consentRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { customer: { select: { id: true, firstName: true, lastName: true } } },
    }),
  ]);

  const smsOptIns = customers.filter(
    (c) => !c.doNotContact && c.consents.find((r) => r.channel === "SMS")?.granted,
  );
  const emailOptIns = customers.filter(
    (c) => !c.doNotContact && c.consents.find((r) => r.channel === "EMAIL")?.granted,
  );
  const rate = customers.length
    ? Math.round(
        (customers.filter((c) => c.consents.some((r) => r.granted)).length / customers.length) * 100,
      )
    : 0;

  return (
    <div>
      <PageTitle
        title="Marketing Consent"
        subtitle="Only message customers whose current status is opted in. Every change is recorded with its exact wording."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="SMS opt-ins" value={smsOptIns.length} />
        <StatCard label="Email opt-ins" value={emailOptIns.length} />
        <StatCard label="Overall opt-in rate" value={`${rate}%`} />
        <StatCard label="Customers" value={customers.length} />
      </div>

      <div className="mb-4">
        <a
          href="/api/admin/export?type=consents"
          className="inline-flex items-center min-h-10 px-4 rounded-xl border border-blush bg-cream text-sm hover:border-gold transition-colors"
        >
          Export consent records (CSV)
        </a>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-serif text-xl text-charcoal mb-3">Current SMS list ({smsOptIns.length})</h2>
          <ul className="text-sm space-y-1 max-h-96 overflow-y-auto">
            {smsOptIns.map((c) => (
              <li key={c.id}>
                <CustomerLink id={c.id}>
                  {c.firstName} {c.lastName}
                </CustomerLink>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-serif text-xl text-charcoal mb-3">
            Current email list ({emailOptIns.length})
          </h2>
          <ul className="text-sm space-y-1 max-h-96 overflow-y-auto">
            {emailOptIns.map((c) => (
              <li key={c.id}>
                <CustomerLink id={c.id}>
                  {c.firstName} {c.lastName}
                </CustomerLink>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5 mt-6">
        <h2 className="font-serif text-xl text-charcoal mb-3">Recent consent activity</h2>
        <ul className="text-sm text-charcoal-soft space-y-1.5 max-h-96 overflow-y-auto">
          {records.map((r) => (
            <li key={r.id}>
              {fmtDateTime(r.createdAt)} —{" "}
              <CustomerLink id={r.customer.id}>
                {r.customer.firstName} {r.customer.lastName}
              </CustomerLink>{" "}
              {r.granted ? "opted in to" : "declined"} {r.channel} via {r.source}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
