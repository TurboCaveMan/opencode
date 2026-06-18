# Ultimate T3 SaaS Template 🚀

This is a production-ready, fully functional SaaS boilerplate built with the **T3 Stack** and tailored for rapid deployment on **Vercel** with a **Neon PostgreSQL** database. It features secure **Clerk** authentication, **Stripe** subscription payments, and end-to-end type safety via **tRPC** and **Drizzle ORM**.

---

## 🛠️ The Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **API**: [tRPC (Query Client & Server)](https://trpc.io/)
- **Authentication**: [Clerk Authentication](https://clerk.com/)
- **Payments**: [Stripe Subscriptions & Portal](https://stripe.com/)
- **Hosting**: [Vercel](https://vercel.com/)

---

## ⚡ Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and populate your secrets:
```bash
cp .env.example .env
```

Here is a checklist of the accounts and keys you need:

#### 🔹 Neon (Database)
1. Sign up at [Neon.tech](https://neon.tech/) and create a new PostgreSQL project.
2. Copy your pooled connection string and set `DATABASE_URL` in your `.env`.

#### 🔹 Clerk (Authentication)
1. Sign up at [Clerk.com](https://clerk.com/) and create a new application.
2. In the Clerk Dashboard under **API Keys**, copy the **Publishable Key** and **Secret Key**. Set:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

#### 🔹 Stripe (Billing)
1. Sign up at [Stripe.com](https://stripe.com/) and activate test mode.
2. Under **Developers -> API Keys**, copy the publishable and secret keys. Set:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
3. Create a subscription product in Stripe (e.g., "Pro Tier" at $19/month) and copy its **Price ID** (starts with `price_...`). Paste this Price ID in `src/app/dashboard/page.tsx` under the `handleUpgrade` function.

---

## 🔄 Local Webhook Testing

Webhooks synchronize user accounts and billing status between external services and your database.

### 1. Stripe Webhooks (using Stripe CLI)
To test billing changes locally, use the Stripe CLI to forward events:
```bash
# Log in to your Stripe account from CLI
stripe login

# Forward webhook events to your local handler
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the webhook signing secret returned by the CLI (starts with `whsec_...`) and paste it as `STRIPE_WEBHOOK_SECRET` in your `.env`.

### 2. Clerk Webhooks (using tunneling or forwarding)
To test Clerk user signups locally, you can use **ngrok** or **localtunnel** to expose your server:
```bash
npx localtunnel --port 3000
```
1. Copy your tunnel URL (e.g., `https://random-subdomain.localtunnel.me`).
2. Go to **Clerk Dashboard -> Webhooks -> Add Endpoint**.
3. Set the endpoint URL to `https://<your-subdomain>.localtunnel.me/api/webhooks/clerk`.
4. Subscribe to the following events: `user.created`, `user.updated`, `user.deleted`.
5. Copy the endpoint **Signing Secret** (starts with `whsec_...`) and set it as `CLERK_WEBHOOK_SECRET` in your `.env`.

---

## 🗄️ Database Migrations

Generate your schema and push it directly to your Neon Database:

```bash
# Push schema shifts directly to your database instance
npm run db:push

# Open the local Drizzle Studio GUI to inspect tables
npm run db:studio
```

---

## 🚀 Running the App

Start the development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deploying to Production (Vercel)

1. Create a new GitHub repository and push your project code:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **Add New -> Project**.
3. Select your GitHub repository.
4. Add all environment variables from `.env` in the project configuration (make sure `NEXT_PUBLIC_APP_URL` is set to your production domain, e.g., `https://your-domain.vercel.app`).
5. Click **Deploy**. Vercel will automatically build the site and deploy your serverless tRPC endpoints.
6. **IMPORTANT**: In production, go back to your **Clerk** and **Stripe** dashboards and register your production webhook endpoints pointing to:
   - `https://your-domain.vercel.app/api/webhooks/clerk`
   - `https://your-domain.vercel.app/api/webhooks/stripe`

---

## 📁 Project Architecture & Customization

This template is designed to be easily cloned and customized for any future SaaS project:

- **`src/server/db/schema.ts`**: Contains our database models. Add new models here to extend functionality.
- **`src/server/api/routers/billing.ts`**: High-performance procedures for billing. To customize pricing or support multiple pricing models, adapt `createCheckoutSession` with dynamic price maps.
- **`src/app/page.tsx`**: High-converting, fully customized SaaS Landing Page.
- **`src/app/dashboard/page.tsx`**: Secure workspace displaying subscription levels, Stripe billing portals, and an interactive database interface.
