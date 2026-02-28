# EPIC 2: Authentication & User Management

> Full Clerk + Convex integration with sign-in/sign-up, proxy route protection,
> user sync via webhooks, and RBAC foundation.

## Goal

Establish the complete authentication and authorization pipeline. After this epic,
users can sign in, their data syncs to Convex, routes are protected, and every
Convex mutation has reusable auth guards.

## Status: Completed

## Dependencies: EPIC 1

---

## Tasks

### Task 2.1 — Install and configure Clerk authentication

**Status:** [x] Completed

**Description:**
Integrate Clerk as the authentication provider. Create the proxy.ts file (Next.js 16
convention replacing middleware.ts) to protect dashboard routes at the network boundary.
Set up sign-in and sign-up pages using Clerk's pre-built components.

**Deliverables:**

- **`proxy.ts`** (project root):
  - Uses `clerkMiddleware()` from `@clerk/nextjs/server`
  - Protects `/dashboard(.*)` routes — unauthenticated users redirected to sign-in
  - Matcher config excludes static files and API routes

- **`app/sign-in/[[...sign-in]]/page.tsx`**:
  - Renders Clerk `<SignIn />` component
  - Centered layout

- **`app/sign-up/[[...sign-up]]/page.tsx`**:
  - Renders Clerk `<SignUp />` component
  - Centered layout

- **`lib/roles.ts`**:
  ```typescript
  checkRole(role: Role): Promise<boolean>
  // Reads Clerk session claims, checks metadata.role
  // For use in Next.js server components/actions
  ```

**Acceptance Criteria:**
- Visiting `/dashboard` while unauthenticated redirects to `/sign-in`
- Sign-in page renders Clerk UI correctly
- Sign-up page renders Clerk UI correctly
- `checkRole("admin")` returns true/false based on session claims

**Commit:** `feat: integrate Clerk auth with proxy route protection and sign-in/sign-up pages`

---

### Task 2.2 — Install and configure Convex backend

**Status:** [x] Completed

**Description:**
Set up Convex as the backend/database layer. Create the full database schema with
proper indexes, the Clerk JWT authentication config, and reusable server-side
authorization helpers that will be used in every protected mutation.

**Deliverables:**

- **`convex/auth.config.ts`**:
  ```typescript
  // Clerk JWT provider configuration
  // domain: CLERK_JWT_ISSUER_DOMAIN env var
  // applicationID: "convex"
  ```

- **`convex/schema.ts`**:
  - `users` table: clerkId, name, imageUrl?, role
  - `recommendations` table: title, genre, link, blurb, userId, isStaffPick
  - Indexes: by_clerk_id (users), by_genre (recommendations), by_user_id (recommendations)

- **`convex/helpers/validators.ts`**:
  - Genre union validator built from shared constants
  - Field length validation constants for Convex-side checks

- **`convex/helpers/auth.ts`**:
  ```typescript
  getAuthenticatedUser(ctx): Promise<Doc<"users">>
  // 1. Get identity from ctx.auth.getUserIdentity()
  // 2. If null -> throw ConvexError("UNAUTHENTICATED")
  // 3. Query users by tokenIdentifier
  // 4. If null -> throw ConvexError("USER_NOT_FOUND")
  // 5. Return user document

  requireRole(user: Doc<"users">, role: Role): void
  // If user.role !== role -> throw ConvexError("FORBIDDEN")
  ```

**Acceptance Criteria:**
- `npx convex dev` pushes schema successfully
- Schema types generate correctly in `convex/_generated/`
- Auth helpers compile with proper types
- Auth config references correct environment variable

**Commit:** `feat: setup Convex schema, auth config, and server-side authorization helpers`

---

### Task 2.3 — Create user management and Clerk webhook sync

**Status:** [x] Completed

**Description:**
Implement user storage in Convex with two sync mechanisms: client-initiated (on login)
and webhook-based (for external changes). Webhook handler uses svix for signature
verification to prevent forgery (ADR-003).

**Deliverables:**

- **`convex/users.ts`**:
  ```typescript
  store: mutation
  // Upsert user from JWT identity on login
  // Creates new user with role "user" if not exists
  // Updates name/imageUrl if changed

  getCurrentUser: query
  // Returns current authenticated user or null

  getByClerkId: internalQuery
  // Lookup user by Clerk ID (used by webhook handler)
  ```

- **`convex/http.ts`**:
  - HTTP action at `/clerk-users-webhook`
  - Verifies webhook signature using svix library
  - Handles events:
    - `user.created` — Insert new user with role "user"
    - `user.updated` — Update name, imageUrl, role from publicMetadata
    - `user.deleted` — Delete user document
  - Returns 200 on success, 400 on invalid signature

**Acceptance Criteria:**
- User store mutation creates/updates users correctly
- getCurrentUser returns the authenticated user
- Webhook handler verifies svix signatures
- Invalid signatures return 400 status
- User deletion cascades properly

**Commit:** `feat: implement Convex user management with Clerk webhook sync`

---

### Task 2.4 — Wire auth providers into app layout

**Status:** [x] Completed

**Description:**
Create the provider wrapper that combines ClerkProvider and ConvexProviderWithClerk,
and integrate the useStoreUser hook to automatically sync users to Convex on login.
Wire everything into the root layout.

**Deliverables:**

- **`components/providers/convex-clerk-provider.tsx`**:
  - ClerkProvider wraps ConvexProviderWithClerk (Clerk must be outer)
  - Passes Clerk's `useAuth` hook to Convex for token management
  - ConvexReactClient initialized with NEXT_PUBLIC_CONVEX_URL

- **`hooks/use-store-user.ts`** (or inline in provider):
  - Calls `users.store` mutation when user is authenticated
  - Tracks loading/authenticated state
  - Prevents duplicate calls

- **`app/layout.tsx`** updated:
  - Wraps children with ConvexClerkProvider
  - Keeps "use client" boundary minimal

**Acceptance Criteria:**
- App loads without hydration errors
- Signing in triggers user store mutation
- Convex queries work after authentication
- useConvexAuth() returns correct authentication state

**Commit:** `feat: wire Clerk and Convex providers into root layout with user auto-sync`
