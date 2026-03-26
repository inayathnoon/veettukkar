# Reliability — Veettukkar

> Monitoring, error handling, and incident response for v1

## Key Reliability Concerns

| Component | Failure Mode | Impact | Mitigation |
|-----------|-------------|--------|------------|
| `onJobCreated` Cloud Function | Fails to notify workers | Homeowner gets no matches; job expires silently | Retry on failure (Cloud Functions built-in); alert on repeated failures |
| FCM push delivery | Notification not delivered | Worker misses job | WhatsApp fallback notification sent in parallel |
| WhatsApp (Twilio) | Message not sent | Worker misses job notification | FCM push already sent as primary; log failures |
| DigiLocker API | Verification fails | Worker can't get verified badge | Verification is incentivised, not mandatory — failure doesn't block platform |
| Firestore | Read/write failure | App unusable | Firebase SLA 99.95%; Expo offline caching for read-heavy screens |
| Firebase Auth OTP | SMS not delivered | User can't log in | Firebase handles retries; user can request resend |

## Monitoring (v1 — minimal)

- **Firebase Crashlytics:** Enabled for React Native app — catches unhandled exceptions
- **Cloud Functions logs:** All function errors logged to Cloud Logging; review daily during pilot
- **Job fill rate:** Manually tracked in Firestore query during pilot (% jobs confirmed within 24h)
- **Notification delivery:** `notifications_queue` collection tracks sent/failed per channel

## Incident Response (v1)

Solo founder. No on-call rotation. Response process:
1. **Detect:** Firebase Crashlytics alert or user WhatsApp message to founder
2. **Triage:** Is it blocking job matching? If yes, priority 1. If no, log and fix in next session.
3. **Fix:** Hotfix via Expo OTA update (app) or `firebase deploy --only functions` (backend)
4. **Communicate:** WhatsApp message to affected users if job matching was impacted

## Error Handling Conventions

- Cloud Functions: catch all errors, log with context (`jobId`, `workerId`), return structured error response
- React Native: show user-friendly error message in Malayalam; log to Crashlytics; never show raw error strings
- Firestore write failures: retry once automatically; show "Something went wrong, try again" if retry fails
