# Task: MT Pricing Auto-Calculation

| | |
|---|---|
| **Epic** | 04 — Wedding-Partner Linking |
| **Assignee** | Marija Musa |
| **Estimate** | 2 days |
| **Status** | Not Started |
| **Depends on** | Epic 01 Task 03 — Partner API (PricingService stub) |

## Description

Implement the MT pricing calculation endpoint and integrate it into the partner assignment flow. When a catalog item is selected for a wedding, the system automatically calculates the planned price based on the wedding date using the 3-tier MT pricing rules.

## Acceptance Criteria

**Backend:**
- [ ] `GET /api/weddings/{id}/pricing?catalogItemId={itemId}` — returns calculated price for a catalog item on the wedding's date
- [ ] Response: `{ basePrice, appliedRule (BASE/SPECIAL_DAY/SPECIFIC_DATE), calculatedPrice, ruleDescription }`
- [ ] Pricing algorithm correctly implements the 3-tier priority:
  1. SPECIFIC_DATE matching wedding date → use that price
  2. SPECIAL_DAY matching wedding date's day of week → use that price
  3. Fallback → use `PartnerCatalogItems.BasePrice`
- [ ] ValidFrom/ValidTo on pricing rules respected
- [ ] `PlannedPrice` on WeddingPartner is set automatically when `POST /api/weddings/{id}/partners` is called with a catalogItemId

**Frontend:**
- [ ] When user selects a catalog item in the "Add Partner" form, call the pricing endpoint and show the calculated price immediately
- [ ] Show which pricing tier was applied (e.g. "Saturday rate" or "Special date: 15 Aug")
- [ ] Price shown as read-only in the form — it's the planned/estimated price
- [ ] If catalog item is a SONG (no price), show "N/A"

## Technical Notes

**Pricing algorithm (C#):**
```csharp
public async Task<PriceResult> CalculatePriceAsync(int catalogItemId, DateTime weddingDate)
{
    var item = await _db.PartnerCatalogItems
        .Include(i => i.PricingRules)
        .FirstOrThrowAsync(i => i.Id == catalogItemId);

    var dateOnly = DateOnly.FromDateTime(weddingDate);
    var dayOfWeek = (int)weddingDate.DayOfWeek; // adjust for 1=Mon mapping
    // Note: .NET DayOfWeek: Sunday=0, Monday=1...Saturday=6
    // App convention: 1=Mon...7=Sun → convert: (int)dow == 0 ? 7 : (int)dow

    // 1. Check SPECIFIC_DATE
    var specificRule = item.PricingRules
        .Where(r => r.RuleType == "SPECIFIC_DATE"
                 && r.SpecificDate == dateOnly
                 && (r.ValidFrom == null || r.ValidFrom <= dateOnly)
                 && (r.ValidTo   == null || r.ValidTo   >= dateOnly))
        .FirstOrDefault();
    if (specificRule != null)
        return new PriceResult(specificRule.Price, "SPECIFIC_DATE", specificRule.SpecificDate.ToString());

    // 2. Check SPECIAL_DAY
    var specialRule = item.PricingRules
        .Where(r => r.RuleType == "SPECIAL_DAY"
                 && r.DayOfWeek == dayOfWeek
                 && (r.ValidFrom == null || r.ValidFrom <= dateOnly)
                 && (r.ValidTo   == null || r.ValidTo   >= dateOnly))
        .FirstOrDefault();
    if (specialRule != null)
        return new PriceResult(specialRule.Price, "SPECIAL_DAY", $"Day {specialRule.DayOfWeek}");

    // 3. Base price
    return new PriceResult(item.BasePrice ?? 0, "BASE", "Base price");
}
```

This service method was stubbed in Epic 01 Task 03 — implement it fully here.
