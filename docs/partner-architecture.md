# Partner Architecture — Generalized Partner Model

## Problem Statement

The application has 7+ partner types (band, florist, pastry, photographer, venue, catering, generic). Each type has a "catalog" of things they offer:

| Partner Type | Their Catalog |
|-------------|--------------|
| Band / DJ | Service packages (4h, 6h...) + Songs (playlist) |
| Florist | Floral arrangements |
| Pastry | Cakes and sweets |
| Photographer | Photo/video packages |
| Venue | Food menus, drink packages, room rental |
| Catering | Menus and packages |
| Generic | Anything |

The naive approach would create a separate table for each type (`BandPackages`, `FloristArrangements`, `VenueMenus`...). This creates unnecessary duplication, since all of these are fundamentally the same thing: **a catalog item with a name, category, description, and price**.

---

## Solution: Generic Catalog Item

All catalog entries for all partner types are stored in a single `PartnerCatalogItems` table. The `Metadata` column (JSON) holds any fields that are specific to the item type.

```
Partner
  └── PartnerCatalogItems[]
        ├── Id, Name, Category, Description
        ├── ItemType  (SERVICE | PRODUCT | SONG)
        ├── BasePrice
        └── Metadata  (JSON — shape varies by partner type)
              └── PricingRules[]  (SPECIAL_DAY, SPECIFIC_DATE overrides)
```

**Result:** one set of CRUD endpoints, one React form, one CSV importer — used by all partner types. The metadata shape is the only thing that differs.

---

## Data Model

### Core Tables

```
PartnerTypes                     Partners
────────────────────             ────────────────────────────────
Id                               Id
Name         "Bend / DJ"         Name         "Bend Harmonia"
Code         "BAND"              Address
HasBooking   1                   Phone / Email / Website
FieldSchema  (JSON, optional)    PartnerTypeId  ──────────────→ PartnerTypes.Id
                                 CommissionPercent
                                 ExtraFields  (JSON, optional)
                                 IsActive


PartnerCatalogItems              PricingRules
────────────────────────         ─────────────────────────────────
Id                               Id
PartnerId ──────────────────→    CatalogItemId ───────────────→ PartnerCatalogItems.Id
Name         "Premium 6h"        RuleType   SPECIAL_DAY | SPECIFIC_DATE
Category     "Premium"           DayOfWeek  6  (Saturday)
Description                      SpecificDate  2025-08-15
ItemType     SERVICE|PRODUCT|SONG Price      3200.00
BasePrice    2800.00              ValidFrom / ValidTo
Metadata     (JSON)
SortOrder
IsActive


BandMembers
────────────────────────
Id
PartnerId ───────────────────→ Partners.Id
Name, Role, Phone, Email
```

### Linking Tables

```
Weddings                         WeddingPartners
──────────────────────           ───────────────────────────────────
Id                               Id
Name                             WeddingId  ──────────────────→ Weddings.Id
DateTime                         PartnerId  ──────────────────→ Partners.Id
Location                         CatalogItemId ───────────────→ PartnerCatalogItems.Id
TemplateId                       Status     PROPOSED|OFFERED|CONFIRMED|CANCELLED
Status                           PlannedPrice   (calculated at assignment time)
Notes                            ActualPrice    (entered on confirmation)
                                 CommissionPercent  (snapshot from partner)
                                 Notes

Bookings
─────────────────────────────────────────────────────
Id
PartnerId        ──────────────────────────────────→ Partners.Id
WeddingId        ──────────────────────────────────→ Weddings.Id
WeddingPartnerId ──────────────────────────────────→ WeddingPartners.Id
StartDateTime / EndDateTime
Notes
```

---

## Partner Type → Catalog Item Mapping

| Partner Type | ItemType Used | What Category Means | Key Metadata Fields |
|-------------|--------------|---------------------|---------------------|
| **BAND** | `SERVICE` | "Standard", "Premium", "DJ" | `durationHours`, `setupMinutes`, `includedItems[]` |
| **BAND** | `SONG` | Genre (pop, rock, folk...) | `artist`, `genre`, `playlistName` |
| **FLORIST** | `PRODUCT` | Bouquets, Table, Car, Church... | `flowers[]`, `materials[]`, `photoUrl`, `customizable` |
| **PASTRY** | `PRODUCT` | Wedding cake, Cookies, Candy bar... | `portionOptions[]`, `flavors[]`, `customizable` |
| **PHOTOGRAPHER** | `SERVICE` | Photo, Video, Drone... | `durationHours`, `includesVideo`, `includesDrone`, `includesAlbum`, `photoCount`, `deliveryDays` |
| **VENUE** | `SERVICE` | Food menu, Drinks, Room rental, Extras | `menuType` (food/drinks/rental/extra), `priceType` (per_person/flat), `dishes[]` or `includes[]` |
| **CATERING** | `SERVICE` | Menu, Package | `priceType`, `dishes[]`, `minPersons` |
| **GENERIC** | `SERVICE`/`PRODUCT` | Anything | Freeform JSON |

> **Songs** (ItemType=`SONG`) have no `BasePrice` — they are informational only (playlist management). They are never directly used in pricing.

---

## Metadata JSON Reference

### BAND — Service Package
```json
{
  "durationHours": 6,
  "setupMinutes": 60,
  "includedItems": ["live music", "PA system", "lighting rig"]
}
```

### BAND — Song
```json
{
  "artist": "Bijelo Dugme",
  "genre": "rock",
  "playlistName": "Main Set"
}
```

### FLORIST — Arrangement
```json
{
  "flowers": ["red rose", "lily", "greenery"],
  "materials": ["satin ribbon", "floral foam"],
  "photoUrl": "https://example.com/photo.jpg",
  "customizable": true
}
```

### PASTRY — Product
```json
{
  "portionOptions": [50, 100, 150, 200],
  "flavors": ["vanilla", "chocolate", "strawberry"],
  "customizable": true
}
```

### PHOTOGRAPHER — Package
```json
{
  "durationHours": 8,
  "includesVideo": true,
  "includesDrone": false,
  "includesAlbum": true,
  "photoCount": 400,
  "videoMinutes": 30,
  "deliveryDays": 60
}
```

### VENUE — Food Menu
```json
{
  "menuType": "food",
  "priceType": "per_person",
  "dishes": [
    { "course": "starter", "items": ["salad", "soup"] },
    { "course": "main", "items": ["roast lamb", "grilled chicken"] },
    { "course": "dessert", "items": ["fruit platter"] }
  ],
  "minPersons": 80
}
```

### VENUE — Drinks Package
```json
{
  "menuType": "drinks",
  "priceType": "per_person",
  "type": "open_bar",
  "includes": ["wine", "beer", "spirits", "soft drinks"]
}
```

### VENUE — Room Rental
```json
{
  "menuType": "rental",
  "priceType": "flat",
  "capacity": 250,
  "includes": ["tables", "chairs", "AC", "parking", "projector"]
}
```

### GENERIC — Freeform
```json
{
  "description": "anything the user wants to store",
  "customField1": "value"
}
```

---

## MT Pricing System (3-tier)

### How It Works

Each priceable catalog item (`SERVICE`, `PRODUCT`) has:

1. **`BasePrice`** on the `PartnerCatalogItems` record — the default price
2. **`PricingRules`** table rows for price overrides:
   - `SPECIAL_DAY` + `DayOfWeek (1-7)` — e.g. every Saturday costs more
   - `SPECIFIC_DATE` + `SpecificDate` — e.g. August 15th (Assumption Day) fixed price

### Price Lookup Algorithm

```
function getPrice(catalogItemId, date):
  1. Find PricingRules WHERE CatalogItemId = id
        AND RuleType = 'SPECIFIC_DATE'
        AND SpecificDate = date
        AND (ValidFrom IS NULL OR ValidFrom <= date)
        AND (ValidTo IS NULL OR ValidTo >= date)
     → if found, return that Price (highest priority)

  2. Find PricingRules WHERE CatalogItemId = id
        AND RuleType = 'SPECIAL_DAY'
        AND DayOfWeek = DATEPART(dw, date)  [1=Mon...7=Sun in app logic]
        AND (ValidFrom IS NULL OR ValidFrom <= date)
        AND (ValidTo IS NULL OR ValidTo >= date)
     → if found, return that Price

  3. Return PartnerCatalogItems.BasePrice  (fallback)
```

### Example

| Catalog Item | BasePrice | Special (Sat) | Specific (15 Aug) |
|-------------|-----------|---------------|-------------------|
| Band Premium 6h | 2,500 KM | 3,200 KM | 4,000 KM |

If the wedding is on Saturday 15 August → price = **4,000 KM** (specific date wins).  
If the wedding is on Saturday 20 September → price = **3,200 KM** (special day).  
If the wedding is on Thursday 10 October → price = **2,500 KM** (base).

---

## Booking / Conflict Detection System

Only applies to partner types where `PartnerTypes.HasBooking = 1`: **BAND**, **PHOTOGRAPHER**, **VENUE**.

### When a booking is created

A `Bookings` row is created when `WeddingPartners.Status` transitions to `CONFIRMED`. The `StartDateTime` and `EndDateTime` come from the wedding's date/time + estimated duration.

### Conflict check SQL

```sql
SELECT COUNT(*)
FROM   Bookings
WHERE  PartnerId = @partnerId
  AND  Id != @currentBookingId  -- exclude own row on update
  AND  StartDateTime < @newEnd
  AND  EndDateTime   > @newStart
```

If count > 0 → conflict exists → API returns `409 Conflict` with details.

### Flow

```
POST /api/weddings/{id}/partners/{wpId}/confirm
  → validate ActualPrice is set
  → run conflict check for partner
  → if conflict: return 409 with conflicting booking info
  → if clear: update WeddingPartners.Status = 'CONFIRMED'
              create Bookings row
```

---

## Partner Clone

Clone performs a deep copy of:
- The `Partners` record (with new Id, name gets " (kopija)" suffix)
- All `PartnerCatalogItems` for that partner
- All `PricingRules` for those items
- All `BandMembers` (if BAND type)

Does **not** copy:
- Bookings
- WeddingPartner links

Endpoint: `POST /api/partners/{id}/clone`

---

## API Surface Summary

```
# Partner Types
GET  /api/partner-types
POST /api/partner-types

# Partners
GET    /api/partners                     ?typeCode=BAND&isActive=true
POST   /api/partners
GET    /api/partners/{id}
PUT    /api/partners/{id}
DELETE /api/partners/{id}
POST   /api/partners/{id}/clone

# Catalog Items
GET    /api/partners/{id}/catalog
POST   /api/partners/{id}/catalog
PUT    /api/partners/{id}/catalog/{itemId}
DELETE /api/partners/{id}/catalog/{itemId}
POST   /api/partners/{id}/catalog/import  ← CSV

# Pricing Rules
GET    /api/catalog-items/{id}/pricing
POST   /api/catalog-items/{id}/pricing
PUT    /api/catalog-items/{id}/pricing/{ruleId}
DELETE /api/catalog-items/{id}/pricing/{ruleId}

# Band Members
GET    /api/partners/{id}/members
POST   /api/partners/{id}/members
PUT    /api/partners/{id}/members/{memberId}
DELETE /api/partners/{id}/members/{memberId}

# Bookings / Availability
GET    /api/partners/{id}/bookings
GET    /api/partners/{id}/availability?start=...&end=...
```

---

## Frontend Notes

### Partner form
The partner creation/edit form has a static top section (name, address, contact, commission) and a dynamic bottom section that switches based on the selected `PartnerTypeId`:
- BAND → show "Members" tab + "Catalog (Services + Songs)" tab
- FLORIST / PASTRY → show "Catalog (Products)" tab only
- PHOTOGRAPHER → show "Catalog (Packages)" tab only
- VENUE → show "Catalog (Menus & Offers)" tab only
- GENERIC → show "Catalog (Services)" tab with free metadata

### Catalog item form
Each catalog item form has fixed fields (`Name`, `Category`, `Description`, `ItemType`, `BasePrice`) and a metadata section that renders differently per partner type:
- Render metadata fields as a typed JSON editor using predefined field schemas per partner type
- For MVP: a simple set of predefined fields per type is sufficient — no need for a dynamic schema builder

### CSV Import
All catalog imports share the same endpoint and table and use **column mapping**. The user's CSV can have any column names — a two-step flow lets them map their columns to the target fields before the import runs.

**Import endpoints:**
- `POST /api/partners/{id}/catalog/import/preview` — reads headers + first 3 rows, returns them for the mapping UI
- `POST /api/partners/{id}/catalog/import` — runs the import with a `mapping` JSON form field that specifies which CSV column maps to which target field (name, category, description, itemType, basePrice, metadata)

**Target fields and defaults when a column is not mapped:**

| Target Field | Required | Default if unmapped |
|-------------|----------|---------------------|
| `name` | ✅ | — (error if missing) |
| `category` | no | null |
| `description` | no | null |
| `itemType` | no | `"SERVICE"` |
| `basePrice` | no | null |
| `metadata` | no | null |

The `metadata` column value is stored as-is if it is valid JSON; otherwise it is stored as `null`. No validation of the metadata shape is required for MVP.

See [epics/03-partners/task-05-csv-import.md](epics/03-partners/task-05-csv-import.md) for the full flow, mapping format, and CsvHelper implementation details.
