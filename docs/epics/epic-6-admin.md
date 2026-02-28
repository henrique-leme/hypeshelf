# EPIC 6: Admin Features & Staff Pick

> Admin-specific capabilities with clear visual distinction.

## Goal

Enable admin users to manage all recommendations and highlight the best ones with
Staff Pick. Admin actions are visually distinct but use the same components (ADR-006).
All admin operations are enforced server-side in Convex mutations — the UI only
controls visibility, never authorization.

## Status: Completed

## Dependencies: EPIC 5

---

## Tasks

### Task 6.1 — Implement admin actions in dashboard

**Status:** [x] Completed

**Description:**
Add admin-specific UI elements to the existing recommendation cards and implement
the Staff Pick visual indicator. Admin users see additional action buttons on every
card, while regular users continue to see only their own card actions.

**Deliverables:**

- **`components/recommendations/staff-pick-badge.tsx`**:
  - Visual badge/indicator for staff-picked recommendations
  - Uses shadcn/ui Badge with distinctive styling (golden/amber)
  - Icon + "Staff Pick" text
  - Positioned prominently on the card

- **`components/recommendations/recommendation-card.tsx`** updated:
  - When `isStaffPick === true`:
    - Staff Pick badge displayed prominently
    - Optional subtle card border/highlight
  - Action slot receives admin-specific buttons when user.role === "admin":
    - Delete button on ALL cards (not just own)
    - "Staff Pick" / "Remove Staff Pick" toggle button
    - Toggle calls Convex `toggleStaffPick` mutation

- **`components/recommendations/recommendation-list.tsx`** updated:
  - Passes admin action buttons when currentUserRole === "admin"
  - Admin delete button appears on every card
  - Staff Pick toggle appears on every card

**Admin Permission Rendering:**

| Element | Regular User | Admin User |
|---|---|---|
| Delete own rec | Visible | Visible |
| Delete other's rec | Hidden | Visible |
| Staff Pick toggle | Hidden | Visible |
| Staff Pick badge | Visible (read-only) | Visible (read-only) |

**Acceptance Criteria:**
- Admin sees delete button on ALL recommendation cards
- Admin sees Staff Pick toggle on ALL cards
- Toggling Staff Pick updates the badge in real-time
- Staff Pick badge is visually distinctive (golden/amber)
- Regular users cannot see admin action buttons
- All admin actions are verified server-side (mutations throw FORBIDDEN for non-admin)
- Staff picked recommendations stand out visually

**Commit:** `feat: implement admin actions (delete any, toggle staff pick) with visual indicators`
