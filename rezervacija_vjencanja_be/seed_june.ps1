[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$endpoint = "http://localhost:8080/api/weddings"

$weddings = @(
    @{ name="Ante i Maja";      dateTime="2026-06-06T11:00:00.000Z"; location="Dvorac Trakosc an" },
    @{ name="Marko i Lucija";   dateTime="2026-06-13T11:00:00.000Z"; location="Restoran Dubrovnik" },
    @{ name="Hrvoje i Nina";    dateTime="2026-06-13T14:00:00.000Z"; location="Hotel Esplanade" },
    @{ name="Domagoj i Lea";    dateTime="2026-06-14T11:00:00.000Z"; location="Dvorac Veliki Tabor" },
    @{ name="Patrik i Mia";     dateTime="2026-06-21T11:00:00.000Z"; location="Hotel Sheraton Zagreb" },
    @{ name="Leon i Iva";       dateTime="2026-06-21T14:00:00.000Z"; location="Restoran Zinfandels" },
    @{ name="Tin i Anja";       dateTime="2026-06-27T11:00:00.000Z"; location="Lauba Zagreb" },
    @{ name="Roko i Dora";      dateTime="2026-06-28T11:00:00.000Z"; location="Restoran Vinodol" }
)

foreach ($w in $weddings) {
    $body = [System.Text.Encoding]::UTF8.GetBytes(
        (ConvertTo-Json @{
            name = $w.name; dateTime = $w.dateTime
            location = $w.location; templateId = $null; notes = $null
        } -Compress)
    )
    try {
        $req = [System.Net.HttpWebRequest]::Create($endpoint)
        $req.Method = "POST"; $req.ContentType = "application/json; charset=utf-8"
        $req.ContentLength = $body.Length
        $s = $req.GetRequestStream(); $s.Write($body, 0, $body.Length); $s.Close()
        $req.GetResponse().Close()
        Write-Host "OK  $($w.name)" -ForegroundColor Green
    } catch {
        Write-Host "ERR $($w.name)" -ForegroundColor Red
    }
}
