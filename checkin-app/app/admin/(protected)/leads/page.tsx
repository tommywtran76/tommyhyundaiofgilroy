import { prisma } from "@/lib/db";
import { canWrite, getSession } from "@/lib/auth";
import { daysAgo } from "@/lib/dates";
import CheckInCards from "@/components/admin/CheckInCards";
import { EmptyState, PageTitle } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// Walk-ins from the last 30 days — the raw lead pool for follow-up.
export default async function LeadsPage() {
  const session = (await getSession())!;
  const checkIns = await prisma.checkIn.findMany({
    where: { visitType: "WALK_IN", createdAt: { gte: daysAgo(30) } },
    orderBy: { createdAt: "desc" },
    include: { customer: true, consents: true },
  });

  return (
    <div>
      <PageTitle title="Walk-In Leads" subtitle="Walk-in visits from the last 30 days" />
      {checkIns.length === 0 ? (
        <EmptyState message="No walk-ins in the last 30 days." />
      ) : (
        <CheckInCards checkIns={checkIns} readOnly={!canWrite(session.role)} />
      )}
    </div>
  );
}
