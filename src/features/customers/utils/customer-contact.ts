/** Normalizes supported Bangladesh mobile formats to +8801XXXXXXXXX. */
export function normalizeBangladeshPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("880") ? digits.slice(3) : digits;
  const normalized = local.startsWith("0") ? local : `0${local}`;
  if (!/^01\d{9}$/.test(normalized)) throw new Error("INVALID_PHONE");
  return `+88${normalized}`;
}

export const maskCustomerPhone = (phone: string) =>
  `${phone.slice(0, 6)}*****${phone.slice(-2)}`;

export const maskCustomerEmail = (email: string | null) => {
  if (!email) return "—";
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
};
