# EPIC 4: Public Landing Page

> Beautiful, responsive public page with HypeShelf branding, latest recommendations,
> and clear call-to-action for sign-in.

## Goal

Create the first visual impression of HypeShelf. The landing page must work without
authentication, showcase recent recommendations, and funnel users to sign in.
Components built here (header, recommendation-card) are reused in the dashboard (ADR-006).

## Status: Not Started

## Dependencies: EPIC 3

---

## Tasks

### Task 4.1 — Create header, footer, and layout components

**Status:** [ ] Not Started

**Description:**
Build the global layout shell components. The header is auth-aware: it shows sign-in/sign-up
buttons for anonymous users and the user avatar/menu for authenticated users.
These components wrap every page in the application.

**Deliverables:**

- **`components/layout/header.tsx`**:
  - HypeShelf brand text (from APP_NAME constant)
  - Navigation links: Home (always), Dashboard (when authenticated)
  - Auth state rendering:
    - Unauthenticated: Sign In + Sign Up buttons (shadcn/ui Button)
    - Authenticated: Clerk `<UserButton />` with avatar
  - Responsive: hamburger menu on mobile (or simplified layout)

- **`components/layout/auth-buttons.tsx`**:
  - Reusable component that renders correct auth UI based on state
  - Uses Clerk's `<SignedIn>`, `<SignedOut>` components
  - Wraps `<SignInButton>`, `<SignUpButton>`, `<UserButton>`

- **`components/layout/footer.tsx`**:
  - Minimal footer with copyright and "Built with Next.js, Clerk & Convex"

- **`app/layout.tsx`** updated:
  - Add Header above children
  - Add Footer below children
  - Consistent padding/max-width container

**Acceptance Criteria:**
- Header renders brand name
- Unauthenticated view shows Sign In / Sign Up buttons
- Authenticated view shows user avatar
- Dashboard link only visible when signed in
- Footer renders on all pages
- Layout is responsive

**Commit:** `feat: create header, footer, and auth-aware navigation components`

---

### Task 4.2 — Build public landing page

**Status:** [ ] Not Started

**Description:**
Build the home page that anonymous users see. It features a hero section with branding,
a grid of the latest recommendations (real-time from Convex), and a call-to-action.
This page uses the RecommendationCard in read-only mode (no action buttons).

**Deliverables:**

- **`app/page.tsx`**:
  - Hero section:
    - APP_NAME in large heading
    - APP_TAGLINE as subtitle
    - "Sign in to add yours" CTA button (links to /sign-in)
  - "Latest Recommendations" section:
    - Uses `getPublicRecent` Convex query
    - Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
    - Maps to RecommendationCard components (read-only mode)
  - Empty state:
    - Friendly message when no recommendations exist
    - Still shows CTA to sign in

- **`components/recommendations/recommendation-card.tsx`**:
  - Props: recommendation data + optional action slot (ReactNode)
  - Displays:
    - Title (heading)
    - Genre badge (shadcn/ui Badge with color per genre)
    - Blurb (paragraph)
    - External link (opens in new tab with `rel="noopener noreferrer"`)
    - Author info: avatar (shadcn/ui Avatar) + name
    - Staff Pick badge (when isStaffPick === true)
  - Action slot: empty on public page, filled on dashboard
  - Uses shadcn/ui Card as container

**Acceptance Criteria:**
- Landing page loads without authentication
- Hero section displays APP_NAME and APP_TAGLINE
- CTA button navigates to sign-in
- Latest recommendations display in responsive grid
- Empty state renders when no recommendations exist
- External links have rel="noopener noreferrer" (security)
- Genre badges display with appropriate styling
- Staff pick items show visual indicator

**Commit:** `feat: build public landing page with latest recommendations and CTA`
