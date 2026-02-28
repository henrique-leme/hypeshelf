# HypeShelf — Project Roadmap

> A shared recommendations hub for friends. Collect and share the stuff you're hyped about.

## Project Overview

HypeShelf is a full-stack web application where users can sign in and share their favorite movie
recommendations in a clean, public shelf. Built as a technical assessment demonstrating
senior-level engineering with healthcare/financial-grade security practices.

### Tech Stack Justification

| Technology | Choice | Reasoning |
|---|---|---|
| Framework | Next.js 16 (App Router) | Latest stable version, SSR/SSG support, proxy.ts for route protection |
| Auth | Clerk (@clerk/nextjs 6.35+) | Battle-tested auth, built-in RBAC via publicMetadata, Next.js 16 support |
| Backend/DB | Convex | Real-time subscriptions, type-safe queries/mutations, built-in validation, serverless |
| Styling | Tailwind CSS 4.x + shadcn/ui | Utility-first CSS + accessible, composable components. Minimal bundle |
| Validation | Zod (client) + Convex validators (server) | Defense-in-depth: UX validation + security boundary validation |
| Language | TypeScript 5.x | End-to-end type safety from DB schema to UI components |

### Evaluation Criteria Mapping

| Criteria | How We Address It |
|---|---|
| Code structure and clarity | DRY/KISS/SOLID, reusable helpers, clear naming, organized by domain |
| Security-minded thinking | 3-layer validation, RBAC in every mutation, CSP/HSTS headers, URL sanitization |
| UX and practicality | Real-time updates, loading skeletons, responsive design, accessible components |
| Documentation and reasoning | This ROADMAP, README with setup guide, ADRs explaining every decision |

---

## Architecture Decision Records (ADRs)

### ADR-001: Convex as sole backend (no Next.js API routes)

- **Context:** Need a backend for CRUD operations, auth validation, and data storage.
- **Decision:** Use Convex for ALL backend logic. No Next.js API routes.
- **Reasoning:** Convex provides real-time subscriptions, automatic caching, type-safe mutations,
  built-in argument validation, and server-side auth checks. Adding API routes would create
  duplicate logic and break the single-responsibility principle.
- **Consequence:** All business logic lives in `convex/` directory. Frontend communicates
  exclusively through Convex hooks (useQuery, useMutation).

### ADR-002: Clerk publicMetadata for RBAC (not Organizations)

- **Context:** Need role-based access control with two roles: user and admin.
- **Decision:** Store roles in Clerk's publicMetadata, expose via session token claims.
- **Reasoning:** Organizations feature is designed for B2B multi-tenant apps (like GitHub teams).
  publicMetadata is simpler, stores role in the JWT token (zero extra requests), and is
  tamper-proof (only modifiable server-side). Perfect for B2C role assignment.
- **Consequence:** Admin sets roles via Clerk Dashboard. Role available instantly in session
  claims and Convex mutations.

### ADR-003: Webhook-based user sync (not client-initiated)

- **Context:** Need to keep Convex users table in sync with Clerk.
- **Decision:** Use Clerk webhooks (user.created, user.updated, user.deleted) verified with svix.
- **Reasoning:** Client-initiated mutations miss edge cases: admin changes role in dashboard,
  user deleted from Clerk, profile updated outside the app. Webhooks guarantee eventual
  consistency. Svix signature verification prevents webhook forgery.
- **Consequence:** Need to configure webhook endpoint in Clerk Dashboard and handle HTTP
  actions in Convex. More reliable than useEffect-based sync.

### ADR-004: proxy.ts for route protection (Next.js 16)

- **Context:** Need to protect /dashboard routes from unauthenticated access.
- **Decision:** Use proxy.ts (Next.js 16 convention, replaces middleware.ts).
- **Reasoning:** Protects routes at the network boundary BEFORE any component code runs.
  Runs on Node.js runtime (not Edge). Combined with Clerk's clerkMiddleware(), provides
  authentication check + role-based redirects at the proxy layer.
- **Consequence:** Unauthenticated users are redirected before any dashboard code loads.
  Additional authorization checks still happen in Convex mutations (defense in depth).

### ADR-005: Defense-in-depth validation strategy

- **Context:** Need input validation for user-submitted recommendations.
- **Decision:** Three layers of validation: Zod (client) -> Convex validators (server) -> URL sanitizer.
- **Reasoning:** Client validation provides instant UX feedback. Server validation is the
  security boundary (never trust client). URL sanitizer adds protocol-level protection
  against XSS via javascript:/data: URLs. Each layer serves a different purpose.
- **Consequence:** Validation logic is defined once in constants (GENRES, FIELD_LIMITS) and
  used by both Zod schemas and Convex validators. DRY maintained.

### ADR-006: Component composition over prop drilling

- **Context:** RecommendationCard needs different behavior on public page vs dashboard.
- **Decision:** Card accepts optional action slot/props. Rendering logic determined by parent.
- **Reasoning:** Follows Open/Closed principle — card is open for extension (actions) but
  closed for modification. Same component renders read-only on public page and interactive
  on dashboard.
- **Consequence:** One RecommendationCard component, multiple use cases. No conditional
  rendering based on route.

### ADR-007: Shared constants as single source of truth

- **Context:** Genre list and field limits used in schema, validators, and UI.
- **Decision:** Define once in lib/constants.ts, import everywhere.
- **Reasoning:** If a genre is added, change one file. No risk of schema/validator/UI mismatch.
  True DRY across the full stack (Convex schema, Zod schema, UI select options).
- **Consequence:** Constants must be serializable (no functions) to work across server/client boundary.

---

## Security Considerations

### OWASP Top 10 Alignment

| OWASP Risk | Mitigation |
|---|---|
| A01: Broken Access Control | RBAC in every Convex mutation, proxy.ts route protection, ownership checks |
| A02: Cryptographic Failures | HTTPS enforced via HSTS, Clerk handles credential storage, no secrets in client |
| A03: Injection | Convex parameterized queries (no raw SQL), input validation, URL sanitization |
| A04: Insecure Design | Threat model documented, auth checks at multiple layers, principle of least privilege |
| A05: Security Misconfiguration | Security headers configured, .env.local.example documents all vars, no defaults |
| A06: Vulnerable Components | Modern stack with active maintenance, npm audit in CI |
| A07: Auth Failures | Clerk handles auth (battle-tested), session management, MFA support |
| A08: Data Integrity Failures | Server-side validation mandatory, Convex schema enforcement |
| A09: Logging Failures | Convex provides built-in function logs, errors surfaced to client safely |
| A10: SSRF | No server-side URL fetching, URLs only rendered as links (user clicks) |

### HTTP Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
  img-src 'self' https://img.clerk.com data:; font-src 'self';
  connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.clerk.accounts.dev;
  frame-src https://*.clerk.accounts.dev; object-src 'none'; base-uri 'self';
  form-action 'self'; frame-ancestors 'none';
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
```

---

## Epics Index

| Epic | Name | Tasks | Status |
|---|---|---|---|
| [EPIC 0](epics/epic-0-planning.md) | Project Planning & Documentation Bootstrap | 1 | Completed |
| [EPIC 1](epics/epic-1-foundation.md) | Project Foundation & Security Infrastructure | 4 | Not Started |
| [EPIC 2](epics/epic-2-authentication.md) | Authentication & User Management | 4 | Not Started |
| [EPIC 3](epics/epic-3-backend-logic.md) | Backend Business Logic | 2 | Not Started |
| [EPIC 4](epics/epic-4-public-page.md) | Public Landing Page | 2 | Not Started |
| [EPIC 5](epics/epic-5-dashboard.md) | Authenticated Dashboard Experience | 4 | Not Started |
| [EPIC 6](epics/epic-6-admin.md) | Admin Features & Staff Pick | 1 | Not Started |
| [EPIC 7](epics/epic-7-polish.md) | UX Polish & Production Readiness | 2 | Not Started |
| [EPIC 8](epics/epic-8-documentation.md) | Final Documentation | 2 | Not Started |

**Total: 22 tasks across 9 epics**
