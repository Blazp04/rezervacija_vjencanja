namespace RezervacijaVjencanja.Data.Seeds;

public static class PartnerTypeSeed
{
    public record Entry(string Name, string Code, bool HasBooking);

    public static readonly IReadOnlyList<Entry> Data =
    [
        new("Bend / DJ",            "BAND",         HasBooking: true),
        new("Cvjećar",              "FLORIST",      HasBooking: false),
        new("Slastičar",            "PASTRY",       HasBooking: false),
        new("Fotograf / Snimatelj", "PHOTOGRAPHER", HasBooking: true),
        new("Sala / Dvorana",       "VENUE",        HasBooking: true),
        new("Catering",             "CATERING",     HasBooking: false),
        new("Ostalo",               "GENERIC",      HasBooking: false),
    ];
}
