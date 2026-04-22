# Task: Band Member Management

| | |
|---|---|
| **Epic** | 03 — Partner Catalog & Management |
| **Assignee** | Jelena Vučić |
| **Estimate** | 2 days |
| **Status** | Not Started |
| **Depends on** | Epic 01 Task 04 — Partner UI (Members tab stub exists) |

## Description

Implement band member management in the partner detail page. The Members tab stub was created in Epic 01 — this task fills it in. Only partners of type BAND have this tab visible.

## Acceptance Criteria

- [ ] Members tab only visible on partner detail page when `PartnerType.Code == 'BAND'`
- [ ] Members tab shows a list of band members: name, role, phone, email
- [ ] "Add Member" button opens an inline form (or modal) with fields: Name, Role, Phone, Email
- [ ] Existing member can be edited inline or via edit button
- [ ] Member can be deleted with a confirmation prompt
- [ ] Empty state message when no members are added yet
- [ ] API endpoints used:
  - `GET /api/partners/{id}/members`
  - `POST /api/partners/{id}/members`
  - `PUT /api/partners/{id}/members/{memberId}`
  - `DELETE /api/partners/{id}/members/{memberId}`

## Technical Notes

These API endpoints were already built in Epic 01 Task 03. This is a pure frontend task.

**Suggested inline form approach:** show an empty row at the bottom of the table when "Add Member" is clicked. User fills in the row and hits Save/Enter to confirm. This keeps the UX fast without a full modal.

**Role examples to show as suggestions** (not enforced): Vocalist, Guitarist, Drummer, Bassist, Keyboardist, DJ, Sound Engineer.
