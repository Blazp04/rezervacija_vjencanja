$baseUrl = "http://localhost:8080"
$endpoint = "$baseUrl/api/weddings"

$weddings = @(
    @{ name="Ante i Maja";      dateTime="2026-06-14T11:00:00.000Z"; location="Dvorac Trakošćan";          notes="Vanjsko vjenčanje" },
    @{ name="Ivan i Petra";     dateTime="2026-06-20T12:00:00.000Z"; location="Hotel Esplanade, Zagreb";   notes=$null },
    @{ name="Marko i Lucija";   dateTime="2026-06-27T11:00:00.000Z"; location="Restoran Dubrovnik";        notes="Romantična atmosfera" },
    @{ name="Tomislav i Sara";  dateTime="2026-07-04T10:00:00.000Z"; location="Villa Magdalena, Krapina";  notes=$null },
    @{ name="Nikola i Elena";   dateTime="2026-07-11T11:00:00.000Z"; location="Dvorac Bežanec";            notes="Rustikalni stil" },
    @{ name="Josip i Marina";   dateTime="2026-07-18T12:00:00.000Z"; location="Restoran Boban, Zagreb";    notes=$null },
    @{ name="Filip i Katarina"; dateTime="2026-07-25T11:00:00.000Z"; location="Hotel Sheraton, Zagreb";    notes="Luksuzni paket" },
    @{ name="Luka i Valentina"; dateTime="2026-08-01T10:00:00.000Z"; location="Pula Arena, Pula";          notes="Ceremonija na otvorenom" },
    @{ name="Dario i Monika";   dateTime="2026-08-08T11:00:00.000Z"; location="Restoran Zinfandel's";      notes=$null },
    @{ name="Bruno i Ivana";    dateTime="2026-08-15T12:00:00.000Z"; location="Tvrđava Sv. Mihovila, Šibenik"; notes="Povijesna lokacija" },
    @{ name="Davor i Nikolina"; dateTime="2026-08-22T11:00:00.000Z"; location="Hotel More, Dubrovnik";     notes=$null },
    @{ name="Karlo i Andreja";  dateTime="2026-08-29T10:00:00.000Z"; location="Dvorac Veliki Tabor";       notes="Bajkovita lokacija" },
    @{ name="Vedran i Tena";    dateTime="2026-09-05T11:00:00.000Z"; location="Restoran Mano, Zagreb";     notes=$null },
    @{ name="Mario i Silvija";  dateTime="2026-09-12T12:00:00.000Z"; location="Vila Juraj, Split";         notes="Primorska svečanost" },
    @{ name="Stjepan i Renata"; dateTime="2026-09-19T11:00:00.000Z"; location="Vinarija Grgić";            notes="Vinski stol" },
    @{ name="Goran i Dijana";   dateTime="2026-09-26T10:00:00.000Z"; location="Hotel Palace, Zagreb";      notes=$null },
    @{ name="Robert i Kristina";dateTime="2026-10-03T11:00:00.000Z"; location="Restoran Vinodol, Zagreb";  notes="Jesen dekoracija" },
    @{ name="Darko i Tamara";   dateTime="2026-10-10T12:00:00.000Z"; location="Dvorac Oršić, Gornja Stubica"; notes=$null },
    @{ name="Matej i Lorena";   dateTime="2026-10-17T11:00:00.000Z"; location="Hotel Westin, Zagreb";      notes="Grand svečanost" },
    @{ name="Petar i Ines";     dateTime="2026-10-24T10:00:00.000Z"; location="Restoran Ribarski dvor";    notes=$null },
    @{ name="Juraj i Jelena";   dateTime="2026-11-07T12:00:00.000Z"; location="Grand Hotel Brioni";        notes="Zimska bajka" },
    @{ name="Borna i Klara";    dateTime="2026-11-14T11:00:00.000Z"; location="Lauba, Zagreb";             notes="Artistički prostor" },
    @{ name="Stipe i Željka";   dateTime="2026-11-21T12:00:00.000Z"; location="Hotel Lav, Split";          notes=$null },
    @{ name="Denis i Anita";    dateTime="2026-11-28T11:00:00.000Z"; location="Dvorac Januševec";          notes="Intimno slavlje" },
    @{ name="Kristijan i Ema";  dateTime="2026-12-05T12:00:00.000Z"; location="Hotel Regent Esplanade";    notes="Adventska romansa" },
    @{ name="Vlado i Helena";   dateTime="2026-12-12T11:00:00.000Z"; location="Katedrala sv. Stjepana";    notes=$null },
    @{ name="Sandro i Nives";   dateTime="2026-12-19T12:00:00.000Z"; location="Restoran Zrno soli";        notes="Preddbožićno slavlje" },
    @{ name="Igor i Suzana";    dateTime="2027-01-09T12:00:00.000Z"; location="Hotel Panorama, Zagreb";    notes=$null },
    @{ name="Zvonimir i Lara";  dateTime="2027-01-16T11:00:00.000Z"; location="Umjetnički paviljon";       notes="Zimska svečanost" },
    @{ name="Tihomir i Vera";   dateTime="2027-01-23T12:00:00.000Z"; location="Restoran 360°, Dubrovnik";  notes="Nova godina nova ljubav" }
)

$ok = 0
$fail = 0

foreach ($w in $weddings) {
    $body = @{
        name       = $w.name
        dateTime   = $w.dateTime
        location   = $w.location
        templateId = $null
        notes      = $w.notes
    } | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod -Uri $endpoint -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "OK  $($w.name)" -ForegroundColor Green
        $ok++
    } catch {
        Write-Host "ERR $($w.name): $_" -ForegroundColor Red
        $fail++
    }
}

Write-Host ""
Write-Host "Done: $ok created, $fail failed."
