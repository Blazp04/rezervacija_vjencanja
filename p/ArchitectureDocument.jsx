// ============================================================
// Informacijski sustav za rezervaciju vjenčanja
// Arhitekturni dokument projekta - ADM radna verzija
// Dokument ID: INF-MEG-001
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
  purple: '#6D4DB2',
  white: '#FFFFFF',
  codeBg: '#1A1D2E',
  codeText: '#D6DAF3',
};

const Divider = ({ color, thick }) => (
  <View
    style={{
      borderBottomWidth: thick ? 2 : 0.6,
      borderBottomColor: color || BRAND.border,
      marginVertical: 6,
    }}
  />
);

const PhaseHeader = ({ phase, title, admLabel }) => (
  <View style={styles.phaseHeader}>
    <Text style={styles.phaseAdmLabel}>{admLabel || 'ADM'}</Text>
    <Text style={styles.phaseTitle}>{phase}</Text>
    <Text style={styles.phaseSubtitle}>{title}</Text>
    <View style={styles.phaseAccentBar} />
  </View>
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

const NoteBox = ({ title, children, variant }) => {
  const color =
    variant === 'warn'
      ? BRAND.amber
      : variant === 'danger'
        ? BRAND.destructive
        : BRAND.primary;

  return (
    <View style={[styles.noteBox, { borderLeftColor: color }]}>
      {title ? <Text style={[styles.noteBoxTitle, { color }]}>{title}</Text> : null}
      <Text style={styles.noteBoxBody}>{children}</Text>
    </View>
  );
};

const Bullet = ({ children, level }) => (
  <View style={[styles.bulletRow, { paddingLeft: (level || 0) * 12 }]}>
    <Text style={styles.bulletDot}>-</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const CheckRow = ({ children, done }) => (
  <View style={styles.bulletRow}>
    <Text style={[styles.bulletDot, { color: done === false ? BRAND.textMuted : BRAND.success }]}>
      {done === false ? '[ ]' : '[x]'}
    </Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const CodeBlock = ({ children }) => (
  <View style={styles.codeBlock}>
    <Text style={styles.codeText}>{children}</Text>
  </View>
);

const DataTable = ({ columns, rows }) => (
  <View style={styles.table}>
    <View style={[styles.tableRow, styles.tableHeaderRow]}>
      {columns.map((col, index) => (
        <View key={index} style={[styles.tableCell, styles.tableHeaderCell, { flex: col.flex || 1 }]}>
          <Text style={styles.tableHeaderText}>{col.label}</Text>
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

const FlowStep = ({ label, color }) => (
  <View
    style={[
      styles.flowBox,
      {
        borderColor: color || BRAND.primary,
        backgroundColor: `${color || BRAND.primary}18`,
      },
    ]}
  >
    <Text style={[styles.flowBoxText, { color: color || BRAND.primary }]}>{label}</Text>
  </View>
);

const FlowArrow = ({ label }) => (
  <View style={styles.flowArrowWrap}>
    <Text style={styles.flowArrowText}>{label || '->'}</Text>
  </View>
);

const MetaStat = ({ label, value }) => (
  <View style={styles.metaStatBox}>
    <Text style={styles.metaStatValue}>{value}</Text>
    <Text style={styles.metaStatLabel}>{label}</Text>
  </View>
);

const ArchitectureDocument = () => (
  <Document
    title="Informacijski sustav za rezervaciju vjenčanja - arhitekturni dokument"
    author="Blaž Perić, Vinko Jakeljić, Jelena Vučić, Marija Musa"
    subject="ADM orijentirani arhitekturni dokument"
    keywords="ADM arhitektura vjenčanja informacijski sustav"
  >
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverBand}>
        <View style={styles.coverBrandRow}>
          <Text style={styles.coverBrandUpper}>REZERVACIJA</Text>
          <Text style={styles.coverBrandLower}>VJENČANJA</Text>
        </View>
        <View style={styles.coverBandDivider} />
        <Text style={styles.coverDocType}>Arhitekturni dokument projekta</Text>
        <Text style={styles.coverFramework}>ADM struktura za planiranje i pregled arhitekture</Text>
      </View>

      <View style={styles.coverCenter}>
        <Text style={styles.coverMainTitle}>Informacijski sustav za rezervaciju vjenčanja</Text>
        <Text style={styles.coverTagline}>
          Interna aplikacija za upravljanje vjenčanjima, partnerima, cijenama i dokumentima
        </Text>
      </View>

      <View style={styles.coverStatsRow}>
        <MetaStat label="Epovi" value="5" />
        <MetaStat label="Zadaci" value="21" />
        <MetaStat label="Tim" value="4" />
        <MetaStat label="Tablice" value="9" />
        <MetaStat label="Dokumenti" value="3" />
        <MetaStat label="Tipovi partnera" value="7" />
      </View>

      <View style={styles.coverMetaBox}>
        {[
          ['Dokument ID', 'INF-MEG-001'],
          ['Verzija', '1.0 - prva i jedina radna verzija'],
          ['Datum', '21. travnja 2026.'],
          ['Status', 'Aktivna radna verzija'],
          ['Vrsta', 'Interna projektna dokumentacija'],
          ['Pregled', '2 asistentice i predmetni profesor'],
          ['Struktura', 'ADM faze: Preliminary, A, B, C, D, E, F, G i H'],
        ].map(([label, value], index) => (
          <View key={index}>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>{label}</Text>
              <Text style={styles.coverMetaValue}>{value}</Text>
            </View>
            {index < 6 ? <View style={styles.coverMetaDivider} /> : null}
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
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <SectionTitle number="0">Kontrola dokumenta</SectionTitle>

      <Para>
        Ovaj dokument je radni arhitekturni opis sustava Rezervacija Vjenčanja. Struktura prati ADM faze kako bi se od poslovnog problema došlo do podatkovne, aplikacijske i tehnološke izvedbe bez skokova u logici. Iako je dokument inspiriran ADM strukturom nije 1/1 preslika ADM standarda.
      </Para>

      <SubTitle>Povijest verzija</SubTitle>
      <DataTable
        columns={[
          { label: 'Verzija', flex: 0.8 },
          { label: 'Datum', flex: 1.2 },
          { label: 'Autor', flex: 1.7 },
          { label: 'Napomena', flex: 3.3 },
        ]}
        rows={[
          ['1.0', '21. travnja 2026.', 'projektni tim', 'prva i jedina radna verzija za razvoj i pregled'],
        ]}
      />

      <SubTitle>Svrha dokumenta</SubTitle>
      <Para>
        Svrha dokumenta je uskladiti poslovni opseg, tehničku arhitekturu, podjelu rada po epovima i kriterije prihvata. Nakon usvajanja ove verzije dokument služi kao glavni referentni okvir za razvoj aplikacije i za obrazloženje arhitekturnih izbora tijekom pregleda projekta.
      </Para>

      <SubTitle>Ciljana publika</SubTitle>
      <Bullet>razvojni tim koji implementira backend, frontend i testove po epovima</Bullet>
      <Bullet>akademski preglednici - 2 asistentice i predmetni profesor</Bullet>
      <Bullet>interni korisnik agencije koji treba razumjeti što sustav pokriva, a što ne pokriva</Bullet>

      <SubTitle>Pokrivenost ADM faza</SubTitle>
      <DataTable
        columns={[
          { label: 'Faza', flex: 1.4 },
          { label: 'Što se isporučuje', flex: 3.3 },
          { label: 'Oznaka', flex: 0.8 },
          { label: 'Status', flex: 1 },
        ]}
        rows={[
          ['Preliminary', 'kontekst, ograničenja, načela i organizacija tima', '1', 'obuhvaćeno'],
          ['Faza A', 'vizija arhitekture, opseg i dionici', '2', 'obuhvaćeno'],
          ['Faza B', 'poslovni moduli, tokovi i pravila', '3', 'obuhvaćeno'],
          ['Faza C', 'podatkovna i aplikacijska arhitektura', '4-5', 'obuhvaćeno'],
          ['Faza D', 'tehnološka arhitektura i kvalitativni zahtjevi', '6', 'obuhvaćeno'],
          ['Faza E', 'rješenja po epovima i radni paketi', '7', 'obuhvaćeno'],
          ['Faza F', 'redoslijed implementacije i prijelazni plan', '7', 'obuhvaćeno'],
          ['Faza G', 'standardi provedbe i definition of done', '8', 'obuhvaćeno'],
          ['Faza H', 'rizici i okidači za promjenu arhitekture', '8', 'obuhvaćeno'],
        ]}
      />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <PhaseHeader
        phase="Preliminary"
        title="Kontekst projekta, ograničenja i arhitekturna načela"
        admLabel="ADM - Preliminary"
      />

      <SectionTitle number="1.1">Kontekst projekta</SectionTitle>
      <Para>
        Projekt opisuje internu web aplikaciju za agenciju koja organizira vjenčanja. Agencija trenutno koristi rastrkane alate, uglavnom tablice, poruke i ručne bilješke. Takav način rada usporava izradu ponuda, otežava praćenje partnera i povećava rizik preklapanja termina kod benda, fotografa i sale.
      </Para>
      <Para>
        Faza 1 je usmjerena isključivo na vjenčanja, ali arhitektura mora ostati dovoljno čista da kasnije podrži i druga svečana događanja bez promjene osnovne strukture sustava. Zbog toga se već sada biraju rješenja koja ne zaključavaju aplikaciju samo na jedan poslovni scenarij.
      </Para>

      <SectionTitle number="1.2">Projektna ograničenja</SectionTitle>
      <DataTable
        columns={[
          { label: 'Ograničenje', flex: 2.1 },
          { label: 'Praktična posljedica', flex: 3.9 },
        ]}
        rows={[
          ['Nema autentifikacije i korisničkih računa', 'sustav je interni alat jedne agencije; nema prijave, uloga ni upravljanja pristupom u fazi 1'],
          ['Jedna agencija i jedan kontekst rada', 'nema višeklijentske logike, tenant izolacije ni SaaS modela'],
          ['Web aplikacija kao jedini klijent', 'mobilna aplikacija nije predmet ove verzije; cilj je stabilan desktop preglednik'],
          ['MVP razina produkcijske zrelosti', 'nema naprednog monitoringa, audita, poruka u pozadini ni kompleksne infrastrukture'],
          ['Tim od 4 studenta', 'arhitektura mora omogućiti paralelan rad po epovima bez uskog grla u jednom sloju'],
          ['Microsoft SQL Server je zadana baza', 'model i validacije koriste mogućnosti MSSQL-a, uključujući JSON funkcije'],
        ]}
      />

      <SectionTitle number="1.3">Arhitekturna načela</SectionTitle>

      <SubTitle>N1 - Jednostavnost ispred nepotrebne složenosti</SubTitle>
      <Para>
        Sustav se gradi za interni rad jedne agencije. Sve što ne donosi izravnu vrijednost u fazi 1 ostaje izvan opsega. Time se razvoj usmjerava na stabilne osnovne procese: evidenciju vjenčanja, rad s partnerima, cijene i dokumente.
      </Para>

      <SubTitle>N2 - Jedinstveni model partnera</SubTitle>
      <Para>
        Umjesto posebnih tablica i posebnih CRUD tokova za svaki tip partnera, koristi se generalizirani model partnera i kataloških stavki. Time se dobiva jedna logika za većinu operacija, a posebnosti se drže u JSON poljima gdje to ima poslovnog smisla.
      </Para>

      <SubTitle>N3 - Cijena mora biti deterministička</SubTitle>
      <Para>
        Planirana cijena za partnera na vjenčanju mora se moći izračunati jednoznačno za zadani datum. Pravilo prioriteta je jasno: specifični datum, pa posebni dan, pa osnovna cijena. Nakon izračuna, vrijednost se sprema kao snimka kako kasnije promjene u cjeniku ne bi mijenjale povijesni zapis.
      </Para>

      <SubTitle>N4 - Potvrda ne smije proizvoditi konflikt</SubTitle>
      <Para>
        Za tipove partnera koji imaju rezervacijski termin potvrda mora proći provjeru preklapanja. Time se poslovno pravilo prebacuje iz ručne provjere u sustav i smanjuje se rizik dvostruke rezervacije.
      </Para>

      <SubTitle>N5 - Faza 1 mora ostati proširiva</SubTitle>
      <Para>
        Iako se u ovoj verziji radi samo o vjenčanjima, tablice, moduli i API ugovori ne smiju blokirati buduća proširenja na krštenja, krizme i druga događanja. To je razlog zašto se dio strukture definira dovoljno generički od samog početka.
      </Para>

      <SectionTitle number="1.4">Tim i pregled projekta</SectionTitle>
      <DataTable
        columns={[
          { label: 'Uloga', flex: 1.4 },
          { label: 'Osoba ili skupina', flex: 2 },
          { label: 'Primarna odgovornost', flex: 2.6 },
        ]}
        rows={[
          ['Epic 01', 'Blaž Perić', 'temelj sustava, baza, opći model partnera'],
          ['Epic 02', 'Vinko Jakeljić', 'predlošci, vjenčanja, dashboard i detalj'],
          ['Epic 03', 'Jelena Vučić', 'katalog partnera, cijene, CSV, kalendar i kloniranje'],
          ['Epic 04', 'Marija Musa', 'povezivanje partnera s vjenčanjem, konflikti i potvrda'],
          ['Akademski pregled', '2 asistentice i profesor', 'pregled arhitekture, usklađenost i kvaliteta projekta'],
        ]}
      />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <PhaseHeader
        phase="Faza A"
        title="Vizija arhitekture, opseg i ključni dionici"
        admLabel="ADM - Faza A"
      />

      <SectionTitle number="2.1">Problem koji sustav rješava</SectionTitle>
      <NoteBox title="Središnji poslovni problem">
        Agencija nema jedno mjesto na kojem može voditi vjenčanja, partnere, raspoloživost, cjenike i dokumente. Ručni rad kroz tablice i poruke stvara spor proces izrade ponude, nekonzistentne cijene i stvaran rizik dvostruke rezervacije ključnih partnera.
      </NoteBox>

      <SectionTitle number="2.2">Vizija rješenja</SectionTitle>
      <Para>
        Rezervacija Vjenčanja treba postati jedno središnje mjesto za rad agencije. Korisnik mora moći otvoriti vjenčanje, vezati odgovarajuće partnere i njihove usluge, automatski izračunati planirane cijene prema datumu, spriječiti potvrdu konfliktnog termina i na kraju generirati sve potrebne dokumente bez dodatnog ručnog pretipkavanja.
      </Para>

      <SectionTitle number="2.3">Opseg faze 1</SectionTitle>

      <SubTitle>U opsegu</SubTitle>
      <Bullet>CRUD za vjenčanja i predloške vjenčanja</Bullet>
      <Bullet>CRUD za partnere i njihove kataloške stavke</Bullet>
      <Bullet>MT model cijena: osnovna cijena, posebni dani, specifični datumi</Bullet>
      <Bullet>dodjela partnera na vjenčanje sa snimkom cijene i provizije</Bullet>
      <Bullet>provjera konflikta termina za bend, fotografa i salu</Bullet>
      <Bullet>CSV import i export za kataloge partnera</Bullet>
      <Bullet>PDF dokumenti: ponuda, račun i interni obračun</Bullet>

      <SubTitle>Izvan opsega</SubTitle>
      <Bullet>prijava korisnika, uloge i autorizacija</Bullet>
      <Bullet>portal za klijente ili samostalni pristup partnera</Bullet>
      <Bullet>slanje mailova, SMS obavijesti i online naplate</Bullet>
      <Bullet>mobilna aplikacija i rad u stvarnom vremenu</Bullet>
      <Bullet>vise agencija u istoj instalaciji</Bullet>

      <SectionTitle number="2.4">Ključni dionici</SectionTitle>
      <DataTable
        columns={[
          { label: 'Dionik', flex: 1.5 },
          { label: 'Uloga', flex: 1.9 },
          { label: 'Glavna potreba', flex: 3 },
        ]}
        rows={[
          ['Agencijski djelatnik', 'glavni korisnik sustava', 'brzo otvaranje vjenčanja, pregled partnera i generiranje dokumenata'],
          ['Vlasnik ili voditelj agencije', 'poslovni pregled i odluke', 'uvid u cijene, provizije i status realizacije'],
          ['Razvojni tim', 'izgradnja sustava', 'jasni zahtjevi, stabilni API ugovori i podjela rada bez blokada'],
          ['Akademski preglednici', 'stručni i nastavni pregled', 'jasna arhitekturna logika, opravdane odluke i uredna dokumentacija'],
          ['Vanjski partneri', 'subjekti evidencije, ne korisnici sustava', 'točni termini, točni kontakt podaci i točan odabir usluge'],
        ]}
      />

      <SectionTitle number="2.5">Pokazatelji uspjeha</SectionTitle>
      <Bullet>svako vjenčanje mora biti moguće otvoriti i voditi bez dodatne vanjske tablice</Bullet>
      <Bullet>partner s preklapajućim terminom ne smije biti potvrđen</Bullet>
      <Bullet>planirana cijena mora se računati automatizmom na temelju datuma</Bullet>
      <Bullet>dokumente za klijenta i interni pregled treba biti moguće generirati iz sustava</Bullet>
      <Bullet>tim mora moći raditi paralelno po epovima nakon završetka temeljnog epica</Bullet>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <PhaseHeader
        phase="Faza B"
        title="Poslovna arhitektura, moduli i poslovna pravila"
        admLabel="ADM - Faza B"
      />

      <SectionTitle number="3.1">Poslovni moduli</SectionTitle>
      <DataTable
        columns={[
          { label: 'Modul', flex: 1.4 },
          { label: 'Što radi', flex: 3.3 },
          { label: 'Glavni rezultat', flex: 1.8 },
        ]}
        rows={[
          ['Vjenčanja', 'otvara i vodi evidenciju svakog vjenčanja kroz statusni tok', 'jedinstveni zapis događaja'],
          ['Predlošci', 'daje gotove obrasce partnera i napomena za tipične scenarije', 'brže otvaranje vjenčanja'],
          ['Partneri', 'drži bazu svih partnera, kataloga, cijena i posebnih podataka', 'centralni katalog ponude'],
          ['Povezivanje', 'veže partnera i uslugu s konkretnim vjenčanjem', 'snimka plana, cijene i provizije'],
          ['Dokumenti', 'pretvara podatke iz sustava u ponudbeni i obračunski izlaz', 'PDF i CSV izlazi'],
        ]}
      />

      <SectionTitle number="3.2">Glavni poslovni tok faze 1</SectionTitle>
      <View style={styles.flowRow}>
        <FlowStep label="Kreiranje vjenčanja" />
        <FlowArrow />
        <FlowStep label="Odabir predloška" />
        <FlowArrow />
        <FlowStep label="Dodjela partnera" />
      </View>
      <View style={styles.flowRow}>
        <FlowStep label="Izračun cijene" />
        <FlowArrow />
        <FlowStep label="Ponuda" />
        <FlowArrow />
        <FlowStep label="Potvrda i dokumenti" />
      </View>

      <SectionTitle number="3.3">Status vjenčanja</SectionTitle>
      <Para>
        Vjenčanje prolazi kroz linearni tok. Otkazivanje je dopušteno iz bilo kojeg aktivnog stanja, ali povratak iz terminalnog stanja nije dio faze 1.
      </Para>

      <View style={styles.flowRow}>
        <FlowStep label="PREPARATION" />
        <FlowArrow />
        <FlowStep label="CONFIRMED" color={BRAND.success} />
        <FlowArrow />
        <FlowStep label="COMPLETED" color={BRAND.textMuted} />
      </View>
      <View style={[styles.flowRow, { marginTop: 4 }]}> 
        <Text style={styles.cancelNote}>{'bilo koje aktivno stanje -> CANCELLED'}</Text>
      </View>

      <DataTable
        columns={[
          { label: 'Tehnička vrijednost', flex: 1.4 },
          { label: 'Prikaz korisniku', flex: 1.3 },
          { label: 'Značenje', flex: 3.3 },
        ]}
        rows={[
          ['PREPARATION', 'U pripremi', 'osnovni podaci su otvoreni, partneri se tek slazu'],
          ['CONFIRMED', 'Potvrđeno', 'događaj ide dalje i ulazi u završnu pripremu'],
          ['COMPLETED', 'Završeno', 'događaj je održan i financijski zatvoren'],
          ['CANCELLED', 'Otkazano', 'događaj je prekinut i više se ne vodi kao aktivan'],
        ]}
      />

      <SectionTitle number="3.4">Status partnera na vjenčanju</SectionTitle>
      <Para>
        Svaki partner povezan s vjenčanjem ima vlastiti statusni tok. Potvrda partnera je poslovno značajna jer tada mogu nastati rezervacija termina i obveza unosa stvarne cijene.
      </Para>

      <View style={styles.flowRow}>
        <FlowStep label="PROPOSED" color={BRAND.purple} />
        <FlowArrow />
        <FlowStep label="OFFERED" color={BRAND.amber} />
        <FlowArrow />
        <FlowStep label="CONFIRMED" color={BRAND.success} />
      </View>
      <View style={[styles.flowRow, { marginTop: 4 }]}> 
        <Text style={[styles.cancelNote, { color: BRAND.destructive }]}>{'bilo koje stanje -> CANCELLED'}</Text>
      </View>

      <DataTable
        columns={[
          { label: 'Prijelaz', flex: 1.8 },
          { label: 'Uvjet ili posljedica', flex: 4.2 },
        ]}
        rows={[
          ['PROPOSED -> OFFERED', 'partner je uključen u ponudu ili je agencija započela službeni kontakt'],
          ['OFFERED -> CONFIRMED', 'unesena je stvarna cijena i nema konflikta termina ako partner koristi rezervacije'],
          ['CONFIRMED -> CANCELLED', 'zapis ostaje vidljiv, a rezervacija se briše ako je postojala'],
        ]}
      />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <SectionTitle number="3.5">Ključna poslovna pravila</SectionTitle>
      <Bullet>partner može biti dodijeljen vjenčanju i bez potvrde, ali potvrda traži strožu validaciju</Bullet>
      <Bullet>provizija agencije sprema se kao snimka u trenutku dodjele partnera na vjenčanje</Bullet>
      <Bullet>stvarna cijena je obavezna kad partner prelazi u stanje CONFIRMED</Bullet>
      <Bullet>završni račun i interni obračun imaju smisla tek kada svi ključni partneri imaju potvrđen status</Bullet>
      <Bullet>SONG stavke u katalogu benda služe za playlistu i ne smiju ulaziti u financijski izračun</Bullet>

      <SectionTitle number="3.6">Predlošci vjenčanja kao poslovni akcelerator</SectionTitle>
      <DataTable
        columns={[
          { label: 'Predložak', flex: 1.4 },
          { label: 'Namjena', flex: 2.4 },
          { label: 'Tipični partneri', flex: 2.2 },
        ]}
        rows={[
          ['Malo vjenčanje', 'manji broj gostiju i jednostavnija organizacija', 'sala, fotograf, slastičar'],
          ['Veliko vjenčanje', 'veći broj gostiju i više paralelnih obveza', 'sala, bend, fotograf, cvjećar, torta'],
          ['Vjenčanje u prirodi', 'otvorena lokacija i veći logistički rizik', 'catering, bend, fotograf, cvjećar'],
          ['Vjenčanje cijeli dan', 'događaj traje od jutra do kasno navečer', 'sala, bend, fotograf, cvjećar, slastičar'],
          ['Samo sala', 'fokus na lokaciji, meniju i osnovnom protoku', 'sala, DJ ili bend, slastičar'],
        ]}
      />

      <PhaseHeader
        phase="Faza C"
        title="Podatkovna arhitektura i struktura poslovnih zapisa"
        admLabel="ADM - Faza C (podaci)"
      />

      <SectionTitle number="4.1">Pregled podatkovne arhitekture</SectionTitle>
      <Para>
        Podatkovni sloj se izvodi nad Microsoft SQL Serverom, a model se održava kroz EF Core code first migracije. Jezgra modela je generalizirani partner koji može imati različite tipove usluga, proizvoda i pjesama bez širenja baze dodatnim tablicama za svaki pojedini tip partnera.
      </Para>

      <SectionTitle number="4.2">Glavni entiteti</SectionTitle>
      <DataTable
        columns={[
          { label: 'Entitet', flex: 1.5 },
          { label: 'Svrha', flex: 2.9 },
          { label: 'Ključni atributi', flex: 2.1 },
        ]}
        rows={[
          ['PartnerTypes', 'definira tip partnera i podatak ima li partner rezervaciju termina', 'Code, Name, HasBooking'],
          ['Partners', 'osnovni zapis svakog partnera', 'Name, PartnerTypeId, CommissionPercent'],
          ['PartnerCatalogItems', 'sve usluge, proizvodi i pjesme partnera', 'ItemType, BasePrice, Metadata'],
          ['PricingRules', 'posebni dani i specifični datumi za cijene', 'RuleType, DayOfWeek, SpecificDate, Price'],
          ['BandMembers', 'članovi benda i njihove uloge', 'PartnerId, Name, Role'],
          ['WeddingTemplates', 'predlošci za otvaranje vjenčanja', 'RequiredPartnerTypes, ActivityOrder'],
          ['Weddings', 'glavni zapis vjenčanja', 'Name, DateTime, Location, Status'],
          ['WeddingPartners', 'veza partnera i vjenčanja', 'PlannedPrice, ActualPrice, CommissionPercent, Status'],
          ['Bookings', 'rezervacije termina za konfliktne partnere', 'PartnerId, StartDateTime, EndDateTime'],
        ]}
      />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <SectionTitle number="4.3">Generalizirani model partnera</SectionTitle>
      <NoteBox title="Zašto jedan model, a ne mnogo tablica">
        Bend, cvjećar, fotograf i sala nude različite stvari, ali sve te stvari u sustavu postaju kataloške stavke partnera. Time se dobiva jedan CRUD tok, jedan API obrazac i jedan skup pravila za cijene. Posebnosti se pohranjuju u Metadata JSON polje umjesto u dodatne specijalizirane tablice.
      </NoteBox>

      <SubTitle>Ključevi odnosa</SubTitle>
      <Bullet>jedan partner ima više kataloških stavki</Bullet>
      <Bullet>jedna kataloška stavka može imati više pravila cijena</Bullet>
      <Bullet>jedno vjenčanje ima više povezanih partnera</Bullet>
      <Bullet>jedan povezani partner može generirati najviše jednu aktivnu rezervaciju termina</Bullet>

      <SectionTitle number="4.4">JSON polja koja arhitektura koristi</SectionTitle>
      <DataTable
        columns={[
          { label: 'Polje', flex: 2.1 },
          { label: 'Namjena', flex: 3.9 },
        ]}
        rows={[
          ['Partners.ExtraFields', 'dodatne vrijednosti koje ovise o tipu partnera, npr. kapacitet sale ili dodatna oprema'],
          ['PartnerCatalogItems.Metadata', 'detalji pojedine usluge ili proizvoda, npr. trajanje, sastav, broj porcija ili uključene stavke'],
          ['WeddingTemplates.RequiredPartnerTypes', 'popis tipova partnera koje predložak očekuje i oznaka jesu li obavezni'],
          ['WeddingTemplates.ActivityOrder', 'preporučeni redoslijed aktivnosti za konkretan tip vjenčanja'],
          ['PartnerTypes.FieldSchema', 'rezervirano proširenje za buduće dinamične forme po tipu partnera'],
        ]}
      />

      <SectionTitle number="4.5">MT pravilo cijena</SectionTitle>
      <NoteBox title="Prioritet izračuna cijene" variant="warn">
        Sustav uvijek najprije provjerava postoji li cijena za specifični datum. Ako ne postoji, provjerava postoji li cijena za posebni dan u tjednu. Tek ako nijedno od ta dva pravila nije primjenjivo, koristi se osnovna cijena sa same kataloške stavke. Time je rezultat predvidiv i lako provjerljiv.
      </NoteBox>

      <CodeBlock>{`function izracunajCijenu(stavka, datumVjencanja) {
  if (postojiSpecificniDatum(stavka, datumVjencanja)) return cijenaSpecificnogDatuma
  if (postojiPosebniDan(stavka, datumVjencanja)) return cijenaPosebnogDana
  return stavka.basePrice
}`}</CodeBlock>

      <SectionTitle number="4.6">Financijska pravila zapisa WeddingPartners</SectionTitle>
      <Bullet>PlannedPrice se sprema pri dodjeli partnera i ne mijenja se retroaktivno promjenom cjenika</Bullet>
      <Bullet>ActualPrice se unosi pri potvrdi i predstavlja realnu dogovorenu cijenu partnera</Bullet>
      <Bullet>CommissionPercent se kopira s partnera u trenutku dodjele kako bi povijesni zapis ostao stabilan</Bullet>
      <Bullet>commissionAmount i clientPrice računaju se pri čitanju i nisu nužno trajno pohranjeni</Bullet>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <PhaseHeader
        phase="Faza C"
        title="Aplikacijska arhitektura, moduli i API ugovori"
        admLabel="ADM - Faza C (aplikacije)"
      />

      <SectionTitle number="5.1">Slojevi sustava</SectionTitle>
      <Para>
        Rješenje koristi klasičnu troslojnu strukturu: React aplikaciju za korisničko sučelje, .NET 9 Web API za poslovnu logiku i Microsoft SQL Server za trajnu pohranu podataka. Takva podjela je dovoljno jednostavna za studenski projekt, a istodobno dovoljno jasna za buduće proširenje.
      </Para>

      <View style={styles.archDiagram}>
        <View style={styles.archLayerBox}>
          <Text style={styles.archLayerName}>PREZENTACIJSKI SLOJ</Text>
          <Text style={styles.archLayerTech}>React + TypeScript + Vite | port 3000</Text>
          <Text style={styles.archLayerDetail}>forme, tablice, dashboard, prikaz statusa, preuzimanje dokumenata</Text>
        </View>
        <Text style={styles.archConnector}>HTTP JSON API</Text>
        <View style={styles.archLayerBox}>
          <Text style={styles.archLayerName}>APLIKACIJSKI SLOJ</Text>
          <Text style={styles.archLayerTech}>.NET 9 Web API | port 5000</Text>
          <Text style={styles.archLayerDetail}>kontroleri, servisi, validacija, izračun cijena, konflikti i generiranje izlaza</Text>
        </View>
        <Text style={styles.archConnector}>EF Core + SQL</Text>
        <View style={styles.archLayerBox}>
          <Text style={styles.archLayerName}>PODATKOVNI SLOJ</Text>
          <Text style={styles.archLayerTech}>Microsoft SQL Server | port 1433</Text>
          <Text style={styles.archLayerDetail}>relacijski model, JSON polja, integritet i indeksiranje za osnovne upite</Text>
        </View>
      </View>

      <SectionTitle number="5.2">Moduli i odgovornosti po slojevima</SectionTitle>
      <DataTable
        columns={[
          { label: 'Modul', flex: 1.2 },
          { label: 'Backend odgovornost', flex: 2.6 },
          { label: 'Frontend odgovornost', flex: 2.2 },
        ]}
        rows={[
          ['Temelj', 'DbContext, seed podaci, globalna obrada grešaka, osnovna infrastruktura', 'routing, osnovni layout, API klijent i error boundary'],
          ['Partneri', 'CRUD za partnere, kataloge, pravila cijena i članove benda', 'lista partnera, detalj partnera i upravljanje katalogom'],
          ['Vjenčanja', 'CRUD za predloške i vjenčanja, statusna pravila', 'dashboard, forme i detalj vjenčanja'],
          ['Povezivanje', 'dodjela partnera na vjenčanje, izračun cijene i konflikti termina', 'tab partnera na vjenčanju, statusne akcije i sažetci'],
          ['Dokumenti', 'PDF i CSV servisi, priprema podataka za ispis', 'okidanje preuzimanja i pregled stanja spremnosti'],
        ]}
      />

      <SectionTitle number="5.3">API dogovori</SectionTitle>
      <Bullet>svi odgovori koriste standardni omotac s data i error poljima</Bullet>
      <Bullet>entiteti baze se ne izbacuju direktno prema klijentu, nego preko DTO sloja</Bullet>
      <Bullet>validacija se provodi na backendu, a frontend radi osnovne korisničke provjere</Bullet>
      <Bullet>statusi se u bazi spremaju kao string vrijednosti radi čitljivosti i lakšeg debugiranja</Bullet>

      <CodeBlock>{`{
  "data": {},
  "error": null
}`}</CodeBlock>

      <SectionTitle number="5.4">Primarni endpointi</SectionTitle>
      <DataTable
        columns={[
          { label: 'Metoda', flex: 0.9 },
          { label: 'Ruta', flex: 2.8 },
          { label: 'Namjena', flex: 2.3 },
        ]}
        rows={[
          ['GET / POST', '/api/partners', 'lista partnera i otvaranje novog partnera'],
          ['GET / PUT / DEL', '/api/partners/{id}', 'detalj, izmjena i deaktivacija partnera'],
          ['POST', '/api/partners/{id}/clone', 'dubinsko kopiranje partnera i kataloga'],
          ['GET / POST', '/api/partners/{id}/catalog-items', 'pregled i unos kataloških stavki'],
          ['GET / POST', '/api/wedding-templates', 'predlošci vjenčanja'],
          ['GET / POST', '/api/weddings', 'lista i kreiranje vjenčanja'],
          ['POST', '/api/weddings/{id}/status', 'promjena statusa vjenčanja'],
          ['GET / POST', '/api/weddings/{id}/partners', 'dodjela partnera na vjenčanje'],
          ['POST', '/api/weddings/{id}/partners/{wpId}/confirm', 'potvrda partnera uz stvarnu cijenu i provjeru konflikta'],
          ['POST', '/api/weddings/{id}/offer', 'PDF ponuda za klijenta'],
          ['POST', '/api/weddings/{id}/invoice', 'PDF konačni račun za klijenta'],
          ['POST', '/api/weddings/{id}/report', 'PDF interni obračun agencije'],
        ]}
      />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <PhaseHeader
        phase="Faza D"
        title="Tehnološka arhitektura i kvalitativni zahtjevi"
        admLabel="ADM - Faza D"
      />

      <SectionTitle number="6.1">Tehnološki stack</SectionTitle>
      <DataTable
        columns={[
          { label: 'Sloj', flex: 1 },
          { label: 'Tehnologija', flex: 1.6 },
          { label: 'Verzija', flex: 0.8 },
          { label: 'Razlog odabira', flex: 2.8 },
        ]}
        rows={[
          ['Backend', '.NET 9 Web API', '9.0', 'jasan REST model, dobar rad s EF Coreom i poznat akademski stack'],
          ['Frontend', 'React + TypeScript + Vite', '18 / 5', 'brza izrada sučelja i dobar razvojni tok za timski rad'],
          ['Baza', 'Microsoft SQL Server', '2022', 'zadani akademski kontekst i dobra podrška za relacije i JSON'],
          ['ORM', 'Entity Framework Core', '9.0', 'code first migracije i tipizirani rad s bazom'],
          ['PDF', 'QuestPDF', 'aktualno', 'jednostavno generiranje preglednih PDF dokumenata'],
          ['CSV', 'CsvHelper', 'aktualno', 'stabilan import i export tablicnih podataka'],
          ['Validacija', 'FluentValidation', 'aktualno', 'čista odvojenost pravila od kontrolera'],
        ]}
      />

      <SectionTitle number="6.2">Razvojna topologija</SectionTitle>
      <CodeBlock>{`radna stanica
|
+-- /frontend   Vite razvojni server    :3000
|   +-- src/pages, src/components, src/services
|
+-- /backend    .NET 9 Web API          :5000
|   +-- Controllers, Services, DTOs, Data, Validators
|
+-- SQL Server  RezervacijaVjencanja    :1433`}</CodeBlock>

      <SectionTitle number="6.3">Nefunkcionalni zahtjevi</SectionTitle>
      <DataTable
        columns={[
          { label: 'Područje', flex: 1.2 },
          { label: 'Zahtjev', flex: 3.1 },
          { label: 'Arhitekturni odgovor', flex: 2.1 },
        ]}
        rows={[
          ['Održavanje', 'tim mora moći razumjeti i proširivati sustav bez velikog refaktora', 'jedinstveni model partnera, DTO sloj i servisna logika'],
          ['Pouzdanost', 'kritični poslovni tokovi ne smiju ovisiti o ručnoj provjeri', 'automatiziran izračun cijena i provjera konflikta termina'],
          ['Proširivost', 'faza 2 treba dodati nova događanja bez pucanja strukture', 'generička tablica partnera i predlošci s JSON definicijama'],
          ['Učinkovitost rada', 'korisnik mora brzo doći do informacije i izlaza', 'dashboard, sažetci i generiranje PDF-a iz postojećih zapisa'],
        ]}
      />

      <SectionTitle number="6.4">Sigurnosni okvir faze 1</SectionTitle>
      <NoteBox title="Napomena o sigurnosti" variant="warn">
        U ovoj fazi nema autentifikacije ni kontrole pristupa. To je prihvaćeno samo zato što je sustav namijenjen internoj uporabi jedne agencije u kontroliranom okruženju. Ako projekt prijeđe u širi produkcijski rad, zahtjev za prijavom korisnika automatski postaje okidač za promjenu arhitekture.
      </NoteBox>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <PhaseHeader
        phase="Faze E i F"
        title="Plan provedbe, epovi i redoslijed isporuke"
        admLabel="ADM - Faze E i F"
      />

      <SectionTitle number="7.1">Plan rada po epovima</SectionTitle>
      <DataTable
        columns={[
          { label: 'Epic', flex: 0.6 },
          { label: 'Naziv', flex: 2.1 },
          { label: 'Nositelj', flex: 1.4 },
          { label: 'Ovisnost', flex: 1.8 },
          { label: 'Procjena', flex: 0.9 },
        ]}
        rows={[
          ['01', 'Temelj sustava i generalizirani partneri', 'Blaž Perić', 'nema - blokira sve ostalo', '~12 dana'],
          ['02', 'Vjenčanja i predlošci', 'Vinko Jakeljić', 'Epic 01 - baza i temeljni API', '~9 dana'],
          ['03', 'Katalog partnera i upravljanje', 'Jelena Vučić', 'Epic 01 dovršen', '~16 dana'],
          ['04', 'Povezivanje partnera s vjenčanjem', 'Marija Musa', 'Epic 01 + dio Epic 02', '~10 dana'],
          ['05', 'Dokumenti i export', 'podijeljeno', 'Epic 02, 03 i 04', 'raspodijeljeno'],
        ]}
      />

      <SectionTitle number="7.2">Redoslijed isporuke</SectionTitle>
      <View style={styles.depGraph}>
        <View style={styles.depGraphCenter}>
          <View style={[styles.depBox, { borderColor: BRAND.primary, backgroundColor: BRAND.primaryBg }]}>
            <Text style={[styles.depBoxLabel, { color: BRAND.primary }]}>EPIC 01</Text>
            <Text style={styles.depBoxSub}>temelj, baza i partneri</Text>
          </View>
        </View>
        <Text style={styles.depArrow}>nakon toga tim radi paralelno</Text>
        <View style={styles.depGraphRow}>
          <View style={[styles.depBox, styles.depBoxSm]}>
            <Text style={[styles.depBoxLabel, styles.depBoxLabelSm]}>EPIC 02</Text>
            <Text style={styles.depBoxSub}>vjenčanja</Text>
          </View>
          <View style={[styles.depBox, styles.depBoxSm]}>
            <Text style={[styles.depBoxLabel, styles.depBoxLabelSm]}>EPIC 03</Text>
            <Text style={styles.depBoxSub}>partneri</Text>
          </View>
          <View style={[styles.depBox, styles.depBoxSm]}>
            <Text style={[styles.depBoxLabel, styles.depBoxLabelSm]}>EPIC 04</Text>
            <Text style={styles.depBoxSub}>povezivanje</Text>
          </View>
        </View>
        <Text style={styles.depArrow}>kad osnovni moduli sazriju, otvara se dokumentacijski sloj</Text>
        <View style={styles.depGraphCenter}>
          <View style={[styles.depBox, { borderColor: BRAND.success, backgroundColor: `${BRAND.success}15` }]}>
            <Text style={[styles.depBoxLabel, { color: BRAND.success }]}>EPIC 05</Text>
            <Text style={styles.depBoxSub}>PDF dokumenti i CSV export</Text>
          </View>
        </View>
      </View>

      <SectionTitle number="7.3">Buduća proširenja za koja se sada priprema teren</SectionTitle>
      <DataTable
        columns={[
          { label: 'Buduća faza', flex: 1.1 },
          { label: 'Sadržaj', flex: 2.4 },
          { label: 'Kako trenutna arhitektura pomaže', flex: 2.5 },
        ]}
        rows={[
          ['Faza 2', 'krštenja, krizme i druga događanja', 'struktura partnera i cijena već je generička; mijenja se ponajprije glavni entitet događaja'],
          ['Faza 3', 'portal za klijente i obavijesti', 'REST API se može otvoriti dodatnom klijentu bez lomljenja domenske logike'],
          ['Faza 4', 'autentifikacija i uloge', 'DTO i servisni sloj olakšavaju dodavanje kontrole pristupa bez mijenjanja cijelog sučelja'],
          ['Faza 5', 'više agencija', 'trenutni model je dobra osnova, ali tada treba uvesti tenant logiku i dodatna sigurnosna pravila'],
        ]}
      />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-001 v1.0 | Arhitekturni dokument projekta
      </Text>

      <PhaseHeader
        phase="Faze G i H"
        title="Standardi provedbe, rizici i promjene arhitekture"
        admLabel="ADM - Faze G i H"
      />

      <SectionTitle number="8.1">Standardi provedbe</SectionTitle>
      <DataTable
        columns={[
          { label: 'Područje', flex: 1.3 },
          { label: 'Dogovor', flex: 4.7 },
        ]}
        rows={[
          ['API odgovor', 'svaki endpoint vraća objekt oblika { data, error } radi konzistentnog rukovanja uspjehom i greškom'],
          ['Baza i migracije', 'sve promjene sheme idu kroz EF Core migracije; nema ručnog driftanja baze'],
          ['DTO sloj', 'request i response modeli odvojeni su od EF entiteta'],
          ['Validacija', 'backend validira domenska pravila; frontend radi osnovni unos i prikaz poruka'],
          ['Statusi', 'statusne vrijednosti spremaju se kao stringovi radi čitljivosti i lakše provjere'],
          ['Testni fokus', 'najvažnije jedinice su izračun cijene i detekcija konflikta termina'],
          ['Seed podaci', 'partner tipovi i osnovni predlošci moraju postojati nakon inicijalne migracije'],
        ]}
      />

      <SectionTitle number="8.2">Definition of done - sažetak po cjelinama</SectionTitle>
      <SubTitle>Temelj</SubTitle>
      <CheckRow>/backend i /frontend se podizu bez dodatnih rucnih improvizacija</CheckRow>
      <CheckRow>inicijalna baza i seed podaci prolaze na svježoj instalaciji</CheckRow>

      <SubTitle>Vjenčanja</SubTitle>
      <CheckRow>predlošci i vjenčanja imaju pun CRUD i ispravan statusni tok</CheckRow>
      <CheckRow>dashboard prikazuje filtriranje po datumu i statusu</CheckRow>

      <SubTitle>Partneri</SubTitle>
      <CheckRow>partneri, katalog i pravila cijena rade kroz isti model bez dodatnih tip-specifičnih tablica</CheckRow>
      <CheckRow>CSV import i export rade nad katalogom partnera</CheckRow>

      <SubTitle>Povezivanje i dokumenti</SubTitle>
      <CheckRow>potvrda partnera blokira se na konflikt termina</CheckRow>
      <CheckRow>ponuda, račun i interni obračun mogu se generirati iz podataka sustava</CheckRow>

      <SectionTitle number="8.3">Registar rizika</SectionTitle>
      <DataTable
        columns={[
          { label: 'Rizik', flex: 2.1 },
          { label: 'Utjecaj', flex: 0.9 },
          { label: 'Vjerojatnost', flex: 1 },
          { label: 'Mitigacija', flex: 2.5 },
        ]}
        rows={[
          ['paralelni rad tima izazove konflikt migracija', 'srednji', 'srednja', 'dogovoriti vlasništvo nad tablicama i redoslijed integracije'],
          ['JSON polja postanu neujednačena između tipova partnera', 'srednji', 'srednja', 'tipizirane forme na frontendu i jasni primjeri metadata struktura'],
          ['račun cijene vrati pogrešnu vrijednost za poseban datum', 'visok', 'niska', 'jedinični testovi za prioritet specifični datum > posebni dan > osnovna cijena'],
          ['potvrda partnera propusti konflikt rezervacije', 'visok', 'niska', 'transakcija oko provjere konflikta i kreiranja rezervacije'],
          ['opsežnost dokumenta i koda ode iznad studentskog kapaciteta', 'srednji', 'srednja', 'držati se MVP granice i ne otvarati dodatne module izvan opsega'],
        ]}
      />

      <SectionTitle number="8.4">Okidači za promjenu arhitekture</SectionTitle>
      <Bullet>uvođenje autentifikacije, uloga ili više korisničkih skupina</Bullet>
      <Bullet>potreba da više agencija radi u istoj instalaciji</Bullet>
      <Bullet>integracija s vanjskim servisima za placanje, kalendar ili notifikacije</Bullet>
      <Bullet>uvođenje dodatnih tipova događanja kao punopravnih poslovnih tokova</Bullet>
      <Bullet>značajno povećanje volumena podataka koje bi tražilo optimizaciju JSON upita ili drugačiji model spremanja</Bullet>

      <View style={styles.finalBlock}>
        <Divider color={BRAND.primary} thick />
        <Text style={styles.finalTitle}>Kraj arhitekturnog dokumenta</Text>
        <Text style={styles.finalSub}>INF-MEG-001 | Verzija 1.0 | 21. travnja 2026.</Text>
        <Text style={styles.finalSub}>ADM radna verzija za razvoj, pregled i obranu projekta</Text>
        <View style={styles.finalTeamRow}>
          <Text style={styles.finalTeamMember}>Blaž Perić</Text>
          <Text style={styles.finalTeamSep}>|</Text>
          <Text style={styles.finalTeamMember}>Vinko Jakeljić</Text>
          <Text style={styles.finalTeamSep}>|</Text>
          <Text style={styles.finalTeamMember}>Jelena Vučić</Text>
          <Text style={styles.finalTeamSep}>|</Text>
          <Text style={styles.finalTeamMember}>Marija Musa</Text>
        </View>
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

Font.register({
  family: 'NotoMono',
  src: 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSansMono/NotoSansMono-Regular.ttf',
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
    justifyContent: 'space-between',
    marginHorizontal: 52,
    marginBottom: 20,
    backgroundColor: BRAND.background,
    borderRadius: 4,
    padding: 14,
  },

  metaStatBox: {
    alignItems: 'center',
  },

  metaStatValue: {
    fontSize: 17,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
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

  phaseHeader: {
    marginBottom: 18,
    paddingBottom: 14,
  },

  phaseAdmLabel: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  phaseTitle: {
    fontSize: 20,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    marginBottom: 3,
  },

  phaseSubtitle: {
    fontSize: 10,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    marginBottom: 10,
  },

  phaseAccentBar: {
    borderBottomWidth: 2.4,
    borderBottomColor: BRAND.primary,
    width: 46,
  },

  sectionTitleWrap: {
    marginTop: 14,
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
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  noteBoxBody: {
    fontSize: 9,
    fontFamily: 'NotoSerif',
    color: '#2A2D3E',
    lineHeight: 1.55,
  },

  table: {
    marginVertical: 7,
    borderWidth: 0.5,
    borderColor: BRAND.border,
    borderRadius: 2,
    overflow: 'hidden',
  },

  tableRow: {
    flexDirection: 'row',
  },

  tableHeaderRow: {
    backgroundColor: BRAND.primary,
  },

  tableRowEven: {
    backgroundColor: BRAND.surface,
  },

  tableRowOdd: {
    backgroundColor: BRAND.white,
  },

  tableCell: {
    padding: 6,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: BRAND.border,
  },

  tableHeaderCell: {
    borderBottomColor: BRAND.primaryDark,
    borderRightColor: 'rgba(255,255,255,0.20)',
  },

  tableHeaderText: {
    fontSize: 7.3,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.white,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },

  tableCellText: {
    fontSize: 8.35,
    fontFamily: 'NotoSans',
    color: BRAND.text,
    lineHeight: 1.42,
  },

  codeBlock: {
    marginVertical: 7,
    padding: 11,
    backgroundColor: BRAND.codeBg,
    borderRadius: 3,
  },

  codeText: {
    fontSize: 7.5,
    fontFamily: 'NotoMono',
    color: BRAND.codeText,
    lineHeight: 1.55,
  },

  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 2,
  },

  bulletDot: {
    fontSize: 8.6,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    width: 18,
    marginTop: 1,
  },

  bulletText: {
    fontSize: 9,
    fontFamily: 'NotoSans',
    color: '#2A2D3E',
    flex: 1,
    lineHeight: 1.45,
  },

  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    flexWrap: 'wrap',
  },

  flowBox: {
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 3,
    marginVertical: 2,
  },

  flowBoxText: {
    fontSize: 8.4,
    fontFamily: 'NotoSans',
    fontWeight: 700,
  },

  flowArrowWrap: {
    paddingHorizontal: 4,
  },

  flowArrowText: {
    fontSize: 9,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
  },

  cancelNote: {
    fontSize: 8.3,
    fontFamily: 'NotoSans',
    color: BRAND.destructive,
    marginLeft: 6,
  },

  archDiagram: {
    marginVertical: 10,
    alignItems: 'center',
  },

  archLayerBox: {
    width: '88%',
    borderWidth: 1,
    borderColor: BRAND.primary,
    borderRadius: 4,
    padding: 10,
    backgroundColor: BRAND.primaryBg,
    marginVertical: 2,
  },

  archLayerName: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },

  archLayerTech: {
    fontSize: 9,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 2,
  },

  archLayerDetail: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    color: '#3A3D54',
    lineHeight: 1.4,
  },

  archConnector: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textAlign: 'center',
    marginVertical: 2,
  },

  depGraph: {
    marginVertical: 10,
    alignItems: 'center',
  },

  depGraphCenter: {
    width: '100%',
    alignItems: 'center',
  },

  depGraphRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 2,
  },

  depBox: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 4,
    padding: 9,
    backgroundColor: BRAND.surface,
    minWidth: 220,
    marginVertical: 2,
    alignItems: 'center',
  },

  depBoxSm: {
    minWidth: 110,
    marginHorizontal: 4,
  },

  depBoxLabel: {
    fontSize: 7.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 3,
  },

  depBoxLabelSm: {
    fontSize: 7.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  depBoxSub: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textAlign: 'center',
    lineHeight: 1.35,
  },

  depArrow: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textAlign: 'center',
    marginVertical: 3,
  },

  finalBlock: {
    marginTop: 26,
    alignItems: 'center',
    paddingTop: 10,
  },

  finalTitle: {
    fontSize: 11,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },

  finalSub: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textAlign: 'center',
    lineHeight: 1.55,
  },

  finalTeamRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  finalTeamMember: {
    fontSize: 8.4,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginHorizontal: 3,
  },

  finalTeamSep: {
    fontSize: 8.4,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    marginHorizontal: 3,
  },
});

ReactPDF.render(<ArchitectureDocument />);