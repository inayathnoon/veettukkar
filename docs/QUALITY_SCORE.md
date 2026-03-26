# Quality Score

Track quality signals across key dimensions as the project evolves.

## Scoring Rubric

Each dimension is scored 1–10. Target scores are for Phase 1 completion.

| Dimension | Current | Target | Notes |
|-----------|---------|--------|-------|
| Test coverage | — | 6 | Unit tests for Cloud Functions; E2E for critical flows |
| Error handling | — | 7 | All Cloud Function failures handled gracefully |
| Performance (low-end Android) | — | 8 | App boots < 3s on Redmi 9A (2GB RAM, Android 10) |
| Accessibility | — | 6 | Malayalam text sizing, touch target minimums |
| Security | — | 9 | Firestore rules enforced; no phone numbers client-side |
| Documentation | — | 7 | All functions documented; data flows diagrammed |
| Observability | — | 5 | Cloud Function logs structured; error alerting in place |

## How to Update

After each phase milestone, update scores based on:
1. Manual testing on target device
2. Code review checklist from `docs/SECURITY.md` and `docs/RELIABILITY.md`
3. Firebase console error rates

Scores are updated by the solo founder before each pilot onboarding event.
