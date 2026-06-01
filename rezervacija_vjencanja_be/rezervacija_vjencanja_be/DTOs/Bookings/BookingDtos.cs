namespace RezervacijaVjencanja.DTOs.Bookings;

public sealed record BookingDto(
    int Id,
    int PartnerId,
    int WeddingId,
    string WeddingName,
    DateTime StartDateTime,
    DateTime EndDateTime,
    string WeddingPartnerStatus,
    string? Notes);

public sealed record AvailabilityDto(
    bool Available,
    IEnumerable<BookingDto> Conflicts);
