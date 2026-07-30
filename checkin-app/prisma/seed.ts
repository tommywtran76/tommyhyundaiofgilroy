import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
import { SMS_CONSENT_WORDING, EMAIL_CONSENT_WORDING } from "../lib/consent";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  // ----- Users -----
  const ownerEmail = process.env.SEED_OWNER_EMAIL || "aileen@aileennbeauty.com";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD || "ChangeMe!2026";

  await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      name: "Aileen",
      role: "OWNER",
      passwordHash: hashPassword(ownerPassword),
    },
  });
  await prisma.user.upsert({
    where: { email: "frontdesk@aileennbeauty.com" },
    update: {},
    create: {
      email: "frontdesk@aileennbeauty.com",
      name: "Front Desk",
      role: "FRONT_DESK",
      passwordHash: hashPassword(process.env.SEED_STAFF_PASSWORD || "FrontDesk!2026"),
    },
  });
  console.log(`Seeded users. Owner login: ${ownerEmail} / ${ownerPassword}`);

  // ----- Message templates -----
  const templates = [
    {
      name: "Check-in follow-up",
      channel: "SMS",
      body: "Hi [First Name], thank you for visiting Aileen's Beauty today. It was wonderful meeting you. Please let us know if you have any questions about [Service]. You can call or text us at 650-305-8036.",
    },
    {
      name: "Consultation follow-up",
      channel: "SMS",
      body: "Hi [First Name], this is Aileen from Aileen's Beauty. I'm following up regarding your consultation for [Service]. I would be happy to help you choose the best next step when you're ready.",
    },
    {
      name: "Booking help",
      channel: "SMS",
      body: "Hi [First Name], this is Aileen's Beauty. You mentioned you'd like help booking an appointment for [Service] — I'd love to find a time that works for you. Call or text 650-305-8036.",
    },
  ];
  if ((await prisma.messageTemplate.count()) === 0) {
    await prisma.messageTemplate.createMany({ data: templates });
  }

  // ----- Sample customers (skip if data already exists) -----
  if ((await prisma.customer.count()) > 0) {
    console.log("Customers already exist — skipping sample data.");
    return;
  }

  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);

  const samples = [
    {
      customer: {
        firstName: "Jessica", lastName: "Tran", phone: "4085550101",
        email: "jessica.tran@example.com", birthday: "1991-04-12", preferredLanguage: "en",
        referralSource: "instagram", tags: JSON.stringify(["New Lead", "Brow Removal"]),
        firstVisitAt: hoursAgo(3), lastVisitAt: hoursAgo(3), totalVisits: 1, estimatedValue: 450,
      },
      checkIn: {
        visitType: "APPOINTMENT", isFirstVisit: true, language: "en",
        services: JSON.stringify(["eyebrow-tattoo-removal"]),
        hasAppointment: "YES", appointmentTime: "14:00", serviceBooked: "Eyebrow Tattoo Removal",
        answers: JSON.stringify({ removal: { tattooColor: "blue", tattooAge: "6 years", triedLaser: "no", triedSaline: "no", goal: "complete-removal" } }),
        referralSource: "instagram", status: "COMPLETED", createdAt: hoursAgo(3),
      },
      consents: { sms: true, email: true },
    },
    {
      customer: {
        firstName: "Linh", lastName: "Nguyễn", phone: "4085550102",
        email: "linh.nguyen@example.com", birthday: "1987-11-02", preferredLanguage: "vi",
        referralSource: "friend-family", referralName: "Chị Hoa",
        tags: JSON.stringify(["Returning Customer", "Facial Client", "VIP", "Marketing Opt-In"]),
        firstVisitAt: new Date("2025-09-15"), lastVisitAt: hoursAgo(2), totalVisits: 6, estimatedValue: 350,
      },
      checkIn: {
        visitType: "APPOINTMENT", isFirstVisit: false, language: "vi",
        services: JSON.stringify(["la-mer-facial"]),
        hasAppointment: "YES", appointmentTime: "15:30", staffMember: "Aileen",
        answers: JSON.stringify({ facial: { skinConcerns: ["melasma", "darkSpots"], prescriptionSkincare: "no", recentTreatment: "no" } }),
        referralSource: "returning-customer", status: "IN_SERVICE", createdAt: hoursAgo(2),
      },
      consents: { sms: true, email: false },
    },
    {
      customer: {
        firstName: "Maria", lastName: "Lopez", phone: "4085550103",
        email: "maria.lopez@example.com", preferredLanguage: "es",
        referralSource: "google-maps", tags: JSON.stringify(["New Lead", "Consultation Only", "Needs Follow-Up"]),
        firstVisitAt: hoursAgo(1), lastVisitAt: hoursAgo(1), totalVisits: 1, estimatedValue: 550,
      },
      checkIn: {
        visitType: "CONSULTATION", isFirstVisit: true, language: "es",
        services: JSON.stringify(["lip-blush"]),
        hasAppointment: "NO", bookingHelp: "YES",
        answers: JSON.stringify({}),
        referralSource: "google-maps", status: "WAITING", createdAt: hoursAgo(1),
      },
      consents: { sms: false, email: true },
      followUp: {
        stage: "CONTACT_TODAY", estimatedValue: 550,
        nextAction: "Help book lip blush appointment (asked for help today)", dueDate: new Date(),
      },
    },
    {
      customer: {
        firstName: "Emily", lastName: "Chen", phone: "4085550104",
        email: "emily.chen@example.com", birthday: "1995-07-30", preferredLanguage: "en",
        referralSource: "yelp", tags: JSON.stringify(["New Lead", "Head Spa", "Birthday Month"]),
        firstVisitAt: hoursAgo(0.5), lastVisitAt: hoursAgo(0.5), totalVisits: 1, estimatedValue: 350,
      },
      checkIn: {
        visitType: "WALK_IN", isFirstVisit: true, language: "en",
        services: JSON.stringify(["head-spa", "body-scrub"]),
        hasAppointment: "NO", bookingHelp: "MAYBE_LATER",
        answers: JSON.stringify({ bodyScrub: { confirmFemale: true, skinContraindications: "no" } }),
        safetyNotes: "Allergic to lavender oil",
        referralSource: "yelp", status: "WAITING", createdAt: hoursAgo(0.5),
      },
      consents: { sms: true, email: true },
      followUp: {
        stage: "NEW_LEAD", estimatedValue: 350,
        nextAction: "Reach out about head spa packages", dueDate: new Date(),
      },
    },
  ];

  for (const s of samples) {
    const customer = await prisma.customer.create({ data: s.customer });
    const checkIn = await prisma.checkIn.create({
      data: { ...s.checkIn, customerId: customer.id },
    });
    await prisma.consentRecord.createMany({
      data: [
        { customerId: customer.id, checkInId: checkIn.id, channel: "SMS", granted: s.consents.sms, wording: SMS_CONSENT_WORDING.en, source: "kiosk" },
        { customerId: customer.id, checkInId: checkIn.id, channel: "EMAIL", granted: s.consents.email, wording: EMAIL_CONSENT_WORDING.en, source: "kiosk" },
      ],
    });
    if ("followUp" in s && s.followUp) {
      await prisma.followUp.create({ data: { ...s.followUp, customerId: customer.id } });
    }
    await prisma.notification.create({
      data: {
        type: s.checkIn.visitType === "WALK_IN" ? "walk-in" : "check-in",
        message:
          s.checkIn.visitType === "WALK_IN"
            ? `New walk-in lead: ${customer.firstName} is interested in Head Spa.`
            : `${customer.firstName} has checked in.`,
        checkInId: checkIn.id,
        createdAt: checkIn.createdAt,
        readAt: new Date(),
      },
    });
  }
  console.log("Seeded 4 sample customers with check-ins, consents, and follow-ups.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
