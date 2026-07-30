import { prisma } from "@/lib/db";
import { canWrite, getSession } from "@/lib/auth";
import { daysAgo } from "@/lib/dates";
import CheckInCards from "@/components/admin/CheckInCards";
import { EmptyState, PageTitle } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const session = (await getSession())!;
  const checkIns = await prisma.checkIn.findMany({
    where: { visitType: "CONSULTATION", createdAt: { gte: daysAgo(90) } },
    orderBy: { createdAt: "desc" },
    include: { customer: true, consents: true },
  });

  return (
    <div>
      <PageTitle title="Consultation Requests" subtitle="Consultation visits from the last 90 days" />
      {checkIns.length === 0 ? (
        <EmptyState message="No consultations in the last 90 days." />
      ) : (
        <CheckInCards checkIns={checkIns} readOnly={!canWrite(session.role)} />
      )}
    </div>
  );
}
