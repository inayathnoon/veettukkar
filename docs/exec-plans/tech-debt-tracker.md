# Tech Debt Tracker

Running list of known shortcuts taken in v1 that should be addressed before scaling.

## Format

Each item: **What the debt is** → **Why it was accepted** → **When to fix**

---

## Active Debt

| ID | Debt | Why Accepted | Fix When |
|----|------|--------------|----------|
| TD-001 | `ratingAvg` stored redundantly on user doc (denormalised) | Firestore has no native aggregation; real-time query needs it on user doc | If/when moving to PostgreSQL post-scale |
| TD-002 | Geohash query over-fetches (rectangular area, not circle); client-side filtering required | Firestore has no native geo queries; geohash is the standard workaround | Only matters if worker density in a geohash cell becomes high enough to cause noticeable over-fetch |
| TD-003 | No retry logic on WhatsApp Twilio calls from Cloud Functions | v1 volume is low; failures are acceptable | Phase 2 — add retry queue before real-user pilot |
| TD-004 | No CI/CD pipeline — manual Expo builds and Firebase deploy via CLI | Solo founder; automation overhead not justified at zero users | Phase 2 — when multiple contributors or faster release cadence needed |
| TD-005 | No admin dashboard — moderation handled manually by founder | No team; manual review is fastest v1 approach | Phase 2 — when worker complaints or no-show flags exceed 10/week |
| TD-006 | FCM tokens refreshed on launch but no staleness check | FCM handles expired token cleanup server-side eventually | If notification delivery rate drops below 80% |
| TD-007 | Language preference stored in both Firestore AND AsyncStorage (could drift) | AsyncStorage needed for offline / pre-login screens; Firestore is source of truth on login | Add sync-on-login logic in Phase 2 |

## Resolved Debt

_None yet — project has not shipped._

---

## Notes

- Debt items are added here as they are identified during build, not retroactively
- Each item must have a clear trigger for when it becomes worth fixing
- Accepted debt is not the same as bad code — it is an explicit tradeoff
