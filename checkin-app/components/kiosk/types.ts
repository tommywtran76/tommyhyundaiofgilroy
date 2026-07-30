import type { Lang } from "@/lib/i18n";
import type { VisitType } from "@/lib/services";

export type KioskStep =
  | "welcome"
  | "info"
  | "services"
  | "details"
  | "referral"
  | "consent"
  | "review"
  | "done";

export interface KioskForm {
  visitType: VisitType | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthday: string;
  preferredLanguage: "en" | "vi" | "es" | "other";
  isFirstVisit: boolean | null;

  services: string[];
  otherService: string;
  hasAppointment: "YES" | "NO" | "NOT_SURE" | null;
  appointmentTime: string;
  staffMember: string;
  serviceBooked: string;
  bookingHelp: "YES" | "MAYBE_LATER" | "INFO_ONLY" | "";

  // Service-specific answers
  tattooColor: string;
  tattooAge: string;
  triedLaser: "yes" | "no" | "";
  triedSaline: "yes" | "no" | "";
  removalGoal: "complete-removal" | "lighten" | "color-correct" | "advice" | "";
  photo: string; // data URL

  skinConcerns: string[];
  prescriptionSkincare: "yes" | "no" | "";
  recentTreatment: "yes" | "no" | "";

  confirmFemale: boolean;
  skinContraindications: "yes" | "no" | "";

  safetyNotes: string;

  referralSource: string;
  referralName: string;

  smsConsent: boolean;
  emailConsent: boolean;

  signature: string; // data URL
}

export const EMPTY_FORM: KioskForm = {
  visitType: null,
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  birthday: "",
  preferredLanguage: "en",
  isFirstVisit: null,
  services: [],
  otherService: "",
  hasAppointment: null,
  appointmentTime: "",
  staffMember: "",
  serviceBooked: "",
  bookingHelp: "",
  tattooColor: "",
  tattooAge: "",
  triedLaser: "",
  triedSaline: "",
  removalGoal: "",
  photo: "",
  skinConcerns: [],
  prescriptionSkincare: "",
  recentTreatment: "",
  confirmFemale: false,
  skinContraindications: "",
  safetyNotes: "",
  referralSource: "",
  referralName: "",
  smsConsent: false,
  emailConsent: false,
  signature: "",
};

export interface ScreenProps {
  lang: Lang;
  form: KioskForm;
  update: (patch: Partial<KioskForm>) => void;
  next: () => void;
  back: () => void;
}
