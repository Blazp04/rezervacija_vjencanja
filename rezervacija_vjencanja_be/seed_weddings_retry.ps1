[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

$baseUrl = "http://localhost:8080"
$endpoint = "$baseUrl/api/weddings"

$weddings = @(
    @{ name="Ante i Maja";      dateTime="2026-06-14T11:00:00.000Z"; location="Dvorac Trakosc an";        notes="Vanjsko vjencanje" },
    @{ name="Marko i Lucija";   dateTime="2026-06-27T11:00:00.000Z"; location="Restoran Dubrovnik";       notes="Romanticna atmosfera" },
    @{ name="Bruno i Ivana";    dateTime="2026-08-15T12:00:00.000Z"; location="Tvrdava Sv. Mihovila";     notes="Povijesna lokacija" },
    @{ name="Mario i Silvija";  dateTime="2026-09-12T12:00:00.000Z"; location="Vila Juraj, Split";        notes="Primorska svecanos" },
    @{ name="Stjepan i Renata"; dateTime="2026-09-19T11:00:00.000Z"; location="Vinarija Grgic";           notes="Vinski stol" },
    @{ name="Darko i Tamara";   dateTime="2026-10-10T12:00:00.000Z"; location="Dvorac Orsic, Stubica";    notes=$null },
    @{ name="Matej i Lorena";   dateTime="2026-10-17T11:00:00.000Z"; location="Hotel Westin, Zagreb";     notes="Grand svecanos" },
    @{ name="Borna i Klara";    dateTime="2026-11-14T11:00:00.000Z"; location="Lauba, Zagreb";            notes="Artisticki prostor" },
    @{ name="Sandro i Nives";   dateTime="2026-12-19T12:00:00.000Z"; location="Restoran Zrno soli";       notes="Predbozicno slavlje" },
    @{ name="Zvonimir i Lara";  dateTime="2027-01-16T11:00:00.000Z"; location="Umjetnicki paviljon";      notes="Zimska svecanos" }
)

$ok = 0; $fail = 0

foreach ($w in $weddings) {
    $body = [System.Text.Encoding]::UTF8.GetBytes(
        (ConvertTo-Json @{
            name       = $w.name
            dateTime   = $w.dateTime
            location   = $w.location
            templateId = $null
            notes      = $w.notes
        } -Compress)
    )

    try {
        $req = [System.Net.HttpWebRequest]::Create($endpoint)
        $req.Method = "POST"
        $req.ContentType = "application/json; charset=utf-8"
        $req.ContentLength = $body.Length
        $stream = $req.GetRequestStream()
        $stream.Write($body, 0, $body.Length)
        $stream.Close()
        $resp = $req.GetResponse()
        $resp.Close()
        Write-Host "OK  $($w.name)" -ForegroundColor Green
        $ok++
    } catch {
        $errBody = ""
        try { $errBody = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch {}
        Write-Host "ERR $($w.name): $errBody" -ForegroundColor Red
        $fail++
    }
}

Write-Host ""
Write-Host "Done: $ok created, $fail failed."
