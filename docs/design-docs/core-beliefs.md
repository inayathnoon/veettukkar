# Core Beliefs — Veettukkar

Principles that guide this project. These override local preferences and short-term convenience.

## Product Beliefs

- **Ratings are the moat.** Every completed job that doesn't generate a rating is a missed compounding opportunity. Ratings are why a homeowner uses Veettukkar instead of a WhatsApp group. Protect them.
- **Workers are the supply; without supply, nothing works.** Every product and engineering decision should ask: does this make it easier or harder for a migrant mason in Ernakulam to get his next job?
- **Cash is a feature, not a limitation.** Don't try to remove cash payment in v1. It is familiar, trusted, and removes compliance friction. Respect it.
- **Malayalam is not optional.** A worker who can't read the app won't use the app. Language support is load-bearing, not cosmetic.
- **Density before expansion.** One district done well beats three districts done poorly. 70% fill rate in Ernakulam is more valuable than 20% fill rate across Kerala.

## Engineering Beliefs (Harness Engineering)

- **Humans steer, agents execute.** Humans define intent, design environments, and build feedback loops. Agents write the code.
- **The repo is the system of record.** If it's not in the repo, it doesn't exist. No tribal knowledge, no external-only docs.
- **Docs are truth.** If the code and docs disagree, fix the code.
- **One task at a time.** Pick one issue, finish it, merge it, then pick the next.
- **Tests are not optional.** Every implementation task has a paired test requirement.
- **Entropy is inevitable.** Agent-generated code drifts. Golden principles + recurring cleanup tasks keep the codebase coherent.

## Quality Beliefs

- **Validate at boundaries, trust internally.** Parse and validate at system boundaries (Firestore writes, API inputs). Trust typed internal code.
- **Prefer boring technology.** Firebase, React Native, TypeScript — composable, stable, well-documented. Boring is a feature.
- **Pay down tech debt continuously.** Small, frequent cleanup beats painful quarterly refactors.
- **Low-end device is the real device.** Always test on a Redmi 9A (1GB RAM, Android 10). If it works there, it works everywhere in the target market.
