# HypeShelf

A shared recommendations hub where users sign in and share the stuff they're hyped about. Built with Next.js 16, Clerk, Convex, and TypeScript.

## Features

- **Public shelf** — Browse the latest recommendations without signing in
- **Authenticated dashboard** — Add, filter, and manage recommendations
- **Role-based access control** — Admin users can delete any recommendation and toggle Staff Picks
- **Real-time updates** — Powered by Convex subscriptions, no manual refresh needed
- **Defense-in-depth security** — Three-layer validation, RBAC in every mutation, security headers

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | App Router, SSR, proxy.ts route protection |
| [Clerk](https://clerk.com/) | Authentication, RBAC via publicMetadata |
| [Convex](https://convex.dev/) | Real-time backend, database, server-side validation |
| [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | Minimalist, accessible UI |
| [Zod](https://zod.dev/) | Client-side form validation |

## Architecture

```
Browser
  |
  v
proxy.ts (Clerk middleware — route protection)
  |
  v
Next.js App Router
  |-- app/page.tsx           (Public landing page)
  |-- app/dashboard/page.tsx (Authenticated dashboard)
  |-- app/sign-in, sign-up   (Clerk auth pages)
  |
  v
Convex (Backend)
  |-- recommendations.ts  (Queries + Mutations with RBAC)
  |-- users.ts             (User CRUD + webhook sync)
  |-- http.ts              (Clerk webhook handler)
  |-- helpers/auth.ts      (getAuthenticatedUser, requireRole)
  |-- helpers/validators.ts (Shared Convex validators)
```

### Project Structure

```
hypeshelf/
├── app/
│   ├── layout.tsx                    # Root layout: providers, header, footer
│   ├── page.tsx                      # Public landing page
│   ├── globals.css                   # Tailwind base + custom utilities
│   ├── sign-in/[[...sign-in]]/       # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/       # Clerk sign-up
│   └── dashboard/
│       ├── layout.tsx                # Authenticated layout
│       └── page.tsx                  # Dashboard with filters and CRUD
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── providers/
│   │   └── convex-clerk-provider.tsx # Auth + DB provider wrapper
│   ├── layout/
│   │   ├── header.tsx                # Auth-aware navigation
│   │   ├── footer.tsx                # Minimal footer
│   │   └── auth-buttons.tsx          # SignIn/SignUp/UserButton
│   ├── recommendations/
│   │   ├── recommendation-card.tsx   # Composable card (public + dashboard)
│   │   ├── recommendation-list.tsx   # Card grid with permission-based actions
│   │   ├── recommendation-form.tsx   # Validated form in dialog
│   │   ├── recommendation-skeleton.tsx # Loading skeleton
│   │   ├── genre-filter.tsx          # Genre toggle bar
│   │   ├── delete-confirmation.tsx   # Delete confirmation dialog
│   │   ├── staff-pick-badge.tsx      # Staff Pick visual indicator
│   │   └── staff-pick-toggle.tsx     # Admin-only toggle button
│   └── error-boundary.tsx            # Graceful error fallback
├── convex/
│   ├── schema.ts                     # Database schema (users + recommendations)
│   ├── auth.config.ts                # Clerk JWT provider config
│   ├── recommendations.ts            # All queries and mutations
│   ├── users.ts                      # User CRUD + webhook mutations
│   ├── http.ts                       # Clerk webhook endpoint
│   └── helpers/
│       ├── auth.ts                   # getAuthenticatedUser(), requireRole()
│       └── validators.ts             # Shared genre/field validators
├── hooks/
│   └── use-store-user.ts             # Auto-sync user to Convex on login
├── lib/
│   ├── constants.ts                  # GENRES, FIELD_LIMITS, APP_NAME
│   ├── validators.ts                 # Zod form schema
│   ├── roles.ts                      # Server-side role check helper
│   ├── url.ts                        # isSafeUrl() — protocol validation
│   └── utils.ts                      # cn() utility (shadcn)
├── types/
│   └── globals.d.ts                  # Clerk session claims types
├── proxy.ts                          # Clerk middleware (Next.js 16)
├── docs/
│   ├── ROADMAP.md                    # Project roadmap with ADRs
│   └── epics/                        # Detailed epic documentation
└── .env.local.example                # Environment variables template
```

## Prerequisites

- Node.js 20.9 or later
- A [Clerk](https://dashboard.clerk.com/) account (free tier — 10,000 MAUs)
- A [Convex](https://dashboard.convex.dev/) account (free tier)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/henrique-leme/hypeshelf.git
cd hypeshelf
npm install
```

### 2. Create a Clerk application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) and create a new application
2. Copy your **Publishable Key** and **Secret Key**

### 3. Configure Clerk JWT template for Convex

1. In Clerk Dashboard, go to **JWT Templates**
2. Click **New template** and select **Convex**
3. Do NOT rename the token — it must be called `convex`
4. Copy the **Issuer URL** (e.g., `https://verb-noun-00.clerk.accounts.dev`)

### 4. Create a Convex project

```bash
npx convex dev
```

This will prompt you to create a new project. Follow the instructions.

Then set the Clerk JWT issuer in Convex:

1. Go to [Convex Dashboard](https://dashboard.convex.dev/) > Your Project > **Settings** > **Environment Variables**
2. Add: `CLERK_JWT_ISSUER_DOMAIN` = your Clerk Issuer URL from step 3

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the values:

| Variable | Description | Where to find |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk Dashboard > API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard > API Keys |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Convex Dashboard > Settings |

### 6. Configure Clerk webhook (user sync)

1. In Clerk Dashboard, go to **Webhooks**
2. Add a new endpoint: `https://<your-convex-url>.convex.site/clerk-users-webhook`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret**
5. Add it to Convex Dashboard > Environment Variables as `CLERK_WEBHOOK_SECRET`

### 7. Set admin role

To make a user an admin:

1. Go to Clerk Dashboard > **Users** > select the user
2. Scroll to **Public Metadata**
3. Set: `{ "role": "admin" }`
4. Save

### 8. Run the development server

```bash
npm run dev
```

In a separate terminal, run Convex in development mode:

```bash
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000).

## RBAC Permission Matrix

| Action | `user` role | `admin` role |
|---|---|---|
| View all recommendations | Yes | Yes |
| Create recommendation | Yes | Yes |
| Delete own recommendation | Yes | Yes |
| Delete any recommendation | No | **Yes** |
| Toggle Staff Pick | No | **Yes** |

## Security

### Defense-in-depth validation

| Layer | Tool | Purpose |
|---|---|---|
| Client | Zod | Instant UX feedback, form validation |
| Server | Convex validators | Security boundary, never trust client |
| Protocol | isSafeUrl() | Blocks javascript:, data:, ftp: URLs |

### Server-side authorization

Every Convex mutation follows the same pattern:

1. `getAuthenticatedUser(ctx)` — verify authentication
2. `requireRole(user, "admin")` — verify authorization (admin-only operations)
3. Ownership check — verify the user owns the resource (delete own)
4. Input validation — verify field limits and URL safety
5. Execute operation

### HTTP security headers

Configured in `next.config.ts`:

- **Content-Security-Policy** — strict CSP allowing only self + Clerk + Convex
- **Strict-Transport-Security** — HSTS with 2-year max-age
- **X-Content-Type-Options** — nosniff
- **X-Frame-Options** — DENY
- **Referrer-Policy** — strict-origin-when-cross-origin
- **Permissions-Policy** — deny camera, microphone, geolocation

### OWASP Top 10 alignment

See [docs/ROADMAP.md](docs/ROADMAP.md#owasp-top-10-alignment) for the full mapping.

## Deployment

### Vercel (Frontend)

1. Import the repository in [Vercel](https://vercel.com/)
2. Set environment variables from `.env.local.example`
3. Deploy

### Convex (Backend)

```bash
npx convex deploy
```

### Post-deployment

1. Update Clerk webhook URL to the production Convex HTTP endpoint
2. Configure Clerk production instance keys in Vercel
3. Verify security headers at [securityheaders.com](https://securityheaders.com/)

## Documentation

- [Project Roadmap](docs/ROADMAP.md) — Epics, ADRs, security considerations
- [Epic Documentation](docs/epics/) — Detailed task breakdowns per epic
