import { z } from "zod";
import { REFERRAL_SOURCES, SERVICES, VISIT_TYPES } from "./services";

/** Normalize a US phone number to bare digits, e.g. "(650) 305-8036" -> "6503058036". */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  // Strip leading US country code
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

export function isValidPhone(input: string): boolean {
  const d = normalizePhone(input);
  return d.length === 10 && !/^0/.test(d);
}

export function formatPhone(digits: string): string {
  const d = normalizePhone(digits);
  if (d.length !== 10) return digits;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const serviceKeys = new Set(SERVICES.map((s) => s.key));

export const removalAnswersSchema = z
  .object({
    tattooColor: z.string().max(40).optional(),
    tattooAge: z.string().max(120).optional(),
    triedLaser: z.enum(["yes", "no"]).optional(),
    triedSaline: z.enum(["yes", "no"]).optional(),
    goal: z.enum(["complete-removal", "lighten", "color-correct", "advice"]).optional(),
  })
  .partial();

export const facialAnswersSchema = z
  .object({
    skinConcerns: z.array(z.string().max(40)).max(12).optional(),
    prescriptionSkincare: z.enum(["yes", "no"]).optional(),
    recentTreatment: z.enum(["yes", "no"]).optional(),
  })
  .partial();

export const bodyScrubAnswersSchema = z
  .object({
    confirmFemale: z.boolean().optional(),
    skinContraindications: z.enum(["yes", "no"]).optional(),
  })
  .partial();

export const answersSchema = z
  .object({
    removal: removalAnswersSchema.optional(),
    facial: facialAnswersSchema.optional(),
    bodyScrub: bodyScrubAnswersSchema.optional(),
  })
  .partial();

export const checkInSchema = z.object({
  visitType: z.enum(VISIT_TYPES),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z
    .string()
    .refine(isValidPhone, { message: "Please enter a valid 10-digit US phone number." }),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || EMAIL_RE.test(v), { message: "Please enter a valid email address." }),
  birthday: z
    .string()
    .trim()
    .max(10)
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v) || /^\d{2}-\d{2}$/.test(v), {
      message: "Birthday must be a date.",
    })
    .optional()
    .default(""),
  preferredLanguage: z.enum(["en", "vi", "es", "other"]).default("en"),
  isFirstVisit: z.boolean(),
  language: z.enum(["en", "vi", "es"]).default("en"),

  services: z
    .array(z.string())
    .min(1, "Please choose at least one service.")
    .max(10)
    .refine((arr) => arr.every((k) => serviceKeys.has(k)), { message: "Unknown service." }),
  otherService: z.string().trim().max(200).optional().default(""),

  hasAppointment: z.enum(["YES", "NO", "NOT_SURE"]),
  appointmentTime: z.string().trim().max(60).optional().default(""),
  staffMember: z.string().trim().max(60).optional().default(""),
  serviceBooked: z.string().trim().max(120).optional().default(""),
  bookingHelp: z.enum(["YES", "MAYBE_LATER", "INFO_ONLY", ""]).optional().default(""),

  answers: answersSchema.optional().default({}),
  safetyNotes: z.string().trim().max(2000).optional().default(""),

  referralSource: z.enum(REFERRAL_SOURCES),
  referralName: z.string().trim().max(120).optional().default(""),

  smsConsent: z.boolean(),
  emailConsent: z.boolean(),

  // PNG data URL from the signature pad
  signature: z
    .string()
    .max(400_000)
    .refine((v) => v === "" || v.startsWith("data:image/png;base64,"), {
      message: "Invalid signature format.",
    })
    .optional()
    .default(""),

  // Optional uploaded photo (removal services): data URL, ~4 MB max
  photo: z
    .string()
    .max(6_000_000)
    .refine((v) => v === "" || /^data:image\/(png|jpe?g|webp|heic);base64,/.test(v), {
      message: "Photo must be an image.",
    })
    .optional()
    .default(""),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const lookupSchema = z.object({
  phone: z.string().refine(isValidPhone, { message: "Please enter a valid phone number." }),
});
