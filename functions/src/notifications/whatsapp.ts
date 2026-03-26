import * as twilio from 'twilio';

// Twilio credentials come from Firebase secret manager / environment config.
// Set via: firebase functions:secrets:set TWILIO_ACCOUNT_SID etc.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

// TWILIO_SANDBOX_MODE=true → send freeform messages (dev/sandbox only)
// Production must use pre-approved Meta templates.
const sandboxMode = process.env.TWILIO_SANDBOX_MODE === 'true';

/**
 * Build a Twilio client. Returns null if credentials are not configured.
 */
function getClient(): ReturnType<typeof twilio.default> | null {
  if (!accountSid || !authToken) return null;
  return twilio.default(accountSid, authToken);
}

/**
 * Send a freeform WhatsApp message.
 * Only valid within a 24-hour session window (user sent a message first)
 * or in Twilio sandbox mode.
 */
export async function sendWhatsApp(toPhone: string, body: string): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn('[WhatsApp] Twilio credentials not set — skipping WhatsApp send');
    return;
  }

  const to = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`;
  await client.messages.create({ from: fromNumber, to, body });
}

/**
 * Send the "job alert" template to a worker.
 *
 * Template name: veettukkar_job_alert
 * Body: "New {{1}} job available on {{2}} near {{3}}. Open Veettukkar to accept."
 * Variables: skill, date, area
 *
 * In sandbox mode, falls back to freeform.
 */
export async function sendJobAlertWhatsApp(
  toPhone: string,
  skill: string,
  date: string,
  area: string
): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn('[WhatsApp] Twilio credentials not set — skipping job alert');
    return;
  }

  const to = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`;

  if (sandboxMode) {
    // Sandbox: freeform only (no template required)
    await client.messages.create({
      from: fromNumber,
      to,
      body: `New ${skill} job available on ${date} near ${area}. Open Veettukkar to accept.`,
    });
  } else {
    // Production: use pre-approved Meta content template
    await client.messages.create({
      from: fromNumber,
      to,
      contentSid: process.env.TWILIO_TEMPLATE_JOB_ALERT,
      contentVariables: JSON.stringify({ 1: skill, 2: date, 3: area }),
    });
  }
}

/**
 * Send the "rating reminder" template to a homeowner.
 *
 * Template name: veettukkar_rating_reminder
 * Body: "How was the {{1}} job today? Rate your worker in the Veettukkar app."
 * Variables: skill
 *
 * In sandbox mode, falls back to freeform.
 */
export async function sendRatingReminderWhatsApp(
  toPhone: string,
  skill: string
): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn('[WhatsApp] Twilio credentials not set — skipping rating reminder');
    return;
  }

  const to = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`;

  if (sandboxMode) {
    await client.messages.create({
      from: fromNumber,
      to,
      body: `How was the ${skill} job today? Rate your worker in the Veettukkar app.`,
    });
  } else {
    await client.messages.create({
      from: fromNumber,
      to,
      contentSid: process.env.TWILIO_TEMPLATE_RATING_REMINDER,
      contentVariables: JSON.stringify({ 1: skill }),
    });
  }
}
