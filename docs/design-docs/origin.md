# Decision: Origin — Veettukkar

## Origin

The idea started as a practical observation about the informal labour market in Kerala: homeowners regularly need skilled daily-wage workers — coconut tree climbers, painters, cleaners, cement construction workers, plumbers, electricians — but have no reliable way to find them beyond personal contacts and word-of-mouth. Workers, meanwhile, are limited to the jobs their personal network feeds them, leaving earning potential largely to chance.

The raw idea: build an app that connects these two sides. Kerala-specific because the labour types, language (Malayalam), and cash-based wage conventions are very regional.

## What We Decided to Build

A lightweight mobile app — **Veettukkar** (Malayalam for "house helpers") — that acts as a hyperlocal marketplace for daily-wage home services in Kerala.

- **What we decided:** Build a job-posting + worker-matching app, Malayalam-first, with phone OTP auth. No payment processing in v1; cash model preserved.
- **Alternatives considered:** (1) WhatsApp-based matching bot — rejected because it requires a central number and doesn't scale; (2) Aggregator listing site — rejected because it's passive, not real-time; (3) Full gig-economy with in-app payments — deferred to v2.
- **Why this path:** The simplest intervention that breaks the word-of-mouth bottleneck.
- **Trade-off accepted:** No monetisation at launch. Revenue model is a v2 decision.

## Key Decision: Target Worker Categories

- **What we decided:** Six categories — coconut tree climbers, house painters, cleaners, cement construction workers, plumbers, electricians.
- **Why:** These are the most commonly hired daily-wage workers for Kerala homes.
- **Trade-off:** Excluding gardeners, cooks, domestic helpers — to keep MVP scope tight.

## Key Decision: Malayalam-First UI

- **What we decided:** Malayalam as default UI language, English as secondary.
- **Why:** Most daily-wage workers in Kerala are more comfortable in Malayalam. English-only would kill worker adoption.

## Key Decision: Phone OTP Authentication (No Email)

- **What we decided:** Register and log in with phone number + SMS OTP only.
- **Why:** Workers use basic Android phones. Email-based auth creates friction and dropout.

## Open Questions

- [ ] Should homeowners browse worker profiles directly or only post jobs and wait?
- [ ] Do workers set availability proactively or just respond to notifications?
- [ ] What verification before a worker can accept jobs?
- [ ] Monetisation model for v2: platform commission, worker subscription, or homeowner subscription?
