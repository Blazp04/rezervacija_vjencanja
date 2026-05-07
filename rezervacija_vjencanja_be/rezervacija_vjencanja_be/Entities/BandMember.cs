namespace RezervacijaVjencanja.Entities;

public sealed class BandMember
{
    public int Id { get; set; }
    public int PartnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }

    public Partner Partner { get; set; } = null!;
}
