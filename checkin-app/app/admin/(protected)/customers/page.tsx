import { prisma } from "@/lib/db";
import { formatPhone } from "@/lib/validation";
import { fmtDate } from "@/lib/dates";
import { Card, CustomerLink, EmptyState, PageTitle, Tag } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { phone: { contains: query.replace(/\D/g, "") || query } },
            { email: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { lastVisitAt: "desc" },
    take: 200,
    include: {
      consents: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });

  return (
    <div>
      <PageTitle title="Customer Directory" subtitle={`${customers.length} customer${customers.length === 1 ? "" : "s"} shown`} />

      <form className="mb-6" action="/admin/customers" method="get">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name, phone, or email…"
          aria-label="Search customers"
          className="w-full max-w-md min-h-12 px-4 rounded-xl bg-cream border border-blush shadow-card focus:border-gold focus:outline-none"
        />
      </form>

      {customers.length === 0 ? (
        <EmptyState message={query ? "No customers match that search." : "No customers yet."} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-charcoal-soft border-b border-blush">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Visits</th>
                <th className="px-5 py-3">Last visit</th>
                <th className="px-5 py-3">Consent</th>
                <th className="px-5 py-3">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blush/50">
              {customers.map((c) => {
                const sms = c.consents.find((x) => x.channel === "SMS")?.granted ?? false;
                const email = c.consents.find((x) => x.channel === "EMAIL")?.granted ?? false;
                const tags: string[] = JSON.parse(c.tags || "[]");
                return (
                  <tr key={c.id} className="hover:bg-blush-soft/40">
                    <td className="px-5 py-3">
                      <CustomerLink id={c.id}>
                        {c.firstName} {c.lastName}
                      </CustomerLink>
                      {c.deletionRequestedAt && (
                        <span className="ml-2 text-xs text-red-800">deletion requested</span>
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">{formatPhone(c.phone)}</td>
                    <td className="px-5 py-3">{c.email ?? "—"}</td>
                    <td className="px-5 py-3">{c.totalVisits}</td>
                    <td className="px-5 py-3 whitespace-nowrap">{fmtDate(c.lastVisitAt)}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs">
                      <span className={sms ? "text-emerald-700" : "text-stone-400"}>SMS</span>
                      {" / "}
                      <span className={email ? "text-emerald-700" : "text-stone-400"}>Email</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex flex-wrap gap-1">
                        {tags.slice(0, 4).map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
