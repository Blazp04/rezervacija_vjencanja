namespace RezervacijaVjencanja.DTOs.PartnerTypes;

public sealed record PartnerTypeDto(int Id, string Name, string Code, bool HasBooking, string? FieldSchema);

public sealed record CreatePartnerTypeRequest(string Name, string Code, bool HasBooking, string? FieldSchema);

public sealed record UpdatePartnerTypeRequest(string Name, string Code, bool HasBooking, string? FieldSchema);
