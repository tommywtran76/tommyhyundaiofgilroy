// Service catalog for Aileen's Beauty. Keys are stored in the database;
// labels are looked up per language at render time.

export type ServiceCategory = "removal" | "pmu" | "facial" | "body" | "other";

export interface ServiceDef {
  key: string;
  category: ServiceCategory;
  // Rough average ticket, used for the revenue-opportunity report (USD)
  estValue: number;
  label: { en: string; vi: string; es: string };
}

export const SERVICES: ServiceDef[] = [
  { key: "eyebrow-tattoo-removal", category: "removal", estValue: 450, label: { en: "Eyebrow Tattoo Removal", vi: "Xóa Xăm Chân Mày", es: "Eliminación de Tatuaje de Cejas" } },
  { key: "microblading-removal", category: "removal", estValue: 450, label: { en: "Microblading Removal", vi: "Xóa Phun Xăm Microblading", es: "Eliminación de Microblading" } },
  { key: "permanent-makeup-removal", category: "removal", estValue: 500, label: { en: "Permanent Makeup Removal", vi: "Xóa Trang Điểm Vĩnh Viễn", es: "Eliminación de Maquillaje Permanente" } },
  { key: "lip-blush", category: "pmu", estValue: 550, label: { en: "Lip Blush", vi: "Phun Môi Collagen", es: "Rubor de Labios" } },
  { key: "eyebrow-services", category: "pmu", estValue: 400, label: { en: "Eyebrow Services", vi: "Dịch Vụ Chân Mày", es: "Servicios de Cejas" } },
  { key: "la-mer-facial", category: "facial", estValue: 350, label: { en: "Luxury La Mer Facial", vi: "Chăm Sóc Da Cao Cấp La Mer", es: "Facial de Lujo La Mer" } },
  { key: "deep-clean-facial", category: "facial", estValue: 180, label: { en: "Deep-Clean Facial", vi: "Chăm Sóc Da Chuyên Sâu", es: "Facial de Limpieza Profunda" } },
  { key: "forever-young-collagen", category: "facial", estValue: 300, label: { en: "Forever Young Collagen Treatment", vi: "Liệu Trình Collagen Trẻ Hóa", es: "Tratamiento de Colágeno Forever Young" } },
  { key: "skin-tag-milia-removal", category: "facial", estValue: 150, label: { en: "Skin Tag or Milia Removal", vi: "Tẩy Mụn Thịt / Mụn Kê", es: "Eliminación de Verrugas o Milia" } },
  { key: "melasma-treatment", category: "facial", estValue: 400, label: { en: "Melasma Treatment", vi: "Điều Trị Nám", es: "Tratamiento de Melasma" } },
  { key: "age-spot-treatment", category: "facial", estValue: 300, label: { en: "Age Spot Treatment", vi: "Điều Trị Đồi Mồi", es: "Tratamiento de Manchas de Edad" } },
  { key: "body-scrub", category: "body", estValue: 200, label: { en: "Body Scrub", vi: "Tẩy Tế Bào Chết Toàn Thân", es: "Exfoliación Corporal" } },
  { key: "head-spa", category: "body", estValue: 150, label: { en: "Head Spa", vi: "Gội Đầu Dưỡng Sinh", es: "Spa Capilar" } },
  { key: "back-acne-treatment", category: "body", estValue: 220, label: { en: "Back Acne Treatment", vi: "Điều Trị Mụn Lưng", es: "Tratamiento de Acné de Espalda" } },
  { key: "gift-card", category: "other", estValue: 100, label: { en: "Gift Card", vi: "Thẻ Quà Tặng", es: "Tarjeta de Regalo" } },
  { key: "consultation", category: "other", estValue: 0, label: { en: "Consultation", vi: "Tư Vấn", es: "Consulta" } },
  { key: "other", category: "other", estValue: 0, label: { en: "Other", vi: "Khác", es: "Otro" } },
];

export const SERVICE_MAP = new Map(SERVICES.map((s) => [s.key, s]));

export function serviceLabel(key: string, lang: "en" | "vi" | "es" = "en"): string {
  return SERVICE_MAP.get(key)?.label[lang] ?? key;
}

export function isRemovalService(key: string): boolean {
  return SERVICE_MAP.get(key)?.category === "removal";
}

export function isFacialService(key: string): boolean {
  return SERVICE_MAP.get(key)?.category === "facial";
}

export const REFERRAL_SOURCES = [
  "google-search",
  "google-maps",
  "instagram",
  "facebook",
  "tiktok",
  "yelp",
  "friend-family",
  "campbell-neighbors",
  "returning-customer",
  "saw-store",
  "event",
  "other",
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCES)[number];

export const REFERRAL_LABELS: Record<ReferralSource, { en: string; vi: string; es: string }> = {
  "google-search": { en: "Google Search", vi: "Tìm kiếm Google", es: "Búsqueda de Google" },
  "google-maps": { en: "Google Maps", vi: "Google Maps", es: "Google Maps" },
  instagram: { en: "Instagram", vi: "Instagram", es: "Instagram" },
  facebook: { en: "Facebook", vi: "Facebook", es: "Facebook" },
  tiktok: { en: "TikTok", vi: "TikTok", es: "TikTok" },
  yelp: { en: "Yelp", vi: "Yelp", es: "Yelp" },
  "friend-family": { en: "Friend or Family", vi: "Bạn bè hoặc người thân", es: "Amigo o Familiar" },
  "campbell-neighbors": { en: "Campbell Neighbors Group", vi: "Nhóm Campbell Neighbors", es: "Grupo Campbell Neighbors" },
  "returning-customer": { en: "Returning Customer", vi: "Khách hàng quay lại", es: "Cliente que Regresa" },
  "saw-store": { en: "Saw the Store", vi: "Thấy cửa tiệm", es: "Vi la Tienda" },
  event: { en: "Event", vi: "Sự kiện", es: "Evento" },
  other: { en: "Other", vi: "Khác", es: "Otro" },
};

export const VISIT_TYPES = ["APPOINTMENT", "CONSULTATION", "WALK_IN", "GIFT_CARD", "ACCOMPANYING"] as const;
export type VisitType = (typeof VISIT_TYPES)[number];

export const CHECKIN_STATUSES = [
  "WAITING",
  "IN_CONSULTATION",
  "IN_SERVICE",
  "COMPLETED",
  "NO_SHOW",
  "FOLLOW_UP_NEEDED",
] as const;
export type CheckInStatus = (typeof CHECKIN_STATUSES)[number];

export const FOLLOW_UP_STAGES = [
  "NEW_LEAD",
  "CONTACT_TODAY",
  "WAITING_REPLY",
  "CONSULT_SCHEDULED",
  "BOOKED",
  "NOT_READY",
  "DO_NOT_CONTACT",
] as const;
export type FollowUpStage = (typeof FOLLOW_UP_STAGES)[number];

export const CUSTOMER_TAGS = [
  "New Lead",
  "Returning Customer",
  "Brow Removal",
  "Facial Client",
  "Body Scrub",
  "Head Spa",
  "Gift Card",
  "VIP",
  "Needs Follow-Up",
  "Consultation Only",
  "Marketing Opt-In",
  "Birthday Month",
] as const;

// Business constants
export const BUSINESS = {
  name: "Aileen's Beauty",
  phone: "650-305-8036",
  phoneDial: "+16503058036",
  website: "https://www.aileennbeauty.com",
  location: "Campbell / San Jose, California",
};
