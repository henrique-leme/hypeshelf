# EPIC 5: Authenticated Dashboard Experience

> Full-featured dashboard: view all recommendations, filter by genre,
> add new ones, manage own recommendations.

## Goal

Build the core authenticated experience. Users can browse all recommendations,
filter by genre, add new ones via a validated form, and manage (delete) their own.
This epic does NOT include admin features — those are in EPIC 6.

## Status: Not Started

## Dependencies: EPIC 4

---

## Tasks

### Task 5.1 — Create dashboard layout and page structure

**Status:** [ ] Not Started

**Description:**
Create the dashboard shell and main page. The page structure includes a title,
genre filter bar, add-recommendation button, and the recommendation list.
Loading states are included from the start.

**Deliverables:**

- **`app/dashboard/layout.tsx`**:
  - Authenticated layout wrapper
  - Container with max-width and padding
  - Can include dashboard-specific navigation in the future

- **`app/dashboard/page.tsx`**:
  - Page heading: "All Recommendations"
  - Genre filter bar (component from Task 5.2)
  - "Add Recommendation" button (opens dialog from Task 5.3)
  - Recommendation list (component from Task 5.4)
  - Uses Convex `getAll` query (or `getByGenre` when filter active)
  - State management: selectedGenre (null = show all)
  - Loading skeleton while query loads

**Acceptance Criteria:**
- Page only accessible when authenticated (proxy.ts redirects otherwise)
- All recommendations display on initial load
- Loading skeleton shows while data loads
- Page structure is clean and scannable

**Commit:** `feat: create authenticated dashboard layout and page structure`

---

### Task 5.2 — Build genre filter component

**Status:** [ ] Not Started

**Description:**
Create a horizontal scrollable filter bar with genre toggle buttons. Uses the GENRES
constant as single source of truth. The "All" option clears the filter.

**Deliverables:**

- **`components/recommendations/genre-filter.tsx`**:
  - Props:
    - `selectedGenre: string | null` — currently active genre
    - `onGenreChange: (genre: string | null) => void` — callback
  - Renders:
    - "All" button — clears filter (genre = null)
    - One button per genre from GENRES constant
    - Active button: filled variant (shadcn/ui Button default)
    - Inactive buttons: outline variant
  - Horizontal scroll on mobile (overflow-x-auto)
  - Capitalized genre labels for display

**Acceptance Criteria:**
- All genres from GENRES constant render as buttons
- "All" button is present and clears the filter
- Only one genre can be active at a time
- Active genre has visually distinct styling
- Horizontal scroll works on small screens
- Clicking same genre twice does NOT deselect (use "All" for that)

**Commit:** `feat: build genre filter component with toggle buttons`

---

### Task 5.3 — Build recommendation form with validation

**Status:** [ ] Not Started

**Description:**
Create a validated form inside a modal dialog for adding new recommendations.
Uses react-hook-form with Zod resolver for client-side validation (UX layer).
Convex mutation handles server-side validation (security layer).

**Deliverables:**

- **`components/recommendations/recommendation-form.tsx`**:
  - Uses `react-hook-form` + `@hookform/resolvers/zod`
  - Schema: `recommendationFormSchema` from `lib/validators.ts`
  - Fields:
    - Title — shadcn/ui Input, max 100 chars, character count
    - Genre — shadcn/ui Select, options from GENRES constant
    - Link — shadcn/ui Input, type="url", validated as safe URL
    - Blurb — shadcn/ui Textarea, max 280 chars, character count
  - Submit button with loading state
  - On success:
    - Calls Convex `recommendations.create` mutation
    - Closes dialog
    - Shows success toast (sonner)
    - Resets form
  - On error:
    - Displays server error message in toast
    - Form remains open for correction
  - Wrapped in shadcn/ui Dialog:
    - Trigger: "Add Recommendation" button
    - Title: "Share a Recommendation"
    - Description: brief helper text

**Acceptance Criteria:**
- Form validates all fields before submission
- Character counts update in real-time
- Genre dropdown shows all options from GENRES
- Invalid URLs (javascript:, data:) are rejected client-side
- Successful submission creates recommendation and closes dialog
- Failed submission shows error and keeps dialog open
- Form resets after successful submission
- Loading state prevents double submission

**Commit:** `feat: build recommendation form with Zod validation and dialog wrapper`

---

### Task 5.4 — Build recommendation list with filtering and actions

**Status:** [ ] Not Started

**Description:**
Create the recommendation list that displays cards with user-specific action buttons.
Users can delete their own recommendations. Filtering integrates with the genre filter.
Includes delete confirmation dialog for safety.

**Deliverables:**

- **`components/recommendations/recommendation-list.tsx`**:
  - Props:
    - `recommendations: RecommendationWithAuthor[]`
    - `currentUserId: Id<"users"> | null`
    - `currentUserRole: Role`
  - Maps recommendations to RecommendationCard components
  - Passes action buttons based on permissions:
    - Own rec: Delete button
    - Admin: Delete button + Staff Pick toggle (EPIC 6)
    - Other's rec (non-admin): no actions
  - Empty state: friendly message when list is empty
  - Loading state: skeleton card grid

- **`components/recommendations/delete-confirmation.tsx`**:
  - Uses shadcn/ui AlertDialog
  - Title: "Delete Recommendation"
  - Description: "This action cannot be undone. This will permanently delete this recommendation."
  - Cancel + Confirm buttons
  - Confirm calls Convex `recommendations.remove` mutation
  - Shows toast on success/error

- **`app/dashboard/page.tsx`** updated:
  - Integrates genre filter state with query selection
  - When selectedGenre is null: uses `getAll` query
  - When selectedGenre is set: uses `getByGenre` query
  - Passes current user info to recommendation list

**Acceptance Criteria:**
- All recommendations render in responsive grid
- Own recommendations show delete button
- Other users' recommendations show no action buttons (for regular user)
- Delete confirmation dialog appears before deletion
- Deletion removes the card in real-time (Convex subscription)
- Genre filter switches between getAll and getByGenre
- Empty state displays when no recommendations match filter
- Loading skeleton shows while switching genres

**Commit:** `feat: build recommendation list with genre filtering, delete, and staff pick actions`
