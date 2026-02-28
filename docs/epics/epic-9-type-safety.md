# EPIC 9: Type Safety & Code Quality

> Eliminate inline types, centralize shared DTOs, strengthen typing across backend and frontend.
> Zero `any`, zero duplicated interfaces, single source of truth for data shapes.

## Goal

Ensure the codebase uses proper TypeScript types with zero `any` usage, shared DTO
interfaces for cross-boundary data shapes, and domain types (`Role`) instead of
primitive strings. This directly addresses the evaluation criterion: "Code structure
and clarity."

## Status: Completed

## Dependencies: EPIC 3

---

## Tasks

### Task 9.1 — Eliminate `any` types and rename parameters

**Status:** [x] Completed

**Description:**
Replace all `any` types in Convex backend files with proper generated types.
Rename abbreviated parameter names (`ctx` → `context`) for clarity.

**Deliverables:**
- `convex/recommendations.ts`: `enrichWithAuthor` typed with `QueryCtx` and `Doc<"recommendations">`
- `convex/users.ts`: `Record<string, string>` → `Partial<Pick<Doc<"users">, "name" | "imageUrl">>`
- `convex/http.ts`: `Record<string, unknown>` → `{ role?: string }`, union literal event types
- `convex/helpers/auth.ts`: `AuthCtx` → `AuthContext`, `ctx` → `context`
- All handlers across all Convex files: `ctx` → `context`

**Acceptance Criteria:**
- Zero `any` in Convex source files (excluding `_generated/`)
- All parameters use descriptive names
- `npx tsc --noEmit` passes with zero errors

---

### Task 9.2 — Create shared DTO for RecommendationWithAuthor

**Status:** [x] Completed

**Description:**
The recommendation-with-author data shape was defined inline in `recommendation-list.tsx`
and implicitly returned by `enrichWithAuthor()`. Extract to a single shared DTO that
serves as the contract between backend and frontend.

**Deliverables:**
- `types/recommendations.ts`: `RecommendationWithAuthor` type extending `Doc<"recommendations">`
- `convex/recommendations.ts`: explicit return type `Promise<RecommendationWithAuthor>` on `enrichWithAuthor`
- `components/recommendations/recommendation-list.tsx`: imports DTO instead of defining inline
- `components/recommendations/recommendation-card.tsx`: props derived via `Pick<RecommendationWithAuthor, ...>`

**Acceptance Criteria:**
- Single source of truth for the recommendation-with-author shape
- No inline `RecommendationWithAuthor` interface in components
- Card props are derived from the DTO, not manually duplicated

---

### Task 9.3 — Extract Clerk webhook types

**Status:** [x] Completed

**Description:**
Move the `ClerkWebhookEvent` interface from inline in `convex/http.ts` to a dedicated
type file with properly separated data and event interfaces.

**Deliverables:**
- `types/clerk.ts`: `ClerkWebhookData` and `ClerkWebhookEvent` interfaces
- `convex/http.ts`: imports from `types/clerk` instead of defining inline

**Acceptance Criteria:**
- Webhook types are reusable if additional webhook handlers are needed
- Event type uses union literal instead of `string`
- No `Record<string, unknown>` for metadata

---

### Task 9.4 — Use domain types instead of primitives

**Status:** [x] Completed

**Description:**
Replace `string` with the `Role` domain type where user roles are referenced.

**Deliverables:**
- `components/recommendations/recommendation-list.tsx`: `currentUserRole: string` → `currentUserRole: Role`

**Acceptance Criteria:**
- TypeScript enforces valid role values at compile time
- No primitive `string` used where `Role` applies
