namespace RezervacijaVjencanja.GraphQL.Inputs;

public record CreatePricingRuleInput(
    int CatalogItemId,
    string RuleType,
    byte? DayOfWeek,
    DateOnly? SpecificDate,
    decimal Price,
    DateOnly? ValidFrom,
    DateOnly? ValidTo);

public record UpdatePricingRuleInput(
    string RuleType,
    byte? DayOfWeek,
    DateOnly? SpecificDate,
    decimal Price,
    DateOnly? ValidFrom,
    DateOnly? ValidTo);
