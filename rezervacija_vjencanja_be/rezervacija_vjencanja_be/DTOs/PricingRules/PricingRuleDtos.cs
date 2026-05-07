namespace RezervacijaVjencanja.DTOs.PricingRules;

public sealed record PricingRuleDto(
    int Id,
    int CatalogItemId,
    string RuleType,
    byte? DayOfWeek,
    DateOnly? SpecificDate,
    decimal Price,
    DateOnly? ValidFrom,
    DateOnly? ValidTo);

public sealed record CreatePricingRuleRequest(
    int CatalogItemId,
    string RuleType,
    byte? DayOfWeek,
    DateOnly? SpecificDate,
    decimal Price,
    DateOnly? ValidFrom,
    DateOnly? ValidTo);

public sealed record UpdatePricingRuleRequest(
    string RuleType,
    byte? DayOfWeek,
    DateOnly? SpecificDate,
    decimal Price,
    DateOnly? ValidFrom,
    DateOnly? ValidTo);
