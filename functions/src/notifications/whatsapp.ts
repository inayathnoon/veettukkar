import * as twilio from 'twilio';

// Twilio credentials come from Firebase secret manager / environment config.
// Set via: firebase functions:secrets:set TWILIO_ACCOUNT_SID etc.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

/**
 * Send a WhatsApp message via Twilio.
 * Falls back silently if credentials are not configured (sandbox / dev).
 */
export async function sendWhatsApp(toPhone: string, body: string): Promise<void> {
  if (!accountSid || !authToken) {
    console.warn('[WhatsApp] Twilio credentials not set — skipping WhatsApp send');
    return;
  }

  const client = twilio.default(accountSid, authToken);
  const to = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`;

  await client.messages.create({ from: fromNumber, to, body });
}
