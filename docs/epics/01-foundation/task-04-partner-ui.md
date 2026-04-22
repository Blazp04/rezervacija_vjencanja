# Task: Partner Management UI

| | |
|---|---|
| **Epic** | 01 — Foundation |
| **Assignee** | Blaž Perić |
| **Estimate** | 4 days |
| **Status** | Not Started |
| **Depends on** | Task 03 — Generic Partner API |

## Description

Build the React pages for managing partners. This includes the partner list, partner create/edit form, and the partner detail page with a catalog items tab. Other team members will extend these pages or reuse components from them, so clean component structure matters here.

## Acceptance Criteria

- [ ] `/partners` — Partner list page with search by name and filter by partner type
- [ ] Partner list shows: name, type badge, commission %, active status, actions (view, edit, delete, clone)
- [ ] `/partners/new` — Create partner form (all base fields + partner type selector)
- [ ] `/partners/:id` — Partner detail page with tabs:
  - **Info** tab: all partner fields (read + edit)
  - **Catalog** tab: list of catalog items for this partner
- [ ] `/partners/:id/catalog/new` — Add catalog item form
- [ ] Catalog item form shows: Name, Category, Description, ItemType, BasePrice
- [ ] Metadata section renders based on partner type (see Technical Notes)
- [ ] Pricing rules shown inline on each catalog item (expand row)
- [ ] Add/delete pricing rules from the catalog item row
- [ ] Clone button triggers clone API call and navigates to the cloned partner
- [ ] Band-type partners: show **Members** tab on detail page (list + add/delete)
- [ ] All API errors shown to user (toast or inline message)
- [ ] Loading states on all async operations

## Technical Notes

**Routing (react-router-dom):**
```
/partners                     → PartnerListPage
/partners/new                 → PartnerFormPage (create mode)
/partners/:id                 → PartnerDetailPage
/partners/:id/edit            → PartnerFormPage (edit mode)
```

**Metadata fields per partner type** — render a set of typed inputs based on selected `PartnerType.Code`. For MVP, hardcode the field sets per type:

```ts
const METADATA_SCHEMAS: Record<string, MetadataField[]> = {
  BAND_SERVICE: [
    { key: 'durationHours', label: 'Duration (hours)', type: 'number' },
    { key: 'setupMinutes',  label: 'Setup time (min)',  type: 'number' },
    { key: 'includedItems', label: 'Included items',    type: 'text' },
  ],
  BAND_SONG: [
    { key: 'artist',       label: 'Artist',  type: 'text' },
    { key: 'genre',        label: 'Genre',   type: 'text' },
    { key: 'playlistName', label: 'Playlist', type: 'text' },
  ],
  PHOTOGRAPHER_SERVICE: [ ... ],
  VENUE_SERVICE: [ ... ],
  // etc.
}
```

Key is `{partnerTypeCode}_{itemType}`. The form builds from this array — no dynamic schema engine needed for MVP.

**API service layer** (`/src/services/partnerService.ts`):
```ts
export const partnerService = {
  getAll: (params?) => fetch('/api/partners?...'),
  getById: (id) => fetch(`/api/partners/${id}`),
  create: (data) => fetch('/api/partners', { method: 'POST', ... }),
  update: (id, data) => ...,
  delete: (id) => ...,
  clone: (id) => ...,
  getCatalog: (id) => ...,
  // etc.
}
```

Keep all API calls in `/src/services/` — pages import from services, never call `fetch` directly.
