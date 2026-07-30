import { parseDateRange, fmtDate } from "@/lib/dates";
import { buildReport } from "@/lib/reports";
import { Card, PageTitle, StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function BarList({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="flex justify-between mb-0.5">
            <span className="text-charcoal">{r.label}</span>
            <span className="text-charcoal-soft">{r.count}</span>
          </div>
          <div className="h-2 rounded-full bg-blush-soft overflow-hidden">
            <div className="h-full bg-gold rounded-full" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const range = parseDateRange(from, to);
  const report = await buildReport(range.gte, range.lte);
  const exportQs = `from=${from ?? ""}&to=${to ?? ""}`;

  return (
    <div>
      <PageTitle
        title="Reports"
        subtitle={`${fmtDate(report.range.from)} — ${fmtDate(report.range.to)}`}
      />

      <form method="get" action="/admin/reports" className="mb-6 flex flex-wrap items-end gap-3 text-sm">
        <label className="grid gap-1">
          <span className="text-charcoal-soft">From</span>
          <input type="date" name="from" defaultValue={from ?? ""} className="px-3 py-2 rounded-xl border border-blush bg-cream focus:border-gold focus:outline-none" />
        </label>
        <label className="grid gap-1">
          <span className="text-charcoal-soft">To</span>
          <input type="date" name="to" defaultValue={to ?? ""} className="px-3 py-2 rounded-xl border border-blush bg-cream focus:border-gold focus:outline-none" />
        </label>
        <button type="submit" className="min-h-10 px-4 rounded-xl bg-charcoal text-cream font-medium hover:bg-charcoal-soft transition-colors">
          Apply
        </button>
        <span className="flex gap-2 ml-auto">
          <a href={`/api/admin/export?type=checkins&${exportQs}`} className="min-h-10 inline-flex items-center px-4 rounded-xl border border-blush bg-cream hover:border-gold transition-colors">
            Export check-ins CSV
          </a>
          <a href={`/api/admin/export?type=customers`} className="min-h-10 inline-flex items-center px-4 rounded-xl border border-blush bg-cream hover:border-gold transition-colors">
            Export customers CSV
          </a>
          <a href={`/api/admin/export?type=report&${exportQs}`} className="min-h-10 inline-flex items-center px-4 rounded-xl border border-blush bg-cream hover:border-gold transition-colors">
            Export report CSV
          </a>
        </span>
      </form>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Check-ins" value={report.totals.checkIns} />
        <StatCard
          label="New vs returning"
          value={`${report.totals.newCustomers} / ${report.totals.returningCustomers}`}
          hint="new / returning"
        />
        <StatCard label="Consultations" value={report.totals.consultations} />
        <StatCard label="Walk-ins" value={report.totals.walkIns} />
        <StatCard
          label="Consultation → booking"
          value={`${report.conversion.consultToBooked.rate}%`}
          hint={`${report.conversion.consultToBooked.converted} of ${report.conversion.consultToBooked.total}`}
        />
        <StatCard
          label="Walk-in → booking"
          value={`${report.conversion.walkInToBooked.rate}%`}
          hint={`${report.conversion.walkInToBooked.converted} of ${report.conversion.walkInToBooked.total}`}
        />
        <StatCard label="Marketing opt-in rate" value={`${report.marketing.optInRate}%`} hint={`${report.marketing.smsOptIns} SMS · ${report.marketing.emailOptIns} email`} />
        <StatCard label="Customer return rate" value={`${report.customers.returnRate}%`} hint={`${report.customers.total} customers`} />
        <StatCard label="Birthdays this month" value={report.customers.birthdayCount} />
        <StatCard label="Leads needing follow-up" value={report.followUps.open} />
        <StatCard label="Pipeline value" value={`$${report.followUps.pipelineValue.toLocaleString()}`} />
        <StatCard
          label="Revenue opportunity"
          value={`$${report.opportunity.reduce((s, o) => s + o.value, 0).toLocaleString()}`}
          hint="open leads × avg. ticket"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-serif text-xl text-charcoal mb-4">Check-ins per day</h2>
          {report.totals.perDay.length === 0 ? (
            <p className="text-sm text-charcoal-soft">No check-ins in this range.</p>
          ) : (
            <BarList rows={report.totals.perDay.map((d) => ({ label: d.day, count: d.count }))} />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl text-charcoal mb-4">Most requested services</h2>
          {report.services.length === 0 ? (
            <p className="text-sm text-charcoal-soft">No data yet.</p>
          ) : (
            <BarList rows={report.services.map((s) => ({ label: s.label, count: s.count }))} />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl text-charcoal mb-4">Top referral sources</h2>
          {report.referrals.length === 0 ? (
            <p className="text-sm text-charcoal-soft">No data yet.</p>
          ) : (
            <BarList rows={report.referrals.map((r) => ({ label: r.label, count: r.count }))} />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl text-charcoal mb-4">Revenue opportunity by service</h2>
          {report.opportunity.length === 0 ? (
            <p className="text-sm text-charcoal-soft">No open leads.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {report.opportunity.map((o) => (
                <li key={o.label} className="flex justify-between">
                  <span className="text-charcoal">
                    {o.label} <span className="text-charcoal-soft">({o.leads} lead{o.leads === 1 ? "" : "s"})</span>
                  </span>
                  <span className="font-medium text-charcoal">${o.value.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
