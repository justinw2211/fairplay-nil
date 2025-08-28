### Student-Athlete Dashboard — Status Column Fix

**Goal**: Enable selecting/removing status labels in the dashboard table without errors, and auto-apply the label "FMV Calculated" when a deal has a valuation result.

---

### Current Bug

Clicking a status option throws a runtime error due to a prop API mismatch between the status menu and its caller.

```16:28:frontend/src/components/StatusMenu.jsx
const StatusMenu = ({ currentStatus, onSelect }) => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost" size="sm" w="100%">
        <StatusBadge status={currentStatus} />
      </MenuButton>
      <MenuList>
        {statuses.map(status => (
          <MenuItem key={status} onClick={() => onSelect(status)}>
            <StatusBadge status={status} />
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
```

```552:555:frontend/src/components/DealsTable.jsx
<StatusMenu deal={deal} onStatusChange={handleStatusChange}>
  <StatusBadge status={deal.status} />
</StatusMenu>
```

Result: `onSelect is not a function` when choosing a menu item.

---

### Fix Scope

- Align component APIs to remove the error.
- Support multiple user-selectable status labels (add/remove) and persist them server-side.
- Auto-append a system label: "FMV Calculated" when `valuation_prediction` exists for the deal.

---

### Data Model

- Keep existing `status` string for backward compatibility.
- Add `status_labels` (array of strings) to `deals` for user-managed labels.
- Treat "FMV Calculated" as a system label derived from `valuation_prediction` (not user-writable).

Allowed user labels (initial set):
- In Negotiation, Accepted, Active, Completed, Cleared by NIL Go

System label (derived):
- FMV Calculated → present if `valuation_prediction` is non-null

---

### Backend Changes

1) Migration: add `status_labels jsonb NOT NULL DEFAULT '[]'::jsonb`

File: `backend/migrations/025_add_status_labels_to_deals.sql`

```sql
-- Adds user-managed labels to deals
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS status_labels jsonb NOT NULL DEFAULT '[]'::jsonb;
```

2) API schema: include `status_labels` in request/response

- In `backend/app/schemas.py` → `DealUpdate`:
  - Add `status_labels: Optional[List[str]] = None`
  - Optional validator to restrict values to the allowed set

- In `backend/app/api/deals.py`:
  - Add `status_labels` to `DEAL_SELECT_FIELDS` so lists and single fetch include it.

No additional endpoint required; existing `PUT /api/deals/{id}` and `PATCH` paths already handle updates.

---

### Frontend Changes

1) Fix prop API mismatch and support multi-select labels

- Replace the current menu with a checkbox group. Prop signature:
  - `labels: string[]` (user-managed labels)
  - `systemLabels: string[]` (computed, read-only)
  - `onChange: (labels: string[]) => void`

Behavior:
- Checked items reflect `labels ∪ systemLabels`.
- System labels are disabled in the UI and cannot be unchecked.

2) Compute system labels in the table row

- If `deal.valuation_prediction` exists → include "FMV Calculated" in `systemLabels`.

3) Persist user labels

- Optimistic update `deal.status_labels` on change, then `PATCH /api/deals/{id}` with `{ status_labels: [...] }`.

4) Backward compatibility for `status`

- Keep the existing single `status` column display using the first selected user label (or leave as-is). This plan focuses on labels; a later clean-up can deprecate `status` if desired.

---

### UI Details

- Render all labels as badges in the Status cell: `[system] + [user]`.
- Color map continues via `StatusBadge.jsx`.
- Tooltip on disabled system badge: "Added automatically after valuation analysis".

---

### Example Interactions

- User checks "In Negotiation" and "Active" → both badges appear; persisted in `status_labels`.
- Deals with valuation results always show "FMV Calculated"; checkbox disabled.
- User can remove any user-added label; PATCH updates the array.

---

### Testing

- Unit: `StatusMenu` renders options, disables system labels, calls `onChange` with updated arrays.
- Integration: `DealsTable` row toggling performs optimistic update and rolls back on API failure.
- Backend: schema validator accepts only allowed user labels; rejects others with 400.

---

### Acceptance Criteria

- No runtime errors when interacting with the Status column.
- Users can add/remove labels; changes persist on refresh.
- "FMV Calculated" appears automatically when a valuation exists and cannot be removed by the user.
- Existing `status` field remains unaffected for now.

---

### Implementation Notes (how-to)

1) Create migration `025_add_status_labels_to_deals.sql` as shown above and apply.
2) Update `DealUpdate` in `backend/app/schemas.py` and `DEAL_SELECT_FIELDS` in `backend/app/api/deals.py`.
3) Refactor `StatusMenu.jsx` to use a checkbox group and the new props.
4) In `DealsTable.jsx`, compute `systemLabels` from `deal.valuation_prediction`, merge for display, and wire `onChange` to PATCH `status_labels`.
5) Keep existing single `status` UI element until follow-up deprecation.

---

### Rollback Plan

- Revert migration (drop column) if needed: `ALTER TABLE deals DROP COLUMN status_labels;`
- Revert frontend to single-select `status` menu.

---

### PR Checklist

- Backend migration added and applied locally
- Schemas and `DEAL_SELECT_FIELDS` updated
- Frontend `StatusMenu` and `DealsTable` updated
- Unit/integration tests added and passing
- Manual check: create deal → toggle labels → refresh → labels persist; run valuation → "FMV Calculated" appears automatically


