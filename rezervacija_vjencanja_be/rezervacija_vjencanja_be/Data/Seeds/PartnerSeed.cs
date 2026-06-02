namespace RezervacijaVjencanja.Data.Seeds;

public static class PartnerSeed
{
    // PartnerTypeCode is used to look up the FK at seed time
    public record Entry(string Name, string PartnerTypeCode, decimal CommissionPercent);

    public static readonly IReadOnlyList<Entry> Data =
    [
        new("Luminous Band",  "BAND",         15m),
        new("DJ Stefan",      "BAND",         12m),
        new("Cvjetni Raj",    "FLORIST",      10m),
        new("Slastica Marija","PASTRY",       8m),
        new("FotoStudio Plus","PHOTOGRAPHER", 20m),
    ];
}
