# WhatsApp Message Templates

> Templates must be submitted to Meta for approval before use in production.
> Review time: 2–5 business days.
> Submit via: Twilio Console → Messaging → Content Editor

## Template 1: veettukkar_job_alert

**Purpose:** Notify a worker of a new job matching their skills.
**Category:** UTILITY
**Language:** English (en)

**Body:**
```
New {{1}} job available on {{2}} near {{3}}. Open Veettukkar to accept.
```

**Variables:**
| # | Value | Example |
|---|-------|---------|
| 1 | Skill name | Plumber |
| 2 | Job date | 01 Apr 2026 |
| 3 | Area (geohash prefix) | tdy3v7 |

---

## Template 2: veettukkar_rating_reminder

**Purpose:** Prompt a homeowner to rate the worker after a job.
**Category:** UTILITY
**Language:** English (en)

**Body:**
```
How was the {{1}} job today? Rate your worker in the Veettukkar app.
```

**Variables:**
| # | Value | Example |
|---|-------|---------|
| 1 | Skill name | Painter |

---

## Setup Steps

1. Log into [Twilio Console](https://console.twilio.com)
2. Go to **Messaging → Content Editor** → Create new template
3. Submit each template with the body above and category UTILITY
4. Wait for Meta approval (2–5 days)
5. Copy the Content SID (`HXxxx...`) to Firebase secrets:
   ```
   firebase functions:secrets:set TWILIO_TEMPLATE_JOB_ALERT
   firebase functions:secrets:set TWILIO_TEMPLATE_RATING_REMINDER
   ```
6. Remove `TWILIO_SANDBOX_MODE` from production config

## Local Development

Set `TWILIO_SANDBOX_MODE=true` in your `.env.local`.
This sends freeform messages to the Twilio sandbox number — no template required.
Workers and homeowners must first send "join <sandbox-word>" to the sandbox number.
