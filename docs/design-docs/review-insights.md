# Decision: Review Insights — Veettukkar

## Review Verdict: APPROVED (7.75/10)

| Dimension | Score | Key Finding |
|-----------|-------|-------------|
| Clarity | 8/10 | Problem is specific and concrete; cold-start strategy is the gap |
| Market Viability | 7/10 | Real market, real gap; monetisation deferred but valid |
| Feasibility | 9/10 | Standard mobile stack; Malayalam localisation is the main added complexity |
| User Validation | 7/10 | Problem is real but validation is assumption-driven, not tested |

## Strengths That Confirmed the Direction

- Kerala's informal daily-wage labour market is large and under-served by Urban Company.
- Cash payment preservation removes the biggest trust and regulatory hurdle from v1.
- Phone OTP is exactly right for this audience.
- Ratings as the key differentiator over WhatsApp groups is sharp and real.

## Weaknesses That Changed the Design

- **"Available Today" toggle added** — merged from Direction 6 for urgency use cases.
- **"Urgent" tag added** — homeowners can mark same-day jobs; helps workers prioritise.
- **Cold-start strategy added** — Ernakulam-first pilot with in-person worker onboarding.

## Risks Named by Review

| Risk | Mitigation |
|------|------------|
| Cold-start: no workers at launch | In-person outreach to ~30 workers before app launch |
| WhatsApp groups already exist | Ratings/trust made the visible value prop |
| Sparse rural areas won't have density | Start in Ernakulam (urban density) |
| Workers may not respond to notifications | "Available today" toggle creates lighter commitment |

## Decision: District-First Pilot

- **Ernakulam preferred** — high urban density, dense migrant worker population, Urban Company's only Kerala foothold (can undercut on worker-friendliness).
- **Expansion:** Thiruvananthapuram → Kozhikode → remaining districts, district by district.
- Each new district requires 20+ verified workers per skill category before opening to homeowners.

## Decision: Ratings Are the Moat

- Ratings are the primary reason to use Veettukkar over WhatsApp groups.
- WhatsApp can coordinate a job. It cannot record, persist, or surface worker reputation.
- Newly onboarded unverified workers show "Registered on Veettukkar" as an interim trust signal.
