# EPIC 3: Backend Business Logic

> All Convex queries and mutations for recommendations CRUD with full
> server-side authorization and input validation in every operation.

## Goal

Implement the complete data access layer. Every query that requires auth checks it.
Every mutation validates inputs AND checks authorization. This is the security boundary
of the application (ADR-005).

## Status: Not Started

## Dependencies: EPIC 2

---

## Tasks

### Task 3.1 — Implement recommendation queries

**Status:** [ ] Not Started

**Description:**
Create all read operations for recommendations. The public query requires no authentication
(for the landing page), while authenticated queries provide full data with author details.
All queries join user data to avoid N+1 patterns.

**Deliverables:**

- **`convex/recommendations.ts`** — Queries:

  ```typescript
  getPublicRecent: query
  // No auth required (public landing page)
  // Returns latest 10 recommendations ordered by _creationTime desc
  // Joins: user name + imageUrl for each recommendation
  // Returns: { ...rec, authorName, authorImageUrl }

  getAll: query
  // Auth required (calls getAuthenticatedUser)
  // Returns ALL recommendations ordered by _creationTime desc
  // Joins: user name + imageUrl
  // Returns: { ...rec, authorName, authorImageUrl }

  getByGenre: query
  // Auth required
  // Args: { genre: GenreValidator }
  // Returns recommendations filtered by genre
  // Uses by_genre index for efficient lookup
  // Joins: user name + imageUrl
  ```

**Acceptance Criteria:**
- `getPublicRecent` returns max 10 items without authentication
- `getAll` throws UNAUTHENTICATED if called without auth
- `getByGenre` returns only matching genre
- All queries include author name and image
- Queries use indexes where applicable

**Commit:** `feat: implement Convex recommendation queries (public, all, by-genre)`

---

### Task 3.2 — Implement recommendation mutations with authorization

**Status:** [ ] Not Started

**Description:**
Create all write operations with full authorization enforcement. Every mutation follows
the same pattern: authenticate -> authorize -> validate -> execute. This is the
security boundary — no mutation trusts client input.

**Deliverables:**

- **`convex/recommendations.ts`** — Mutations:

  ```typescript
  create: mutation
  // 1. getAuthenticatedUser(ctx) — verifies authentication
  // 2. Validate args via Convex validators:
  //    - title: v.string() (max FIELD_LIMITS.TITLE_MAX)
  //    - genre: genreValidator (union of literals)
  //    - link: v.string() (max FIELD_LIMITS.LINK_MAX)
  //    - blurb: v.string() (max FIELD_LIMITS.BLURB_MAX)
  // 3. Validate link is safe URL (http/https only)
  //    - If unsafe -> throw ConvexError("INVALID_URL")
  // 4. Insert recommendation with:
  //    - userId: authenticated user's _id
  //    - isStaffPick: false (default)

  remove: mutation
  // 1. getAuthenticatedUser(ctx)
  // 2. Args: { recommendationId: v.id("recommendations") }
  // 3. Fetch recommendation by ID
  //    - If not found -> throw ConvexError("NOT_FOUND")
  // 4. Authorization check:
  //    - If user.role === "admin" -> allowed (can delete any)
  //    - If rec.userId === user._id -> allowed (owns it)
  //    - Otherwise -> throw ConvexError("FORBIDDEN")
  // 5. Delete the recommendation

  toggleStaffPick: mutation
  // 1. getAuthenticatedUser(ctx)
  // 2. requireRole(user, "admin") — admin only
  // 3. Args: { recommendationId: v.id("recommendations") }
  // 4. Fetch recommendation by ID
  //    - If not found -> throw ConvexError("NOT_FOUND")
  // 5. Toggle: patch isStaffPick to !current value
  ```

**Authorization Matrix Enforced:**

| Mutation | user role | admin role |
|---|---|---|
| create | Allowed | Allowed |
| remove (own rec) | Allowed | Allowed |
| remove (other's rec) | FORBIDDEN | Allowed |
| toggleStaffPick | FORBIDDEN | Allowed |

**Acceptance Criteria:**
- `create` inserts recommendation with correct userId
- `create` rejects unsafe URLs (javascript:, data:)
- `create` rejects inputs exceeding field limits
- `remove` allows owner to delete their own rec
- `remove` allows admin to delete any rec
- `remove` throws FORBIDDEN for non-owner non-admin
- `toggleStaffPick` only works for admin role
- `toggleStaffPick` flips the boolean correctly
- All mutations throw UNAUTHENTICATED without valid auth

**Commit:** `feat: implement recommendation mutations (create, remove, toggleStaffPick) with RBAC`
