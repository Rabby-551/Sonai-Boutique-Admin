/** Masks customer contact details in list views while preserving operational recognition. */
export function maskPhone(phone: string) {
  return `${phone.slice(0, 6)}••••${phone.slice(-3)}`;
}
export function maskEmail(email: string | null) {
  if (!email) return "—";
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}•••@${domain}`;
}
