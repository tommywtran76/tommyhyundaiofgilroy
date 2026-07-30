import { prisma } from "@/lib/db";
import { canWrite, getSession } from "@/lib/auth";
import { startOfBusinessDay } from "@/lib/dates";
import CheckInCards from "@/components/admin/CheckInCards";
import { EmptyState, PageTitle } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// Guests who checked in with an appointment and are still in progress today —
// ordered by their stated appointment time.
export default async function AppointmentsPage() {
  const session = (await getSession())!;
  const checkIns = await prisma.checkIn.findMany({
    where: {
      hasAppointment: "YES",
      createdAt: { gte: startOfBusinessDay() },
      status: { notIn: ["COMPLETED", "NO_SHOW"] },
    },
    orderBy: [{ appointmentTime: "asc" }, { createdAt: "asc" }],
    include: { customer: true, consents: true },
  });

  return (
    <div>
      <PageTitle
        title="Upcoming Appointments"
        subtitle="Checked-in guests with an appointment that hasn’t been completed yet"
      />
      {checkIns.length === 0 ? (
        <EmptyState message="No pending appointments right now." />
      ) : (
        <CheckInCards checkIns={checkIns} readOnly={!canWrite(session.role)} />
      )}
    </div>
  );
}
