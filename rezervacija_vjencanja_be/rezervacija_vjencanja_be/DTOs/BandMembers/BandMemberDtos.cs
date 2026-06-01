namespace RezervacijaVjencanja.DTOs.BandMembers;

public sealed record BandMemberDto(
    int Id,
    int PartnerId,
    string Name,
    string? Role,
    string? Phone,
    string? Email);

public sealed record CreateBandMemberRequest(
    string Name,
    string? Role,
    string? Phone,
    string? Email);

public sealed record UpdateBandMemberRequest(
    string Name,
    string? Role,
    string? Phone,
    string? Email);
