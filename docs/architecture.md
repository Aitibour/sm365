# SM 365 Architecture

## Core Components

- `apps/web`: branded customer-facing portal
- `apps/api`: integration layer for auth, billing, sync, and webhooks
- `Postiz`: social publishing engine
- `Mautic`: marketing funnel engine
- `Twenty`: CRM engine
- `Chatwoot`: inbox and conversation engine

## Recommended User Journey

1. The user lands on the SM 365 website.
2. A form submission or campaign event enters Mautic.
3. Lead and customer records are synced into Twenty.
4. Support or pre-sales conversations are handled in Chatwoot.
5. The user signs in to the SM 365 portal.
6. Social planning and publishing happen in Postiz.
7. The API layer keeps account, billing, and usage data aligned across services.

## Integration Priorities

1. Unified auth and workspace mapping
2. Billing and subscription events
3. Lead sync between Mautic and Twenty
4. User and company sync into Chatwoot
5. Publishing and engagement events from Postiz into the CRM

## Notes

- Keep each service isolated and deploy behind the same reverse proxy.
- Present a single navigation and brand layer through the custom web app.
- Verify each service's latest deployment guide before production rollout.
