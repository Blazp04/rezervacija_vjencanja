// ============================================================
// Rezervacija Vjenčanja
// Brand & Design Guide - PDF radna verzija
// Dokument ID: INF-MEG-003
// 21. travnja 2026.
// ============================================================

const BRAND = {
  primary: '#3D52A0',
  primaryInk: '#2A3B85',
  primarySoft: '#E8EAFA',
  secondary: '#E8ECF8',
  secondaryText: '#3A4775',
  background: '#F4F6FB',
  surface: '#FCFDFF',
  surfaceSoft: '#F7F9FE',
  text: '#1E2235',
  textSoft: '#43507A',
  textMuted: '#6F7693',
  border: '#D8DEEB',
  input: '#E1E5EF',
  ring: '#5B6EC4',
  accent: '#EEF3FF',
  accentText: '#3D52A0',
  success: '#2D7A4F',
  successSoft: '#E9F6EE',
  amber: '#B45309',
  amberSoft: '#FEF1E6',
  destructive: '#C94030',
  destructiveSoft: '#FDEDEA',
  white: '#FFFFFF',
};

const DOCUMENT_META = [
  ['Dokument', 'Brand & Design Guide'],
  ['Status', 'Light-only radna verzija'],
  ['UI stack', 'shadcn/ui + Tailwind semantic tokens'],
  ['Fokus', 'Boje, surfaces, komponente i layout'],
  ['Izvor', 'docs/brand-guidelines.md'],
  ['Datum', '21. travnja 2026.'],
];

const LIGHT_TOKENS = [
  {
    name: 'background',
    variable: '--background',
    className: 'bg-background',
    value: 'oklch(0.96 0.01 271.34)',
    preview: BRAND.background,
    ink: BRAND.text,
    role: 'Glavna pozadina aplikacije',
  },
  {
    name: 'card',
    variable: '--card',
    className: 'bg-card',
    value: 'oklch(0.98 0.01 271.41)',
    preview: BRAND.surface,
    ink: BRAND.text,
    role: 'Kartice i glavni paneli',
  },
  {
    name: 'foreground',
    variable: '--foreground',
    className: 'text-foreground',
    value: 'oklch(0.21 0.03 263.61)',
    preview: BRAND.text,
    ink: BRAND.white,
    role: 'Primarni tekst i headings',
  },
  {
    name: 'primary',
    variable: '--primary',
    className: 'bg-primary',
    value: 'oklch(0.48 0.20 260.47)',
    preview: BRAND.primary,
    ink: BRAND.white,
    role: 'Glavna akcija, active state i focus',
  },
  {
    name: 'secondary',
    variable: '--secondary',
    className: 'bg-secondary',
    value: 'oklch(0.91 0.02 274.06)',
    preview: BRAND.secondary,
    ink: BRAND.primaryInk,
    role: 'Mirne pomoćne površine',
  },
  {
    name: 'muted',
    variable: '--muted',
    className: 'bg-muted',
    value: 'oklch(0.94 0.02 274.86)',
    preview: '#EEF1F8',
    ink: BRAND.textMuted,
    role: 'Disabled i niski naglasak',
  },
  {
    name: 'accent',
    variable: '--accent',
    className: 'bg-accent',
    value: 'oklch(0.95 0.02 260.18)',
    preview: BRAND.accent,
    ink: BRAND.primary,
    role: 'Hover, selection i ghost states',
  },
  {
    name: 'destructive',
    variable: '--destructive',
    className: 'bg-destructive',
    value: 'oklch(0.58 0.22 27.29)',
    preview: BRAND.destructive,
    ink: BRAND.white,
    role: 'Brisanje, greška i danger tokovi',
  },
];

const UTILITY_TOKENS = [
  {
    name: 'border',
    className: 'border-border',
    value: 'oklch(0.89 0.02 259.43)',
    preview: BRAND.border,
  },
  {
    name: 'input',
    className: 'border-input',
    value: 'oklch(0.90 0.01 266.73)',
    preview: BRAND.input,
  },
  {
    name: 'ring',
    className: 'ring-ring',
    value: 'oklch(0.48 0.20 260.47)',
    preview: BRAND.ring,
  },
];

const SURFACE_RECIPES = [
  {
    title: 'Default workspace card',
    body: 'Osnovna radna jedinica za tablice, forme i detaljne preglede.',
    code: 'bg-card border-border text-foreground shadow-sm',
    bg: BRAND.surface,
    border: BRAND.border,
    labelBg: BRAND.primarySoft,
    labelText: BRAND.primary,
    label: 'default',
  },
  {
    title: 'Selected or hover state',
    body: 'Koristi se za row hover, selected item i lagani fokus površine.',
    code: 'bg-accent text-accent-foreground ring-1 ring-ring',
    bg: BRAND.accent,
    border: '#D8E1FF',
    labelBg: '#DCE6FF',
    labelText: BRAND.primary,
    label: 'active',
  },
  {
    title: 'Destructive strip',
    body: 'Samo za opasne akcije. Nema uporabe kao neutralni highlight.',
    code: 'bg-destructive/10 text-destructive border-destructive/20',
    bg: BRAND.destructiveSoft,
    border: '#F3C8C2',
    labelBg: '#F8DAD5',
    labelText: BRAND.destructive,
    label: 'danger',
  },
];

const TYPE_SAMPLES = [
  {
    title: 'Editorial heading',
    family: 'serif',
    sample: 'Brand guide za uredan operativni proizvod',
    note: 'Za naslovnicu, dokumente i veće editorial trenutke.',
  },
  {
    title: 'UI sans',
    family: 'sans',
    sample: 'Pregled vjenčanja, partnera i dokumenata',
    note: 'Zadani ton za tablice, navigaciju, forme i dashboard copy.',
  },
  {
    title: 'Utility mono',
    family: 'mono',
    sample: 'bg-card border-border rounded-md p-6 shadow-sm',
    note: 'Za utility reference, kodne oznake i tehničke specifikacije.',
  },
];

const TYPE_SCALE = [
  { label: 'Display / text-2xl', size: 24, text: 'Naslov sekcije i dokumenta' },
  { label: 'Subheading / text-lg', size: 18, text: 'Podnaslov, naziv bloka ili veća kartica' },
  { label: 'Body / text-sm', size: 14, text: 'Standardni radni tekst, forma i tablica' },
  { label: 'Meta / text-xs', size: 12, text: 'Badge, datum, caption i sekundarni label' },
];

const STATUS_PREVIEWS = [
  { label: 'U pripremi', bg: BRAND.primarySoft, text: BRAND.primary },
  { label: 'Potvrđeno', bg: BRAND.successSoft, text: BRAND.success },
  { label: 'Ponuđeno', bg: BRAND.amberSoft, text: BRAND.amber },
  { label: 'Otkazano', bg: BRAND.destructiveSoft, text: BRAND.destructive },
];

const SHADCN_RULES = [
  {
    title: 'Buttons',
    className: 'rounded-md text-sm font-medium',
    text: 'Jedan jasni primary button po panelu. Secondary i outline ostaju tihi.',
  },
  {
    title: 'Cards',
    className: 'bg-card border border-border rounded-xl p-6',
    text: 'Card je glavna radna jedinica i ne smije biti predekoriran.',
  },
  {
    title: 'Inputs',
    className: 'h-10 rounded-md border-input bg-background',
    text: 'Label ide iznad inputa, helper tekst ispod, a ring je uvijek primary.',
  },
  {
    title: 'Badges',
    className: 'rounded-sm px-2 py-1 text-xs',
    text: 'Status prenosi i boju i tekst. Nikada se ne oslanja samo na boju.',
  },
];

const FORM_FIELDS = [
  {
    label: 'Naziv vjenčanja',
    value: 'Sara & Ivan | 14.09.2026.',
    hint: 'Format: ime para + datum',
  },
  {
    label: 'Lokacija',
    value: 'Mostar | Hotel Mepas',
    hint: 'Koristi standardni naziv partnera iz kataloga',
  },
];

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', active: true },
  { label: 'Vjenčanja' },
  { label: 'Partneri' },
  { label: 'Dokumenti' },
  { label: 'Postavke' },
];

const TABLE_ROWS = [
  ['14.09.2026.', 'Sara & Ivan', 'Mepas', 'Potvrđeno'],
  ['20.09.2026.', 'Ana & Petar', 'Buna', 'U pripremi'],
  ['28.09.2026.', 'Lana & Marko', 'Mostar', 'Ponuđeno'],
];

const PRINCIPLES = [
  {
    title: 'Operativna jasnoća',
    text: 'Prvo dolazi preglednost. Korisnik mora brzo doći do partnera, cijene i dokumenta.',
  },
  {
    title: 'Jedan fokus po panelu',
    text: 'Svaka kartica treba imati jedan jasan razlog postojanja i jednu dominantnu akciju.',
  },
  {
    title: 'Primary je signal',
    text: 'Primary plava označava akciju, active state i focus. Nije pozadina za cijele sekcije.',
  },
  {
    title: 'shadcn disciplina',
    text: 'Gradimo preko semantic tokena, mirnih shadow vrijednosti i dosljednih rounded vrijednosti.',
  },
];

const IMPLEMENTATION_NOTES = [
  'Ovaj guide obrađuje samo light smjer proizvoda i njegove glavne UI obrasce.',
  'Showcase primjeri zamišljeni su kao shadcn/ui primitive nad Tailwind semantic tokenima.',
  'Osnovni ritam je p-6, gap-4 i rounded-md do rounded-xl bez agresivnog zaobljavanja.',
  'Primary se koristi za CTA, selekciju i focus ring, ne za velike dekorativne blokove.',
];

const Divider = ({ color, thick }) => (
  <View
    style={{
      borderBottomWidth: thick ? 1.8 : 0.7,
      borderBottomColor: color || BRAND.border,
      marginVertical: 6,
    }}
  />
);

const MetaStat = ({ label, value }) => (
  <View style={styles.metaStatBox}>
    <Text style={styles.metaStatValue}>{value}</Text>
    <Text style={styles.metaStatLabel}>{label}</Text>
  </View>
);

const CoverChip = ({ children }) => (
  <View style={styles.coverChip}>
    <Text style={styles.coverChipText}>{children}</Text>
  </View>
);

const SectionHeader = ({ kicker, title, body }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionKicker}>{kicker}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
    {body ? <Text style={styles.sectionBody}>{body}</Text> : null}
  </View>
);

const CodePill = ({ children, soft }) => (
  <View style={[styles.codePill, soft ? styles.codePillSoft : null]}>
    <Text style={[styles.codePillText, soft ? styles.codePillTextSoft : null]}>{children}</Text>
  </View>
);

const TokenCard = ({ token }) => (
  <View style={styles.tokenCard} wrap={false}>
    <View
      style={[
        styles.tokenSwatch,
        {
          backgroundColor: token.preview,
          borderColor: token.name === 'card' || token.name === 'background' ? BRAND.border : token.preview,
        },
      ]}
    >
      <Text style={[styles.tokenSwatchLabel, { color: token.ink }]}>{token.name}</Text>
      <Text style={[styles.tokenSwatchSub, { color: token.ink }]}>{token.variable}</Text>
    </View>
    <CodePill soft>{token.className}</CodePill>
    <Text style={styles.tokenValue}>{token.value}</Text>
    <Text style={styles.tokenRole}>{token.role}</Text>
  </View>
);

const UtilityTokenChip = ({ token }) => (
  <View style={styles.utilityChip} wrap={false}>
    <View style={[styles.utilityChipSwatch, { backgroundColor: token.preview }]} />
    <View style={styles.utilityChipContent}>
      <Text style={styles.utilityChipTitle}>{token.name}</Text>
      <Text style={styles.utilityChipValue}>{token.value}</Text>
    </View>
    <CodePill soft>{token.className}</CodePill>
  </View>
);

const SurfaceRecipeCard = ({ recipe }) => (
  <View style={styles.recipeCard} wrap={false}>
    <View style={[styles.recipeSurface, { backgroundColor: recipe.bg, borderColor: recipe.border }]}>
      <View style={[styles.recipeLabel, { backgroundColor: recipe.labelBg }]}>
        <Text style={[styles.recipeLabelText, { color: recipe.labelText }]}>{recipe.label}</Text>
      </View>
      <Text style={styles.recipeSurfaceTitle}>{recipe.title}</Text>
      <Text style={styles.recipeSurfaceBody}>{recipe.body}</Text>
      <View style={styles.recipeMiniRow}>
        <View style={styles.recipeLine} />
        <View style={[styles.recipeChipDot, { backgroundColor: recipe.labelText }]} />
      </View>
    </View>
    <CodePill>{recipe.code}</CodePill>
  </View>
);

const TypeSpecCard = ({ item }) => {
  const sampleStyle =
    item.family === 'serif'
      ? styles.typeSampleSerif
      : item.family === 'mono'
        ? styles.typeSampleMono
        : styles.typeSampleSans;

  return (
    <View style={styles.typeCard} wrap={false}>
      <Text style={styles.typeCardTitle}>{item.title}</Text>
      <Text style={sampleStyle}>{item.sample}</Text>
      <Text style={styles.typeCardNote}>{item.note}</Text>
    </View>
  );
};

const TypeScaleLine = ({ item }) => (
  <View style={styles.scaleRow}>
    <Text style={[styles.scaleSample, { fontSize: item.size }]}>{item.text}</Text>
    <Text style={styles.scaleLabel}>{item.label}</Text>
  </View>
);

const RadiusTile = ({ label, radius }) => (
  <View style={styles.radiusTileWrap}>
    <View style={[styles.radiusTile, { borderRadius: radius }]} />
    <Text style={styles.radiusTileLabel}>{label}</Text>
  </View>
);

const SpacingBlock = ({ label, width }) => (
  <View style={styles.spacingBlockWrap}>
    <View style={[styles.spacingBlock, { width }]} />
    <Text style={styles.spacingBlockLabel}>{label}</Text>
  </View>
);

const ButtonPreview = ({ label, bg, color, borderColor, compact }) => (
  <View
    style={[
      styles.buttonPreview,
      compact ? styles.buttonPreviewCompact : null,
      {
        backgroundColor: bg,
        borderColor: borderColor || bg,
        borderWidth: borderColor ? 0.8 : 0,
      },
    ]}
  >
    <Text style={[styles.buttonPreviewText, compact ? styles.buttonPreviewTextCompact : null, { color }]}>
      {label}
    </Text>
  </View>
);

const BadgePreview = ({ label, bg, color }) => (
  <View style={[styles.badgePreview, { backgroundColor: bg }]}>
    <Text style={[styles.badgePreviewText, { color }]}>{label}</Text>
  </View>
);

const FormFieldPreview = ({ field }) => (
  <View style={styles.formField}>
    <Text style={styles.formLabel}>{field.label}</Text>
    <View style={styles.formInputShell}>
      <Text style={styles.formInputValue}>{field.value}</Text>
    </View>
    <Text style={styles.formHint}>{field.hint}</Text>
  </View>
);

const RuleCard = ({ rule }) => (
  <View style={styles.ruleCard} wrap={false}>
    <Text style={styles.ruleCardTitle}>{rule.title}</Text>
    <CodePill>{rule.className}</CodePill>
    <Text style={styles.ruleCardText}>{rule.text}</Text>
  </View>
);

const SidebarItem = ({ item }) => (
  <View style={[styles.sidebarItem, item.active ? styles.sidebarItemActive : null]}>
    <View style={[styles.sidebarItemDot, item.active ? styles.sidebarItemDotActive : null]} />
    <Text style={[styles.sidebarItemText, item.active ? styles.sidebarItemTextActive : null]}>{item.label}</Text>
  </View>
);

const TablePreviewRow = ({ row, header }) => (
  <View style={[styles.tablePreviewRow, header ? styles.tablePreviewHeaderRow : null]}>
    <Text style={[styles.tablePreviewCellDate, header ? styles.tablePreviewHeaderText : styles.tablePreviewText]}>
      {row[0]}
    </Text>
    <Text style={[styles.tablePreviewCellName, header ? styles.tablePreviewHeaderText : styles.tablePreviewText]}>
      {row[1]}
    </Text>
    <Text style={[styles.tablePreviewCellLocation, header ? styles.tablePreviewHeaderText : styles.tablePreviewText]}>
      {row[2]}
    </Text>
    <Text style={[styles.tablePreviewCellStatus, header ? styles.tablePreviewHeaderText : styles.tablePreviewText]}>
      {row[3]}
    </Text>
  </View>
);

const PrincipleCard = ({ item }) => (
  <View style={styles.principleCard} wrap={false}>
    <Text style={styles.principleTitle}>{item.title}</Text>
    <Text style={styles.principleText}>{item.text}</Text>
  </View>
);

const DesignSystemDocument = () => (
  <Document
    title="Rezervacija Vjenčanja - brand & design guide"
    author="Blaž Perić, Vinko Jakeljić, Jelena Vučić, Marija Musa"
    subject="Light mode brand and design guide for shadcn UI"
    keywords="brand guide design system shadcn light tokens pdf"
  >
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverTopBar} />

      <View style={styles.coverBody}>
        <View style={styles.coverLeft}>
          <Text style={styles.coverEyebrow}>Rezervacija Vjenčanja</Text>
          <Text style={styles.coverTitlePrimary}>BRAND &</Text>
          <Text style={styles.coverTitleSecondary}>DESIGN GUIDE</Text>
          <Text style={styles.coverSubtitle}>
            Light-only vizualni sustav, token usage i shadcn/ui smjernice za interni proizvod.
          </Text>

          <View style={styles.coverStatRow}>
            <MetaStat label="Theme" value="Light" />
            <MetaStat label="Tokens" value="8" />
            <MetaStat label="UI" value="shadcn" />
            <MetaStat label="Layout" value="1 smjer" />
          </View>

          <View style={styles.coverChipRow}>
            <CoverChip>semantic tokens</CoverChip>
            <CoverChip>rounded-md discipline</CoverChip>
            <CoverChip>card-first UI</CoverChip>
            <CoverChip>focus on clarity</CoverChip>
          </View>

          <View style={styles.coverPaletteStrip}>
            <View style={[styles.coverPaletteSwatch, { backgroundColor: BRAND.primary }]} />
            <View style={[styles.coverPaletteSwatch, { backgroundColor: BRAND.secondary }]} />
            <View style={[styles.coverPaletteSwatch, { backgroundColor: BRAND.accent }]} />
            <View style={[styles.coverPaletteSwatch, { backgroundColor: BRAND.surface }]} />
            <View style={[styles.coverPaletteSwatch, { backgroundColor: BRAND.text }]} />
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
        </View>

        <View style={styles.coverRight}>
          <View style={styles.coverPreviewFrame}>
            <Text style={styles.coverPreviewLabel}>Preview board</Text>
            <View style={styles.coverPreviewHeader}>
              <View>
                <Text style={styles.coverPreviewTitle}>Wedding dashboard</Text>
                <Text style={styles.coverPreviewSub}>Primary surfaces + light status language</Text>
              </View>
              <BadgePreview label="Light only" bg={BRAND.primarySoft} color={BRAND.primary} />
            </View>

            <View style={styles.coverPreviewMetricRow}>
              <View style={styles.coverPreviewMetric}>
                <Text style={styles.coverPreviewMetricValue}>24</Text>
                <Text style={styles.coverPreviewMetricLabel}>aktivna</Text>
              </View>
              <View style={styles.coverPreviewMetric}>
                <Text style={styles.coverPreviewMetricValue}>68</Text>
                <Text style={styles.coverPreviewMetricLabel}>partnera</Text>
              </View>
              <View style={styles.coverPreviewMetric}>
                <Text style={styles.coverPreviewMetricValue}>12</Text>
                <Text style={styles.coverPreviewMetricLabel}>dokumenata</Text>
              </View>
            </View>

            <View style={styles.coverPreviewCard}>
              <Text style={styles.coverPreviewCardTitle}>Sara & Ivan</Text>
              <Text style={styles.coverPreviewCardMeta}>14.09.2026. | Hotel Mepas</Text>
              <View style={styles.coverPreviewBadgeRow}>
                <BadgePreview label="Potvrđeno" bg={BRAND.successSoft} color={BRAND.success} />
                <BadgePreview label="Bend + foto" bg={BRAND.accent} color={BRAND.primary} />
              </View>
              <Divider />
              <View style={styles.coverPreviewButtonRow}>
                <ButtonPreview label="Spremi" bg={BRAND.primary} color={BRAND.white} compact />
                <ButtonPreview
                  label="Detalji"
                  bg={BRAND.white}
                  color={BRAND.text}
                  borderColor={BRAND.border}
                  compact
                />
              </View>
            </View>

            <View style={styles.coverPreviewCodeBox}>
              <Text style={styles.coverPreviewCodeTitle}>shadcn baseline</Text>
              <Text style={styles.coverPreviewCodeLine}>bg-card border-border rounded-xl p-6</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.coverFooter}>
        <View style={styles.coverFooterLine} />
        <Text style={styles.coverFooterText}>INF-MEG-003 | Brand & Design Guide | 2026</Text>
      </View>
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-003 | Brand & Design Guide | Light only
      </Text>

      <SectionHeader
        kicker="01 Palette"
        title="Light palette s jasnom semantičkom hijerarhijom"
        body="Dokument zadržava samo light smjer. Fokus je na primarnim tokenima koji stvarno grade shadcn površine, stanja i CTA logiku."
      />

      <View style={styles.tokenGrid}>
        {LIGHT_TOKENS.map((token) => (
          <TokenCard key={token.name} token={token} />
        ))}
      </View>

      <View style={styles.utilityRail}>
        {UTILITY_TOKENS.map((token) => (
          <UtilityTokenChip key={token.name} token={token} />
        ))}
      </View>

      <View style={styles.recipeHeaderRow}>
        <Text style={styles.miniHeading}>Surface recipes</Text>
        <Text style={styles.miniSubheading}>Tri sigurne kombinacije za card, active state i danger tok.</Text>
      </View>

      <View style={styles.recipeRow}>
        {SURFACE_RECIPES.map((recipe) => (
          <SurfaceRecipeCard key={recipe.title} recipe={recipe} />
        ))}
      </View>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-003 | Brand & Design Guide | Light only
      </Text>

      <SectionHeader
        kicker="02 Type & Foundations"
        title="Typography, radius i spacing grade miran operativni ton"
        body="Vizualni sustav je namjerno kontroliran. Nema velikih radiusa, nema agresivnih sjena i nema nepotrebno glasnih površina."
      />

      <View style={styles.typeRow}>
        {TYPE_SAMPLES.map((item) => (
          <TypeSpecCard key={item.title} item={item} />
        ))}
      </View>

      <View style={styles.scaleBoard} wrap={false}>
        <Text style={styles.scaleBoardTitle}>Recommended type scale</Text>
        {TYPE_SCALE.map((item) => (
          <TypeScaleLine key={item.label} item={item} />
        ))}
      </View>

      <View style={styles.foundationRow}>
        <View style={styles.foundationCard} wrap={false}>
          <Text style={styles.foundationCardTitle}>Radius discipline</Text>
          <Text style={styles.foundationCardText}>Default shape language ostaje kompaktan i čist.</Text>

          <View style={styles.radiusRow}>
            <RadiusTile label="2px" radius={2} />
            <RadiusTile label="4px" radius={4} />
            <RadiusTile label="6px" radius={6} />
            <RadiusTile label="10px" radius={10} />
          </View>

          <Divider />
          <Text style={styles.foundationSubTitle}>Spacing rhythm</Text>
          <View style={styles.spacingRow}>
            <SpacingBlock label="4" width={18} />
            <SpacingBlock label="8" width={34} />
            <SpacingBlock label="16" width={64} />
            <SpacingBlock label="24" width={94} />
          </View>
        </View>

        <View style={styles.foundationCard} wrap={false}>
          <Text style={styles.foundationCardTitle}>Elevation behaviour</Text>
          <Text style={styles.foundationCardText}>Shadow je suptilan i služi hijerarhiji, ne dekoraciji.</Text>

          <View style={styles.elevationStage}>
            <View style={styles.elevationCardBack}>
              <Text style={styles.elevationLabel}>modal</Text>
            </View>
            <View style={styles.elevationCardMid}>
              <Text style={styles.elevationLabel}>dropdown</Text>
            </View>
            <View style={styles.elevationCardFront}>
              <Text style={styles.elevationLabel}>default card</Text>
            </View>
          </View>

          <Divider />
          <Text style={styles.foundationSubTitle}>shadcn base line</Text>
          <CodePill>rounded-md to rounded-xl | shadow-sm by default</CodePill>
        </View>
      </View>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-003 | Brand & Design Guide | Light only
      </Text>

      <SectionHeader
        kicker="03 shadcn Showcase"
        title="Komponente trebaju izgledati kao sistem, ne kao skup nepovezanih widgeta"
        body="Ispod su osnovni shadcn obrasci koje vrijedi ponavljati kroz dashboard, detalje vjenčanja i partnerske ekrane."
      />

      <View style={styles.buttonPanel} wrap={false}>
        <Text style={styles.panelTitle}>Button language</Text>
        <View style={styles.buttonRowLarge}>
          <ButtonPreview label="Spremi promjene" bg={BRAND.primary} color={BRAND.white} />
          <ButtonPreview
            label="Pregled ponude"
            bg={BRAND.secondary}
            color={BRAND.secondaryText}
            borderColor={BRAND.secondary}
          />
          <ButtonPreview label="Dodaj partnera" bg={BRAND.white} color={BRAND.text} borderColor={BRAND.border} />
          <ButtonPreview label="Otvori detalje" bg={BRAND.accent} color={BRAND.primary} borderColor={BRAND.accent} />
        </View>

        <View style={styles.badgeRow}>
          {STATUS_PREVIEWS.map((badge) => (
            <BadgePreview key={badge.label} label={badge.label} bg={badge.bg} color={badge.text} />
          ))}
        </View>
      </View>

      <View style={styles.showcaseRow}>
        <View style={styles.formCard} wrap={false}>
          <Text style={styles.panelTitle}>Form card</Text>
          {FORM_FIELDS.map((field) => (
            <FormFieldPreview key={field.label} field={field} />
          ))}

          <View style={styles.formButtonRow}>
            <ButtonPreview label="Spremi" bg={BRAND.primary} color={BRAND.white} compact />
            <ButtonPreview label="Odustani" bg={BRAND.white} color={BRAND.textMuted} borderColor={BRAND.border} compact />
          </View>
        </View>

        <View style={styles.sampleCard} wrap={false}>
          <Text style={styles.panelTitle}>Example content card</Text>
          <View style={styles.sampleCardHeader}>
            <View>
              <Text style={styles.sampleCardTitle}>Sara & Ivan</Text>
              <Text style={styles.sampleCardMeta}>14.09.2026. | Hotel Mepas</Text>
            </View>
            <BadgePreview label="Potvrđeno" bg={BRAND.successSoft} color={BRAND.success} />
          </View>

          <Divider />

          <View style={styles.sampleInfoRow}>
            <Text style={styles.sampleInfoLabel}>Fotograf</Text>
            <Text style={styles.sampleInfoValue}>Studio Lumiere</Text>
          </View>
          <View style={styles.sampleInfoRow}>
            <Text style={styles.sampleInfoLabel}>Glazba</Text>
            <Text style={styles.sampleInfoValue}>Bend Aurora</Text>
          </View>
          <View style={styles.sampleInfoRow}>
            <Text style={styles.sampleInfoLabel}>Ukupan iznos</Text>
            <Text style={styles.sampleInfoValue}>11.450 KM</Text>
          </View>

          <View style={styles.sampleFooterRow}>
            <CodePill soft>bg-card border-border rounded-xl</CodePill>
            <ButtonPreview label="Detalji" bg={BRAND.accent} color={BRAND.primary} compact />
          </View>
        </View>
      </View>

      <View style={styles.ruleGrid}>
        {SHADCN_RULES.map((rule) => (
          <RuleCard key={rule.title} rule={rule} />
        ))}
      </View>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    <Page size="A4" style={styles.body}>
      <Text style={styles.runningHeader} fixed>
        INF-MEG-003 | Brand & Design Guide | Light only
      </Text>

      <SectionHeader
        kicker="04 Layout Direction"
        title="Kako sve to izgleda kada se složi u stvaran ekran"
        body="Ovo je preporučeni smjer za glavni dashboard i srodne radne ekrane: sidebar, header, mirni KPI cardovi i jedna dominantna content površina."
      />

      <View style={styles.layoutFrame} wrap={false}>
        <View style={styles.layoutSidebar}>
          <Text style={styles.layoutSidebarBrand}>RV</Text>
          <Text style={styles.layoutSidebarLabel}>Rezervacija Vjenčanja</Text>

          <View style={styles.sidebarList}>
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </View>

          <View style={styles.layoutSidebarNote}>
            <Text style={styles.layoutSidebarNoteTitle}>Brand note</Text>
            <Text style={styles.layoutSidebarNoteText}>Sidebar koristi mirnu površinu i active state preko primary akcenta.</Text>
          </View>
        </View>

        <View style={styles.layoutContent}>
          <View style={styles.layoutTopbar}>
            <View>
              <Text style={styles.layoutTopbarTitle}>Pregled vjenčanja</Text>
              <Text style={styles.layoutTopbarSub}>Card-first struktura za internu operativu</Text>
            </View>

            <View style={styles.layoutTopbarActions}>
              <CodePill soft>px-6 gap-4</CodePill>
              <ButtonPreview label="Novo vjenčanje" bg={BRAND.primary} color={BRAND.white} compact />
            </View>
          </View>

          <View style={styles.layoutStatsRow}>
            <View style={styles.layoutStatCard}>
              <Text style={styles.layoutStatLabel}>Aktivna vjenčanja</Text>
              <Text style={styles.layoutStatValue}>24</Text>
              <Text style={styles.layoutStatMeta}>+3 ovaj tjedan</Text>
            </View>
            <View style={styles.layoutStatCard}>
              <Text style={styles.layoutStatLabel}>Potvrđeni partneri</Text>
              <Text style={styles.layoutStatValue}>68</Text>
              <Text style={styles.layoutStatMeta}>stabilan rast</Text>
            </View>
            <View style={styles.layoutStatCard}>
              <Text style={styles.layoutStatLabel}>PDF dokumenti</Text>
              <Text style={styles.layoutStatValue}>12</Text>
              <Text style={styles.layoutStatMeta}>generirano danas</Text>
            </View>
          </View>

          <View style={styles.layoutGrid}>
            <View style={styles.layoutMainPanel}>
              <Text style={styles.layoutPanelTitle}>Nadolazeća vjenčanja</Text>
              <TablePreviewRow row={['Datum', 'Par', 'Lokacija', 'Status']} header />
              {TABLE_ROWS.map((row, index) => (
                <TablePreviewRow key={index} row={row} />
              ))}
            </View>

            <View style={styles.layoutSidePanel}>
              <Text style={styles.layoutPanelTitle}>Quick panel</Text>
              <BadgePreview label="Primary CTA" bg={BRAND.primarySoft} color={BRAND.primary} />
              <Text style={styles.layoutSideText}>Desni panel čuva pomoćni sadržaj, kratke napomene i manje sekundarne radnje.</Text>
              <Divider />
              <Text style={styles.layoutSideMini}>Recommended classes</Text>
              <CodePill>bg-card border-border rounded-xl p-6</CodePill>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.principleGrid}>
        {PRINCIPLES.map((item) => (
          <PrincipleCard key={item.title} item={item} />
        ))}
      </View>

      <View style={styles.noteListBox}>
        <Text style={styles.noteListTitle}>Implementation notes</Text>
        {IMPLEMENTATION_NOTES.map((item, index) => (
          <View key={index} style={styles.noteListRow}>
            <Text style={styles.noteListBullet}>-</Text>
            <Text style={styles.noteListText}>{item}</Text>
          </View>
        ))}
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
    paddingTop: 38,
    paddingBottom: 52,
    paddingHorizontal: 42,
    backgroundColor: '#FFFFFF',
  },

  coverPage: {
    backgroundColor: '#FFFFFF',
  },

  runningHeader: {
    fontSize: 7.2,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.35,
  },

  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 22,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: BRAND.textMuted,
    fontFamily: 'NotoSans',
  },

  coverTopBar: {
    height: 18,
    backgroundColor: BRAND.primary,
  },

  coverBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 42,
    paddingBottom: 24,
  },

  coverLeft: {
    width: 288,
  },

  coverRight: {
    width: 220,
    alignItems: 'flex-end',
  },

  coverEyebrow: {
    fontSize: 9,
    fontFamily: 'NotoSans',
    color: BRAND.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 12,
  },

  coverTitlePrimary: {
    fontSize: 31,
    fontFamily: 'NotoSerif',
    fontWeight: 700,
    color: BRAND.text,
    lineHeight: 1.05,
  },

  coverTitleSecondary: {
    fontSize: 28,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    letterSpacing: 1.3,
    marginBottom: 12,
  },

  coverSubtitle: {
    fontSize: 10.2,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
    lineHeight: 1.55,
    marginBottom: 18,
  },

  coverStatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },

  metaStatBox: {
    width: 120,
    marginRight: 10,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: BRAND.surfaceSoft,
    borderWidth: 0.7,
    borderColor: BRAND.border,
    borderRadius: 10,
  },

  metaStatValue: {
    fontSize: 16,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    marginBottom: 2,
  },

  metaStatLabel: {
    fontSize: 7,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  coverChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },

  coverChip: {
    backgroundColor: BRAND.accent,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },

  coverChipText: {
    fontSize: 7.4,
    fontFamily: 'NotoSans',
    color: BRAND.accentText,
  },

  coverPaletteStrip: {
    flexDirection: 'row',
    marginBottom: 18,
  },

  coverPaletteSwatch: {
    width: 44,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
    borderWidth: 0.6,
    borderColor: BRAND.border,
  },

  coverMetaBox: {
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 12,
    overflow: 'hidden',
  },

  coverMetaRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: BRAND.white,
  },

  coverMetaDivider: {
    borderBottomWidth: 0.6,
    borderBottomColor: BRAND.border,
  },

  coverMetaLabel: {
    width: 88,
    fontSize: 7.8,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
  },

  coverMetaValue: {
    flex: 1,
    fontSize: 7.8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
  },

  coverPreviewFrame: {
    width: 220,
    padding: 14,
    backgroundColor: BRAND.white,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 16,
  },

  coverPreviewLabel: {
    fontSize: 7,
    fontFamily: 'NotoSans',
    color: BRAND.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },

  coverPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  coverPreviewTitle: {
    fontSize: 11,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 2,
  },

  coverPreviewSub: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    width: 120,
    lineHeight: 1.35,
  },

  coverPreviewMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  coverPreviewMetric: {
    width: 58,
    backgroundColor: BRAND.surfaceSoft,
    borderWidth: 0.7,
    borderColor: BRAND.border,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },

  coverPreviewMetricValue: {
    fontSize: 12,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
  },

  coverPreviewMetricLabel: {
    fontSize: 6.8,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    marginTop: 2,
  },

  coverPreviewCard: {
    backgroundColor: BRAND.surface,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  coverPreviewCardTitle: {
    fontSize: 10.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 2,
  },

  coverPreviewCardMeta: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    marginBottom: 8,
  },

  coverPreviewBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },

  coverPreviewButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  coverPreviewCodeBox: {
    backgroundColor: BRAND.text,
    borderRadius: 12,
    padding: 10,
  },

  coverPreviewCodeTitle: {
    fontSize: 7,
    fontFamily: 'NotoSans',
    color: 'rgba(255,255,255,0.58)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  coverPreviewCodeLine: {
    fontSize: 8.3,
    fontFamily: 'NotoMono',
    color: BRAND.white,
    lineHeight: 1.4,
  },

  coverFooter: {
    paddingHorizontal: 42,
    paddingBottom: 24,
    alignItems: 'center',
  },

  coverFooterLine: {
    width: 220,
    borderBottomWidth: 0.7,
    borderBottomColor: BRAND.border,
    marginBottom: 10,
  },

  coverFooterText: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionKicker: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    color: BRAND.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.15,
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 19,
    fontFamily: 'NotoSerif',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 4,
  },

  sectionBody: {
    fontSize: 9.2,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
    lineHeight: 1.55,
  },

  codePill: {
    alignSelf: 'flex-start',
    backgroundColor: BRAND.text,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6,
    marginBottom: 6,
  },

  codePillSoft: {
    backgroundColor: BRAND.surfaceSoft,
    borderWidth: 0.7,
    borderColor: BRAND.border,
  },

  codePillText: {
    fontSize: 7.3,
    fontFamily: 'NotoMono',
    color: BRAND.white,
  },

  codePillTextSoft: {
    color: BRAND.primaryInk,
  },

  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  tokenCard: {
    width: 112,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 8,
    backgroundColor: BRAND.white,
    marginBottom: 10,
  },

  tokenSwatch: {
    height: 72,
    borderRadius: 10,
    padding: 8,
    justifyContent: 'flex-end',
    borderWidth: 0.8,
    marginBottom: 4,
  },

  tokenSwatchLabel: {
    fontSize: 8.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    marginBottom: 2,
  },

  tokenSwatchSub: {
    fontSize: 6.8,
    fontFamily: 'NotoMono',
    opacity: 0.82,
  },

  tokenValue: {
    fontSize: 7.2,
    fontFamily: 'NotoMono',
    color: BRAND.textMuted,
    lineHeight: 1.35,
    marginBottom: 4,
  },

  tokenRole: {
    fontSize: 7.6,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
    lineHeight: 1.4,
  },

  utilityRail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  utilityChip: {
    width: 154,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.surfaceSoft,
    borderWidth: 0.7,
    borderColor: BRAND.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  utilityChipSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
    borderWidth: 0.6,
    borderColor: BRAND.border,
  },

  utilityChipContent: {
    flex: 1,
  },

  utilityChipTitle: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
  },

  utilityChipValue: {
    fontSize: 6.8,
    fontFamily: 'NotoMono',
    color: BRAND.textMuted,
    marginTop: 1,
  },

  recipeHeaderRow: {
    marginBottom: 8,
  },

  miniHeading: {
    fontSize: 10.5,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 2,
  },

  miniSubheading: {
    fontSize: 8.3,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
  },

  recipeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  recipeCard: {
    width: 152,
  },

  recipeSurface: {
    minHeight: 118,
    borderWidth: 0.8,
    borderRadius: 14,
    padding: 10,
    marginBottom: 4,
  },

  recipeLabel: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginBottom: 8,
  },

  recipeLabelText: {
    fontSize: 6.8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  recipeSurfaceTitle: {
    fontSize: 9,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 4,
  },

  recipeSurfaceBody: {
    fontSize: 7.8,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
    lineHeight: 1.45,
  },

  recipeMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  recipeLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },

  recipeChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },

  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  typeCard: {
    width: 152,
    minHeight: 120,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: BRAND.white,
  },

  typeCardTitle: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    color: BRAND.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.85,
    marginBottom: 10,
  },

  typeSampleSerif: {
    fontSize: 17,
    fontFamily: 'NotoSerif',
    color: BRAND.text,
    lineHeight: 1.3,
    marginBottom: 10,
  },

  typeSampleSans: {
    fontSize: 13.4,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    lineHeight: 1.35,
    marginBottom: 10,
  },

  typeSampleMono: {
    fontSize: 9.2,
    fontFamily: 'NotoMono',
    color: BRAND.primaryInk,
    lineHeight: 1.5,
    marginBottom: 10,
  },

  typeCardNote: {
    fontSize: 7.8,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    lineHeight: 1.45,
  },

  scaleBoard: {
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    backgroundColor: BRAND.surfaceSoft,
    padding: 12,
    marginBottom: 12,
  },

  scaleBoardTitle: {
    fontSize: 10.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 8,
  },

  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.6,
    borderBottomColor: '#E2E7F0',
  },

  scaleSample: {
    width: 320,
    fontFamily: 'NotoSans',
    color: BRAND.text,
  },

  scaleLabel: {
    fontSize: 7.6,
    fontFamily: 'NotoMono',
    color: BRAND.textMuted,
  },

  foundationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  foundationCard: {
    width: 236,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: BRAND.white,
  },

  foundationCardTitle: {
    fontSize: 10,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 3,
  },

  foundationCardText: {
    fontSize: 7.9,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    lineHeight: 1.45,
    marginBottom: 10,
  },

  foundationSubTitle: {
    fontSize: 8.4,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    marginBottom: 8,
  },

  radiusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  radiusTileWrap: {
    alignItems: 'center',
  },

  radiusTile: {
    width: 42,
    height: 42,
    backgroundColor: BRAND.primarySoft,
    borderWidth: 0.8,
    borderColor: '#CED8F4',
    marginBottom: 4,
  },

  radiusTileLabel: {
    fontSize: 7,
    fontFamily: 'NotoMono',
    color: BRAND.textMuted,
  },

  spacingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  spacingBlockWrap: {
    alignItems: 'center',
  },

  spacingBlock: {
    height: 12,
    backgroundColor: BRAND.primary,
    borderRadius: 6,
    marginBottom: 5,
  },

  spacingBlockLabel: {
    fontSize: 7,
    fontFamily: 'NotoMono',
    color: BRAND.textMuted,
  },

  elevationStage: {
    position: 'relative',
    height: 110,
    marginBottom: 4,
  },

  elevationCardBack: {
    position: 'absolute',
    top: 10,
    left: 18,
    width: 134,
    height: 70,
    backgroundColor: '#EFF3FA',
    borderWidth: 0.8,
    borderColor: '#D9DFEC',
    borderRadius: 12,
    padding: 10,
  },

  elevationCardMid: {
    position: 'absolute',
    top: 22,
    left: 38,
    width: 142,
    height: 74,
    backgroundColor: '#F6F8FD',
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 10,
  },

  elevationCardFront: {
    position: 'absolute',
    top: 36,
    left: 58,
    width: 148,
    height: 78,
    backgroundColor: BRAND.white,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 10,
  },

  elevationLabel: {
    fontSize: 7.6,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
  },

  buttonPanel: {
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: BRAND.surfaceSoft,
    marginBottom: 12,
  },

  panelTitle: {
    fontSize: 10.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 10,
  },

  buttonRowLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  buttonPreview: {
    minWidth: 104,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  buttonPreviewCompact: {
    minWidth: 74,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  buttonPreviewText: {
    fontSize: 8.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
  },

  buttonPreviewTextCompact: {
    fontSize: 7.5,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  badgePreview: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 4,
  },

  badgePreviewText: {
    fontSize: 7.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
  },

  showcaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  formCard: {
    width: 200,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: BRAND.white,
  },

  formField: {
    marginBottom: 10,
  },

  formLabel: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 4,
  },

  formInputShell: {
    height: 34,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: BRAND.input,
    backgroundColor: BRAND.background,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 3,
  },

  formInputValue: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
  },

  formHint: {
    fontSize: 7.1,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    lineHeight: 1.35,
  },

  formButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  sampleCard: {
    width: 279,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: BRAND.white,
  },

  sampleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },

  sampleCardTitle: {
    fontSize: 11,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 2,
  },

  sampleCardMeta: {
    fontSize: 7.6,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
  },

  sampleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  sampleInfoLabel: {
    fontSize: 8.2,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
  },

  sampleInfoValue: {
    fontSize: 8.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
  },

  sampleFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },

  ruleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  ruleCard: {
    width: 236,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: BRAND.surfaceSoft,
    marginBottom: 10,
  },

  ruleCardTitle: {
    fontSize: 9.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 3,
  },

  ruleCardText: {
    fontSize: 7.7,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
    lineHeight: 1.45,
  },

  layoutFrame: {
    flexDirection: 'row',
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 310,
  },

  layoutSidebar: {
    width: 114,
    backgroundColor: '#F8FAFE',
    borderRightWidth: 0.8,
    borderRightColor: BRAND.border,
    padding: 12,
  },

  layoutSidebarBrand: {
    fontSize: 16,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    marginBottom: 4,
  },

  layoutSidebarLabel: {
    fontSize: 7.4,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    lineHeight: 1.4,
    marginBottom: 14,
  },

  sidebarList: {
    marginBottom: 14,
  },

  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 3,
  },

  sidebarItemActive: {
    backgroundColor: BRAND.primarySoft,
  },

  sidebarItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CAD3E9',
    marginRight: 8,
  },

  sidebarItemDotActive: {
    backgroundColor: BRAND.primary,
  },

  sidebarItemText: {
    fontSize: 7.8,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
  },

  sidebarItemTextActive: {
    color: BRAND.primary,
    fontWeight: 700,
  },

  layoutSidebarNote: {
    backgroundColor: BRAND.white,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 8,
  },

  layoutSidebarNoteTitle: {
    fontSize: 7.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 3,
  },

  layoutSidebarNoteText: {
    fontSize: 6.9,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    lineHeight: 1.35,
  },

  layoutContent: {
    flex: 1,
    backgroundColor: BRAND.background,
    padding: 14,
  },

  layoutTopbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  layoutTopbarTitle: {
    fontSize: 12,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 2,
  },

  layoutTopbarSub: {
    fontSize: 7.6,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
  },

  layoutTopbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  layoutStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  layoutStatCard: {
    width: 110,
    backgroundColor: BRAND.white,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 10,
  },

  layoutStatLabel: {
    fontSize: 7.2,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    marginBottom: 6,
  },

  layoutStatValue: {
    fontSize: 17,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primary,
    marginBottom: 2,
  },

  layoutStatMeta: {
    fontSize: 7.1,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
  },

  layoutGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  layoutMainPanel: {
    width: 262,
    backgroundColor: BRAND.white,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
  },

  layoutSidePanel: {
    width: 114,
    backgroundColor: BRAND.white,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
  },

  layoutPanelTitle: {
    fontSize: 9.2,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 8,
  },

  tablePreviewRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.6,
    borderBottomColor: '#E6EAF2',
  },

  tablePreviewHeaderRow: {
    backgroundColor: BRAND.surfaceSoft,
    borderWidth: 0.6,
    borderColor: BRAND.border,
    borderRadius: 8,
    paddingHorizontal: 6,
    marginBottom: 4,
  },

  tablePreviewCellDate: {
    width: 52,
  },

  tablePreviewCellName: {
    width: 88,
  },

  tablePreviewCellLocation: {
    width: 58,
  },

  tablePreviewCellStatus: {
    flex: 1,
    textAlign: 'right',
  },

  tablePreviewHeaderText: {
    fontSize: 6.8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.primaryInk,
  },

  tablePreviewText: {
    fontSize: 7.1,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
  },

  layoutSideText: {
    fontSize: 7.4,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
    lineHeight: 1.5,
    marginTop: 8,
    marginBottom: 6,
  },

  layoutSideMini: {
    fontSize: 7.1,
    fontFamily: 'NotoSans',
    color: BRAND.textMuted,
    marginBottom: 4,
  },

  principleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  principleCard: {
    width: 236,
    backgroundColor: BRAND.surfaceSoft,
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },

  principleTitle: {
    fontSize: 9,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 4,
  },

  principleText: {
    fontSize: 7.7,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
    lineHeight: 1.45,
  },

  noteListBox: {
    borderWidth: 0.8,
    borderColor: BRAND.border,
    borderRadius: 14,
    backgroundColor: BRAND.white,
    padding: 12,
  },

  noteListTitle: {
    fontSize: 9.3,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 6,
  },

  noteListRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  noteListBullet: {
    width: 12,
    fontSize: 8,
    fontFamily: 'NotoSans',
    color: BRAND.primary,
  },

  noteListText: {
    flex: 1,
    fontSize: 7.8,
    fontFamily: 'NotoSans',
    color: BRAND.textSoft,
    lineHeight: 1.45,
  },
});

ReactPDF.render(<DesignSystemDocument />);