# Decision: Tech Choices — Veettukkar

## Firebase over Supabase

- **Chose:** Firebase (Firestore + Cloud Functions + Auth + FCM + Storage)
- **Why:** Firestore's real-time listeners are a native primitive — both homeowner and worker get live job status updates without polling. Zero server management. Scales to zero when idle. Phone Auth is zero-config. FCM in the same ecosystem.
- **Trade-off:** Firestore's NoSQL model requires denormalisation (e.g., `ratingAvg` on user doc). Acceptable at v1 scale.

## React Native (Expo) over Flutter

- **Chose:** React Native with Expo managed workflow, TypeScript
- **Why:** Firebase's React Native SDK is mature. TypeScript across app + Cloud Functions = one language. Expo OTA updates bypass Play Store review for bug fixes. Familiar JS/TS ecosystem for solo founder.
- **Trade-off:** Flutter has marginally better performance on sub-1GB RAM devices. Revisit if needed.

## Android-Only MVP

- **Chose:** Android only; no iOS in v1.
- **Why:** Kerala's daily-wage worker demographic is ~95% Android. Building and testing both platforms doubles QA effort.
- **Trade-off:** Some homeowners on iPhone can't use the app. Acceptable for Ernakulam pilot.

## Geohash Proximity Queries (not PostGIS)

- **Chose:** Geohash-based proximity using `geofire-common`
- **Why:** Firestore does not support native geospatial queries. Geohash prefix matching is the standard workaround.
- **Trade-off:** Covers a rectangular area, not a circle — slight over-fetch requires client-side filtering. Negligible at v1 scale.

## DigiLocker for Aadhaar Verification

- **Chose:** DigiLocker API (India government) for Aadhaar OTP verification
- **Why:** Free, government-backed, workers already have Aadhaar. Third-party KYC vendors charge ₹5–25/verification + business agreements.
- **Trade-off:** DigiLocker can be slow/down occasionally. Verification is incentivised, not mandatory — downtime doesn't block workers.

## Twilio WhatsApp API (not direct Meta WABA)

- **Chose:** Twilio as WhatsApp Business API wrapper for v1
- **Why:** Faster sandbox testing without Meta Business verification upfront.
- **Trade-off:** Twilio adds cost margin. Switch to direct WABA when volume justifies it.

## No In-App Payments in v1

- **Chose:** Cash payment model; no UPI/digital payments
- **Why:** UPI integration requires KYC, GST registration, payment gateway agreements, RBI compliance — months of work. Cash is familiar and trusted.
- **Trade-off:** No transactional revenue in v1. Commission model is a v2 decision.
