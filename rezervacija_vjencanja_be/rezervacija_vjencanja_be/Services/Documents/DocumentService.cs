using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.Documents;

public sealed class DocumentService(AppDbContext db) : IDocumentService
{
    private const string AgencyName = "Wedding Agency d.o.o.";
    private const string AgencyContact = "Tel: +387 33 000 000 | Email: info@wedding-agency.ba";

    public async Task<(byte[] Bytes, string Error)> GenerateClientInvoiceAsync(int weddingId)
    {
        var wedding = await db.Weddings
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == weddingId);

        if (wedding is null)
            return ([], $"Wedding with id {weddingId} was not found.");

        var partners = await db.WeddingPartners
            .AsNoTracking()
            .Where(wp => wp.WeddingId == weddingId)
            .Include(wp => wp.Partner).ThenInclude(p => p.PartnerType)
            .Include(wp => wp.CatalogItem)
            .ToListAsync();

        var hasUnconfirmed = partners.Any(wp => wp.Status != "CONFIRMED" && wp.Status != "CANCELLED");
        if (hasUnconfirmed)
            return ([], "All partners must be confirmed (or cancelled) before generating invoice.");

        var confirmedPartners = partners.Where(wp => wp.Status == "CONFIRMED").ToList();

        var bytes = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                page.Header().Element(header => BuildInvoiceHeader(header, wedding));
                page.Content().Element(content => BuildInvoiceContent(content, wedding, confirmedPartners));
                page.Footer().Element(BuildFooter);
            });
        }).GeneratePdf();

        return (bytes, string.Empty);
    }

    public async Task<(byte[] Bytes, string Error)> GenerateInternalReportAsync(int weddingId)
    {
        var wedding = await db.Weddings
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == weddingId);

        if (wedding is null)
            return ([], $"Wedding with id {weddingId} was not found.");

        var partners = await db.WeddingPartners
            .AsNoTracking()
            .Where(wp => wp.WeddingId == weddingId)
            .Include(wp => wp.Partner).ThenInclude(p => p.PartnerType)
            .Include(wp => wp.CatalogItem)
            .ToListAsync();

        var hasUnconfirmed = partners.Any(wp => wp.Status != "CONFIRMED" && wp.Status != "CANCELLED");
        if (hasUnconfirmed)
            return ([], "All partners must be confirmed (or cancelled) before generating the report.");

        var confirmedPartners = partners.Where(wp => wp.Status == "CONFIRMED").ToList();

        var bytes = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                page.Header().Element(header => BuildReportHeader(header, wedding));
                page.Content().Element(content => BuildReportContent(content, wedding, confirmedPartners));
                page.Footer().Element(footer =>
                {
                    footer.AlignCenter()
                        .Text("INTERNO — NIJE ZA KLIJENTA")
                        .FontSize(8).FontColor(Colors.Red.Darken2).Bold();
                });
            });
        }).GeneratePdf();

        return (bytes, string.Empty);
    }

    private static void BuildInvoiceHeader(IContainer container, Wedding wedding)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(inner =>
                {
                    inner.Item().Text(AgencyName).FontSize(18).Bold().FontColor(Colors.BlueGrey.Darken3);
                    inner.Item().Text(AgencyContact).FontSize(9).FontColor(Colors.Grey.Darken1);
                });
                row.ConstantItem(150).AlignRight().Column(inner =>
                {
                    inner.Item().Text("FAKTURA").FontSize(20).Bold().FontColor(Colors.BlueGrey.Darken3);
                    inner.Item().Text($"Br: R-{wedding.Id}-{wedding.DateTime.Year}")
                        .FontSize(11).FontColor(Colors.Grey.Darken2);
                    inner.Item().Text($"Datum: {DateTime.Today:dd.MM.yyyy}")
                        .FontSize(9).FontColor(Colors.Grey.Darken1);
                });
            });

            col.Item().PaddingTop(10).BorderBottom(1).BorderColor(Colors.BlueGrey.Lighten3).Element(_ => { });

            col.Item().PaddingTop(8).Row(row =>
            {
                row.RelativeItem().Column(inner =>
                {
                    inner.Item().Text("Za:").FontSize(9).FontColor(Colors.Grey.Darken1);
                    inner.Item().Text(wedding.Name).FontSize(13).Bold();
                    if (!string.IsNullOrEmpty(wedding.Location))
                        inner.Item().Text(wedding.Location).FontSize(10);
                    inner.Item().Text($"Datum vjenčanja: {wedding.DateTime:dd.MM.yyyy}").FontSize(9);
                });
            });
        });
    }

    private static void BuildInvoiceContent(IContainer container, Wedding wedding, List<WeddingPartner> partners)
    {
        decimal grandTotal = 0;

        container.PaddingTop(20).Column(col =>
        {
            // Table
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(cols =>
                {
                    cols.RelativeColumn(3);   // Service
                    cols.RelativeColumn(2.5f); // Partner
                    cols.ConstantColumn(70);   // Unit price
                    cols.ConstantColumn(55);   // Commission %
                    cols.ConstantColumn(80);   // Client price
                });

                // Header
                table.Header(header =>
                {
                    void HeaderCell(string text) =>
                        header.Cell().Background(Colors.BlueGrey.Darken3).Padding(6)
                            .Text(text).FontColor(Colors.White).FontSize(9).Bold();

                    HeaderCell("Usluga");
                    HeaderCell("Partner");
                    HeaderCell("Cijena");
                    HeaderCell("Provizija");
                    HeaderCell("Ukupno");
                });

                foreach (var wp in partners)
                {
                    var commissionAmount = wp.ActualPrice!.Value * (wp.CommissionPercent!.Value / 100m);
                    var clientPrice = wp.ActualPrice.Value + commissionAmount;
                    grandTotal += clientPrice;

                    void DataCell(string text, bool right = false) =>
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                            .Element(c => right ? c.AlignRight() : c)
                            .Text(text).FontSize(9);

                    DataCell(wp.CatalogItem?.Name ?? wp.Partner.PartnerType.Name);
                    DataCell(wp.Partner.Name);
                    DataCell(wp.ActualPrice.Value.ToString("N2") + " KM", right: true);
                    DataCell(wp.CommissionPercent!.Value.ToString("N1") + " %", right: true);
                    DataCell(clientPrice.ToString("N2") + " KM", right: true);
                }
            });

            // Total
            var grandTotalText = $"UKUPNO ZA UPLATU:  {grandTotal:N2} KM";
            col.Item().PaddingTop(12).Table(totalTable =>
            {
                totalTable.ColumnsDefinition(c =>
                {
                    c.RelativeColumn();
                    c.ConstantColumn(220);
                });
                totalTable.Cell().ColumnSpan(2).BorderTop(2).BorderColor(Colors.BlueGrey.Darken2).Height(2);
                totalTable.Cell().PaddingTop(6);
                totalTable.Cell().PaddingTop(6).AlignRight()
                    .Text(grandTotalText).FontSize(13).Bold().FontColor(Colors.BlueGrey.Darken3);
            });
        });
    }

    private static void BuildReportHeader(IContainer container, Wedding wedding)
    {
        container.Column(col =>
        {
            col.Item().Background(Colors.Red.Lighten4).Padding(8).AlignCenter()
                .Text("INTERNI OBRAČUN — INTERNO / NIJE ZA KLIJENTA")
                .FontSize(12).Bold().FontColor(Colors.Red.Darken3);

            col.Item().PaddingTop(8).Row(row =>
            {
                row.RelativeItem().Column(inner =>
                {
                    inner.Item().Text(AgencyName).FontSize(14).Bold();
                    inner.Item().Text($"Vjenčanje: {wedding.Name}").FontSize(11);
                    inner.Item().Text($"Datum: {wedding.DateTime:dd.MM.yyyy}").FontSize(9).FontColor(Colors.Grey.Darken1);
                });
                row.ConstantItem(150).AlignRight().Column(inner =>
                {
                    inner.Item().Text("Interni obračun").FontSize(12).Bold();
                    inner.Item().Text($"Datum: {DateTime.Today:dd.MM.yyyy}").FontSize(9).FontColor(Colors.Grey.Darken1);
                });
            });

            col.Item().PaddingTop(6).BorderBottom(1).BorderColor(Colors.Red.Lighten2).Element(_ => { });
        });
    }

    private static void BuildReportContent(IContainer container, Wedding _, List<WeddingPartner> partners)
    {
        decimal totalPartnerCost = partners.Sum(wp => wp.ActualPrice ?? 0);
        decimal totalCommission = partners.Sum(wp => (wp.ActualPrice ?? 0) * ((wp.CommissionPercent ?? 0) / 100m));
        decimal totalClientRevenue = totalPartnerCost + totalCommission;

        container.PaddingTop(16).Column(col =>
        {
            // Table
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(cols =>
                {
                    cols.RelativeColumn(2.5f); // Partner
                    cols.RelativeColumn(1.5f); // Type
                    cols.ConstantColumn(75);   // Partner cost
                    cols.ConstantColumn(55);   // Commission %
                    cols.ConstantColumn(75);   // Commission amount
                    cols.ConstantColumn(75);   // Client price
                });

                table.Header(header =>
                {
                    void H(string text) =>
                        header.Cell().Background(Colors.Grey.Darken3).Padding(6)
                            .Text(text).FontColor(Colors.White).FontSize(9).Bold();

                    H("Partner");
                    H("Kategorija");
                    H("Cijena partnera");
                    H("Provizija %");
                    H("Iznos provizije");
                    H("Cijena klijenta");
                });

                foreach (var wp in partners)
                {
                    var commission = wp.ActualPrice!.Value * (wp.CommissionPercent!.Value / 100m);
                    var clientPrice = wp.ActualPrice.Value + commission;

                    void D(string text, bool right = false) =>
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                            .Element(c => right ? c.AlignRight() : c)
                            .Text(text).FontSize(9);

                    D(wp.Partner.Name);
                    D(wp.Partner.PartnerType.Name);
                    D(wp.ActualPrice.Value.ToString("N2") + " KM", right: true);
                    D(wp.CommissionPercent!.Value.ToString("N1") + " %", right: true);
                    D(commission.ToString("N2") + " KM", right: true);
                    D(clientPrice.ToString("N2") + " KM", right: true);
                }
            });

            // Financial summary box
            col.Item().PaddingTop(20).Column(summary =>
            {
                summary.Item().Background(Colors.Grey.Lighten4).Padding(12).Column(box =>
                {
                    box.Item().Text("Financijski sažetak").FontSize(12).Bold();
                    box.Item().PaddingTop(6).Table(t =>
                    {
                        t.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn();
                            c.ConstantColumn(180);
                        });
                        t.Cell().PaddingBottom(3).Text("Ukupni trošak partnera:");
                        t.Cell().PaddingBottom(3).Text($"{totalPartnerCost:N2} KM").Bold();
                        t.Cell().PaddingBottom(3).Text("Ukupna provizija agencije:");
                        t.Cell().PaddingBottom(3).Text($"{totalCommission:N2} KM").Bold().FontColor(Colors.Green.Darken2);
                        t.Cell().Text("Ukupan prihod od klijenta:");
                        t.Cell().Text($"{totalClientRevenue:N2} KM").Bold();
                        t.Cell().ColumnSpan(2).BorderTop(2).BorderColor(Colors.Grey.Darken1).Height(2);
                        t.Cell().PaddingTop(4).Text("ZARADA AGENCIJE:").Bold().FontSize(12);
                        t.Cell().PaddingTop(4).Text($"{totalCommission:N2} KM").Bold().FontSize(12).FontColor(Colors.Green.Darken3);
                    });
                });
            });
        });
    }

    private static void BuildFooter(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Text(AgencyContact).FontSize(8).FontColor(Colors.Grey.Darken1);
            row.ConstantItem(50).AlignRight().Text(x =>
            {
                x.Span("Str. ").FontSize(8).FontColor(Colors.Grey.Darken1);
                x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Darken1);
            });
        });
    }
}
