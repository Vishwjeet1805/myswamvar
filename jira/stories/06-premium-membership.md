# Story 06: Premium Membership

## Description

Subscription plans (e.g. monthly/yearly). Payment via Stripe or similar. Premium features: unlimited chat, contact access, advanced search filters.

## Acceptance Criteria

- [ ] Plans defined (e.g. monthly, yearly) with price and features.
- [ ] User can subscribe via payment (Stripe checkout or similar); webhook updates subscription status.
- [ ] Premium feature flags: unlimited chat, access to contact details (phone/email) of other profiles, advanced filters in search.
- [ ] Free users see upsell when hitting message limit or when trying to view contact or use advanced filters.
- [ ] Subscription management: current plan, renewal date, cancel/upgrade (handled by payment provider or API).

## Technical Notes

- **API**: `GET /subscription/plans`, `POST /subscription/checkout` (return Stripe session URL or similar), `GET /subscription/me`, `POST /subscription/webhook` (Stripe); contact visibility: `GET /profiles/:id/contact` returns 403 for free users or when not premium.
- **DB**: `Plan` (id, name, interval, price, features JSON), `Subscription` (userId, planId, status, stripeSubscriptionId, currentPeriodEnd, etc.).
- **Feature flags**: In API guards or service layer: check subscription status and enforce limits (chat count, contact access, filter level).
