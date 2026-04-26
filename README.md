# SM 365

SM 365 is a free-stack social media management and marketing funnel platform scaffold.

## Stack

- `Postiz` for social scheduling and publishing
- `Mautic` for landing pages, forms, and email automation
- `Twenty` for CRM and pipeline management
- `Chatwoot` for live chat and shared inbox
- `Next.js` for the branded web portal
- `NestJS` or `Node.js` for the integration API
- `PostgreSQL` for core application data
- `Redis` for jobs and cache
- `Traefik` for reverse proxy and TLS

## Project Structure

```text
apps/
  web/         Next.js frontend shell
  api/         Integration backend
docs/
  architecture.md
infra/
  docker/
    docker-compose.prod.yml
.env.example
```

## Product Flow

1. A visitor lands on the marketing site.
2. Forms and campaigns are handled by Mautic.
3. Leads and customers are tracked in Twenty.
4. Conversations are managed in Chatwoot.
5. Social publishing is handled by Postiz.
6. The custom API syncs users, workspaces, billing, and events across services.

## Next Steps

1. Replace placeholder domains in `.env.example`.
2. Add real Docker images and service env values for each tool.
3. Scaffold the `apps/web` and `apps/api` codebases.
4. Add auth, billing, and webhook sync.

## Workspace Commands

Run these from the project root:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`

Target one app only:

- `npm run dev:web`
- `npm run dev:api`
- `npm run test:api`

Database setup for `apps/api`:

- `npm --workspace apps/api run db:init`
