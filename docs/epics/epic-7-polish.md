# EPIC 7: UX Polish & Production Readiness

> Loading states, error handling, responsive design, accessibility.

## Goal

Elevate the application from functional to production-quality. Every interaction should
feel smooth: loading states prevent layout shifts, errors are handled gracefully,
and the interface works across all devices and input methods.

## Status: Not Started

## Dependencies: EPIC 6

---

## Tasks

### Task 7.1 — Add loading states and error boundaries

**Status:** [ ] Not Started

**Description:**
Add skeleton loaders for all data-dependent sections, error boundaries for graceful
failure recovery, and toast notifications for user feedback on CRUD operations.

**Deliverables:**

- **Skeleton loaders:**
  - Recommendation card skeleton (pulse animation matching card layout)
  - Recommendation grid skeleton (3x2 grid of card skeletons)
  - Used in:
    - Public page while `getPublicRecent` loads
    - Dashboard while `getAll` / `getByGenre` loads
    - During genre filter switches

- **Error boundaries:**
  - Graceful fallback UI when a component tree crashes
  - "Something went wrong" message with retry button
  - Does not expose stack traces or internal errors

- **Toast notifications (sonner):**
  - Success: "Recommendation added" (on create)
  - Success: "Recommendation deleted" (on remove)
  - Success: "Staff Pick updated" (on toggle)
  - Error: Generic error message from ConvexError
  - Positioned bottom-right, auto-dismiss after 4 seconds

**Acceptance Criteria:**
- No blank screens while data loads (skeletons everywhere)
- Skeletons match the layout of actual content (no layout shift)
- Errors show friendly message, not stack traces
- Every CRUD action provides toast feedback
- Toasts auto-dismiss and are non-blocking

**Commit:** `feat: add loading skeletons, error boundaries, and toast notifications`

---

### Task 7.2 — Responsive design and accessibility pass

**Status:** [ ] Not Started

**Description:**
Final pass over all pages and components to ensure mobile responsiveness and
WCAG AA accessibility compliance. shadcn/ui components provide good baseline
accessibility, but custom components need verification.

**Deliverables:**

- **Responsive breakpoints:**
  - Mobile (< 640px): 1 column grid, stacked layout
  - Tablet (640px - 1024px): 2 column grid
  - Desktop (> 1024px): 3 column grid
  - Genre filter: horizontal scroll on mobile
  - Header: simplified on mobile
  - Form dialog: full-width on mobile

- **Accessibility verification:**
  - All interactive elements reachable via keyboard (Tab/Shift+Tab)
  - Focus indicators visible on all focusable elements
  - ARIA labels on icon-only buttons (delete, staff pick toggle)
  - Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
  - Screen reader: meaningful alt text, form labels, heading hierarchy
  - Dialog: focus trap, Escape to close (shadcn/ui handles this)

**Acceptance Criteria:**
- All pages render correctly on 375px viewport (iPhone SE)
- No horizontal scrollbar on any page (except genre filter intentionally)
- All interactive elements are keyboard accessible
- No color contrast violations
- Screen reader can navigate all content meaningfully
- Dialog focus trap works correctly

**Commit:** `feat: responsive design and accessibility improvements`
