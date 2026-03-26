# Build Plan: Veettukkar — Kerala's Home Services Marketplace

> **Pilot scope:** Ernakulam district only. All of Phase 1 is built for this single district.
> **Platform:** Android only (React Native / Expo).
> **Stack:** Firebase + Cloud Functions + Twilio WhatsApp + DigiLocker.

---

## Phase 1 — Vertical Slice MVP
**Goal:** A homeowner can post a job, a nearby worker gets notified, accepts, and both rate each other after the job. The full loop works end-to-end in Ernakulam district with real users.

### What's in Phase 1

**P1-A: Project Setup & Core Infrastructure**
- [ ] Initialise React Native app with Expo (TypeScript, Expo Router)
- [ ] Configure Firebase project (Firestore, Auth, Functions, Storage, FCM)
- [ ] Set up i18n with i18next — Malayalam, Hindi, English locale files
- [ ] Configure Firestore security rules
- [ ] Set up Cloud Functions project (Node.js 20, TypeScript)
- [ ] Configure Geohash library (geofire-common) for proximity queries
- [ ] Set up Expo EAS Build profile for Android

**P1-B: Authentication**
- [ ] Phone OTP login screen (Firebase Auth phone provider)
- [ ] OTP entry and verification screen
- [ ] Role selection screen after first login (Homeowner / Worker)
- [ ] Malayalam + English UI for all auth screens

**P1-C: Worker Profile**
- [ ] Worker registration form: name, skills, location, day rate, half-day rate, optional photo
- [ ] Photo upload to Firebase Storage (auto-resize to 200×200)
- [ ] Worker profile view screen
- [ ] "Available Today" toggle on worker home screen

**P1-D: Job Posting (Homeowner)**
- [ ] Job post form: skill category, date, duration, location, description, "Urgent" toggle
- [ ] Homeowner home screen: posted jobs with status indicators
- [ ] Job detail screen

**P1-E: Job Matching & Notifications (Cloud Functions)**
- [ ] `onJobCreated`: geohash query, rank workers, send FCM + WhatsApp
- [ ] `onJobAccepted`: update status, notify homeowner, expire other notifications
- [ ] `expireOldJobs` scheduled (hourly)
- [ ] `resetAvailableToday` scheduled (midnight IST)

**P1-F: Worker Job Feed**
- [ ] Worker home screen: open nearby jobs matching skills
- [ ] Job card with urgent badge
- [ ] Accept / Decline flow
- [ ] "My Jobs" tab

**P1-G: Post-Job Rating**
- [ ] `promptRatings` Cloud Function (daily 8pm)
- [ ] Rating screen (1–5 stars + comment)
- [ ] `onRatingCreated`: recalculate ratingAvg + ratingCount
- [ ] Rating display on profiles and job cards

**P1-H: WhatsApp Notification Fallback**
- [ ] Twilio WhatsApp API integration
- [ ] Job alert + rating reminder templates (pre-approved by Meta)

**P1-I: Aadhaar Verification**
- [ ] DigiLocker API integration in `verifyAadhaar` Cloud Function
- [ ] "Get Verified" screen + Aadhaar OTP flow
- [ ] "Verified ✓" badge on profile and job cards

**P1-J: Job History & Settings**
- [ ] Job history for both user types
- [ ] Language toggle (Malayalam / English / Hindi)
- [ ] Log out

### Definition of Done

Phase 1 is complete when:
1. Homeowner posts a job → worker confirms within 5 minutes (test environment)
2. Worker receives both push notification AND WhatsApp for a matching job
3. Both sides can rate each other after job date
4. Verified badge shows after Aadhaar OTP flow
5. APK runs on low-end Android (2GB RAM, Android 10)
6. All primary UI strings display in Malayalam by default

### Estimated Scope
**Large** — 10 subsystems, 2 external API integrations. 6–8 weeks solo build with AI assistance.

---

## Phase 2 — Pilot Quality & Ernakulam Density
**Goal:** 30+ verified workers across all 6 categories in Ernakulam; 70% job fill rate.

- Worker + homeowner onboarding improvements
- Job cancellation and no-show reporting
- Simple admin view (flagged workers)
- Worker-to-homeowner rating display
- Browse workers by skill
- Push notification reliability + performance profiling

---

## Phase 3+ — Expansion and Monetisation

- Multi-district expansion (Thiruvananthapuram, Kozhikode)
- iOS app
- In-app UPI payments + commission model
- Subscription plans, advanced matching, ML demand forecasting

---

## Milestones

| Milestone | Deliverable | Phase |
|-----------|-------------|-------|
| M1: App boots | Firebase connected, auth works, locale in Malayalam | 1 |
| M2: Worker registers | Profile, photo, location, skills stored | 1 |
| M3: Job post → notification | Worker receives FCM + WhatsApp | 1 |
| M4: Accept → confirm | Homeowner gets worker phone number | 1 |
| M5: Ratings loop | Rating stored, ratingAvg updated | 1 |
| M6: Aadhaar verify | Verified badge shows | 1 |
| M7: Full loop on real device | End-to-end on low-end Android | 1 |
| M8: 30 workers onboarded | Ernakulam pilot across all 6 categories | 2 |
| M9: 70% fill rate | Rolling 7-day fill rate ≥ 70% | 2 |

---

## Dependencies

- Firebase Blaze plan (required for Cloud Functions + external API calls)
- Twilio account with WhatsApp Sandbox
- DigiLocker API developer access (1–2 week approval)
- Expo EAS account + Google Play Developer account
- WhatsApp message templates submitted early (2–5 day Meta review)
- Malayalam UI string translations (in parallel with build)
- 5+ workers per category in Ernakulam before soft launch

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| DigiLocker API approval delay | Medium | Medium | Build all other features first; Aadhaar verify is last |
| WhatsApp template rejection | Medium | High | Submit early; prepare SMS fallback |
| Low-end Android performance | Medium | High | Test on Redmi 9A (1GB RAM) from day 1 |
| Cold-start: workers don't install | High | High | In-person onboarding at construction sites |
| Geohash query errors | Low | High | Unit-test with known coordinates |
| Cloud Functions cold-start latency | Low | Medium | Functions v2 with min instances = 1 |

---

## First Task

**Set up Firebase project and connect to Expo app.**

1. Create Firebase project `veettukkar-prod`
2. Enable Firestore, Auth (Phone), Functions, Storage, FCM
3. `npx create-expo-app veettukkar --template expo-template-blank-typescript`
4. Install `@react-native-firebase/app`, `auth`, `firestore`
5. Add `google-services.json` to Android config
6. Verify: app boots, Firebase connects, phone OTP sends
