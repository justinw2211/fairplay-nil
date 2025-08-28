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
- Auto-append system labels: "FMV Calculated" when `valuation_prediction` exists, "Cleared by NIL Go" when `clearinghouse_result === 'approved'`.

---

### Data Model

- Keep existing `status` string for backward compatibility.
- Add `status_labels` (array of strings) to `deals` for user-managed labels.
- System labels are derived from deal data and can be user-removable.

Allowed user labels:
- In Negotiation, Accepted, Active, Completed, Cleared by NIL Go

System labels (derived, user-removable):
- FMV Calculated → present if `valuation_prediction` is non-null
- Cleared by NIL Go → present if `clearinghouse_result === 'approved'`

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
  - `systemLabels: string[]` (computed, user-removable)
  - `onChange: (labels: string[]) => void`

Behavior:
- Checked items reflect `labels ∪ systemLabels`.
- System labels are user-removable but auto-reappear if underlying data changes.

2) Compute system labels in the table row

- If `deal.valuation_prediction` exists → include "FMV Calculated" in `systemLabels`.
- If `deal.clearinghouse_result === 'approved'` → include "Cleared by NIL Go" in `systemLabels`.

3) Persist user labels

- Optimistic update `deal.status_labels` on change, then `PATCH /api/deals/{id}` with `{ status_labels: [...] }`.

4) Add label filtering

- Add filter dropdown to table header for "Status" column.
- Allow filtering by any label (user or system).

5) Backward compatibility for `status`

- Keep the existing single `status` column display using the first selected user label (or leave as-is).

---

### UI Details

- Render all labels as badges in the Status cell: `[system] + [user]`.
- Color map continues via `StatusBadge.jsx`.
- Tooltip on system badges: "Auto-added based on deal data".
- Filter dropdown shows all available labels with counts.

---

### Example Interactions

- User checks "In Negotiation" and "Active" → both badges appear; persisted in `status_labels`.
- Deals with valuation results show "FMV Calculated"; user can remove it but it reappears if valuation data exists.
- Deals with approved clearinghouse show "Cleared by NIL Go"; user can remove it but it reappears if clearinghouse result is still 'approved'.
- User can remove any label; PATCH updates the array.
- Filter by "Active" shows only deals with that label.

---

### Testing

- Unit: `StatusMenu` renders options, allows system label removal, calls `onChange` with updated arrays.
- Integration: `DealsTable` row toggling performs optimistic update and rolls back on API failure.
- Backend: schema validator accepts only allowed user labels; rejects others with 400.
- Filter: label filtering works correctly and shows proper counts.

---

### Acceptance Criteria

- No runtime errors when interacting with the Status column.
- Users can add/remove labels; changes persist on refresh.
- "FMV Calculated" appears automatically when a valuation exists and can be removed by users.
- "Cleared by NIL Go" appears automatically when clearinghouse result is 'approved' and can be removed by users.
- System labels reappear automatically if underlying data changes.
- Label filtering works in the table header.
- Existing `status` field remains unaffected for now.

---

### Implementation Notes (how-to)

1) Create migration `025_add_status_labels_to_deals.sql` as shown above and apply.
2) Update `DealUpdate` in `backend/app/schemas.py` and `DEAL_SELECT_FIELDS` in `backend/app/api/deals.py`.
3) Refactor `StatusMenu.jsx` to use a checkbox group and the new props.
4) In `DealsTable.jsx`, compute `systemLabels` from `deal.valuation_prediction` and `deal.clearinghouse_result`, merge for display, and wire `onChange` to PATCH `status_labels`.
5) Add label filtering dropdown to table header.
6) Keep existing single `status` UI element until follow-up deprecation.

---

### Rollback Plan

- Revert migration (drop column) if needed: `ALTER TABLE deals DROP COLUMN status_labels;`
- Revert frontend to single-select `status` menu.

---

### PR Checklist

- Backend migration added and applied locally
- Schemas and `DEAL_SELECT_FIELDS` updated
- Frontend `StatusMenu` and `DealsTable` updated
- Label filtering added to table header
- Unit/integration tests added and passing
- Manual check: create deal → toggle labels → refresh → labels persist; run valuation → "FMV Calculated" appears automatically; run clearinghouse → "Cleared by NIL Go" appears automatically; test label filtering

---

### Clarifying Questions & Decisions

- **Labels set**: Keep exactly these user-selectable labels—In Negotiation, Accepted, Active, Completed, Cleared by NIL Go—or do you want others?
  - **Decision**: These are good for now

- **Legacy `status` string**: Keep it independent, or mirror it from a "primary" label? If mirrored, which label takes precedence?
  - **Decision**: Use best judgement (keep independent for now)

- **Auto labels**: Besides "FMV Calculated" (from `valuation_prediction`), should we auto-add "Cleared by NIL Go" when `clearinghouse_result === 'approved'`?
  - **Decision**: Yes

- **Removal rules**: If valuation data is deleted, should "FMV Calculated" disappear automatically? Confirm it remains non-removable by users.
  - **Decision**: Yes. This tag should also be removable by users

- **Persistence**: OK to add `status_labels jsonb` on `deals` and expose it via existing PUT/PATCH endpoints?
  - **Decision**: Use best judgement (yes, via existing endpoints)

- **Filters**: Do you want table filters by labels (e.g., show deals tagged "Active") now, or defer?
  - **Decision**: Yes

- **Bulk edit**: Should users be able to add/remove labels for multiple selected deals at once?
  - **Decision**: No

- **Limits**: Any max number of user labels per deal, or unlimited from the allowed set?
  - **Decision**: No limits

- **Ordering**: Preferred badge order? System labels first, then user labels alphabetically?
  - **Decision**: No specific ordering preference

- **Color map**: Keep current `StatusBadge` colors or tweak any (e.g., "Cleared by NIL Go"/"FMV Calculated")?
  - **Decision**: Use best judgement (keep current colors)

- **Mobile UX**: Any special behavior on small screens (truncate badges, collapse to "+N")?
  - **Decision**: Use best judgement (responsive design)

- **Audit/analytics**: Record label change history or surface label counts in Analytics now, or later?
  - **Decision**: No, do this in a future update
