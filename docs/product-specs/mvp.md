# MVP Spec: Veettukkar — Kerala's Home Services Marketplace

## Overview

Veettukkar is a Malayalam-first mobile app that connects Kerala homeowners with verified local daily-wage workers — coconut tree climbers, house painters, cleaners, cement construction workers, plumbers, and electricians. Homeowners post a job; nearby workers are notified and accept. Payment stays in cash, as it always has been. The app handles matching, trust, and reliability — the three things informal WhatsApp-based hiring cannot.

---

## Problem

Homeowners in Kerala struggle to find reliable daily-wage workers on short notice. The current method — asking neighbours, posting in WhatsApp groups, relying on personal contacts — is slow, inconsistent, and breaks down completely for homeowners new to an area or looking for a niche worker type (like a coconut tree climber).

Workers suffer the flip side: their income is capped by their personal network. A skilled plumber in Thrissur may have zero jobs on Tuesday and four conflicting enquiries on Wednesday — all because there is no mechanism that distributes demand evenly across available supply.

The specific pain:
- **For homeowners:** "I need a plumber tomorrow morning — my usual contact isn't picking up and I don't know who else to call."
- **For workers:** "I'm free today but nobody in my contact list needs work today."

This is not a technology gap — it's a discovery gap. The labour and the demand exist. What's missing is the routing layer.

---

## Target Users

**Primary — Homeowners in Kerala**
Families who own homes and regularly need occasional skilled/semi-skilled household work. This includes new homeowners who haven't built a local network yet, NRI families with homes maintained by relatives, and urban professionals with limited time to manage informal referral chains.

**Secondary — Daily-Wage Workers in Kerala**
Skilled and semi-skilled workers across 6 categories who work by the day or half-day for cash:
- Coconut tree climbers
- House painters
- Cleaners (household)
- Cement construction workers / masons
- Plumbers
- Electricians

This includes both local Keralite workers and the ~2.5 million interstate migrant workers who form the backbone of Kerala's construction and home maintenance workforce.

---

## Solution

Veettukkar is a demand-driven job-request marketplace:

1. **Homeowner posts a job** — skill category, date, duration (half-day or full-day), location, optional note. Urgent jobs can be flagged.
2. **Nearby workers are notified** — workers within ~10km who have that skill and are free on that date get a push notification + WhatsApp fallback.
3. **Worker accepts** — first accepted match is confirmed. Homeowner gets the worker's phone number.
4. **Job happens, cash is paid** — exactly as before. No in-app payment.
5. **Both sides rate each other** — ratings accumulate into a trust profile that is the primary differentiator over WhatsApp groups.

**Key differentiator vs. WhatsApp groups:** Persistent, portable ratings. A worker's 4.8-star rating from 47 jobs is visible to every homeowner on Veettukkar. It is the one thing a WhatsApp group can never replicate.

---

## MVP Features

### 1. Phone OTP Authentication (Priority: High)
Register and log in with phone number + SMS OTP only. No email, no password.

### 2. Worker Profile (Priority: High)
Name, skills (1+ of 6 categories), location, day rate, half-day rate, optional photo. Verified badge after Aadhaar verification.

### 3. Available Today Toggle (Priority: High)
Workers flag same-day availability. Bumps them to top of relevant matches. Auto-resets at midnight.

### 4. Job Posting by Homeowner (Priority: High)
Skill category, date, duration, location, optional description. "Urgent" toggle for same-day needs.

### 5. Nearby Worker Matching (Priority: High)
Workers within ~10km matching skill + date. Ranked by: verified+available today > verified > unverified; then rating desc, distance asc.

### 6. Job Notification & Accept/Decline (Priority: High)
Push notification to workers. Worker accepts → homeowner gets worker name, rating, phone number. Job marked Confirmed.

### 7. Post-Job Ratings (Priority: High)
Homeowner rates worker (1–5 stars + comment). Worker rates homeowner (stars only). Visible on profiles.

### 8. Malayalam-First UI (Priority: High)
Malayalam by default. Hindi for migrant workers. English toggle.

### 9. Aadhaar-Based Worker Verification (Priority: High)
DigiLocker Aadhaar OTP flow. Verified badge + higher ranking. Incentivised, not mandatory. Aadhaar number never stored.

### 10. Job History (Priority: Medium)
Past jobs list for both homeowners and workers. Rating trajectory for workers.

### 11. WhatsApp Notification Fallback (Priority: Medium)
Job alerts + rating reminders via Twilio WhatsApp API for workers who don't reliably open push notifications.

---

## Success Metrics

| Metric | Target (Day 90) |
|--------|-----------------|
| Job fill rate (within 24h) | ≥ 70% |
| Worker jobs/month (avg) | ≥ 6 |
| Homeowner repeat rate (2nd job in 30 days) | ≥ 40% |
| Day-30 retention (both types) | ≥ 35% |
| Rating completion per job | ≥ 60% |
| Worker Aadhaar verification rate | ≥ 50% |

---

## Out of Scope (v1)

- In-app payments / UPI — cash model preserved; KYC complexity deferred
- Multi-district expansion — Ernakulam only for MVP
- iOS app — Android-only
- Job categories beyond 6 — validate model before expanding
- Background checks beyond Aadhaar
- AI-based matching or dynamic pricing

---

## Constraints

- Solo founder, AI-agent-assisted build. No team, no external budget.
- Kerala-only, Android-only, cash payment, Malayalam primary.
- App must be lightweight (< 15MB APK), work on 3G/4G, run on 2GB RAM Android 10.
