/* Branche eines Google-Profils (06.11.2026, Maximilian) – synchron mit src/lib/industry.js der Website.
 *
 * Quelle: Googles fester Kategorie-Code (Places API: primaryType + types), NICHT der übersetzte Name
 * („Restaurant", „Ristorante", „レストラン" …). Daraus wird eine Branchengruppe.
 *
 * Wofür:
 *  1. Preis: Premium-Branchen zahlen bei Einzelbewertungen +25 % (siehe reviewsPricing.ts → freshPriceFor).
 *  2. Statistik: jede Bestellung bekommt raw.ind (Gruppe) + raw.ptype (Google-Code) → Auswertung nach Branche.
 *
 * Premium (06.11.2026): Gastro, Hotels, Ärzte/Zahnärzte/Kliniken, Anwälte, Immobilien, Autohäuser, Finanz/Versicherung.
 */

export type IndustryKey =
  | "gastro" | "hotel" | "medical" | "legal" | "realestate" | "cardealer" | "finance"
  | "beauty" | "health" | "auto" | "trades" | "retail" | "education" | "services" | "other" | "unknown";

/** Lesbare Namen (Admin, Auswertung). */
export const INDUSTRY_LABEL: Record<IndustryKey, string> = {
  gastro: "Gastro", hotel: "Hotel & Unterkunft", medical: "Ärzte & Kliniken", legal: "Anwälte & Recht",
  realestate: "Immobilien", cardealer: "Autohäuser", finance: "Finanz & Versicherung",
  beauty: "Beauty & Wellness", health: "Gesundheit (sonstige)", auto: "Kfz-Service", trades: "Handwerk & Bau",
  retail: "Handel", education: "Bildung", services: "Dienstleistung & Beratung", other: "Sonstige", unknown: "Unbekannt",
};

export const PREMIUM_INDUSTRIES: ReadonlySet<IndustryKey> = new Set<IndustryKey>(["gastro", "hotel", "medical", "legal", "realestate", "cardealer", "finance"]);
export const isPremiumIndustry = (k: string | null | undefined): boolean => PREMIUM_INDUSTRIES.has(String(k || "") as IndustryKey);

const SETS: [IndustryKey, string[]][] = [
  ["gastro", ["restaurant", "cafe", "coffee_shop", "cafeteria", "bar", "pub", "wine_bar", "cocktail_bar", "lounge_bar", "sports_bar", "irish_pub", "bar_and_grill",
    "meal_takeaway", "meal_delivery", "diner", "steak_house", "food_court", "bistro", "brewpub", "beer_garden", "beer_hall", "tea_house", "juice_shop",
    "ice_cream_shop", "dessert_shop", "sandwich_shop", "bagel_shop", "donut_shop", "acai_shop", "chocolate_shop", "hookah_bar", "night_club", "karaoke", "catering_service", "food_truck"]],
  ["hotel", ["hotel", "lodging", "motel", "resort_hotel", "bed_and_breakfast", "hostel", "guest_house", "inn", "extended_stay_hotel", "cottage", "farmstay",
    "private_guest_room", "budget_japanese_inn", "japanese_inn", "campground", "camping_cabin", "rv_park", "mobile_home_park", "apartment_hotel", "serviced_apartment"]],
  ["medical", ["doctor", "dentist", "dental_clinic", "hospital", "general_hospital", "medical_clinic", "medical_center", "medical_lab", "plastic_surgeon",
    "orthodontist", "dermatologist", "pediatrician", "psychiatrist", "surgeon", "cardiologist", "ophthalmologist", "gynecologist", "urologist", "radiologist"]],
  ["legal", ["lawyer", "legal_services", "attorney", "law_firm", "notary_public", "notary"]],
  ["realestate", ["real_estate_agency", "real_estate_agent", "property_management_company", "real_estate_developer"]],
  ["cardealer", ["car_dealer", "used_car_dealer", "motorcycle_dealer", "truck_dealer", "rv_dealer"]],
  ["finance", ["accounting", "bank", "insurance_agency", "insurance_company", "financial_consultant", "financial_planner", "finance", "tax_preparation_service",
    "mortgage_broker", "loan_agency", "investment_company", "credit_union", "currency_exchange"]],
  ["beauty", ["beauty_salon", "hair_salon", "barber_shop", "hair_care", "nail_salon", "spa", "massage", "massage_spa", "wellness_center", "skin_care_clinic",
    "tanning_studio", "beautician", "makeup_artist", "tattoo_shop", "piercing_shop", "sauna", "day_spa", "lash_studio", "eyebrow_bar"]],
  ["health", ["physiotherapist", "chiropractor", "pharmacy", "drugstore", "veterinary_care", "psychologist", "optician", "hearing_aid_store", "health", "fitness_center",
    "gym", "yoga_studio", "nutritionist", "speech_pathologist", "occupational_therapist", "acupuncturist", "midwife", "nursing_home"]],
  ["auto", ["car_repair", "car_wash", "car_rental", "auto_parts_store", "tire_shop", "gas_station", "electric_vehicle_charging_station", "parking", "auto_body_shop", "driving_school"]],
  ["trades", ["electrician", "plumber", "roofing_contractor", "general_contractor", "painter", "locksmith", "moving_company", "carpenter", "hvac_contractor",
    "landscaper", "construction_company", "cleaning_service", "house_cleaning_service", "pest_control_service", "window_installer", "flooring_contractor",
    "home_builder", "contractor", "handyman", "glazier", "tiler", "storage"]],
  ["retail", ["store", "clothing_store", "jewelry_store", "furniture_store", "shoe_store", "electronics_store", "supermarket", "grocery_store", "convenience_store",
    "department_store", "hardware_store", "home_goods_store", "book_store", "pet_store", "florist", "gift_shop", "liquor_store", "shopping_mall", "bakery",
    "butcher_shop", "bicycle_store", "sporting_goods_store", "cell_phone_store", "discount_store", "market", "wholesaler", "home_improvement_store", "womens_clothing_store", "mens_clothing_store"]],
  ["education", ["school", "primary_school", "secondary_school", "university", "preschool", "educational_institution", "language_school", "tutoring_service", "music_school", "dance_school", "child_care_agency"]],
  ["services", ["consultant", "corporate_office", "employment_agency", "travel_agency", "marketing_agency", "advertising_agency", "manufacturer", "software_company",
    "it_services", "photographer", "event_planner", "wedding_venue", "event_venue", "tailor", "laundry", "dry_cleaning", "pet_care", "dog_trainer", "courier_service",
    "funeral_home", "security_service", "translator", "printing_service", "design_agency", "web_designer", "coworking_space", "telecommunications_service_provider"]],
];
const TYPE_MAP = new Map<string, IndustryKey>();
for (const [k, list] of SETS) for (const t of list) TYPE_MAP.set(t, k);

/** Einzelner Google-Code → Gruppe (oder null, wenn unbekannt). */
function oneType(t: string): IndustryKey | null {
  const s = String(t || "").trim().toLowerCase();
  if (!s) return null;
  const hit = TYPE_MAP.get(s);
  if (hit) return hit;
  if (s.endsWith("_restaurant") || s.endsWith("_cafe") || s.endsWith("_bar") || s.endsWith("_pub")) return "gastro";
  if (s.endsWith("_hotel") || s.endsWith("_inn")) return "hotel";
  if (s.endsWith("_dentist") || (s.endsWith("_clinic") && !s.includes("skin_care")) || s.endsWith("_doctor") || s.endsWith("_hospital")) return "medical";
  if (s.endsWith("_lawyer") || s.endsWith("_attorney")) return "legal";
  if (s.endsWith("_store") || s.endsWith("_shop")) return "retail";
  if (s.endsWith("_contractor")) return "trades";
  if (s.endsWith("_school")) return "education";
  return null;
}

/** Google-Kategorie (primaryType, dann types in Reihenfolge) → Branchengruppe. Ohne Daten: "unknown". */
export function industryOf(primaryType?: string | null, types?: readonly string[] | null): IndustryKey {
  const p = oneType(String(primaryType || ""));
  if (p) return p;
  const generic = new Set(["point_of_interest", "establishment", "premise", "geocode", "street_address", "political", "locality", "food", "service", "store"]);
  for (const t of Array.isArray(types) ? types : []) { if (generic.has(String(t))) continue; const k = oneType(String(t)); if (k) return k; }
  // „store" o. ä. nur als letzter Ausweg
  for (const t of Array.isArray(types) ? types : []) { const k = oneType(String(t)); if (k) return k; }
  return primaryType || (Array.isArray(types) && types.length) ? "other" : "unknown";
}

/** Fallback für Altdaten ohne Google-Code: übersetzter Kategorie-Name (DE/EN/IT/FR/ES/NL/PT/SV/DA/NO/JA), grob. */
const DISPLAY_RULES: [IndustryKey, RegExp][] = [
  ["gastro", /restaurant|ristorante|restaurante|trattoria|pizzer|sushi|imbiss|buffet|caf[eé]|coffee|bistro|\bbar\b|pub\b|kneipe|gasthaus|gasthof|brasserie|taverna|grill|kebab|burger|bäckerei-?caf|レストラン|カフェ|居酒屋/i],
  ["hotel", /hotel|motel|hostel|pension|ferienwohnung|apartment|camping|b&b|bed and breakfast|lodge|resort|guest ?house|ホテル|旅館/i],
  ["medical", /doctor|arzt|ärzt|zahn|dentist|dental|clinic|klinik|poliklinik|medical|médic|medic[oa]|läkare|lege|læge|hospital|krankenhaus|ospedale|医|歯科|クリニック|chirurg|surgeon|dermatolog|orthodont|laborator/i],
  ["legal", /lawyer|anwalt|anwält|attorney|avvocat|avocat|abogad|advocaat|advokat|notar|law firm|kanzlei|弁護士/i],
  ["realestate", /immobil|real estate|inmobiliar|imobili|makelaar|fastighetsm|ejendomsm|eiendomsm|不動産/i],
  ["cardealer", /car dealer|autohändler|autohaus|concessionari|concession|concesionari|bilåterförs|bilforhand|autodealer|中古車|自動車販売/i],
  ["finance", /bank|versicher|insurance|assicura|assurance|seguro|steuerber|accountant|accounting|buchhalt|finanz|financ|kredit|loan|保険|会計/i],
  ["beauty", /beauty|schönheit|kosmetik|cosmetic|friseur|coiffeur|hair|cabeleir|parrucch|peluquer|barber|nail|nagel|spa\b|massage|wellness|salon|tattoo|美容|エステ/i],
  ["health", /physio|chiropr|kinési|apothek|pharmac|farmac|veterin|tierarzt|psycholog|optiker|optician|fitness|gym|yoga|santé|gesundheit|salute|salud|整体/i],
  ["auto", /car repair|kfz|werkstatt|car wash|autowäsch|tire|reifen|car rental|autovermiet|tankstelle|gas station|fahrschule|auto/i],
  ["trades", /contractor|unternehmer|dachdeck|roof|elektr|electric|plumb|install|maler|painter|tischler|schreiner|bau|construct|reinigung|cleaning|umzug|moving|schlüssel|locksmith|handwerk/i],
  ["retail", /store|geschäft|shop|laden|juwel|jewel|möbel|furniture|boutique|negozio|tienda|magasin|winkel|butik|bäcker|bakery|florist|blumen|supermarkt|店/i],
  ["education", /education|bildung|school|schule|scuola|escuela|école|university|universität|akademie|academy|kindergarten|学校|塾/i],
  ["services", /consult|berat|agentur|agency|agenzia|service|dienstleist|office|büro|manufactur|hersteller|tailor|schneider|photograph|fotograf|event|サービス|コンサル|企業/i],
];
export function industryFromDisplay(text?: string | null): IndustryKey {
  const s = String(text || "").trim();
  if (!s) return "unknown";
  for (const [k, re] of DISPLAY_RULES) if (re.test(s)) return k;
  return "other";
}
