namespace RezervacijaVjencanja.Services.Documents;

public interface IDocumentService
{
    Task<(byte[] Bytes, string Error)> GenerateClientInvoiceAsync(int weddingId);
    Task<(byte[] Bytes, string Error)> GenerateInternalReportAsync(int weddingId);
}
