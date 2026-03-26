# References

External resources, research, and source material that informed Veettukkar's design decisions.

## Market Research Sources

| Source | What It Informed |
|--------|-----------------|
| Kerala RERA project database (1,300+ statewide projects) | Ernakulam district selection; construction worker demand |
| Coconut Development Board — Hello Nariyal directory (1,924 climbers) | Cold-start recruitment strategy; coconut climber supply |
| Kudumbashree Kerala (300,000-member women's self-help network) | Domestic worker supply chain; onboarding approach |
| Urban Company annual report / Kerala operations data | Competitive gap analysis; why they don't serve informal labour |
| India home services market reports (RedSeer, Inc42) | TAM sizing (~$59B India home services) |
| Kerala Economic Review — daily wage data | Highest daily wages in India context; worker income motivation |
| NSSO / Census migrant worker data for Kerala | ~2.5M migrant workers in Kerala; Aluva/Perumbavoor concentration |

## Technical References

| Reference | Used For |
|-----------|----------|
| Firebase Firestore geohash proximity guide | Geohash query pattern with geofire-common |
| DigiLocker API documentation (api.digilocker.gov.in) | Aadhaar OTP verification flow design |
| Twilio WhatsApp Business API docs | WhatsApp template message integration |
| Expo EAS Build documentation | Android build and OTA update configuration |
| i18next React Native guide | Malayalam/Hindi/English localisation setup |

## Competitive Analogues

| Product | What We Learned |
|---------|----------------|
| Urban Company (India) | Professional services model; why informal labour is outside their TAM |
| TaskRabbit (US) | Two-sided marketplace mechanics; accept/decline flow |
| Snabbit (Bengaluru) | On-demand domestic help; geography-first cold start |
| Nayakam (Kerala) | Direct competitor; weak trust signals; no ratings system |
| WhatsApp groups | Real competition; why ratings are the moat |
