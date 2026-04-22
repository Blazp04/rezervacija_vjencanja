# Task: Wedding CRUD

| | |
|---|---|
| **Epic** | 02 — Weddings & Templates |
| **Assignee** | Vinko Jakeljić |
| **Estimate** | 3 days |
| **Status** | Not Started |
| **Depends on** | Task 02-01 — Templates CRUD |

## Description

Full CRUD for weddings, including status flow management. Weddings are the central entity of the application. Status flow: `PREPARATION → CONFIRMED → COMPLETED` with `CANCELLED` possible from any state.

## Acceptance Criteria

- [ ] `GET /api/weddings` — list weddings, supports filters: `?status=PREPARATION&dateFrom=2025-01-01&dateTo=2025-12-31&search=name`
- [ ] `POST /api/weddings` — create wedding
- [ ] `GET /api/weddings/{id}` — get wedding detail (includes template info)
- [ ] `PUT /api/weddings/{id}` — update wedding fields
- [ ] `PATCH /api/weddings/{id}/status` — advance status (validated against allowed transitions)
- [ ] `DELETE /api/weddings/{id}` — sets Status = CANCELLED (no hard delete)
- [ ] Wedding form: Name, DateTime (date + time picker), Location, Template (dropdown), Notes
- [ ] Status badge shown on all wedding views
- [ ] Status can be advanced from the wedding detail page
- [ ] CANCELLED weddings shown with visual distinction (greyed out, strikethrough)

## Technical Notes

**Status transition rules** (enforce in service, not controller):
```
PREPARATION → CONFIRMED    ✅
PREPARATION → CANCELLED    ✅
CONFIRMED   → COMPLETED    ✅
CONFIRMED   → CANCELLED    ✅
COMPLETED   → (nothing)    ❌ terminal state
CANCELLED   → (nothing)    ❌ terminal state
```

Return `400 Bad Request` with clear message if invalid transition attempted.

**Controller:** `WeddingsController.cs`  
**Service:** `IWeddingService` + `WeddingService`

**Key DTOs:**
```csharp
public record CreateWeddingRequest(
    string Name,
    DateTime DateTime,
    string? Location,
    int? TemplateId,
    string? Notes
);

public record UpdateWeddingStatusRequest(string NewStatus);
```

**Note:** Wedding detail page at this stage only shows wedding info. The "Partners on wedding" section will be populated by Epic 04 — leave a placeholder tab/section for it.
