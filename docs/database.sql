-- ============================================================
-- Rezervacija Vjenčanja — Database Schema
-- Target: Microsoft SQL Server (MSSQL)
-- ORM: Entity Framework Core (code-first — this file is the
--      reference schema, not used directly by EF migrations)
-- ============================================================

-- ============================================================
-- PARTNER TYPES
-- Predefined + custom partner types. HasBooking controls
-- whether conflict detection applies to partners of this type.
-- FieldSchema (JSON) can define extra partner-level fields
-- for future dynamic forms — NULL for all predefined types in MVP.
-- ============================================================
CREATE TABLE PartnerTypes (
    Id          INT            IDENTITY(1,1) NOT NULL,
    Name        NVARCHAR(100)  NOT NULL,
    Code        NVARCHAR(50)   NOT NULL,     -- BAND, FLORIST, PASTRY, PHOTOGRAPHER, VENUE, CATERING, GENERIC
    HasBooking  BIT            NOT NULL DEFAULT 0,
    FieldSchema NVARCHAR(MAX)  NULL,         -- JSON: optional extra field definitions
    CreatedAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_PartnerTypes         PRIMARY KEY (Id),
    CONSTRAINT UQ_PartnerTypes_Code    UNIQUE (Code),
    CONSTRAINT CHK_PartnerTypes_JSON   CHECK (FieldSchema IS NULL OR ISJSON(FieldSchema) = 1)
);

-- ============================================================
-- PARTNERS
-- All external vendors. ExtraFields stores values for any
-- custom fields defined in PartnerTypes.FieldSchema.
-- ============================================================
CREATE TABLE Partners (
    Id                INT            IDENTITY(1,1) NOT NULL,
    Name              NVARCHAR(200)  NOT NULL,
    Address           NVARCHAR(500)  NULL,
    Phone             NVARCHAR(50)   NULL,
    Email             NVARCHAR(200)  NULL,
    Website           NVARCHAR(500)  NULL,
    PartnerTypeId     INT            NOT NULL,
    CommissionPercent DECIMAL(5,2)   NOT NULL DEFAULT 0,
    Notes             NVARCHAR(MAX)  NULL,
    ExtraFields       NVARCHAR(MAX)  NULL,    -- JSON: values for type-specific extra fields
    IsActive          BIT            NOT NULL DEFAULT 1,
    CreatedAt         DATETIME2      NOT NULL DEFAULT GETDATE(),
    UpdatedAt         DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Partners                    PRIMARY KEY (Id),
    CONSTRAINT FK_Partners_PartnerTypes       FOREIGN KEY (PartnerTypeId) REFERENCES PartnerTypes(Id),
    CONSTRAINT CHK_Partners_Commission        CHECK (CommissionPercent >= 0 AND CommissionPercent <= 100),
    CONSTRAINT CHK_Partners_ExtraFields_JSON  CHECK (ExtraFields IS NULL OR ISJSON(ExtraFields) = 1)
);

-- ============================================================
-- PARTNER CATALOG ITEMS
-- Generic catalog entry for all partner types:
--   - Band services: ItemType = SERVICE, has BasePrice
--   - Band songs:    ItemType = SONG,    BasePrice = NULL
--   - Florist items: ItemType = PRODUCT, has BasePrice
--   - Venue menus:   ItemType = SERVICE, has BasePrice
--   - Photographer packages: ItemType = SERVICE, has BasePrice
-- Metadata (JSON) holds type-specific fields.
-- See docs/partner-architecture.md for Metadata shape per type.
-- ============================================================
CREATE TABLE PartnerCatalogItems (
    Id          INT            IDENTITY(1,1) NOT NULL,
    PartnerId   INT            NOT NULL,
    Name        NVARCHAR(200)  NOT NULL,
    Category    NVARCHAR(100)  NULL,
    Description NVARCHAR(MAX)  NULL,
    ItemType    NVARCHAR(20)   NOT NULL DEFAULT 'SERVICE',
    BasePrice   DECIMAL(10,2)  NULL,     -- NULL for SONG items
    Metadata    NVARCHAR(MAX)  NULL,     -- JSON: type-specific data
    IsActive    BIT            NOT NULL DEFAULT 1,
    SortOrder   INT            NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_PartnerCatalogItems              PRIMARY KEY (Id),
    CONSTRAINT FK_PartnerCatalogItems_Partners     FOREIGN KEY (PartnerId) REFERENCES Partners(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_PartnerCatalogItems_ItemType    CHECK (ItemType IN ('SERVICE', 'PRODUCT', 'SONG')),
    CONSTRAINT CHK_PartnerCatalogItems_BasePrice   CHECK (BasePrice IS NULL OR BasePrice >= 0),
    CONSTRAINT CHK_PartnerCatalogItems_Metadata    CHECK (Metadata IS NULL OR ISJSON(Metadata) = 1)
);

-- ============================================================
-- PRICING RULES (MT Pricing — overrides for SPECIAL_DAY and SPECIFIC_DATE)
-- BasePrice is stored directly on PartnerCatalogItems.
-- This table only stores the two higher-priority tiers.
--
-- Lookup priority: SPECIFIC_DATE > SPECIAL_DAY > BasePrice
-- DayOfWeek: 1=Monday, 2=Tuesday, ..., 7=Sunday
-- ValidFrom/ValidTo: optional date range for seasonal rules
-- ============================================================
CREATE TABLE PricingRules (
    Id            INT            IDENTITY(1,1) NOT NULL,
    CatalogItemId INT            NOT NULL,
    RuleType      NVARCHAR(20)   NOT NULL,     -- SPECIAL_DAY | SPECIFIC_DATE
    DayOfWeek     TINYINT        NULL,         -- 1-7, required for SPECIAL_DAY
    SpecificDate  DATE           NULL,         -- required for SPECIFIC_DATE
    Price         DECIMAL(10,2)  NOT NULL,
    ValidFrom     DATE           NULL,
    ValidTo       DATE           NULL,
    CONSTRAINT PK_PricingRules                     PRIMARY KEY (Id),
    CONSTRAINT FK_PricingRules_CatalogItems        FOREIGN KEY (CatalogItemId) REFERENCES PartnerCatalogItems(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_PricingRules_RuleType           CHECK (RuleType IN ('SPECIAL_DAY', 'SPECIFIC_DATE')),
    CONSTRAINT CHK_PricingRules_DayOfWeek          CHECK (DayOfWeek IS NULL OR (DayOfWeek >= 1 AND DayOfWeek <= 7)),
    CONSTRAINT CHK_PricingRules_Price              CHECK (Price >= 0),
    CONSTRAINT CHK_PricingRules_DateRange          CHECK (ValidFrom IS NULL OR ValidTo IS NULL OR ValidFrom <= ValidTo)
);

-- ============================================================
-- BAND MEMBERS
-- Only populated for Partners with PartnerTypeId = BAND.
-- Application enforces this — no DB-level type check.
-- ============================================================
CREATE TABLE BandMembers (
    Id        INT           IDENTITY(1,1) NOT NULL,
    PartnerId INT           NOT NULL,
    Name      NVARCHAR(200) NOT NULL,
    Role      NVARCHAR(100) NULL,     -- vocalist, guitarist, drummer, DJ, ...
    Phone     NVARCHAR(50)  NULL,
    Email     NVARCHAR(200) NULL,
    CONSTRAINT PK_BandMembers             PRIMARY KEY (Id),
    CONSTRAINT FK_BandMembers_Partners    FOREIGN KEY (PartnerId) REFERENCES Partners(Id) ON DELETE CASCADE
);

-- ============================================================
-- WEDDING TEMPLATES
-- Preset configurations used when creating a new wedding.
-- RequiredPartnerTypes (JSON): array of partner type requirements.
--   Example: [{"typeCode":"BAND","required":true},{"typeCode":"FLORIST","required":false}]
-- ActivityOrder (JSON): ordered list of recommended activities.
-- ============================================================
CREATE TABLE WeddingTemplates (
    Id                   INT            IDENTITY(1,1) NOT NULL,
    Name                 NVARCHAR(200)  NOT NULL,
    Description          NVARCHAR(MAX)  NULL,
    RequiredPartnerTypes NVARCHAR(MAX)  NULL,  -- JSON
    DefaultNotes         NVARCHAR(MAX)  NULL,
    ActivityOrder        NVARCHAR(MAX)  NULL,  -- JSON
    IsActive             BIT            NOT NULL DEFAULT 1,
    CreatedAt            DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_WeddingTemplates                      PRIMARY KEY (Id),
    CONSTRAINT CHK_WeddingTemplates_PartnerTypes_JSON   CHECK (RequiredPartnerTypes IS NULL OR ISJSON(RequiredPartnerTypes) = 1),
    CONSTRAINT CHK_WeddingTemplates_ActivityOrder_JSON  CHECK (ActivityOrder IS NULL OR ISJSON(ActivityOrder) = 1)
);

-- ============================================================
-- WEDDINGS
-- Core entity. Status flow:
--   PREPARATION → CONFIRMED → COMPLETED
--   Any status  → CANCELLED
-- ============================================================
CREATE TABLE Weddings (
    Id         INT            IDENTITY(1,1) NOT NULL,
    Name       NVARCHAR(200)  NOT NULL,      -- internal name / couple's name
    DateTime   DATETIME2      NOT NULL,
    Location   NVARCHAR(500)  NULL,
    TemplateId INT            NULL,
    Status     NVARCHAR(50)   NOT NULL DEFAULT 'PREPARATION',
    Notes      NVARCHAR(MAX)  NULL,
    CreatedAt  DATETIME2      NOT NULL DEFAULT GETDATE(),
    UpdatedAt  DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Weddings             PRIMARY KEY (Id),
    CONSTRAINT FK_Weddings_Templates   FOREIGN KEY (TemplateId) REFERENCES WeddingTemplates(Id) ON DELETE SET NULL,
    CONSTRAINT CHK_Weddings_Status     CHECK (Status IN ('PREPARATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED'))
);

-- ============================================================
-- WEDDING PARTNERS (Linking / Assignment)
-- Connects a Partner (+ optionally a CatalogItem) to a Wedding.
-- CommissionPercent is snapshotted from Partners.CommissionPercent
-- at the time of assignment so future changes don't affect records.
-- PlannedPrice: auto-calculated using MT pricing at assignment time.
-- ActualPrice:  entered manually when Status → CONFIRMED.
-- ============================================================
CREATE TABLE WeddingPartners (
    Id                INT            IDENTITY(1,1) NOT NULL,
    WeddingId         INT            NOT NULL,
    PartnerId         INT            NOT NULL,
    CatalogItemId     INT            NULL,
    Status            NVARCHAR(50)   NOT NULL DEFAULT 'PROPOSED',
    PlannedPrice      DECIMAL(10,2)  NULL,
    ActualPrice       DECIMAL(10,2)  NULL,
    CommissionPercent DECIMAL(5,2)   NULL,
    Notes             NVARCHAR(MAX)  NULL,
    CreatedAt         DATETIME2      NOT NULL DEFAULT GETDATE(),
    UpdatedAt         DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_WeddingPartners                     PRIMARY KEY (Id),
    CONSTRAINT FK_WeddingPartners_Weddings            FOREIGN KEY (WeddingId)     REFERENCES Weddings(Id) ON DELETE CASCADE,
    CONSTRAINT FK_WeddingPartners_Partners            FOREIGN KEY (PartnerId)     REFERENCES Partners(Id),
    CONSTRAINT FK_WeddingPartners_CatalogItems        FOREIGN KEY (CatalogItemId) REFERENCES PartnerCatalogItems(Id) ON DELETE SET NULL,
    CONSTRAINT CHK_WeddingPartners_Status             CHECK (Status IN ('PROPOSED', 'OFFERED', 'CONFIRMED', 'CANCELLED')),
    CONSTRAINT CHK_WeddingPartners_ActualPrice        CHECK (ActualPrice IS NULL OR ActualPrice >= 0),
    CONSTRAINT CHK_WeddingPartners_CommissionPercent  CHECK (CommissionPercent IS NULL OR (CommissionPercent >= 0 AND CommissionPercent <= 100))
);

-- ============================================================
-- BOOKINGS
-- Created when WeddingPartners.Status → CONFIRMED for a partner
-- with HasBooking = 1 (BAND, PHOTOGRAPHER, VENUE).
-- Used for conflict detection. One WeddingPartner = one Booking.
-- ============================================================
CREATE TABLE Bookings (
    Id               INT            IDENTITY(1,1) NOT NULL,
    PartnerId        INT            NOT NULL,
    WeddingId        INT            NOT NULL,
    WeddingPartnerId INT            NOT NULL,
    StartDateTime    DATETIME2      NOT NULL,
    EndDateTime      DATETIME2      NOT NULL,
    Notes            NVARCHAR(MAX)  NULL,
    CreatedAt        DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Bookings                       PRIMARY KEY (Id),
    CONSTRAINT FK_Bookings_Partners              FOREIGN KEY (PartnerId)        REFERENCES Partners(Id),
    CONSTRAINT FK_Bookings_Weddings              FOREIGN KEY (WeddingId)        REFERENCES Weddings(Id),
    CONSTRAINT FK_Bookings_WeddingPartners       FOREIGN KEY (WeddingPartnerId) REFERENCES WeddingPartners(Id),
    CONSTRAINT CHK_Bookings_DateRange            CHECK (EndDateTime > StartDateTime),
    CONSTRAINT UQ_Bookings_WeddingPartner        UNIQUE (WeddingPartnerId)  -- one booking per WeddingPartner row
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Partners
CREATE INDEX IX_Partners_PartnerTypeId  ON Partners(PartnerTypeId);
CREATE INDEX IX_Partners_IsActive       ON Partners(IsActive);

-- Catalog items
CREATE INDEX IX_PartnerCatalogItems_PartnerId  ON PartnerCatalogItems(PartnerId);
CREATE INDEX IX_PartnerCatalogItems_ItemType   ON PartnerCatalogItems(ItemType);
CREATE INDEX IX_PartnerCatalogItems_IsActive   ON PartnerCatalogItems(IsActive);

-- Pricing rules
CREATE INDEX IX_PricingRules_CatalogItemId  ON PricingRules(CatalogItemId);
CREATE INDEX IX_PricingRules_RuleType       ON PricingRules(RuleType);

-- Band members
CREATE INDEX IX_BandMembers_PartnerId  ON BandMembers(PartnerId);

-- Weddings
CREATE INDEX IX_Weddings_Status    ON Weddings(Status);
CREATE INDEX IX_Weddings_DateTime  ON Weddings(DateTime);

-- Wedding-partner linking
CREATE INDEX IX_WeddingPartners_WeddingId    ON WeddingPartners(WeddingId);
CREATE INDEX IX_WeddingPartners_PartnerId    ON WeddingPartners(PartnerId);
CREATE INDEX IX_WeddingPartners_Status       ON WeddingPartners(Status);

-- Bookings — critical for conflict detection queries
CREATE INDEX IX_Bookings_PartnerId   ON Bookings(PartnerId);
CREATE INDEX IX_Bookings_WeddingId   ON Bookings(WeddingId);
CREATE INDEX IX_Bookings_DateRange   ON Bookings(PartnerId, StartDateTime, EndDateTime);

-- ============================================================
-- SEED DATA — Partner Types
-- ============================================================
INSERT INTO PartnerTypes (Name, Code, HasBooking) VALUES
('Bend / DJ',             'BAND',         1),
('Cvjećar',               'FLORIST',      0),
('Slastičar',             'PASTRY',       0),
('Fotograf / Snimatelj',  'PHOTOGRAPHER', 1),
('Sala / Dvorana',        'VENUE',        1),
('Catering',              'CATERING',     0),
('Ostalo',                'GENERIC',      0);

-- ============================================================
-- SEED DATA — Wedding Templates
-- ============================================================
INSERT INTO WeddingTemplates (Name, Description, RequiredPartnerTypes, DefaultNotes) VALUES
(
    'Malo vjenčanje',
    'Svečanost s manjim brojem gostiju, jednostavnija organizacija.',
    '[{"typeCode":"VENUE","required":true},{"typeCode":"PHOTOGRAPHER","required":true},{"typeCode":"PASTRY","required":false}]',
    'Manji skup. Preporučuje se provjera kapaciteta sale i jednostavniji meni.'
),
(
    'Veliko vjenčanje',
    'Višesatna proslava s velikim brojem gostiju.',
    '[{"typeCode":"VENUE","required":true},{"typeCode":"BAND","required":true},{"typeCode":"PHOTOGRAPHER","required":true},{"typeCode":"FLORIST","required":true},{"typeCode":"PASTRY","required":true}]',
    'Obavezno rezervirati salu i bend unaprijed. Planirati catering za 150+ gostiju.'
),
(
    'Vjenčanje u prirodi',
    'Svečanost na otvorenom, specifičan set partnera.',
    '[{"typeCode":"CATERING","required":true},{"typeCode":"BAND","required":true},{"typeCode":"PHOTOGRAPHER","required":true},{"typeCode":"FLORIST","required":true}]',
    'Osigurati alternativni plan za loše vrijeme. Provjera struje i tehničke opreme na lokaciji.'
),
(
    'Vjenčanje cijeli dan',
    'Od jutarnje ceremonije do kasno u noć.',
    '[{"typeCode":"VENUE","required":true},{"typeCode":"BAND","required":true},{"typeCode":"PHOTOGRAPHER","required":true},{"typeCode":"FLORIST","required":true},{"typeCode":"PASTRY","required":true}]',
    'Bend/DJ potreban za jutarnji i večernji dio. Fotograf cijeli dan. Koordinacija rasporeda kritična.'
),
(
    'Samo sala',
    'Proslava isključivo u zatvorenom prostoru bez crkvene ceremonije.',
    '[{"typeCode":"VENUE","required":true},{"typeCode":"PHOTOGRAPHER","required":false},{"typeCode":"PASTRY","required":false}]',
    'Fokus na sali i meniju. Bez vanjske ceremonije.'
);
