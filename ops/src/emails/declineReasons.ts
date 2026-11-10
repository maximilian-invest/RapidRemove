/* Verständliche Ablehnungsgründe für Kunden (10.11.2026, Maximilian: „der Kunde soll immer im Detail wissen, was das Problem ist").
   Stripe-Codes (decline_code / code) → Kategorie → Text in 11 Sprachen. Genutzt in Mails und im Dashboard. */

export type ReasonKey = "funds" | "limit" | "expired" | "wrongdata" | "blocked" | "notallowed" | "security" | "bank";

export function reasonKeyOf(code?: string | null, message?: string | null): ReasonKey {
  const c = String(code || "").toLowerCase();
  const m = String(message || "").toLowerCase();
  if (["insufficient_funds", "partner_insufficient_funds"].includes(c) || /insufficient funds|not enough funds|nicht genug/.test(m)) return "funds";
  if (["card_velocity_exceeded", "withdrawal_count_limit_exceeded", "amount_too_large"].includes(c) || /limit was exceeded|credit limit/.test(m)) return "limit";
  if (["expired_card"].includes(c)) return "expired";
  if (["incorrect_number", "invalid_number", "incorrect_cvc", "invalid_cvc", "invalid_expiry_month", "invalid_expiry_year", "incorrect_zip"].includes(c)) return "wrongdata";
  if (["lost_card", "stolen_card", "pickup_card", "restricted_card", "revocation_of_authorization", "revocation_of_all_authorizations", "stop_payment_order"].includes(c)) return "blocked";
  if (["transaction_not_allowed", "card_not_supported", "currency_not_supported", "invalid_account", "not_permitted", "service_not_allowed", "new_account_information_available"].includes(c)) return "notallowed";
  if (["fraudulent", "merchant_blacklist", "security_violation", "highest_risk_level"].includes(c) || /risk|fraud/.test(m)) return "security";
  return "bank";
}

const R: Record<string, Record<ReasonKey, string>> = {
  en: {
    funds: "Not enough balance or credit available on the card.",
    limit: "The card's spending or transaction limit has been reached.",
    expired: "The card has expired.",
    wrongdata: "The card details don't match (e.g. card number, expiry date or security code) – possibly the card was replaced.",
    blocked: "The card has been blocked by the bank (e.g. reported lost or replaced).",
    notallowed: "The card isn't enabled for this kind of payment (e.g. online or international payments).",
    security: "The payment was declined for security reasons by the bank or payment provider.",
    bank: "Your bank declined the payment without giving a specific reason.",
  },
  de: {
    funds: "Auf der Karte ist nicht genug Guthaben bzw. Kreditrahmen verfügbar.",
    limit: "Das Ausgabe- bzw. Transaktionslimit der Karte ist erreicht.",
    expired: "Die Karte ist abgelaufen.",
    wrongdata: "Die Kartendaten stimmen nicht (z. B. Kartennummer, Ablaufdatum oder Prüfziffer) – eventuell wurde die Karte ersetzt.",
    blocked: "Die Karte wurde von der Bank gesperrt (z. B. als verloren gemeldet oder ersetzt).",
    notallowed: "Die Karte ist für diese Art von Zahlung nicht freigeschaltet (z. B. Online- oder Auslandszahlungen).",
    security: "Die Zahlung wurde von der Bank bzw. dem Zahlungsanbieter aus Sicherheitsgründen abgelehnt.",
    bank: "Ihre Bank hat die Zahlung ohne genaue Begründung abgelehnt.",
  },
  es: {
    funds: "No hay saldo o crédito suficiente en la tarjeta.",
    limit: "Se ha alcanzado el límite de gasto o de operaciones de la tarjeta.",
    expired: "La tarjeta ha caducado.",
    wrongdata: "Los datos de la tarjeta no coinciden (p. ej., número, fecha de caducidad o código de seguridad); quizá la tarjeta se sustituyó.",
    blocked: "El banco ha bloqueado la tarjeta (p. ej., por pérdida o sustitución).",
    notallowed: "La tarjeta no está habilitada para este tipo de pago (p. ej., pagos online o internacionales).",
    security: "El banco o el proveedor de pago rechazó el pago por motivos de seguridad.",
    bank: "Tu banco rechazó el pago sin indicar un motivo concreto.",
  },
  fr: {
    funds: "Le solde ou le crédit disponible sur la carte est insuffisant.",
    limit: "Le plafond de dépenses ou de transactions de la carte est atteint.",
    expired: "La carte a expiré.",
    wrongdata: "Les données de la carte ne correspondent pas (numéro, date d'expiration ou code de sécurité) – la carte a peut-être été remplacée.",
    blocked: "La carte a été bloquée par la banque (p. ex. déclarée perdue ou remplacée).",
    notallowed: "La carte n'est pas activée pour ce type de paiement (p. ex. paiements en ligne ou internationaux).",
    security: "Le paiement a été refusé pour des raisons de sécurité par la banque ou le prestataire de paiement.",
    bank: "Ta banque a refusé le paiement sans motif précis.",
  },
  it: {
    funds: "Sulla carta non c'è saldo o credito sufficiente.",
    limit: "È stato raggiunto il limite di spesa o di transazioni della carta.",
    expired: "La carta è scaduta.",
    wrongdata: "I dati della carta non corrispondono (es. numero, scadenza o codice di sicurezza): forse la carta è stata sostituita.",
    blocked: "La carta è stata bloccata dalla banca (es. segnalata come smarrita o sostituita).",
    notallowed: "La carta non è abilitata a questo tipo di pagamento (es. pagamenti online o internazionali).",
    security: "Il pagamento è stato rifiutato per motivi di sicurezza dalla banca o dal fornitore di pagamento.",
    bank: "La tua banca ha rifiutato il pagamento senza indicare un motivo preciso.",
  },
  nl: {
    funds: "Er is niet genoeg saldo of krediet beschikbaar op de kaart.",
    limit: "De bestedings- of transactielimiet van de kaart is bereikt.",
    expired: "De kaart is verlopen.",
    wrongdata: "De kaartgegevens kloppen niet (bijv. kaartnummer, vervaldatum of beveiligingscode) – mogelijk is de kaart vervangen.",
    blocked: "De kaart is door de bank geblokkeerd (bijv. als verloren gemeld of vervangen).",
    notallowed: "De kaart is niet geactiveerd voor dit soort betalingen (bijv. online of internationale betalingen).",
    security: "De betaling is om veiligheidsredenen geweigerd door de bank of de betaalprovider.",
    bank: "Uw bank heeft de betaling zonder specifieke reden geweigerd.",
  },
  pt: {
    funds: "Não há saldo ou crédito suficiente no cartão.",
    limit: "Foi atingido o limite de gastos ou de transações do cartão.",
    expired: "O cartão expirou.",
    wrongdata: "Os dados do cartão não coincidem (p. ex. número, validade ou código de segurança) – talvez o cartão tenha sido substituído.",
    blocked: "O cartão foi bloqueado pelo banco (p. ex. dado como perdido ou substituído).",
    notallowed: "O cartão não está ativado para este tipo de pagamento (p. ex. pagamentos online ou internacionais).",
    security: "O pagamento foi recusado por motivos de segurança pelo banco ou pelo fornecedor de pagamento.",
    bank: "O teu banco recusou o pagamento sem indicar um motivo concreto.",
  },
  ja: {
    funds: "カードの残高またはご利用可能枠が不足しています。",
    limit: "カードの利用限度額または取引回数の上限に達しています。",
    expired: "カードの有効期限が切れています。",
    wrongdata: "カード情報（カード番号・有効期限・セキュリティコードなど）が一致しません。カードが再発行された可能性があります。",
    blocked: "カードが銀行により利用停止されています（紛失届・再発行など）。",
    notallowed: "このカードはこの種類の決済（オンライン決済・海外決済など）に対応していません。",
    security: "銀行または決済会社によりセキュリティ上の理由で拒否されました。",
    bank: "カード会社が理由を示さずに決済を拒否しました。",
  },
  sv: {
    funds: "Det finns inte tillräckligt med saldo eller kredit på kortet.",
    limit: "Kortets köp- eller transaktionsgräns är nådd.",
    expired: "Kortet har gått ut.",
    wrongdata: "Kortuppgifterna stämmer inte (t.ex. kortnummer, utgångsdatum eller säkerhetskod) – kortet kan ha ersatts.",
    blocked: "Kortet har spärrats av banken (t.ex. anmält förlorat eller ersatt).",
    notallowed: "Kortet är inte aktiverat för den här typen av betalning (t.ex. online- eller utlandsbetalningar).",
    security: "Betalningen nekades av säkerhetsskäl av banken eller betalleverantören.",
    bank: "Din bank nekade betalningen utan att ange något skäl.",
  },
  da: {
    funds: "Der er ikke nok saldo eller kredit på kortet.",
    limit: "Kortets forbrugs- eller transaktionsgrænse er nået.",
    expired: "Kortet er udløbet.",
    wrongdata: "Kortoplysningerne passer ikke (fx kortnummer, udløbsdato eller sikkerhedskode) – kortet er muligvis blevet erstattet.",
    blocked: "Kortet er spærret af banken (fx meldt bortkommet eller erstattet).",
    notallowed: "Kortet er ikke aktiveret til denne type betaling (fx online- eller udlandsbetalinger).",
    security: "Betalingen blev afvist af sikkerhedsgrunde af banken eller betalingsudbyderen.",
    bank: "Din bank afviste betalingen uden at angive en bestemt grund.",
  },
  no: {
    funds: "Det er ikke nok saldo eller kreditt på kortet.",
    limit: "Kortets bruks- eller transaksjonsgrense er nådd.",
    expired: "Kortet er utløpt.",
    wrongdata: "Kortopplysningene stemmer ikke (f.eks. kortnummer, utløpsdato eller sikkerhetskode) – kortet kan ha blitt erstattet.",
    blocked: "Kortet er sperret av banken (f.eks. meldt tapt eller erstattet).",
    notallowed: "Kortet er ikke aktivert for denne typen betaling (f.eks. nett- eller utenlandsbetalinger).",
    security: "Betalingen ble avvist av sikkerhetsgrunner av banken eller betalingsleverandøren.",
    bank: "Banken din avviste betalingen uten å oppgi en bestemt grunn.",
  },
};

export const reasonText = (lang: string | undefined | null, key: ReasonKey) => (R[String(lang || "en").slice(0, 2)] || R.en)[key] || R.en.bank;
