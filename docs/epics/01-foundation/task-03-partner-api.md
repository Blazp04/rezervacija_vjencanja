# Task: Generic Partner REST API

| | |
|---|---|
| **Epic** | 01 — Foundation |
| **Assignee** | Blaž Perić |
| **Estimate** | 4 days |
| **Status** | Not Started |
| **Depends on** | Task 02 — Database Schema |

## Description

Implement all REST API endpoints for the core partner system: partner types, partners, catalog items, and pricing rules. This is the API surface that all other epics consume when working with partners and their catalogs. See `docs/partner-architecture.md` for the full API surface.

## Acceptance Criteria

- [ ] `GET /api/partner-types` — returns all partner types
- [ ] `POST /api/partner-types` — creates a custom partner type
- [ ] `GET /api/partners` — returns all partners, supports `?typeCode=BAND&isActive=true&search=name`
- [ ] `POST /api/partners` — creates a partner
- [ ] `GET /api/partners/{id}` — returns partner with type info
- [ ] `PUT /api/partners/{id}` — updates partner
- [ ] `DELETE /api/partners/{id}` — soft deletes (sets `IsActive = false`)
- [ ] `POST /api/partners/{id}/clone` — deep-clones partner + all catalog items + pricing rules + band members
- [ ] `GET /api/partners/{id}/catalog` — returns all catalog items for a partner
- [ ] `POST /api/partners/{id}/catalog` — creates a catalog item
- [ ] `PUT /api/partners/{id}/catalog/{itemId}` — updates catalog item
- [ ] `DELETE /api/partners/{id}/catalog/{itemId}` — deletes catalog item
- [ ] `GET /api/catalog-items/{id}/pricing` — returns pricing rules for item
- [ ] `POST /api/catalog-items/{id}/pricing` — adds a pricing rule
- [ ] `PUT /api/catalog-items/{id}/pricing/{ruleId}` — updates rule
- [ ] `DELETE /api/catalog-items/{id}/pricing/{ruleId}` — deletes rule
- [ ] `GET /api/partners/{id}/members` — returns band members
- [ ] `POST /api/partners/{id}/members` — adds band member
- [ ] `PUT /api/partners/{id}/members/{memberId}` — updates member
- [ ] `DELETE /api/partners/{id}/members/{memberId}` — deletes member
- [ ] All endpoints return `ApiResponse<T>` shape
- [ ] `404` returned for non-existent resources, `400` for validation errors
- [ ] Input validated (required fields, value ranges)

## Technical Notes

**Controller structure:**
```
/Controllers/
  PartnerTypesController.cs
  PartnersController.cs
  CatalogItemsController.cs   ← handles /api/catalog-items/{id}/pricing
  BandMembersController.cs    ← or nested under PartnersController
```

**Service layer:**
```
/Services/
  IPartnerService.cs + PartnerService.cs
  ICatalogItemService.cs + CatalogItemService.cs
  IPricingService.cs + PricingService.cs
```

**Clone logic (PartnerService.CloneAsync):**
```csharp
// 1. Copy Partner row (new Id, Name += " (kopija)")
// 2. Copy all PartnerCatalogItems (new Ids, new PartnerId)
// 3. Copy all PricingRules for those items (new Ids, new CatalogItemIds)
// 4. Copy all BandMembers (new Ids, new PartnerId)
// 5. Save all in one transaction
```

**Metadata validation:** For MVP, store Metadata as raw string — call `ISJSON()` / `System.Text.Json.JsonDocument.Parse()` to validate it's well-formed JSON, but do not validate the internal shape.

**Price calculation helper** — add a static method now, it will be used in Epic 04:
```csharp
// PricingService.CalculatePrice(catalogItemId, DateTime weddingDate)
// Returns decimal price based on MT pricing priority
```
