# Scaffolding — veettukkar

> Project structure, conventions, and how to work on this codebase

## Folder Structure

```
veettukkar/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Auth flow screens
│   ├── (homeowner)/        # Homeowner screens
│   └── (worker)/           # Worker screens
├── components/             # Shared UI components
├── functions/              # Firebase Cloud Functions (Node.js/TypeScript)
│   └── src/
│       ├── jobs/           # onJobCreated, onJobAccepted, expireOldJobs
│       ├── ratings/        # onRatingCreated, promptRatings
│       ├── workers/        # resetAvailableToday, verifyAadhaar
│       └── index.ts
├── locales/                # i18n locale files
│   ├── ml.json             # Malayalam
│   ├── hi.json             # Hindi
│   └── en.json             # English
├── lib/                    # Shared utilities (firebase init, geohash helpers)
├── types/                  # Shared TypeScript types
├── __tests__/              # Test files
├── docs/                   # All documentation
├── CLAUDE.md               # Harness instructions
├── AGENTS.md               # Project map
├── ARCHITECTURE.md         # System design
├── WORKFLOW.md             # Issue routing
└── SCAFFOLDING.md          # This file
```

## File Naming Conventions

- **Screens/Components**: PascalCase — `WorkerCard.tsx`, `JobPostForm.tsx`
- **Utilities/Hooks**: camelCase — `useJobFeed.ts`, `formatDistance.ts`
- **Types**: PascalCase interfaces — `JobDocument`, `UserProfile`
- **Tests**: mirror source structure — `__tests__/WorkerCard.test.tsx`
- **Locale keys**: dot-notation — `job.post.title`, `worker.available_today`

## Entry Points

- **Development**: `npx expo start`
- **Tests**: `npm test`
- **Build (Android)**: `eas build --platform android`
- **Deploy Functions**: `firebase deploy --only functions`

## Configuration Files

- **Dependencies**: `package.json` + `package-lock.json`
- **Firebase**: `google-services.json` (Android, gitignored)
- **Environment**: `.env.local` (copy from `.env.example`, gitignored)
- **Expo**: `app.json` / `app.config.ts`

## Conventions

1. **One screen per file** in `app/`
2. **Components are dumb** — no direct Firestore calls in components; use hooks
3. **Hooks own Firestore** — `useJobFeed`, `useWorkerProfile` etc. own data fetching
4. **Cloud Functions own external APIs** — WhatsApp and DigiLocker calls are never in the client
5. **Types first** — define TypeScript types in `types/` before implementing

## Working Agreements

1. **One issue at a time** — finish the current task before picking up a new one
2. **Branch per issue** — `{ISSUE-ID}-brief-name`
3. **Tests alongside code** — test file created in the same PR
4. **Commit message**: `{ISSUE-ID}: brief description`
5. **Lockfile committed** — always commit `package-lock.json`

## Common Tasks

```bash
# Start dev server
npx expo start

# Run tests
npm test

# Add a dependency
npm install {package}

# Deploy Cloud Functions
cd functions && firebase deploy --only functions

# Build Android APK
eas build --platform android --profile preview
```
