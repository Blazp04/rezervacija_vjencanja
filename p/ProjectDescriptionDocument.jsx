// ============================================================
// Informacijski sustav za rezervaciju vjenčanja
// Projektna specifikacija - PDF radna verzija
// Dokument ID: INF-MEG-002
// 21. travnja 2026.
// ============================================================

const BRAND = {
  primary: '#3D52A0',
  primaryDark: '#2A3B85',
  primaryLight: '#5B6EC4',
  primaryBg: '#E8EAFA',
  background: '#F3F4F8',
  surface: '#FAFBFF',
  text: '#1E2235',
  textMuted: '#6F7693',
  border: '#D5D8E8',
  destructive: '#C94030',
  success: '#2D7A4F',
  amber: '#B45309',
  white: '#FFFFFF',
};

const DOCUMENT_META = [
  ['Dokument ID', 'INF-MEG-002'],
  ['Naziv', 'Projektna specifikacija'],
  ['Verzija', '1.0 - inicijalna verzija'],
  ['Datum', '21. travnja 2026.'],
  ['Status', 'Radna PDF verzija'],
  ['Fokus faze 1', 'Vjenčanja'],
  ['Namjena', 'Projektni pregled i PDF izvoz specifikacije'],
];

const KEY_NOTES = [
  'Aplikacija nema sustav prijave, registracije ni role-based access control.',
  'Aplikacija je namijenjena isključivo internoj upotrebi jedne agencije.',
  'Nema korisničkih računa - agencija direktno koristi aplikaciju bez autentifikacije.',
];

const WEDDING_FIELDS = [
  ['Naziv / Identifikator', 'interni naziv ili ime mladenaca'],
  ['Datum i vrijeme', 'točan datum i sat početka vjenčanja'],
  ['Lokacija', 'grad, općina i naziv objekta'],
  ['Predložak vjenčanja', 'odabir unaprijed definiranog predloška'],
  ['Status vjenčanja', 'u pripremi, potvrđeno, završeno ili otkazano'],
  ['Napomene', 'slobodan tekst za dodatne informacije'],
];

const FLOW_STEPS = [
  '1. Kreiranje događanja',
  '2. Dodavanje partnera',
  '3. Generiranje ponude',
  '4. Potvrda i finalizacija',
  '5. Izdavanje finalnih računa',
];

const TEMPLATE_TYPES = [
  ['Malo vjenčanje', 'Svečanost s manjim brojem gostiju i jednostavnijom organizacijom'],
  ['Veliko vjenčanje', 'Višesatna proslava s velikim brojem gostiju'],
  ['Vjenčanje u prirodi', 'Svečanost na otvorenom sa specifičnim setom partnera'],
  ['Vjenčanje cijeli dan', 'Od jutarnje ceremonije do kasno u noć'],
  ['Samo sala', 'Proslava u zatvorenom bez crkvene ceremonije'],
];

const TEMPLATE_CONTENT = [
  'definira koje su vrste partnera uključene, primjerice sala, fotograf i bend',
  'donosi defaultne napomene i smjernice za taj tip vjenčanja',
  'predlaže redoslijed aktivnosti kroz događaj',
];

const PARTNER_FIELDS = [
  ['Naziv', 'ime tvrtke ili fizičke osobe'],
  ['Adresa', 'osnovna adresa partnera'],
  ['Kontakt telefon', 'glavni broj za kontakt'],
  ['E-mail adresa', 'službena ili radna e-mail adresa'],
  ['Web / društvene mreže', 'opcionalni javni kontakt kanali'],
  ['Tip partnera', 'određuje koji se dodatni podaci bilježe'],
  ['Provizija agencije', 'npr. partner 1.000 KM + provizija 5% = klijent 1.050 KM'],
  ['Komentar / napomena', 'slobodan tekst za interne bilješke'],
];

const PRICING_LEVELS = [
  ['Osnovna cijena (Base)', 'standardna cijena za sve dane koji nisu pokriveni višim razinama'],
  ['Specijalna cijena (Special Days)', 'vrijedi za određene dane u tjednu, npr. petak, subota i nedjelja'],
  ['Posebna cijena (Specific Dates)', 'vrijedi za točno definirane datume, npr. blagdane i posebne dane'],
];

const PARTNER_TYPE_SECTIONS = [
  {
    title: '5.1 Bend / DJ',
    description: 'Glazbeni izvođači koji nastupaju na vjenčanju.',
    details: [
      'Popis članova benda - svaki član ima ime, ulogu i kontakt.',
      'Playlist - bend može imati jednu ili više playlisti.',
      'Pjesma sadrži naziv, izvođača / autora i žanr / kategoriju.',
      'Paketi / kategorije usluga - npr. Standard 4h, Premium 6h ili DJ paket.',
      'Cijene po kategorijama slijede MT pricing strukturu.',
      'Trajanje nastupa izražava se u satima.',
    ],
    booking: [
      'Bend se rezervira za točan datum i vremenski raspon.',
      'Sustav automatski sprječava dvostruku rezervaciju u istom ili preklapajućem terminu.',
      'Jedno vjenčanje može imati više bendova, npr. bend za ručak i DJ za večer.',
    ],
    importText: 'Podržan je import playliste putem CSV datoteke.',
  },
  {
    title: '5.2 Cvjećar',
    description: 'Partner koji pruža cvijetne aranžmane za vjenčanje.',
    details: [
      'Katalog aranžmana sadrži naziv, kategoriju, opis i sadržaj.',
      'Svaki aranžman može imati cijenu prema MT pricing strukturi.',
      'Fotografija aranžmana je opcionalna.',
    ],
    booking: ['Nema upravljanja terminima - cvjećar ne blokira termine, samo se bilježe narudžbe.'],
    importText: 'Podržan je import kataloga aranžmana putem CSV datoteke.',
  },
  {
    title: '5.3 Slastičar / Torte i Kolači',
    description: 'Partner koji pruža svadbene torte, kolače i desert.',
    details: [
      'Katalog proizvoda sadrži naziv, kategoriju, opis, cijenu i opciju veličine / broja porcija.',
      'Cijene slijede MT pricing strukturu.',
    ],
    booking: ['Nema upravljanja terminima.'],
    importText: 'Podržan je CSV import kataloga.',
  },
  {
    title: '5.4 Fotograf / Snimatelj',
    description: 'Partner koji fotografira ili snima vjenčanje.',
    details: [
      'Paketi usluga sadrže naziv, opis sadržaja paketa i trajanje.',
      'Opis paketa može uključivati fotografiju, video, drone snimanje, album, broj fotografija i rok isporuke.',
      'Cijene slijede MT pricing strukturu.',
    ],
    booking: ['Fotograf ne može biti rezerviran u dva preklapajuća termina - ista logika kao kod benda.'],
    importText: 'Podržan je CSV import paketa.',
  },
  {
    title: '5.5 Sala / Restoran / Dvorana',
    description: 'Lokacija na kojoj se odvija vjenčanje.',
    details: [
      'Bilježe se kapacitet i opis prostora, uključujući interijer, eksterijer, parking i pristupačnost.',
      'Sala može imati ponude hrane, pića, dekorativne pakete i dodatne usluge.',
      'Cijena može biti po osobi ili kao cijena najma prostora prema MT pricing strukturi.',
    ],
    booking: [
      'Sala ne može biti rezervirana u dva preklapajuća termina.',
      'Ako agencija ima više sala ili dvorana, svaka se tretira kao zaseban partner uz clone funkciju.',
    ],
    importText: 'Podržan je CSV import ponuda.',
  },
  {
    title: '5.6 Catering',
    description: 'Vanjska ketering usluga kada se ne koristi sala s uključenim cateringom.',
    details: ['Meniji i paketi organizirani su slično kao kod sale.', 'Cijena se vodi po osobi.'],
    booking: ['Nema upravljanja terminima.'],
    importText: null,
  },
  {
    title: '5.7 Ostali Partneri (Generički Tip)',
    description: 'Sustav podržava generičke tipove partnera poput prijevoza, smještaja, fotokabine ili pirotehnike.',
    details: [
      'Slobodna lista usluga i proizvoda koje partner nudi.',
      'Cijene prema MT pricing strukturi.',
      'Opcionalno upravljanje terminima, konfigurabilno po tipu partnera.',
    ],
    booking: null,
    importText: null,
  },
];

const LINKING_STATUSES = [
  ['Predloženo', 'agencija je predložila partnera i čeka se odgovor'],
  ['Ponuđeno', 'partner je kontaktiran i dostavio ponudu'],
  ['Potvrđeno', 'dogovor je zaključen i usluga je rezervirana'],
  ['Otkazano', 'partner je otkazan'],
];

const LINKING_DETAILS = [
  'zapis sadrži dodijeljenog partnera i odabranu uslugu ili paket',
  'planirana cijena izračunava se prema MT pricing strukturi',
  'stvarna cijena unosi se pri potvrdi i može odstupati od planirane',
  'provizija agencije preuzima se s partnera i primjenjuje na stvarnu cijenu',
  'mogu se dodati napomene specifične za to vjenčanje',
];

const CONFLICT_RULES = [
  'Prilikom dodavanja partnera provjerava se je li bend, fotograf ili sala već rezerviran u tom terminu.',
  'Ako postoji preklapanje, sustav prikazuje upozorenje i ne dopušta potvrdu.',
];

const OFFER_BULLETS = [
  'naziv agencije i logotip',
  'osnovni podaci o vjenčanju - datum i lokacija',
  'popis svih predloženih ili odabranih partnera i usluga',
  'cijene po stavkama s uključenim provizijama',
  'ukupni iznos',
  'opcionalno zaokruživanje cijelog paketa u jednu stavku',
];

const INVOICE_BULLETS = [
  'dostupan kada je vjenčanje potvrđeno i svi partneri su potvrđeni',
  'sadrži sve stavke s konačnim cijenama i provizijama',
  'prikazuje ukupan iznos koji klijent plaća',
];

const INTERNAL_BULLETS = [
  'po svakom partneru prikazuje stvarnu cijenu, proviziju i iznos provizije',
  'sadrži ukupan prihod agencije od svih provizija',
  'daje pregled što je kome isplaćeno i što je agencija zaradila',
];

const IMPORT_ROWS = [
  ['Partneri (osnovna lista)', 'import nove liste partnera'],
  ['Bend - playlist / pjesme', 'import pjesama za pojedinog partnera tipa Bend'],
  ['Cvjećar - katalog aranžmana', 'import aranžmana za pojedinog cvjećara'],
  ['Fotograf - paketi', 'import paketa usluga fotografa'],
  ['Sala - ponude (meniji)', 'import meni ponuda za salu'],
  ['Slastičar - katalog', 'import kataloga kolača i torti'],
];

const EXPORT_CSV_BULLETS = [
  'svi navedeni entiteti podržavaju export u CSV format',
  'namjena je arhiviranje, prijenos podataka i uređivanje u spreadsheet alatima',
];

const EXPORT_PDF_BULLETS = [
  'ponuda za klijenta',
  'finalni račun za klijenta',
  'interni obračun za agenciju',
  'opcionalno lista partnera za interno korištenje',
];

const CLONE_BULLETS = [
  'clone funkcija kreira duplikat partnera sa svim podacima',
  'namijenjena je partnerima s više lokacija ili varijanti, poput više dvorana ili ogranaka cvjećara',
  'duplikat se nakon kopiranja može urediti kao zaseban partner',
];

const PLATFORM_BULLETS = [
  'web aplikacija kojoj se pristupa putem preglednika',
  'u fazi 1 nema potrebe za serverskim autentifikacijskim slojem',
  'podaci se mogu pohranjivati lokalno ili na jednostavnom backendskom API-ju, ovisno o stacku',
];

const EXTENSIBILITY_BULLETS = [
  'lako dodavanje novih tipova događanja poput krštenja, krizmi i jubileja',
  'lako dodavanje novih tipova partnera sa custom atributima',
  'MT pricing struktura mora ostati generička i primjenjiva na sve tipove partnera',
];

const VALIDATION_BULLETS = [
  'provjera preklapanja termina za bend, fotografa i salu',
  'obavezna potvrda stvarne cijene pri statusu Potvrđeno',
  'provizija se uvijek računa na stvarnu, a ne planiranu cijenu',
  'finalni račun može se generirati samo kada su svi ključni partneri u statusu Potvrđeno',
];

const UI_ROWS = [
  ['Dashboard vjenčanja', 'lista svih vjenčanja s filtriranjem po datumu i statusu'],
  ['Detaljna stranica vjenčanja', 'pregled svih partnera i statusa za pojedino vjenčanje'],
  ['Upravljanje partnerima', 'CRUD nad bazom partnera i njihovim podacima'],
  ['Upravljanje predlošcima', 'izrada i održavanje predložaka vjenčanja'],
  ['Generiranje dokumenata', 'ponude, računi i interni dokumenti'],
];

const Divider = ({ color, thick }) => (
  <View
    style={{
      borderBottomWidth: thick ? 2 : 0.6,
      borderBottomColor: color || BRAND.border,
      marginVertical: 6,
    }}
  />
);

const SectionTitle = ({ number, children }) => (
  <View style={styles.sectionTitleWrap}>
    <View style={styles.sectionTitleRow}>
      {number ? <Text style={styles.sectionNumber}>{number}</Text> : null}
      <Text style={styles.sectionTitleText}>{children}</Text>
    </View>
    <Divider />
  </View>
);

const SubTitle = ({ children }) => <Text style={styles.subTitle}>{children}</Text>;

const Para = ({ children }) => <Text style={styles.para}>{children}</Text>;

const Bullet = ({ children, level }) => (
  <View style={[styles.bulletRow, { paddingLeft: (level || 0) * 10 }]}>
    <Text style={styles.bulletDot}>-</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const NoteBox = ({ title, children, variant }) => {
  const color = variant === 'warn' ? BRAND.amber : BRAND.primary;

  return (
    <View style={[styles.noteBox, { borderLeftColor: color }]}>
      {title ? <Text style={[styles.noteBoxTitle, { color }]}>{title}</Text> : null}
      <Text style={styles.noteBoxBody}>{children}</Text>
    </View>
  );
};

const DataTable = ({ columns, rows }) => (
  <View style={styles.table}>
    <View style={[styles.tableRow, styles.tableHeaderRow]}>
      {columns.map((column, index) => (
        <View key={index} style={[styles.tableCell, styles.tableHeaderCell, { flex: column.flex || 1 }]}>
          <Text style={styles.tableHeaderText}>{column.label}</Text>
        </View>
      ))}
    </View>

    {rows.map((row, rowIndex) => (
      <View
        key={rowIndex}
        style={[styles.tableRow, rowIndex % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}
      >
        {row.map((cell, cellIndex) => (
          <View
            key={cellIndex}
            style={[styles.tableCell, { flex: columns[cellIndex] ? columns[cellIndex].flex || 1 : 1 }]}
          >
            <Text style={styles.tableCellText}>{cell}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
);

const MetaStat = ({ label, value }) => (
  <View style={styles.metaStatBox}>
    <Text style={styles.metaStatValue}>{value}</Text>
    <Text style={styles.metaStatLabel}>{label}</Text>
  </View>
);

const FlowPill = ({ children }) => (
  <View style={styles.flowPill}>
    <Text style={styles.flowPillText}>{children}</Text>
  </View>
);

const PartnerTypeCard = ({ title, description, details, booking, importText }) => (
  <View style={styles.partnerCard} wrap={false}>
    <Text style={styles.partnerCardTitle}>{title}</Text>
    <Text style={styles.partnerCardDescription}>{description}</Text>

    <Text style={styles.miniSectionTitle}>Specifični podaci</Text>
    {details.map((detail, index) => (
      <Bullet key={index}>{detail}</Bullet>
    ))}

    {booking ? (
      <>
        <Text style={styles.miniSectionTitle}>Upravljanje terminima</Text>
        {booking.map((item, index) => (
          <Bullet key={index}>{item}</Bullet>
        ))}
      </>
    ) : null}

    {importText ? (
      <>
        <Text style={styles.miniSectionTitle}>Import podataka</Text>
        <Bullet>{importText}</Bullet>
      </>
    ) : null}
  </View>
);

const ProjectDescriptionDocument = () => (
  <Document
    title="Informacijski sustav za rezervaciju vjenčanja - projektna specifikacija"
    author="Blaž Perić, Vinko Jakeljić, Jelena Vučić, Marija Musa"
    subject="Projektna specifikacija za aplikaciju Rezervacija Vjenčanja"
    keywords="projektna specifikacija vjenčanja partneri cijene pdf"
  >
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverBand}>
        <View style={styles.coverBrandRow}>
          <Text style={styles.coverBrandUpper}>REZERVACIJA</Text>
          <Text style={styles.coverBrandLower}>VJENČANJA</Text>
        </View>
        <View style={styles.coverBandDivider} />
        <Text style={styles.coverDocType}>Projektna specifikacija</Text>
        <Text style={styles.coverFramework}>Uređena PDF verzija zahtjeva i poslovnog opsega</Text>
      </View>

      <View style={styles.coverCenter}>
        <Text style={styles.coverMainTitle}>Aplikacija za organizaciju svečanih događanja</Text>
        <Text style={styles.coverTagline}>
          Interna web aplikacija za upravljanje vjenčanjima, partnerima, cijenama i dokumentima
        </Text>
      </View>

      <View style={styles.coverStatsRow}>
        <MetaStat label="Faza 1" value="Vjenčanja" />
        <MetaStat label="Moduli" value="9" />
        <MetaStat label="Tipovi partnera" value="7" />
        <MetaStat label="CSV importi" value="6" />
        <MetaStat label="PDF izlazi" value="3" />
        <MetaStat label="Statusi" value="4" />
      </View>

      <View style={styles.coverMetaBox}>
        {DOCUMENT_META.map(([label, value], index) => (
          <View key={index}>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>{label}</Text>
              <Text style={styles.coverMetaValue}>{value}</Text>
            </View>
            {index < DOCUMENT_META.length - 1 ? <View style={styles.coverMetaDivider} /> : null}
          </View>
        ))}
      </View>

      <View style={styles.coverFooter}>
        <View style={styles.coverFooterLine} />
        <Text style={styles.coverFooterText}>Blaž Perić | Vinko Jakeljić | Jelena Vučić | Marija Musa</Text>
        <Text style={styles.coverFooterSub}>Fakultetski projekt | 2026.</Text>
      </View>
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-002 v1.0 | Projektna specifikacija
      </Text>

      <SectionTitle number="1">Pregled Projekta</SectionTitle>
      <Para>
        Aplikacija je namijenjena agencijama koje organiziraju svečana događanja poput vjenčanja, krštenja,
        krizmi i sličnih proslava. Cilj je osigurati jedno centralno mjesto za vođenje događanja, partnera,
        cijena i dokumenata.
      </Para>

      <NoteBox title="Faza 1 - opseg razvoja">
        Sustav se u prvoj fazi fokusira isključivo na vjenčanja, ali arhitektura mora ostati dovoljno proširiva da kasnije podrži i ostala svečana događanja bez promjene osnovnog modela.
      </NoteBox>

      <SubTitle>Ključne napomene</SubTitle>
      {KEY_NOTES.map((note, index) => (
        <Bullet key={index}>{note}</Bullet>
      ))}

      <SectionTitle number="2">Modul: Događanja (Vjenčanja)</SectionTitle>
      <SubTitle>2.1 Evidencija vjenčanja</SubTitle>
      <DataTable
        columns={[
          { label: 'Polje', flex: 1.5 },
          { label: 'Opis', flex: 3.5 },
        ]}
        rows={WEDDING_FIELDS}
      />

      <SubTitle>2.2 Tok vjenčanja</SubTitle>
      <View style={styles.flowWrap}>
        {FLOW_STEPS.map((step, index) => (
          <FlowPill key={index}>{step}</FlowPill>
        ))}
      </View>
      <Bullet>Račun za klijenta uključuje sve provizije agencije.</Bullet>
      <Bullet>Interni obračun prikazuje stvarne troškove partnera i zaradu agencije.</Bullet>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-002 v1.0 | Projektna specifikacija
      </Text>

      <SectionTitle number="3">Modul: Predlošci Vjenčanja</SectionTitle>
      <Para>
        Predlošci su unaprijed definirani paketi koji opisuju tip vjenčanja. Agencija ih sama konfigurira i koristi kao preset pri kreiranju novog vjenčanja.
      </Para>

      <SubTitle>3.1 Tipovi predložaka</SubTitle>
      <DataTable
        columns={[
          { label: 'Naziv predloška', flex: 1.4 },
          { label: 'Opis', flex: 2.6 },
        ]}
        rows={TEMPLATE_TYPES}
      />

      <SubTitle>3.2 Sadržaj predloška</SubTitle>
      {TEMPLATE_CONTENT.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SectionTitle number="4">Modul: Partneri</SectionTitle>
      <Para>
        Partneri su svi vanjski suradnici koji sudjeluju u organizaciji vjenčanja. Sustav mora podržati zajednički model podataka, ali i tip-specifična proširenja kada su potrebna.
      </Para>

      <SubTitle>4.1 Zajednički podaci za sve partnere</SubTitle>
      <DataTable
        columns={[
          { label: 'Polje', flex: 1.6 },
          { label: 'Opis', flex: 3.4 },
        ]}
        rows={PARTNER_FIELDS}
      />

      <SubTitle>4.2 Dinamički model partnera</SubTitle>
      <Bullet>Agencija može kreirati novi tip partnera i definirati koja su mu dodatna polja potrebna.</Bullet>
      <Bullet>Postojeći tipovi partnera imaju preddefinirane strukture, ali ostaju proširivi.</Bullet>

      <SubTitle>4.3 Dinamički sustav cijena</SubTitle>
      <DataTable
        columns={[
          { label: 'Razina', flex: 1.4 },
          { label: 'Opis', flex: 3.6 },
        ]}
        rows={PRICING_LEVELS}
      />

      <NoteBox title="Pravilo prioriteta" variant="warn">
        Ako datum pada u posebnu cijenu, ona ima prednost pred specijalnom, a specijalna cijena ima prednost pred osnovnom.
      </NoteBox>

      <Bullet>Uz cijenu može biti vezano trajanje usluge.</Bullet>
      <Bullet>Partner može imati više kategorija usluge s različitim cijenama.</Bullet>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-002 v1.0 | Projektna specifikacija
      </Text>

      <SectionTitle number="5">Tipovi Partnera - Detaljna Specifikacija</SectionTitle>

      <PartnerTypeCard {...PARTNER_TYPE_SECTIONS[0]} />
      <PartnerTypeCard {...PARTNER_TYPE_SECTIONS[1]} />
      <PartnerTypeCard {...PARTNER_TYPE_SECTIONS[2]} />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-002 v1.0 | Projektna specifikacija
      </Text>

      <SectionTitle number="5">Tipovi Partnera - nastavak</SectionTitle>

      <PartnerTypeCard {...PARTNER_TYPE_SECTIONS[3]} />
      <PartnerTypeCard {...PARTNER_TYPE_SECTIONS[4]} />
      <PartnerTypeCard {...PARTNER_TYPE_SECTIONS[5]} />
      <PartnerTypeCard {...PARTNER_TYPE_SECTIONS[6]} />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-002 v1.0 | Projektna specifikacija
      </Text>

      <SectionTitle number="6">Modul: Partneri na Vjenčanju (Linking)</SectionTitle>
      <SubTitle>6.1 Dodavanje partnera na vjenčanje</SubTitle>
      {LINKING_DETAILS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SubTitle>Status partnera na vjenčanju</SubTitle>
      <DataTable
        columns={[
          { label: 'Status', flex: 1.2 },
          { label: 'Značenje', flex: 3.8 },
        ]}
        rows={LINKING_STATUSES}
      />

      <SubTitle>6.2 Provjera preklapanja termina</SubTitle>
      {CONFLICT_RULES.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SectionTitle number="7">Modul: Ponude i Računi</SectionTitle>

      <SubTitle>7.1 Ponuda za klijenta (PDF)</SubTitle>
      {OFFER_BULLETS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SubTitle>7.2 Finalni račun za klijenta</SubTitle>
      {INVOICE_BULLETS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SubTitle>7.3 Interni obračun za agenciju</SubTitle>
      {INTERNAL_BULLETS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-002 v1.0 | Projektna specifikacija
      </Text>

      <SectionTitle number="8">Import / Export Funkcionalnosti</SectionTitle>
      <SubTitle>8.1 Import (CSV)</SubTitle>
      <DataTable
        columns={[
          { label: 'Entitet', flex: 1.8 },
          { label: 'Napomena', flex: 3.2 },
        ]}
        rows={IMPORT_ROWS}
      />

      <SubTitle>8.2 Export (CSV)</SubTitle>
      {EXPORT_CSV_BULLETS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SubTitle>8.3 Export (PDF)</SubTitle>
      {EXPORT_PDF_BULLETS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SubTitle>8.4 Dupliciranje (Clone)</SubTitle>
      {CLONE_BULLETS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SectionTitle number="9">Tehnički Zahtjevi i Arhitekturalne Smjernice</SectionTitle>

      <SubTitle>9.1 Platforma</SubTitle>
      {PLATFORM_BULLETS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SubTitle>9.2 Proširivost</SubTitle>
      {EXTENSIBILITY_BULLETS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SubTitle>9.3 Validacija i poslovne regule</SubTitle>
      {VALIDATION_BULLETS.map((item, index) => (
        <Bullet key={index}>{item}</Bullet>
      ))}

      <SubTitle>9.4 Korisničko sučelje</SubTitle>
      <DataTable
        columns={[
          { label: 'Ekran', flex: 1.6 },
          { label: 'Namjena', flex: 3.4 },
        ]}
        rows={UI_ROWS}
      />

      <View style={styles.finalBlock}>
        <Divider color={BRAND.primary} thick />
        <Text style={styles.finalTitle}>Kraj projektne specifikacije</Text>
        <Text style={styles.finalSub}>INF-MEG-002 | Verzija 1.0 | travanj 2026.</Text>
        <Text style={styles.finalSub}>PDF prikaz uredene radne verzije specifikacije</Text>
      </View>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

Font.register({
  family: 'NotoSans',
  fonts: [
    {
      src: 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf',
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: 'NotoSerif',
  fonts: [
    {
      src: 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSerif/NotoSerif-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSerif/NotoSerif-Bold.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  body: {
    paddingTop: 44,
    paddingBottom: 56,
    paddingHorizontal: 52,
    backgroundColor: '#FFFFFF',
  },

  coverPage: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },

  runningHeader: {
    fontSize: 7,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: BRAND.textMuted,
    fontFamily: 'NotoSans',
  },

  coverBand: {
    backgroundColor: BRAND.primary,
    paddingTop: 56,
    paddingBottom: 44,
    paddingHorizontal: 52,
  },

  coverBrandRow: {
    marginBottom: 18,
  },

  coverBrandUpper: {
    fontSize: 29,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.white,
    letterSpacing: 5,
  },

  coverBrandLower: {
    fontSize: 29,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 5,
  },

  coverBandDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.25)',
    marginBottom: 18,
  },

  coverDocType: {
    fontSize: 13,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.white,
    marginBottom: 5,
  },

  coverFramework: {
    fontSize: 9,
    fontFamily: 'NotoSans',
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 0.5,
  },

  coverCenter: {
    paddingHorizontal: 52,
    paddingTop: 34,
    paddingBottom: 24,
  },

  coverMainTitle: {
    fontSize: 24,
    fontFamily: 'NotoSerif',
    fontWeight: 700,
    color: BRAND.text,
    lineHeight: 1.35,
    marginBottom: 10,
  },

  coverTagline: {
    fontSize: 10,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    lineHeight: 1.5,
  },

  coverStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 52,
    marginBottom: 20,
    backgroundColor: BRAND.background,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  metaStatBox: {
    width: '31%',
    alignItems: 'center',
    marginVertical: 4,
  },

  metaStatValue: {
    fontSize: 14,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    textAlign: 'center',
  },

  metaStatLabel: {
    fontSize: 6.8,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
    textAlign: 'center',
  },

  coverMetaBox: {
    marginHorizontal: 52,
    marginBottom: 24,
    borderWidth: 0.75,
    borderColor: BRAND.border,
    borderRadius: 4,
    overflow: 'hidden',
  },

  coverMetaRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 14,
  },

  coverMetaDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: BRAND.border,
  },

  coverMetaLabel: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    width: 140,
  },

  coverMetaValue: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    flex: 1,
  },

  coverFooter: {
    paddingHorizontal: 52,
    paddingBottom: 28,
    alignItems: 'center',
  },

  coverFooterLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: BRAND.border,
    width: 220,
    marginBottom: 10,
  },

  coverFooterText: {
    fontSize: 8.5,
    fontFamily: 'NotoSans',
    color: BRAND.text,
    textAlign: 'center',
    marginBottom: 3,
  },

  coverFooterSub: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textAlign: 'center',
  },

  sectionTitleWrap: {
    marginTop: 12,
    marginBottom: 8,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  sectionNumber: {
    fontSize: 10,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    marginRight: 8,
  },

  sectionTitleText: {
    fontSize: 12.4,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    flex: 1,
  },

  subTitle: {
    fontSize: 9.5,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    marginTop: 10,
    marginBottom: 4,
  },

  para: {
    fontSize: 9.4,
    fontFamily: 'NotoSerif',
    color: '#2A2D3E',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 7,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },

  bulletDot: {
    width: 12,
    fontSize: 8.8,
    fontFamily: 'NotoSans',
    color: BRAND.primary,
    marginTop: 1,
  },

  bulletText: {
    flex: 1,
    fontSize: 8.8,
    fontFamily: 'NotoSans',
    color: BRAND.text,
    lineHeight: 1.45,
  },

  noteBox: {
    marginVertical: 8,
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    backgroundColor: BRAND.background,
    borderRadius: 2,
  },

  noteBoxTitle: {
    fontSize: 7.6,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    marginBottom: 5,
  },

  noteBoxBody: {
    fontSize: 8.6,
    fontFamily: 'NotoSans',
    color: BRAND.text,
    lineHeight: 1.5,
  },

  table: {
    borderWidth: 0.75,
    borderColor: BRAND.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },

  tableRow: {
    flexDirection: 'row',
  },

  tableHeaderRow: {
    backgroundColor: BRAND.primaryBg,
  },

  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },

  tableRowOdd: {
    backgroundColor: '#F8F9FD',
  },

  tableCell: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 0.5,
    borderRightColor: BRAND.border,
  },

  tableHeaderCell: {
    borderBottomWidth: 0.75,
    borderBottomColor: BRAND.border,
  },

  tableHeaderText: {
    fontSize: 7.8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primaryDark,
  },

  tableCellText: {
    fontSize: 7.9,
    fontFamily: 'NotoSans',
    color: BRAND.text,
    lineHeight: 1.35,
  },

  flowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },

  flowPill: {
    borderWidth: 0.8,
    borderColor: BRAND.primary,
    backgroundColor: BRAND.primaryBg,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 9,
    marginRight: 6,
    marginBottom: 6,
  },

  flowPillText: {
    fontSize: 8.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primaryDark,
  },

  partnerCard: {
    borderWidth: 0.75,
    borderColor: BRAND.border,
    borderRadius: 4,
    backgroundColor: BRAND.surface,
    padding: 10,
    marginBottom: 10,
  },

  partnerCardTitle: {
    fontSize: 10.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    marginBottom: 3,
  },

  partnerCardDescription: {
    fontSize: 8.6,
    fontFamily: 'NotoSerif',
    color: BRAND.text,
    lineHeight: 1.5,
    marginBottom: 6,
  },

  miniSectionTitle: {
    fontSize: 7.8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
    marginBottom: 4,
  },

  finalBlock: {
    marginTop: 16,
    alignItems: 'center',
  },

  finalTitle: {
    fontSize: 13,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    marginTop: 8,
    marginBottom: 4,
  },

  finalSub: {
    fontSize: 8.4,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textAlign: 'center',
    marginBottom: 2,
  },
});

ReactPDF.render(<ProjectDescriptionDocument />);