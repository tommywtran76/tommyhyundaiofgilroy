import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { canWrite, getSession, isOwner } from "@/lib/auth";
import { fmtDate, fmtDateTime } from "@/lib/dates";
import { serviceLabel, REFERRAL_LABELS, type ReferralSource } from "@/lib/services";
import { formatPhone } from "@/lib/validation";
import { Card, PageTitle, StatCard, StatusBadge, Tag } from "@/components/admin/ui";
import CustomerEditor from "@/components/admin/CustomerEditor";
import FollowUpPanel from "@/components/admin/FollowUpPanel";
import ConsentPanel from "@/components/admin/ConsentPanel";
import DangerZone from "@/components/admin/DangerZone";

export const dynamic = "force-dynamic";

export default async function CustomerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = (await getSession())!;
  const writable = canWrite(session.role);

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      checkIns: { orderBy: { createdAt: "desc" } },
      consents: { orderBy: { createdAt: "desc" } },
      photos: { select: { id: true, mimeType: true, createdAt: true, checkInId: true } },
      followUps: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!customer) notFound();

  const tags: string[] = JSON.parse(customer.tags || "[]");
  const consultations = customer.checkIns.filter((c) => c.visitType === "CONSULTATION");

  return (
    <div>
      <PageTitle
        title={`${customer.firstName} ${customer.lastName}`}
        subtitle={`Customer since ${fmtDate(customer.firstVisitAt ?? customer.createdAt)}`}
      />

      {customer.deletionRequestedAt && (
        <p className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-900 px-4 py-3 text-sm">
          This customer requested deletion on {fmtDate(customer.deletionRequestedAt)}. Complete the
          request from the Danger Zone below.
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total visits" value={customer.totalVisits} />
        <StatCard label="Estimated value" value={`$${customer.estimatedValue}`} />
        <StatCard label="Most recent visit" value={fmtDate(customer.lastVisitAt)} />
        <StatCard label="Preferred language" value={customer.preferredLanguage.toUpperCase()} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="grid gap-6 content-start">
          <Card className="p-5">
            <h2 className="font-serif text-xl text-charcoal mb-4">Contact</h2>
            <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-charcoal-soft">Phone</dt>
              <dd>{formatPhone(customer.phone)}</dd>
              <dt className="text-charcoal-soft">Email</dt>
              <dd>{customer.email ?? "—"}</dd>
              <dt className="text-charcoal-soft">Birthday</dt>
              <dd>{customer.birthday ?? "—"}</dd>
              <dt className="text-charcoal-soft">Referral</dt>
              <dd>
                {customer.referralSource
                  ? REFERRAL_LABELS[customer.referralSource as ReferralSource]?.en ?? customer.referralSource
                  : "—"}
                {customer.referralName ? ` — referred by ${customer.referralName}` : ""}
              </dd>
              <dt className="text-charcoal-soft">Do not contact</dt>
              <dd>{customer.doNotContact ? "Yes" : "No"}</dd>
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </Card>

          <CustomerEditor
            customerId={customer.id}
            notes={customer.notes ?? ""}
            tags={tags}
            estimatedValue={customer.estimatedValue}
            doNotContact={customer.doNotContact}
            readOnly={!writable}
          />

          <FollowUpPanel
            customerId={customer.id}
            followUps={customer.followUps.map((f) => ({
              id: f.id,
              stage: f.stage,
              dueDate: f.dueDate?.toISOString() ?? null,
              notes: f.notes ?? "",
              preferredContact: f.preferredContact ?? "",
              estimatedValue: f.estimatedValue,
              lastContactAt: f.lastContactAt?.toISOString() ?? null,
              nextAction: f.nextAction ?? "",
              done: f.done,
            }))}
            readOnly={!writable}
          />

          <ConsentPanel
            customerId={customer.id}
            records={customer.consents.map((r) => ({
              id: r.id,
              channel: r.channel,
              granted: r.granted,
              source: r.source,
              createdAt: r.createdAt.toISOString(),
              revokedAt: r.revokedAt?.toISOString() ?? null,
            }))}
            readOnly={!writable}
          />
        </div>

        <div className="grid gap-6 content-start">
          <Card className="p-5">
            <h2 className="font-serif text-xl text-charcoal mb-4">
              Visit history ({customer.checkIns.length})
            </h2>
            {customer.checkIns.length === 0 ? (
              <p className="text-sm text-charcoal-soft">No visits recorded.</p>
            ) : (
              <ul className="divide-y divide-blush/50">
                {customer.checkIns.map((c) => {
                  const services: string[] = JSON.parse(c.services || "[]");
                  return (
                    <li key={c.id} className="py-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-sm font-medium text-charcoal">
                          {fmtDateTime(c.createdAt)} · {c.visitType.replaceAll("_", " ").toLowerCase()}
                        </p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-sm text-charcoal-soft mt-1">
                        {services.map((s) => serviceLabel(s)).join(", ") || "—"}
                        {c.appointmentTime ? ` · appt ${c.appointmentTime}` : ""}
                        {c.staffMember ? ` · ${c.staffMember}` : ""}
                      </p>
                      {c.safetyNotes && (
                        <p className="text-xs text-amber-900 mt-1">Safety note: {c.safetyNotes}</p>
                      )}
                      {c.staffNotes && (
                        <p className="text-xs text-charcoal-soft mt-1">Staff note: {c.staffNotes}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-serif text-xl text-charcoal mb-4">
              Consultations ({consultations.length})
            </h2>
            {consultations.length === 0 ? (
              <p className="text-sm text-charcoal-soft">No consultations recorded.</p>
            ) : (
              <ul className="text-sm text-charcoal-soft space-y-1">
                {consultations.map((c) => (
                  <li key={c.id}>
                    {fmtDateTime(c.createdAt)} —{" "}
                    {(JSON.parse(c.services || "[]") as string[]).map((s) => serviceLabel(s)).join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-serif text-xl text-charcoal mb-4">
              Photos ({customer.photos.length})
            </h2>
            {customer.photos.length === 0 ? (
              <p className="text-sm text-charcoal-soft">No photos uploaded.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {customer.photos.map((p) => (
                  // Served through the authenticated photo endpoint — never public.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={`/api/admin/photos/${p.id}`}
                    alt={`Uploaded ${fmtDate(p.createdAt)}`}
                    className="h-28 w-28 object-cover rounded-xl border border-blush"
                  />
                ))}
              </div>
            )}
          </Card>

          <DangerZone
            customerId={customer.id}
            customerName={`${customer.firstName} ${customer.lastName}`}
            deletionRequested={!!customer.deletionRequestedAt}
            isOwner={isOwner(session.role)}
          />
        </div>
      </div>
    </div>
  );
}
