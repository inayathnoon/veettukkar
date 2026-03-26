# Design — Veettukkar

> Visual design, UI/UX patterns, and component conventions

## Design Principles

- **Malayalam-first.** Every screen is designed in Malayalam and adapted to English, not the other way round.
- **Low-end Android first.** Target Redmi 9A (1GB RAM, Android 10, 5-inch screen). No heavy animations, no large images, no scroll-heavy layouts.
- **One action per screen.** Workers and homeowners have one primary action per screen. No multi-step forms on a single screen.
- **Trust is visible.** Verified badges, star ratings, and job counts are displayed prominently on every worker card. Trust signals are not hidden in profiles.

## Color and Typography

> To be defined during P1-A scaffolding. Record decisions here.

## Component Patterns

> To be filled as components are built. Follow this format:

```
### ComponentName
- Purpose: what it does
- Props: key inputs
- States: empty / loading / data / error
- Used in: which screens
```

## Screen Inventory

| Screen | Role | Primary Action |
|--------|------|---------------|
| Phone entry | Both | Enter phone number |
| OTP entry | Both | Enter OTP code |
| Role selection | Both | Homeowner / Worker |
| Worker profile setup | Worker | Save profile |
| Worker home (job feed) | Worker | Accept job |
| Worker available toggle | Worker | Toggle availability |
| Homeowner home (job list) | Homeowner | Post new job |
| Job post form | Homeowner | Post job |
| Job detail | Both | View status |
| Rate worker | Homeowner | Submit rating |
| Settings | Both | Language toggle / Log out |
