# Security — Veettukkar

> Auth model, trust boundaries, and threat model for v1

## Auth Model

- **Authentication:** Firebase Auth, phone number + SMS OTP only
- **Identity token:** Firebase JWT issued after OTP verification; all Firestore reads/writes are JWT-authenticated
- **Session:** Firebase handles token refresh automatically
- **No email, no password** — reduces phishing and credential stuffing surface

## Firestore Security Rules (Key Rules)

```javascript
// Users can only read/write their own user document
match /users/{uid} {
  allow read: if request.auth.uid == uid || isWorkerProfile();
  allow write: if request.auth.uid == uid;
}

// Jobs are readable by all authenticated users; writable only by the homeowner
match /jobs/{jobId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.homeownerId;
  allow update: if request.auth.uid == resource.data.homeownerId
                || (request.auth.uid == request.resource.data.acceptedWorkerId
                    && onlyUpdatingAcceptance());
}

// Ratings: writable once per job per user
match /ratings/{ratingId} {
  allow create: if request.auth.uid == request.resource.data.fromUid
                && noExistingRating();
  allow read: if request.auth != null;
}
```

## Trust Boundaries

| Boundary | What crosses it | How it's secured |
|----------|----------------|-----------------|
| Client → Firestore | User data, job posts, ratings | Firestore security rules + Firebase JWT |
| Client → Firebase Storage | Profile photos | Firebase Storage rules (auth required) |
| Cloud Functions → WhatsApp API | Job alert messages | Server-side only; Twilio API key in env vars |
| Cloud Functions → DigiLocker | Aadhaar OTP verification | Server-side only; DigiLocker credentials in env vars |
| Cloud Functions → FCM | Push notifications | Firebase service account; server-side only |

**Rule:** External API credentials (Twilio, DigiLocker) are **never** in client code. Always in Cloud Functions environment variables.

## Data Privacy

- **Aadhaar number:** Never stored. Only `aadhaarVerified: boolean` + DigiLocker transaction reference.
- **Worker phone number:** Visible to homeowner only after job is confirmed (not before). Never stored client-side by Cloud Functions.
- **Homeowner exact location:** GPS coordinates stored in job document; only neighbourhood label shown to workers pre-acceptance.
- **Ratings:** Homeowner name not shown on worker's public profile — only aggregate rating and count.

## Threat Model (v1)

| Threat | Likelihood | Mitigation |
|--------|-----------|------------|
| Fake worker accounts | Medium | Aadhaar verification (incentivised); phone OTP |
| Homeowner posts fake jobs to get worker contact numbers | Low | Worker phone only revealed post-acceptance; limit contacts |
| Rating manipulation (fake jobs to boost rating) | Low | Ratings only created for jobs with confirmed status + past date |
| Credential theft | Low | No passwords; Firebase JWT short-lived |
| Data scraping of worker profiles | Low | Firestore auth required for all reads |
