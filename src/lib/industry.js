/* Branche eines Google-Profils (06.11.2026, Maximilian) – synchron mit ops/src/industry.ts (Backend).
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

/** Lesbare Namen (Admin, Auswertung). */
export const INDUSTRY_LABEL = {
  gastro: "Gastro", hotel: "Hotel & Unterkunft", medical: "Ärzte & Kliniken", legal: "Anwälte & Recht",
  realestate: "Immobilien", cardealer: "Autohäuser", finance: "Finanz & Versicherung",
  beauty: "Beauty & Wellness", health: "Gesundheit (sonstige)", auto: "Kfz-Service", trades: "Handwerk & Bau",
  retail: "Handel", education: "Bildung", services: "Dienstleistung & Beratung", other: "Sonstige", unknown: "Unbekannt",
};

export const PREMIUM_INDUSTRIES = new Set(["gastro", "hotel", "medical", "legal", "realestate", "cardealer", "finance"]);
export const isPremiumIndustry = (k) => PREMIUM_INDUSTRIES.has(String(k || ""));

const SETS = [
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
const TYPE_MAP = new Map();
for (const [k, list] of SETS) for (const t of list) TYPE_MAP.set(t, k);

/** Einzelner Google-Code → Gruppe (oder null, wenn unbekannt). */
function oneType(t) {
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
export function industryOf(primaryType, types) {
  const p = oneType(String(primaryType || ""));
  if (p) return p;
  const generic = new Set(["point_of_interest", "establishment", "premise", "geocode", "street_address", "political", "locality", "food", "service", "store"]);
  for (const t of Array.isArray(types) ? types : []) { if (generic.has(String(t))) continue; const k = oneType(String(t)); if (k) return k; }
  // „store" o. ä. nur als letzter Ausweg
  for (const t of Array.isArray(types) ? types : []) { const k = oneType(String(t)); if (k) return k; }
  return primaryType || (Array.isArray(types) && types.length) ? "other" : "unknown";
}

