/** Formats integer poisha without allowing floating-point money in domain models. */
export function formatMoney(minor: number, locale: "en" | "bn" = "en"): string {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

/** Formats boundary ISO dates in the business timezone used by both branches. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeZone: "Asia/Dhaka",
  }).format(new Date(iso));
}
