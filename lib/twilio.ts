import twilio from "twilio";

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM!;
export const TUTOR_WHATSAPP = `whatsapp:${process.env.TUTOR_WHATSAPP_NUMBER}`;
export const SANDBOX_KEYWORD = process.env.TWILIO_SANDBOX_KEYWORD ?? "";

export function toWhatsApp(phone: string) {
  const normalized = phone.startsWith("+") ? phone : `+${phone}`;
  return `whatsapp:${normalized}`;
}

export function normalizePhone(phone: string) {
  return phone.startsWith("+") ? phone : `+${phone}`;
}
