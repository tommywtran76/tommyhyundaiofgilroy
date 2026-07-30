import { prisma } from "@/lib/db";
import { canWrite, getSession } from "@/lib/auth";
import { serviceLabel } from "@/lib/services";
import { PageTitle, StatCard } from "@/components/admin/ui";
import FollowUpBoard from "@/components/admin/FollowUpBoard";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage() {
  const session = (await getSession())!;
  const [followUps, templates] = await Promise.all([
    prisma.followUp.findMany({
      where: { done: false },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            doNotContact: true,
            checkIns: { orderBy: { createdAt: "desc" }, take: 1, select: { services: true } },
            consents: { where: { revokedAt: null }, select: { channel: true, granted: true } },
          },
        },
      },
    }),
    prisma.messageTemplate.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const rows = followUps.map((f) => {
    const services: string[] = JSON.parse(f.customer.checkIns[0]?.services ?? "[]");
    return {
      id: f.id,
      stage: f.stage,
      dueDate: f.dueDate?.toISOString() ?? null,
      nextAction: f.nextAction ?? "",
      estimatedValue: f.estimatedValue,
      preferredContact: f.preferredContact ?? "",
      customerId: f.customer.id,
      customerName: `${f.customer.firstName} ${f.customer.lastName}`,
      firstName: f.customer.firstName,
      phone: f.customer.phone,
      service: services.length ? serviceLabel(services[0]) : "your visit",
      smsOk:
        !f.customer.doNotContact &&
        (f.customer.consents.find((c) => c.channel === "SMS")?.granted ?? false),
      doNotContact: f.customer.doNotContact,
    };
  });

  const dueToday = rows.filter(
    (r) => r.dueDate && new Date(r.dueDate) <= new Date() && r.stage !== "DO_NOT_CONTACT",
  ).length;
  const pipeline = rows
    .filter((r) => !["DO_NOT_CONTACT", "BOOKED"].includes(r.stage))
    .reduce((sum, r) => sum + r.estimatedValue, 0);

  return (
    <div>
      <PageTitle
        title="Follow-Up Tasks"
        subtitle="Leads who haven’t booked yet. Promotional messages may only be sent to customers with the matching marketing consent."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Open follow-ups" value={rows.length} />
        <StatCard label="Due now" value={dueToday} />
        <StatCard label="Pipeline value" value={`$${pipeline.toLocaleString()}`} />
        <StatCard label="Templates" value={templates.length} />
      </div>

      <FollowUpBoard
        rows={rows}
        templates={templates.map((t) => ({ id: t.id, name: t.name, body: t.body }))}
        readOnly={!canWrite(session.role)}
      />
    </div>
  );
}
