import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { csvResponse, toCsv } from "@/lib/csv";
import { parseDateRange } from "@/lib/dates";
import { buildReport } from "@/lib/reports";
import { serviceLabel } from "@/lib/services";
import { formatPhone } from "@/lib/validation";

export const runtime = "nodejs";

// CSV exports: customers, check-ins, consent records, follow-ups, and the
// aggregated report. Health notes, signatures, and photos are intentionally
// excluded from bulk exports (use the per-customer export for data requests).
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const url = req.nextUrl;
    const type = url.searchParams.get("type") ?? "checkins";
    const range = parseDateRange(url.searchParams.get("from"), url.searchParams.get("to"));

    await audit(session, "export.csv", type);

    if (type === "customers") {
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: "asc" },
        include: { consents: { where: { revokedAt: null } } },
      });
      const csv = toCsv(
        ["First Name", "Last Name", "Phone", "Email", "Birthday", "Language", "First Visit", "Last Visit", "Total Visits", "Estimated Value", "Referral Source", "Referred By", "SMS Consent", "Email Consent", "Do Not Contact", "Tags"],
        customers.map((c) => [
          c.firstName, c.lastName, formatPhone(c.phone), c.email ?? "", c.birthday ?? "",
          c.preferredLanguage, c.firstVisitAt?.toISOString() ?? "", c.lastVisitAt?.toISOString() ?? "",
          c.totalVisits, c.estimatedValue, c.referralSource ?? "", c.referralName ?? "",
          c.consents.find((x) => x.channel === "SMS")?.granted ? "yes" : "no",
          c.consents.find((x) => x.channel === "EMAIL")?.granted ? "yes" : "no",
          c.doNotContact ? "yes" : "no",
          (JSON.parse(c.tags || "[]") as string[]).join("; "),
        ]),
      );
      return csvResponse("customers.csv", csv);
    }

    if (type === "consents") {
      const records = await prisma.consentRecord.findMany({
        orderBy: { createdAt: "asc" },
        include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
      });
      const csv = toCsv(
        ["Date", "Customer", "Phone", "Channel", "Granted", "Source", "Superseded At", "Wording"],
        records.map((r) => [
          r.createdAt.toISOString(),
          `${r.customer.firstName} ${r.customer.lastName}`,
          formatPhone(r.customer.phone),
          r.channel, r.granted ? "yes" : "no", r.source,
          r.revokedAt?.toISOString() ?? "", r.wording,
        ]),
      );
      return csvResponse("consent-records.csv", csv);
    }

    if (type === "followups") {
      const followUps = await prisma.followUp.findMany({
        orderBy: { createdAt: "asc" },
        include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
      });
      const csv = toCsv(
        ["Customer", "Phone", "Stage", "Due Date", "Next Action", "Estimated Value", "Preferred Contact", "Last Contact", "Done", "Notes"],
        followUps.map((f) => [
          `${f.customer.firstName} ${f.customer.lastName}`, formatPhone(f.customer.phone),
          f.stage, f.dueDate?.toISOString() ?? "", f.nextAction ?? "", f.estimatedValue,
          f.preferredContact ?? "", f.lastContactAt?.toISOString() ?? "",
          f.done ? "yes" : "no", f.notes ?? "",
        ]),
      );
      return csvResponse("followups.csv", csv);
    }

    if (type === "report") {
      const report = await buildReport(range.gte, range.lte);
      const rows: unknown[][] = [
        ["Range", `${report.range.from.toISOString()} to ${report.range.to.toISOString()}`],
        ["Total check-ins", report.totals.checkIns],
        ["New customers", report.totals.newCustomers],
        ["Returning customers", report.totals.returningCustomers],
        ["Consultations", report.totals.consultations],
        ["Walk-ins", report.totals.walkIns],
        ["Consultation to booking rate (%)", report.conversion.consultToBooked.rate],
        ["Walk-in to booking rate (%)", report.conversion.walkInToBooked.rate],
        ["Marketing opt-in rate (%)", report.marketing.optInRate],
        ["Customer return rate (%)", report.customers.returnRate],
        ["Birthday customers this month", report.customers.birthdayCount],
        ["Leads needing follow-up", report.followUps.open],
        ["Pipeline value ($)", report.followUps.pipelineValue],
        [],
        ["Check-ins per day", ""],
        ...report.totals.perDay.map((d) => [d.day, d.count]),
        [],
        ["Service", "Requests"],
        ...report.services.map((s) => [s.label, s.count]),
        [],
        ["Referral source", "Count"],
        ...report.referrals.map((r) => [r.label, r.count]),
        [],
        ["Revenue opportunity by service", "Value ($)"],
        ...report.opportunity.map((o) => [o.label, o.value]),
      ];
      return csvResponse("report.csv", toCsv(["Metric", "Value"], rows));
    }

    // default: check-ins in range
    const checkIns = await prisma.checkIn.findMany({
      where: { createdAt: { gte: range.gte, lte: range.lte } },
      orderBy: { createdAt: "asc" },
      include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
    });
    const csv = toCsv(
      ["Date", "Customer", "Phone", "Visit Type", "First Visit", "Services", "Has Appointment", "Appointment Time", "Staff", "Booking Help", "Referral", "Status", "Language"],
      checkIns.map((c) => [
        c.createdAt.toISOString(),
        `${c.customer.firstName} ${c.customer.lastName}`,
        formatPhone(c.customer.phone),
        c.visitType, c.isFirstVisit ? "yes" : "no",
        (JSON.parse(c.services || "[]") as string[]).map((s) => serviceLabel(s)).join("; "),
        c.hasAppointment, c.appointmentTime ?? "", c.staffMember ?? "", c.bookingHelp ?? "",
        c.referralSource ?? "", c.status, c.language,
      ]),
    );
    return csvResponse("checkins.csv", csv);
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("export failed", err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
