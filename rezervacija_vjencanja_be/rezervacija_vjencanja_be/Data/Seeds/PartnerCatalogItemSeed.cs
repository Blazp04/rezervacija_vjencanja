namespace RezervacijaVjencanja.Data.Seeds;

public static class PartnerCatalogItemSeed
{
    // PartnerName is used to look up the FK at seed time
    public record Entry(string PartnerName, string Name, string Category, string ItemType, decimal BasePrice, int SortOrder);

    public static readonly IReadOnlyList<Entry> Data =
    [
        // Luminous Band
        new("Luminous Band",   "4-satna svirka",           "Bend",        "SERVICE", 800m,  1),
        new("Luminous Band",   "6-satna svirka",           "Bend",        "SERVICE", 1200m, 2),
        new("Luminous Band",   "DJ za plesnu muziku",      "DJ",          "SERVICE", 500m,  3),
        // DJ Stefan
        new("DJ Stefan",       "DJ svirka (4h)",           "DJ",          "SERVICE", 600m,  1),
        new("DJ Stefan",       "DJ svirka (8h)",           "DJ",          "SERVICE", 1000m, 2),
        // Cvjetni Raj
        new("Cvjetni Raj",     "Dekoracija sale",          "Dekoracija",  "SERVICE", 1500m, 1),
        new("Cvjetni Raj",     "Cvjetni aranžman za stol", "Cvijeće",    "PRODUCT", 150m,  2),
        // Slastica Marija
        new("Slastica Marija", "Torta sa jagodama",        "Torte",       "SERVICE", 400m,  1),
        new("Slastica Marija", "Kolačići (1kg)",           "Kolačići",   "PRODUCT", 100m,  2),
        // FotoStudio Plus
        new("FotoStudio Plus", "Fotografiranje (8h)",      "Fotografija", "SERVICE", 2000m, 1),
        new("FotoStudio Plus", "Foto album (100 str)",     "Proizvodi",   "PRODUCT", 500m,  2),
    ];
}
