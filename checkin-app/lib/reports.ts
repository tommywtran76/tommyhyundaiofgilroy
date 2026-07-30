import { prisma } from "./db";
import { SERVICE_MAP, serviceLabel, REFERRAL_LABELS, type ReferralSource } from "./services";
import { currentBusinessMonth } from "./dates";

export interface ReportData {
  range: { from: Date; to: Date };
  totals: {
    checkIns: number;
    perDay: { day: string; count: number }[];
    newCustomers: number;
    returningCustomers: number;
    consultations: number;
    walkIns: number;
  };
  services: { key: string; label: string; count: number }[];
  referrals: { key: string; label: string; count: number }[];
  conversion: {
    consultToBooked: { total: number; converted: number; rate: number };
    walkInToBooked: { total: number; converted: number; rate: number };
  };
  marketing: { optInRate: number; smsOptIns: number; emailOptIns: number };
  customers: { total: number; returnRate: number; birthdayCount: number };
  followUps: { open: number; pipelineValue: number };
  opportunity: { label: string; value: number; leads: number }[];
}

/** A customer "converted" if, after the visit, they booked (follow-up stage) or returned with an appointment. */
function converted(
  customerIds: string[],
  bookedByFollowUp: Set<string>,
  laterAppointments: Set<string>,
): number {
  return customerIds.filter((id) => bookedByFollowUp.has(id) || laterAppointments.has(id)).length;
}

export async function buildReport(from: Date, to: Date): Promise<ReportData> {
  const range = { gte: from, lte: to };

  const [checkIns, allCustomers, consents, openFollowUps, bookedFollowUps] = await Promise.all([
    prisma.checkIn.findMany({
      where: { createdAt: range },
      select: {
        id: true,
        customerId: true,
        visitType: true,
        isFirstVisit: true,
        services: true,
        referralSource: true,
        hasAppointment: true,
        createdAt: true,
      },
    }),
    prisma.customer.findMany({
      select: { id: true, totalVisits: true, birthday: true, deletionRequestedAt: true },
    }),
    prisma.consentRecord.findMany({
      where: { revokedAt: null },
      select: { customerId: true, channel: true, granted: true },
    }),
    prisma.followUp.findMany({
      where: { done: false, stage: { notIn: ["BOOKED", "DO_NOT_CONTACT"] } },
      select: { customerId: true, estimatedValue: true },
    }),
    prisma.followUp.findMany({ where: { stage: "BOOKED" }, select: { customerId: true } }),
  ]);

  // Per-day counts
  const perDayMap = new Map<string, number>();
  for (const c of checkIns) {
    const day = c.createdAt.toLocaleDateString("en-CA", {
      timeZone: process.env.BUSINESS_TIMEZONE || "America/Los_Angeles",
    });
    perDayMap.set(day, (perDayMap.get(day) ?? 0) + 1);
  }

  // Service + referral tallies
  const serviceCount = new Map<string, number>();
  const referralCount = new Map<string, number>();
  for (const c of checkIns) {
    for (const s of JSON.parse(c.services || "[]") as string[]) {
      serviceCount.set(s, (serviceCount.get(s) ?? 0) + 1);
    }
    if (c.referralSource) referralCount.set(c.referralSource, (referralCount.get(c.referralSource) ?? 0) + 1);
  }

  // Conversions
  const bookedSet = new Set(bookedFollowUps.map((f) => f.customerId));
  const consultCustomers = [...new Set(checkIns.filter((c) => c.visitType === "CONSULTATION").map((c) => c.customerId))];
  const walkInCustomers = [...new Set(checkIns.filter((c) => c.visitType === "WALK_IN").map((c) => c.customerId))];
  // Customers who later checked in with an appointment (any time, incl. after range)
  const apptCheckIns = await prisma.checkIn.findMany({
    where: { hasAppointment: "YES", customerId: { in: [...consultCustomers, ...walkInCustomers] } },
    select: { customerId: true },
  });
  const apptSet = new Set(apptCheckIns.map((c) => c.customerId));

  const consultConverted = converted(consultCustomers, bookedSet, apptSet);
  const walkInConverted = converted(walkInCustomers, bookedSet, apptSet);

  // Marketing
  const activeCustomers = allCustomers.filter((c) => !c.deletionRequestedAt);
  const optedInCustomers = new Set(consents.filter((c) => c.granted).map((c) => c.customerId));
  const smsOptIns = new Set(consents.filter((c) => c.granted && c.channel === "SMS").map((c) => c.customerId)).size;
  const emailOptIns = new Set(consents.filter((c) => c.granted && c.channel === "EMAIL").map((c) => c.customerId)).size;

  // Birthdays this month (birthday stored as YYYY-MM-DD or MM-DD)
  const month = currentBusinessMonth();
  const birthdayCount = activeCustomers.filter((c) => {
    if (!c.birthday) return false;
    const parts = c.birthday.split("-");
    const m = parts.length === 3 ? Number(parts[1]) : Number(parts[0]);
    return m === month;
  }).length;

  // Revenue opportunity: open leads × the estimated value of the services they asked about
  const openLeadIds = new Set(openFollowUps.map((f) => f.customerId));
  const oppByService = new Map<string, { value: number; leads: number }>();
  const countedLead = new Set<string>();
  for (const c of checkIns) {
    if (!openLeadIds.has(c.customerId) || countedLead.has(c.customerId)) continue;
    countedLead.add(c.customerId);
    const services = JSON.parse(c.services || "[]") as string[];
    for (const s of services) {
      const def = SERVICE_MAP.get(s);
      if (!def || def.estValue === 0) continue;
      const cur = oppByService.get(s) ?? { value: 0, leads: 0 };
      oppByService.set(s, { value: cur.value + def.estValue, leads: cur.leads + 1 });
    }
  }

  return {
    range: { from, to },
    totals: {
      checkIns: checkIns.length,
      perDay: [...perDayMap.entries()].sort().map(([day, count]) => ({ day, count })),
      newCustomers: checkIns.filter((c) => c.isFirstVisit).length,
      returningCustomers: checkIns.filter((c) => !c.isFirstVisit).length,
      consultations: checkIns.filter((c) => c.visitType === "CONSULTATION").length,
      walkIns: checkIns.filter((c) => c.visitType === "WALK_IN").length,
    },
    services: [...serviceCount.entries()]
      .map(([key, count]) => ({ key, label: serviceLabel(key), count }))
      .sort((a, b) => b.count - a.count),
    referrals: [...referralCount.entries()]
      .map(([key, count]) => ({
        key,
        label: REFERRAL_LABELS[key as ReferralSource]?.en ?? key,
        count,
      }))
      .sort((a, b) => b.count - a.count),
    conversion: {
      consultToBooked: {
        total: consultCustomers.length,
        converted: consultConverted,
        rate: consultCustomers.length ? Math.round((consultConverted / consultCustomers.length) * 100) : 0,
      },
      walkInToBooked: {
        total: walkInCustomers.length,
        converted: walkInConverted,
        rate: walkInCustomers.length ? Math.round((walkInConverted / walkInCustomers.length) * 100) : 0,
      },
    },
    marketing: {
      optInRate: activeCustomers.length
        ? Math.round(
            (activeCustomers.filter((c) => optedInCustomers.has(c.id)).length / activeCustomers.length) * 100,
          )
        : 0,
      smsOptIns,
      emailOptIns,
    },
    customers: {
      total: activeCustomers.length,
      returnRate: activeCustomers.length
        ? Math.round((activeCustomers.filter((c) => c.totalVisits > 1).length / activeCustomers.length) * 100)
        : 0,
      birthdayCount,
    },
    followUps: {
      open: openFollowUps.length,
      pipelineValue: openFollowUps.reduce((s, f) => s + f.estimatedValue, 0),
    },
    opportunity: [...oppByService.entries()]
      .map(([key, v]) => ({ label: serviceLabel(key), value: v.value, leads: v.leads }))
      .sort((a, b) => b.value - a.value),
  };
}
