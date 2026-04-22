# Task: Catalog Item Metadata Editor

| | |
|---|---|
| **Epic** | 03 — Partner Catalog & Management |
| **Assignee** | Jelena Vučić |
| **Estimate** | 4 days |
| **Status** | Not Started |
| **Depends on** | Epic 01 Task 04 — Partner Management UI |

## Description

Improve the catalog item form (already partially built in Epic 01) by adding a rich metadata section that renders type-appropriate fields based on the partner type. The goal is that entering a band's songs feels natural and entering a florist's arrangements feels natural — even though they share the same underlying table.

## Acceptance Criteria

- [ ] Catalog item form shows a "Details" section below the base fields
- [ ] The "Details" section renders different fields per partner type + item type combination:
  - BAND + SERVICE → duration, setup time, included items (comma-separated text)
  - BAND + SONG → artist, genre, playlist name
  - FLORIST + PRODUCT → flowers (comma-separated), materials (comma-separated), photo URL, customizable toggle
  - PASTRY + PRODUCT → portion options (comma-separated numbers), flavors (comma-separated), customizable toggle
  - PHOTOGRAPHER + SERVICE → duration, includes video, includes drone, includes album, photo count, delivery days
  - VENUE + SERVICE → menu type (food/drinks/rental/extra), price type (per_person/flat), includes / dishes (textarea)
  - CATERING + SERVICE → price type, dishes (textarea), min persons
  - GENERIC → freeform JSON textarea
- [ ] Fields are pre-populated when editing an existing item (metadata deserialized on load)
- [ ] On save, metadata fields serialized back to JSON and stored in `Metadata` column
- [ ] "Items" ItemType selector only shown for partner types where SONG is applicable (BAND)
- [ ] BasePrice field hidden when ItemType = SONG

## Technical Notes

**Approach:** Hardcode the metadata schemas as a TypeScript const (no DB-driven schema needed for MVP):

```ts
// /src/utils/metadataSchemas.ts
type FieldDef = { key: string; label: string; type: 'text' | 'number' | 'boolean' | 'textarea' }

export const METADATA_SCHEMAS: Record<string, FieldDef[]> = {
  'BAND-SERVICE': [
    { key: 'durationHours', label: 'Duration (hours)', type: 'number' },
    { key: 'setupMinutes',  label: 'Setup time (min)',  type: 'number' },
    { key: 'includedItems', label: 'Included items',    type: 'text' },
  ],
  'BAND-SONG': [
    { key: 'artist',       label: 'Artist',   type: 'text' },
    { key: 'genre',        label: 'Genre',    type: 'text' },
    { key: 'playlistName', label: 'Playlist', type: 'text' },
  ],
  // ... add all types from partner-architecture.md
}
```

Key format: `{PARTNER_TYPE_CODE}-{ITEM_TYPE}`.

**Rendering:**
```ts
function MetadataForm({ partnerTypeCode, itemType, value, onChange }) {
  const schema = METADATA_SCHEMAS[`${partnerTypeCode}-${itemType}`]
  if (!schema) return <JsonTextarea value={value} onChange={onChange} />  // GENERIC fallback
  // render fields from schema, read/write to parsed JSON object
}
```

**Existing API in Epic 01 is sufficient** — no new backend endpoints needed for this task. The metadata is just a string field on the existing catalog item API.
