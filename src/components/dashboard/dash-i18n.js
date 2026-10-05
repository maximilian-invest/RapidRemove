/* Texte der Kunden-App (/my-reviews). Englisch = Quelle; weitere Sprachen in dash-i18n-langs.js.
   Platzhalter: {n}, {name}, {amount}, {price}, {date}, {r}, {id}. Mengenabhängige Texte als
   { one, other } (Auswahl über Intl.PluralRules der Sprache, fehlende Form → other). */
import LANGS from "./dash-i18n-langs";
import APP from "./dash-i18n-app";

export const EN = {
  // Zeit
  now: "Now", minAgo: "{n} min ago", hAgo: "{n} h ago", yesterday: "Yesterday", today: "Today",
  durM: "{n} min", durH: "{n} h", durD: "{n} d",
  // Status (intern → Kunde) + Erklärung
  st_new: "Being checked", st_working: "In progress", st_removed: "Removed", st_notpossible: "Not removable",
  st_software: "Needs your decision", st_sw_accepted: "Specialist removal running", st_sw_declined: "Declined", st_cancelled: "Cancelled",
  why_new: "We’re checking whether this review can be removed.",
  why_working: "We’re working on the removal right now.",
  why_removed: "This review is gone from Google.",
  why_notpossible: "This review can’t be removed. You won’t be charged.",
  why_software: "This one needs our specialist partner.",
  why_sw_accepted: "Commissioned – our specialist partner is on it.",
  why_sw_declined: "You declined. Nothing to pay.",
  why_cancelled: "This review was cancelled.",
  paidSuffix: "Paid", toPaySuffix: "{amount} to pay",
  // Login
  loginTitle: "Your reviews", loginSub: "Log in with the email and password from your order confirmation.",
  newPwTitle: "New password", newPwSub: "Enter your email and we’ll send you a new password.",
  email: "Email", password: "Password", login: "Log in", sendNewPw: "Send new password", backToLogin: "Back to log in", forgot: "Forgot password?",
  magicExpired: "This login link has expired – please log in, or tap “Forgot password?”.",
  resetSent: "If there’s an account for this email, we’ve just sent you a link to set a new password.", firstTime: "First time here? Tap “Forgot password?” – we’ll email you a link to set your password.", setPwTitle: "Set a new password", setPwSub: "Choose a new password with at least 8 characters.", newPassword: "New password", savePw: "Save password", pwTooShort: "Please use at least 8 characters.", resetInvalid: "This link is invalid or has expired. Please request a new one.", pwSaved: "Password saved – you’re logged in", changePw: "Change password", changePwSub: "We’ll email you a secure link", linkSent: "Link sent – please check your inbox", statusChanged: "Status changed", statusChangedSub: { one: "{n} review has a new status", other: "{n} reviews have a new status" }, gotIt: "Got it", showPw: "Show password", hidePw: "Hide password",
  tooMany: "Too many attempts – please wait a few minutes.", genericErr: "Something went wrong – please try again.", wrongLogin: "Email or password is wrong.",
  // Meldungen
  tPaymentSw: "Payment received – our specialist is on it", tPaid: "Paid – thank you",
  loadErr: "Couldn’t load your reviews. Please try again in a moment.", tryAgain: "Try again",
  payUnavailable: "Payment isn’t available right now – please contact us.", nothingToPay: "Nothing to pay here anymore.", checkoutOpened: "Checkout opened in a new tab",
  // Home
  hi: "Hi {name}", hiNoName: "Hi",
  removedSoFar: { one: "{r} of {n} review removed so far", other: "{r} of {n} reviews removed so far" },
  problemOrders: { one: "Problem with {n} order", other: "Problem with {n} orders" },
  needDecision: { one: "{n} review needs your decision", other: "{n} reviews need your decision" },
  yourOrders: "Your orders", seeAll: "See all", actionNeeded: "Action needed", inProgressN: "{n} in progress", noOrders: "No orders yet.",
  activity: "Activity", activityEmpty: "Updates show up here.",
  act_decision: "Decision needed", act_working: "Working on it", act_specialist: "Specialist on it", act_removed: "Review removed",
  googleReview: "Google review", orderN: "Order {id}",
  // To-pay-Karte
  toPay: "To pay",
  removedEach: { one: "{n} review removed · {price} each", other: "{n} reviews removed · {price} each" },
  removedCount: { one: "{n} review removed", other: "{n} reviews removed" },
  remaining: { one: "Remaining {n} review", other: "Remaining {n} reviews" },
  pay: "Pay", payNow: "Pay now", allPaid: "All paid", due: "{amount} due",
  remainingInProgress: { one: "Remaining {n} review in progress", other: "Remaining {n} reviews in progress" },
  nothingOpen: "Nothing open right now",
  prepayTitle: { one: "Prepayment · {n} review without text", other: "Prepayment · {n} reviews without text" },
  prepaySub: "99 % success · full refund if not removed within 14 days", payAmount: "Pay {amount}",
  // Orders
  orders: "Orders", f_all: "All", f_open: "Active", f_done: "Completed", noOrdersHere: "No orders here.",
  // Payments
  payments: "Payments", history: "History", h_software: "Specialist removal", h_deposit: "Prepayment", h_invoice: "Removal",
  hReviews: { one: "{n} review", other: "{n} reviews" }, noPayments: "No payments yet.",
  // Account
  account: "Account", pkLogin: "{name} login", pkOn: "On for this device", pkOff: "Log in without a password",
  pkIsOn: "{name} login is on", pkAlready: "{name} login is already on",
  help: "Help & contact", helpSub: "We usually reply within a few hours", invoices: "Invoices", invoicesSub: "Sent by email after each payment",
  privacy: "Privacy", logout: "Log out",
  // Auftrag
  ordered: "Ordered {date}", removedOf: "{r} of {n} removed", stillInProgress: "{n} still in progress", cancelled: "Cancelled", completed: "Completed",
  needYou: { one: "{n} review needs you", other: "{n} reviews need you" }, tapToSee: "Tap to see what’s going on",
  reviews: "Reviews", noText: "No review text", close: "Close", showProblem: "Show problem", openGoogle: "Open on Google",
  // Spezialisten-Flow
  f0k: "What happened",
  f0h: { one: "Google is protecting {n} of your reviews", other: "Google is protecting {n} of your reviews" },
  f0p1: "We tried our standard removal, but Google declined it. This happens when a review is worded carefully enough that it doesn’t break Google’s rules on its own.",
  f0p2: "There’s still a way – and you decide if you want it.",
  f1k: "Your options",
  f1h: { one: "A specialist can still remove it", other: "A specialist can still remove them" },
  f1p: "For cases like this we work with a vetted external partner who specialises in hard-to-remove reviews and uses dedicated tools we don’t run ourselves.",
  feat1t: "Vetted specialist", feat1s: "A partner we’ve worked with on many cases – we stay your contact throughout.",
  feat2t: "Transparent price", feat2s: "The price mainly covers the specialist’s work. It’s paid upfront because we commission them right away.",
  feat3t: "99 % success rate", feat3s: "If a review isn’t removed within 14 days at the latest, you get a full refund.",
  feat4t: "Usually within a few days", feat4s: "Takes a bit longer than our standard removal.",
  optSw: "Specialist removal", optSwSub: "per review · paid upfront · invoice included",
  optNo: "No thanks", optNoSub: "The review stays online – no cost, no obligation",
  f2k: "Choose", f2h: "Which ones should we remove?", f2p: "You decide per review. Tap to deselect any you’d rather leave.",
  total: "Total", cont: "Continue", contPay: "Continue to payment", declineAll: "Decline all · {amount}",
  f3k: "Payment", f3h: "Pay {amount} and we commission the specialist today",
  f3p: { one: "{n} specialist removal", other: "{n} specialist removals" }, declinedN: "{n} declined",
  card: "Card", totalToday: "Total today",
  secure: "Secure payment · Invoice by email · Full refund if not removed within 14 days", payBtn: "Pay {amount}",
  f4hDeclined: "Done – nothing to pay", f4hPaid: "You’re all set", f4hWait: "Almost done",
  f4pDeclined: "The reviews stay online and you won’t be charged.",
  f4pPaid: { one: "We received {amount} and have commissioned our specialist for {n} review. You’ll see every update in Activity.", other: "We received {amount} and have commissioned our specialist for {n} reviews. You’ll see every update in Activity." },
  f4pWait: "Finish the payment in the new tab. This page updates by itself once we’ve received it.",
  openAgain: "Open payment again", done: "Done",
  // Tabs
  tabHome: "Home", tabOrders: "Orders", tabPay: "Payments", tabAcc: "Account",
  // Face ID / Passkey (Name des Geräts wird als {name} eingesetzt: „Face ID", „Touch ID" oder nameFingerprint/namePasskey)
  nameFingerprint: "fingerprint", namePasskey: "passkey",
  pkTitle: "Log in faster with {name}", pkText: "Next time just tap “Log in with {name}” – no password needed. You can still use your password anytime.",
  pkTurnOn: "Turn on {name}", notNow: "Not now", pkLoginBtn: "Log in with {name}",
  pkErrUnknown: "This passkey isn’t linked to an account anymore – please log in with your password.",
  pkErr: "That didn’t work – please log in with your password.",
};

export const DASH_LANGS = ["en", ...Object.keys(LANGS)];
const LOCALE = { en: "en-US", de: "de-AT", es: "es-ES", fr: "fr-FR", it: "it-IT", nl: "nl-NL", pt: "pt-PT", ja: "ja-JP", sv: "sv-SE", da: "da-DK", no: "nb-NO" };
export const localeOf = (lang) => LOCALE[lang] || "en-US";

/** Sprache wählen: Bestellung → gemerkte → Browser → Englisch. */
export function pickLang(...cands) {
  for (const c of cands) {
    const l = String(c || "").toLowerCase().slice(0, 2).replace("nb", "no").replace("nn", "no");
    if (l === "en" || LANGS[l]) return l;
  }
  return "en";
}

/** t(key, vars) für eine Sprache. */
export function makeT(lang) {
  const D = { ...EN, ...APP.en, ...(LANGS[lang] || {}), ...(APP[lang] || {}) };
  const pr = new Intl.PluralRules(localeOf(lang));
  return (key, vars = {}) => {
    let v = D[key] ?? EN[key] ?? APP.en[key] ?? key;
    if (v && typeof v === "object") v = v[pr.select(Number(vars.n ?? 0))] ?? v.other ?? v.one;
    return String(v).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
  };
}
