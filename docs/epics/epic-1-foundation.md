# EPIC 1: Project Foundation & Security Infrastructure

> Scaffold the project with Next.js 16, configure security headers, setup UI library.
> No functionality yet — pure infrastructure with security-first configuration.

## Goal

Establish a solid, secure project foundation. Every configuration decision prioritizes
security (CSP, HSTS, etc.) from day one. Shared constants and utilities are created
here to be reused across all future epics (DRY principle).

## Status: Not Started

## Dependencies: EPIC 0

---

## Tasks

### Task 1.1 — Initialize Next.js 16 project with TypeScript and Tailwind

**Status:** [ ] Not Started

**Description:**
Create the Next.js application using `create-next-app` with the App Router, TypeScript,
and Tailwind CSS. Clean all boilerplate content to start with a blank canvas.

**Deliverables:**
- Next.js 16 project with App Router enabled
- TypeScript configuration
- Tailwind CSS 4.x configured
- ESLint configured
- Boilerplate cleaned (default page content, unused assets removed)

**Acceptance Criteria:**
- `npm run dev` starts successfully on localhost:3000
- No boilerplate content visible on the page
- TypeScript compilation passes with zero errors

**Commit:** `feat: initialize Next.js 16 project with TypeScript and Tailwind CSS`

---

### Task 1.2 — Configure security headers and environment template

**Status:** [ ] Not Started

**Description:**
Add comprehensive HTTP security headers to `next.config.ts` following OWASP recommendations.
Create an environment variables template so developers know exactly what's needed.

**Deliverables:**
- `next.config.ts` with all security headers:
  - `Content-Security-Policy` — self + Clerk + Convex domains whitelisted
  - `Strict-Transport-Security` — max-age=63072000; includeSubDomains; preload
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — camera=(), microphone=(), geolocation=(), browsing-topics=()
- `.env.local.example` with documented template of all required environment variables

**Environment Variables Template:**
```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Convex
NEXT_PUBLIC_CONVEX_URL=https://....convex.cloud
CLERK_JWT_ISSUER_DOMAIN=https://....clerk.accounts.dev

# Clerk Webhook (for Convex HTTP endpoint)
CLERK_WEBHOOK_SECRET=whsec_...
```

**Acceptance Criteria:**
- Security headers visible in browser DevTools Network tab
- CSP does not block Clerk or Convex resources
- .env.local.example contains all variables with descriptions

**Commit:** `feat: configure security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy)`

---

### Task 1.3 — Setup shadcn/ui component library

**Status:** [ ] Not Started

**Description:**
Initialize shadcn/ui and install all UI primitives needed across the application.
This provides accessible, composable components that follow WAI-ARIA standards.

**Deliverables:**
- shadcn/ui initialized (New York style, neutral theme)
- Components installed:
  - **Layout:** card, separator
  - **Forms:** button, input, label, textarea, select, form
  - **Feedback:** badge, dialog, sonner (toast)
  - **Data display:** avatar
  - **Navigation:** dropdown-menu

**Acceptance Criteria:**
- `components/ui/` directory populated with all listed components
- Components import and render without errors
- Tailwind config includes shadcn/ui theme extensions

**Commit:** `feat: setup shadcn/ui with base component library`

---

### Task 1.4 — Create shared constants, types, and utility functions

**Status:** [ ] Not Started

**Description:**
Create the shared foundation that all future epics depend on. These constants and
utilities are the single source of truth (ADR-007) used across Convex schema,
Zod validators, and UI components.

**Deliverables:**

- **`lib/constants.ts`** — App-wide constants:
  ```typescript
  APP_NAME = "HypeShelf"
  APP_TAGLINE = "Collect and share the stuff you're hyped about."
  GENRES = ["horror", "action", "comedy", "drama", "sci-fi", "documentary", "thriller", "romance", "animation"] as const
  FIELD_LIMITS = { TITLE_MAX: 100, BLURB_MAX: 280, LINK_MAX: 2048 }
  ```

- **`lib/url.ts`** — URL sanitization:
  ```typescript
  isSafeUrl(url: string): boolean
  // Returns true only for http:// and https:// protocols
  // Blocks javascript:, data:, ftp:, file:, etc.
  ```

- **`lib/validators.ts`** — Zod schemas:
  ```typescript
  recommendationFormSchema: z.object({
    title: z.string().min(1).max(FIELD_LIMITS.TITLE_MAX),
    genre: z.enum(GENRES),
    link: z.string().url().max(FIELD_LIMITS.LINK_MAX).refine(isSafeUrl),
    blurb: z.string().min(1).max(FIELD_LIMITS.BLURB_MAX),
  })
  ```

- **`types/globals.d.ts`** — Clerk session claims extension:
  ```typescript
  type Role = "user" | "admin"
  interface CustomJwtSessionClaims {
    metadata: { role?: Role }
  }
  ```

**Acceptance Criteria:**
- Constants are serializable (work across server/client boundary)
- `isSafeUrl` rejects javascript:, data:, ftp:, file: protocols
- `isSafeUrl` accepts http:// and https:// URLs
- Zod schema validates correct inputs and rejects invalid ones
- TypeScript types compile without errors

**Commit:** `feat: add shared constants, URL sanitizer, Zod validators, and Clerk types`
