import { prisma } from "@/lib/db";
import { getSession, canWrite } from "@/lib/auth";
import { startOfBusinessDay, fmtTime } from "@/lib/dates";
import { serviceLabel } from "@/lib/services";
import StatusControl from "@/components/admin/StatusControl";
import WaitEstimate from "@/components/admin/WaitEstimate";
import { Card, ConsentDots, CustomerLink, EmptyState, PageTitle, StatCard, Tag } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const session = (await getSession())!;
  const readOnly = !canWrite(session.role);
  const dayStart = startOfBusinessDay();

  const checkIns = await prisma.checkIn.findMany({
    where: { createdAt: { gte: dayStart } },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      consents: { orderBy: { createdAt: "desc" } },
    },
  });

  const waiting = checkIns.filter((c) => c.status === "WAITING").length;
  const walkIns = checkIns.filter((c) => c.visitType === "WALK_IN").length;
  const newGuests = checkIns.filter((c) => c.isFirstVisit).length;

  return (
    <div>
      <PageTitle
        title="Today’s Check-Ins"
        subtitle={new Date().toLocaleDateString("en-US", {
          timeZone: process.env.BUSINESS_TIMEZONE || "America/Los_Angeles",
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Check-ins today" value={checkIns.length} />
        <StatCard label="Currently waiting" value={waiting} />
        <StatCard label="Walk-ins" value={walkIns} />
        <StatCard label="New guests" value={newGuests} />
      </div>

      {checkIns.length === 0 ? (
        <EmptyState message="No check-ins yet today. New arrivals appear here automatically." />
      ) : (
        <div className="grid gap-4">
          {checkIns.map((c) => {
            const services: string[] = JSON.parse(c.services || "[]");
            const sms = c.consents.find((x) => x.channel === "SMS")?.granted ?? false;
            const email = c.consents.find((x) => x.channel === "EMAIL")?.granted ?? false;
            return (
              <Card key={c.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CustomerLink id={c.customerId}>
                        <span className="text-lg">
                          {c.customer.firstName} {c.customer.lastName}
                        </span>
                      </CustomerLink>
                      <Tag>{c.isFirstVisit ? "New" : "Returning"}</Tag>
                      <Tag>{c.visitType.replaceAll("_", " ").toLowerCase()}</Tag>
                      <ConsentDots sms={sms} email={email} />
                    </div>
                    <p className="text-sm text-charcoal-soft mt-1.5">
                      Arrived {fmtTime(c.createdAt)}
                      {c.hasAppointment === "YES" && c.appointmentTime
                        ? ` · Appointment ${c.appointmentTime}`
                        : " · No appointment"}
                      {c.staffMember ? ` · with ${c.staffMember}` : ""}
                    </p>
                    <p className="text-sm text-charcoal mt-1">
                      {services.map((s) => serviceLabel(s)).join(", ") || "—"}
                      {c.otherService ? ` (${c.otherService})` : ""}
                    </p>
                    {c.safetyNotes && (
                      <p className="text-sm mt-2 text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
                        Safety note: {c.safetyNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <StatusControl checkInId={c.id} status={c.status} readOnly={readOnly} />
                    <WaitEstimate checkInId={c.id} value={c.waitEstimate ?? ""} readOnly={readOnly} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
