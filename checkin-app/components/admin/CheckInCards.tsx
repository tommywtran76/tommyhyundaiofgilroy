import type { CheckIn, ConsentRecord, Customer } from "@prisma/client";
import { fmtDateTime } from "@/lib/dates";
import { serviceLabel } from "@/lib/services";
import StatusControl from "./StatusControl";
import { Card, ConsentDots, CustomerLink, Tag } from "./ui";

type Row = CheckIn & { customer: Customer; consents: ConsentRecord[] };

// Shared check-in card list used by the appointments / leads / consultations views.
export default function CheckInCards({ checkIns, readOnly }: { checkIns: Row[]; readOnly: boolean }) {
  return (
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
                  <ConsentDots sms={sms} email={email} />
                </div>
                <p className="text-sm text-charcoal-soft mt-1.5">
                  {fmtDateTime(c.createdAt)}
                  {c.appointmentTime ? ` · appt ${c.appointmentTime}` : ""}
                  {c.staffMember ? ` · with ${c.staffMember}` : ""}
                  {c.bookingHelp === "YES" ? " · wants booking help" : ""}
                  {c.bookingHelp === "MAYBE_LATER" ? " · maybe later" : ""}
                  {c.bookingHelp === "INFO_ONLY" ? " · info only" : ""}
                </p>
                <p className="text-sm text-charcoal mt-1">
                  {services.map((s) => serviceLabel(s)).join(", ") || "—"}
                  {c.otherService ? ` (${c.otherService})` : ""}
                </p>
              </div>
              <StatusControl checkInId={c.id} status={c.status} readOnly={readOnly} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
