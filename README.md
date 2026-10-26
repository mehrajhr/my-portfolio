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

For profile photos, project covers, and résumé PDF uploads, add the cloud name, API key, and API secret from the same Cloudinary product environment to `.env`. The authenticated API signs each upload and the browser sends the file directly to Cloudinary, keeping the API secret private and avoiding serverless request-size limits. Set `CLOUDINARY_SIGNATURE_ALGORITHM=sha256` only if your Cloudinary environment requires SHA-256; otherwise leave it as `sha1`.

Cloudinary Free accounts block PDF delivery by default. To make the résumé download work, open the Cloudinary Console's **Settings → Security**, enable **Allow delivery of PDF and ZIP files**, and save the product environment settings.

To deliver contact form messages to `CONTACT_EMAIL` (defaults to `mehrajhasanriajcse@gmail.com`), create a free Resend account and set `RESEND_API_KEY` in `.env`. No custom domain is needed for initial testing: the app defaults to Resend's `onboarding@resend.dev` sender. Resend's testing sender may only deliver to a verified recipient on your account; add and verify the destination email in Resend. For public production delivery to arbitrary recipients, verify a domain and set `EMAIL_FROM` to an address on it. Messages are also kept in the admin inbox.

Use `pnpm db:deploy` to apply checked-in migrations in a deployment environment; `pnpm db:migrate` is for local schema development.

## Deploy to Vercel

This is a pnpm monorepo, so create **two Vercel projects from the same GitHub repository**. The web project runs Next.js and the API project runs the Express app as a Vercel Function. Use Neon (or another hosted PostgreSQL provider) for the database. Vercel Functions scale down when idle; Fluid Compute can reduce cold starts, but Vercel does not provide a permanently running free API server.

### 1. Prepare the database and repository

1. Push the latest code to GitHub and make sure your hosted PostgreSQL database is reachable. For Neon, use the pooled connection URL for the Vercel API runtime (usually the hostname containing `-pooler`) and keep the direct URL for migrations. Both URLs should use SSL (`sslmode=require`); never publish either in the repository.
2. If this database has not been initialized, apply migrations once from PowerShell at the repository root:

   ```powershell
   $env:DATABASE_URL = "<your direct hosted PostgreSQL URL>"
   pnpm --filter @portfolio/api exec prisma migrate deploy
   Remove-Item Env:DATABASE_URL
   ```

   The current Neon database already contains your owner, so reuse the same email and password when you deploy it. If you need to create or reset the owner, run the seed command below; it updates the password for that email:

   ```powershell
   $env:DATABASE_URL = "<your direct hosted PostgreSQL URL>"
   $env:OWNER_EMAIL = "<your admin email>"
   $env:OWNER_PASSWORD = "<your strong password>"
   pnpm --filter @portfolio/api exec tsx prisma/seed.ts
   Remove-Item Env:DATABASE_URL, Env:OWNER_EMAIL, Env:OWNER_PASSWORD
   ```

### 2. Deploy the API project

1. In Vercel, **Add New → Project**, import this repository, and set **Root Directory** to `apps/api`.
2. In Project Settings → Build and Development Settings, set the Build Command to `pnpm run vercel-build`. Keep the detected pnpm install command. Enable **Include source files outside of the Root Directory** so Vercel can access the shared `packages/contracts` workspace.
3. Add these API project environment variables for Production (and Preview too, if you want preview deployments to work):

   | Variable | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Hosted PostgreSQL connection string |
   | `SESSION_SECRET` | Random secret with at least 32 characters |
   | `OWNER_EMAIL` | Your admin email |
   | `OWNER_PASSWORD` | Your owner password |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Cloudinary API secret |
   | `CLOUDINARY_SIGNATURE_ALGORITHM` | `sha1`, or `sha256` if required by your Cloudinary account |
   | `RESEND_API_KEY` | Resend API key (optional if contact email delivery is not enabled) |
   | `CONTACT_EMAIL` | `mehrajhasanriajcse@gmail.com` |
   | `EMAIL_FROM` | `Portfolio <onboarding@resend.dev>` or your verified sender |
   | `WEB_ORIGIN` | Add the frontend's Vercel URL after step 3 |

4. Deploy. The API URL should respond at `/health` with `{"ok":true}`.

### 3. Deploy the web project

1. Add another Vercel project using the same repository and set **Root Directory** to `apps/web`. Enable **Include source files outside of the Root Directory** here too.
2. Set the Build Command to `pnpm exec next build`; leave the detected pnpm install command.
3. Add these web project environment variables:

   | Variable | Value |
   | --- | --- |
   | `API_PROXY_TARGET` | Full API project URL, such as `https://your-api.vercel.app` |
   | `SITE_URL` | Full web project URL, such as `https://your-portfolio.vercel.app` |

4. Deploy the web project, then set the API project's `WEB_ORIGIN` to the web project's URL and redeploy the API. The web app proxies browser calls through `/api/v1`, so admin session cookies stay on the portfolio's own origin.
5. In Vercel, assign your custom domain to the web project when you have one. Update `SITE_URL` and the API's `WEB_ORIGIN` to match it, then redeploy both projects.

### 4. Verify the deployed portfolio

Open the web URL, confirm public sections load, sign in at `/login`, and test one image or résumé upload and one contact message. Configure Resend's verified recipient when using its test sender; sending email to arbitrary recipients requires a verified sending domain. Keep all API secrets in Vercel's Environment Variables, never in source control.

Vercel deploys each project independently. After changing an environment variable, redeploy the project that uses it. Removing `render.yaml` from this repository does not delete any existing Render services or Blueprint; remove those separately from the Render dashboard after Vercel is working.
