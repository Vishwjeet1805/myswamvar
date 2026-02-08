# Module 06: Premium Membership

**Jira story**: `JIRA-XXX` (replace with your story key)

## Description

Subscription plans (e.g. monthly/yearly). Payment via Stripe or similar. Premium features: unlimited chat, contact access, advanced search filters.

## Acceptance criteria

- Plans defined (e.g. monthly, yearly) with price and features.
- User can subscribe via payment (Stripe checkout or similar); webhook updates subscription status.
- Premium feature flags: unlimited chat, access to contact details (phone/email) of other profiles, advanced filters in search.
- Free users see upsell when hitting message limit or when trying to view contact or use advanced filters.
- Subscription management: current plan, renewal date, cancel/upgrade (handled by payment provider or API).

## Main API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/subscription/plans` | List plans |
| POST | `/subscription/checkout` | Create checkout (returns Stripe session URL or similar) |
| GET | `/subscription/me` | Current user’s subscription |
| POST | `/subscription/webhook` | Stripe webhook (updates subscription status) |
| GET | `/profiles/:id/contact` | Returns 403 for free users or when not premium; returns contact for premium |

## Technical notes

- **DB**: `Plan` (id, name, interval, price, features JSON), `Subscription` (userId, planId, status, stripeSubscriptionId, currentPeriodEnd, etc.).
- **Feature flags**: In API guards or service layer: check subscription status and enforce limits (chat count, contact access, filter level).

---

**Jira**: Add a **Jira Issue** widget for this story or **Jira Issues (Filter)** for sub-tasks (e.g. `labels = premium-membership`).
