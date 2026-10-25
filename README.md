# Portfolio CMS

Full-stack single-owner portfolio: Next.js public site and admin, Express API, Prisma, and PostgreSQL.

## Start locally

1. Install Node.js 20+ and pnpm 9+.
2. Copy `.env.example` to `.env` (`Copy-Item .env.example .env` in PowerShell) and change the owner email/password and session secret.
3. Start PostgreSQL with `docker compose up -d`.
4. Install dependencies with `pnpm install`.
5. Run `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:seed`.
6. Run `pnpm dev`, then open `http://localhost:3000`. Admin: `/login`.

The API runs on port 4000. Public reads expose published content only. There is no public registration route. See app package scripts for individual commands.

For profile photos, project covers, and résumé PDF uploads, add the cloud name, API key, and API secret from the same Cloudinary product environment to `.env`. Uploads pass through the authenticated API server, which keeps the Cloudinary secret private and authenticates directly with Cloudinary. Restart the API after changing credentials. Image and résumé URLs can also be entered directly. After upload, review the file preview and save the profile to publish it on the homepage.

Cloudinary Free accounts block PDF delivery by default. To make the résumé download work, open the Cloudinary Console's **Settings → Security**, enable **Allow delivery of PDF and ZIP files**, and save the product environment settings.

To deliver contact form messages to `CONTACT_EMAIL` (defaults to `mehrajhasanriajcse@gmail.com`), create a free Resend account and set `RESEND_API_KEY` in `.env`. No custom domain is needed for initial testing: the app defaults to Resend's `onboarding@resend.dev` sender. Resend's testing sender may only deliver to a verified recipient on your account; add and verify the destination email in Resend. For public production delivery to arbitrary recipients, verify a domain and set `EMAIL_FROM` to an address on it. Messages are also kept in the admin inbox.

Use `pnpm db:deploy` to apply checked-in migrations in a deployment environment; `pnpm db:migrate` is for local schema development.

## Free deployment (Render + Neon)

The repository includes `render.yaml` for two free Render web services (Next.js and the API). Use Neon for PostgreSQL rather than Render's free Postgres, which expires after 30 days. Free Render services sleep after 15 minutes idle, so the first request after a quiet period can take around a minute. This is suitable for a personal portfolio with light traffic, but not an always-on production service. See [Render's free instance limits](https://render.com/docs/free) and [Neon's free plan limits](https://neon.com/docs/introduction/plans).

1. Push this repository to GitHub and create a free Neon project. Copy its pooled or direct PostgreSQL connection string and ensure it includes SSL (`sslmode=require`).
2. In Render, choose **New → Blueprint**, connect this repository, and deploy the `render.yaml` Blueprint. Render creates `mehraj-portfolio-web` and `mehraj-portfolio-api` services. Enter the requested `DATABASE_URL`, `OWNER_EMAIL`, `OWNER_PASSWORD`, and Cloudinary/Resend credentials during setup (or add them in the API service's Environment settings). Choose a strong owner password of at least 12 characters.
3. `CONTACT_EMAIL` defaults to `mehrajhasanriajcse@gmail.com`. Keep credentials and secrets in Render, never in source control.
4. The Blueprint links the services' generated URLs: the API allows the web origin, and the web app builds with the API URL. `SITE_URL` is linked to the web URL for sitemap and robots metadata. If you later change either service's URL, sync/redeploy the Blueprint and redeploy the web service because `NEXT_PUBLIC_API_URL` is embedded at build time.
5. The API's pre-deploy command runs `prisma migrate deploy` against Neon. After the first deploy completes, seed the owner account once from your local PowerShell terminal with the API environment loaded:

   ```powershell
   $env:DATABASE_URL = "<Neon connection string>"
   $env:OWNER_EMAIL = "<your admin email>"
   $env:OWNER_PASSWORD = "<your strong password>"
   pnpm --filter @portfolio/api exec tsx prisma/seed.ts
   Remove-Item Env:DATABASE_URL, Env:OWNER_EMAIL, Env:OWNER_PASSWORD
   ```

   Run that command from the repository root. It uses the same Neon database as the deployed API; do not run `db:seed` with the local `.env` unless it points to that hosted database.
6. In Resend, verify your recipient email to test delivery using `onboarding@resend.dev`. Without a domain, Resend's test sender is restricted to verified recipients; sending to arbitrary recipients requires a verified domain.

The Render build commands deliberately bypass the local `.env`-loading scripts. Render injects environment variables directly into each build and service process.
