import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSchema } from "@/lib/migrate";
import { checkInSchema, normalizePhone } from "@/lib/validation";
import { EMAIL_CONSENT_WORDING, SMS_CONSENT_WORDING } from "@/lib/consent";
import { notifyCheckIn } from "@/lib/notify";
import { SERVICE_MAP } from "@/lib/services";

export const runtime = "nodejs";

// Public endpoint used by the kiosk. Deliberately returns only a success flag
// and the first name — never customer records.
export async function POST(req: NextRequest) {
  await ensureSchema();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input." },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const phone = normalizePhone(input.phone);
  const now = new Date();

  try {
    // Duplicate detection: one customer per phone number. Re-check-ins update
    // the existing profile instead of creating a duplicate.
    const existing = await prisma.customer.findUnique({ where: { phone } });

    const tagSet = new Set<string>(existing ? JSON.parse(existing.tags || "[]") : []);
    tagSet.add(existing ? "Returning Customer" : "New Lead");
    if (input.services.some((s) => SERVICE_MAP.get(s)?.category === "removal")) tagSet.add("Brow Removal");
    if (input.services.some((s) => SERVICE_MAP.get(s)?.category === "facial")) tagSet.add("Facial Client");
    if (input.services.includes("body-scrub")) tagSet.add("Body Scrub");
    if (input.services.includes("head-spa")) tagSet.add("Head Spa");
    if (input.services.includes("gift-card") || input.visitType === "GIFT_CARD") tagSet.add("Gift Card");
    if (input.visitType === "CONSULTATION") tagSet.add("Consultation Only");
    if (input.smsConsent || input.emailConsent) tagSet.add("Marketing Opt-In");

    const estValue = input.services.reduce((sum, s) => sum + (SERVICE_MAP.get(s)?.estValue ?? 0), 0);

    const customerData = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || null,
      birthday: input.birthday || null,
      preferredLanguage: input.preferredLanguage,
      referralSource: input.referralSource,
      referralName: input.referralName || null,
      lastVisitAt: now,
      tags: JSON.stringify([...tagSet]),
    };

    const customer = existing
      ? await prisma.customer.update({
          where: { id: existing.id },
          data: {
            ...customerData,
            totalVisits: { increment: 1 },
            estimatedValue: Math.max(existing.estimatedValue, estValue),
          },
        })
      : await prisma.customer.create({
          data: {
            ...customerData,
            phone,
            firstVisitAt: now,
            totalVisits: 1,
            estimatedValue: estValue,
          },
        });

    const checkIn = await prisma.checkIn.create({
      data: {
        customerId: customer.id,
        visitType: input.visitType,
        isFirstVisit: input.isFirstVisit,
        language: input.language,
        services: JSON.stringify(input.services),
        otherService: input.otherService || null,
        hasAppointment: input.hasAppointment,
        appointmentTime: input.appointmentTime || null,
        staffMember: input.staffMember || null,
        serviceBooked: input.serviceBooked || null,
        bookingHelp: input.bookingHelp || null,
        answers: JSON.stringify(input.answers ?? {}),
        safetyNotes: input.safetyNotes || null,
        referralSource: input.referralSource,
        referralName: input.referralName || null,
        signature: input.signature || null,
      },
    });

    // Immutable consent records: exact wording, status, and timestamp for both
    // channels on every submission (granted or declined).
    const lang = input.language;
    await prisma.consentRecord.createMany({
      data: [
        {
          customerId: customer.id,
          checkInId: checkIn.id,
          channel: "SMS",
          granted: input.smsConsent,
          wording: SMS_CONSENT_WORDING[lang],
          source: "kiosk",
        },
        {
          customerId: customer.id,
          checkInId: checkIn.id,
          channel: "EMAIL",
          granted: input.emailConsent,
          wording: EMAIL_CONSENT_WORDING[lang],
          source: "kiosk",
        },
      ],
    });

    if (input.photo) {
      const mimeType = input.photo.slice(5, input.photo.indexOf(";"));
      await prisma.photo.create({
        data: { customerId: customer.id, checkInId: checkIn.id, mimeType, data: input.photo },
      });
    }

    // Walk-ins and guests without an appointment become follow-up leads.
    const isLead =
      input.hasAppointment !== "YES" &&
      (input.visitType === "WALK_IN" || input.visitType === "CONSULTATION" || input.bookingHelp !== "");
    if (isLead) {
      await prisma.followUp.create({
        data: {
          customerId: customer.id,
          stage: input.bookingHelp === "YES" ? "CONTACT_TODAY" : "NEW_LEAD",
          estimatedValue: estValue,
          nextAction:
            input.bookingHelp === "YES"
              ? "Help book an appointment (asked for help today)"
              : "Reach out about services of interest",
          dueDate: now,
        },
      });
    }

    await notifyCheckIn({
      checkInId: checkIn.id,
      customerId: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      visitType: input.visitType,
      services: input.services,
      appointmentTime: input.appointmentTime || null,
      isFirstVisit: input.isFirstVisit,
      createdAt: now,
    });

    return NextResponse.json({ ok: true, firstName: customer.firstName });
  } catch (err) {
    console.error("check-in failed", err);
    return NextResponse.json({ error: "Check-in failed. Please try again." }, { status: 500 });
  }
}
