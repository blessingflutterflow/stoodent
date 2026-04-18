import twilio from "twilio";

export function getTwilioClient() {
  return twilio(
    (process.env.TWILIO_ACCOUNT_SID ?? "").trim(),
    (process.env.TWILIO_AUTH_TOKEN ?? "").trim()
  );
}

export const WHATSAPP_FROM = () => (process.env.TWILIO_WHATSAPP_FROM ?? "").trim();
export const TUTOR_WHATSAPP = () => `whatsapp:${(process.env.TUTOR_WHATSAPP_NUMBER ?? "").trim()}`;

export function toWhatsApp(phone: string) {
  const normalized = phone.startsWith("+") ? phone : `+${phone}`;
  return `whatsapp:${normalized}`;
}

export function normalizePhone(phone: string) {
  return phone.startsWith("+") ? phone : `+${phone}`;
}
