# Task: Templates CRUD

| | |
|---|---|
| **Epic** | 02 — Weddings & Templates |
| **Assignee** | Vinko Jakeljić |
| **Estimate** | 3 days |
| **Status** | Not Started |
| **Depends on** | Epic 01 Task 02 — DB schema |

## Description

Build full CRUD for wedding templates (backend + frontend). Templates are configuration presets the agency sets up once and reuses when creating weddings. They define which partner types are expected and provide default notes.

## Acceptance Criteria

- [ ] `GET /api/templates` — returns all active templates
- [ ] `POST /api/templates` — creates a template
- [ ] `GET /api/templates/{id}` — returns template detail
- [ ] `PUT /api/templates/{id}` — updates template
- [ ] `DELETE /api/templates/{id}` — soft deletes (IsActive = false)
- [ ] `/templates` — Template list page
- [ ] `/templates/new` — Create template form
- [ ] `/templates/:id/edit` — Edit template form
- [ ] Template form fields: Name, Description, DefaultNotes
- [ ] Template form has a "Required Partner Types" multi-select (shows all partner types from `/api/partner-types`)
- [ ] Each selected partner type has a "Required / Optional" toggle
- [ ] On save, `RequiredPartnerTypes` is serialized to JSON: `[{"typeCode":"BAND","required":true},...]`
- [ ] Template list shows name, description, number of required partner types

## Technical Notes

**Controller:** `WeddingTemplatesController.cs`

**Service:** `IWeddingTemplateService` + `WeddingTemplateService`

**DTO:**
```csharp
public record CreateTemplateRequest(
    string Name,
    string? Description,
    string? DefaultNotes,
    List<TemplatePartnerTypeDto> RequiredPartnerTypes
);

public record TemplatePartnerTypeDto(string TypeCode, bool Required);
```

Serialize `RequiredPartnerTypes` list to JSON string before saving to DB. Deserialize on read.

**Frontend:** `/pages/templates/` — keep template-related components separate from wedding components.
