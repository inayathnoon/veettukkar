# Frontend — Veettukkar

> React Native (Expo) architecture, state management, and routing

## Stack

- **Framework:** React Native with Expo (managed workflow)
- **Language:** TypeScript
- **Routing:** Expo Router (file-based routing)
- **State:** React Context + Firestore real-time listeners (no Redux/Zustand in v1)
- **i18n:** i18next + react-i18next
- **Firebase:** @react-native-firebase/app, auth, firestore, storage, messaging

## Routing Structure

```
app/
  (auth)/
    index.tsx         ← Phone entry
    otp.tsx           ← OTP verification
    role.tsx          ← Role selection (Homeowner / Worker)
  (homeowner)/
    index.tsx         ← Job list home
    post.tsx          ← Post new job
    job/[id].tsx      ← Job detail
    rate/[id].tsx     ← Rate worker
    history.tsx       ← Past jobs
  (worker)/
    index.tsx         ← Job feed home
    job/[id].tsx      ← Job detail + accept/decline
    profile.tsx       ← Own profile edit
    verify.tsx        ← Aadhaar verification
    history.tsx       ← Completed jobs
  settings.tsx        ← Language toggle, log out
```

## State Management

- **Auth state:** Firebase Auth listener in `AuthProvider` context — provides `user` to all screens
- **Role state:** Fetched from Firestore `users/{uid}.role` on first auth; cached in context
- **Job feed:** Real-time Firestore listener in `useJobFeed` hook (worker) / `useMyJobs` hook (homeowner)
- **Worker profile:** Fetched on mount via `useWorkerProfile` hook; updated via form submit

No global state store in v1. Co-locate state with the component that owns it.

## Performance Rules

- APK target: < 15MB. Avoid heavy native modules.
- No inline images > 50KB. Profile photos served at 200×200px from Firebase Storage.
- No blocking spinners on the main thread. Show skeleton screens for loading states.
- Test on Redmi 9A (1GB RAM) before every milestone — not just on emulator.
