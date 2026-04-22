# Aplikacija za Organizaciju Svečanih Događanja - Projektna Specifikacija

| Stavka | Vrijednost |
|---|---|
| Dokument | Projektna specifikacija |
| Verzija | 1.0 |
| Status | Inicijalna verzija |
| Fokus faze 1 | Vjenčanja |
| Posljednje ažuriranje | travanj 2026. |

## 1. Pregled Projekta

Aplikacija je namijenjena agencijama koje se bave organizacijom svečanih događanja (vjenčanja, krštenja, krizmi i sličnih proslava). Cilj je pružiti agenciji centraliziran alat za upravljanje svim aspektima organizacije - od evidencije samog događanja, upravljanja partnerima i njihovim ponudama, sve do generiranja finalnih računa i ponuda u PDF formatu.

> **Faza 1 - Opseg razvoja:** Aplikacija se u prvoj fazi fokusira isključivo na vjenčanja, ali arhitektura mora biti dizajnirana tako da se u kasnijim fazama može proširiti na sva ostala svečana događanja (krštenja, krizme, jubileji itd.).

### Ključne napomene

- Aplikacija nema sustav prijave (login), registracije (sign-up) ni kontrole pristupa po ulogama (role-based access control).
- Aplikacija je namijenjena isključivo internoj upotrebi jedne agencije.
- Nema korisničkih računa - agencija direktno koristi aplikaciju bez autentifikacije.

---

## 2. Modul: Događanja (Vjenčanja)

### 2.1 Evidencija Vjenčanja

Svako vjenčanje u sustavu mora sadržavati sljedeće podatke:

| Polje | Opis |
|---|---|
| Naziv / Identifikator | interni naziv ili ime mladenaca |
| Datum i vrijeme | točan datum i sat početka vjenčanja |
| Lokacija | opis mjesta gdje se vjenčanje odvija (grad, općina, naziv objekta) |
| Predložak vjenčanja | odabir jednog od unaprijed definiranih predložaka (vidi Modul 3) |
| Status vjenčanja | npr. u pripremi, potvrđeno, završeno, otkazano |
| Napomene | slobodan tekst za dodatne informacije |

### 2.2 Tok Vjenčanja (Flow)

Organizacija vjenčanja prolazi kroz sljedeće faze:

1. **Kreiranje događanja** - unos osnovnih podataka i odabir predloška.
2. **Dodavanje partnera** - vezivanje pojedinih partnera (bend, fotograf, sala, cvjećar itd.) uz vjenčanje.
3. **Generiranje ponude** - kreiranje ponude za klijenta u PDF formatu s prijedlogom usluga i cijenama.
4. **Potvrda i finalizacija** - potvrda svakog pojedinog partnera i unos stvarnih (konačnih) cijena.
5. **Izdavanje finalnih računa** - generiranje dva odvojena dokumenta:
   - **Račun za klijenta (mladence)** - ukupni iznos koji plaćaju mladi, uključujući sve provizije agencije.
   - **Interni obračun za agenciju** - pregled svakog partnera, njegovih stvarnih troškova, provizija i ukupne zarade agencije.

---

## 3. Modul: Predlošci Vjenčanja

Predlošci su unaprijed definirani paketi koji opisuju tip vjenčanja. Agencija ih sama konfigurira i koristi kao "preset" pri kreiranju novog vjenčanja.

### 3.1 Tipovi Predložaka (primjeri za Hercegovinu)

| Naziv Predloška | Opis |
|---|---|
| Malo vjenčanje | Svečanost s manjim brojem gostiju, jednostavnija organizacija |
| Veliko vjenčanje | Višesatna proslava s velikim brojem gostiju |
| Vjenčanje u prirodi | Svečanost na otvorenom, specifičan set partnera |
| Vjenčanje cijeli dan | Od jutarnje ceremonije do kasno u noć |
| Samo sala | Proslava isključivo u zatvorenom prostoru bez crkvene ceremonije |

### 3.2 Sadržaj Predloška

Svaki predložak definira:

- Koji su tipovi partnera uključeni (npr. obavezno sala, fotograf, bend - opcionalno cvjećar, torta).
- Defaultne napomene i smjernice za taj tip vjenčanja.
- Preporučeni redoslijed aktivnosti.

---

## 4. Modul: Partneri

Partneri su svi vanjski suradnici koji sudjeluju u organizaciji vjenčanja. Agencija upravlja bazom partnera, a svaki partner se može vezati uz jedno ili više vjenčanja.

### 4.1 Zajednički Podaci za Sve Partnere

Svaki partner, bez obzira na tip, mora imati:

| Polje | Opis |
|---|---|
| Naziv | ime tvrtke ili fizičke osobe |
| Adresa | osnovna adresa partnera |
| Kontakt telefon | glavni broj za kontakt |
| E-mail adresa | službena ili radna e-mail adresa |
| Web / društvene mreže | opcionalni javni kontakt kanali |
| Tip partnera | određuje koji se dodatni podaci bilježe (vidi po tipovima) |
| Postotak provizije agencije | npr. ako je provizija 5%, a partner naplati 1.000 KM, klijentu se fakturira 1.050 KM |
| Komentar / napomena | slobodan tekst za interne bilješke |

### 4.2 Dinamički Model Partnera

Sustav mora podržavati **dinamičko definiranje tipova partnera i njihovih atributa**. To znači:

- Agencija može kreirati novi tip partnera (npr. "Prijevoz") i definirati koja mu polja trebaju (npr. broj vozila, kapacitet).
- Postojeći tipovi partnera imaju preddefinirane strukture opisane u nastavku, ali te strukture mogu biti proširive.

### 4.3 Dinamički Sustav Cijena (MT Pricing Struktura)

Svaki partner (gdje je relevantno) koristi troslojeviti sustav cijena:

| Razina | Opis |
|---|---|
| **Osnovna cijena (Base)** | Standardna cijena koja vrijedi za sve dane koji nisu pokriveni višim razinama |
| **Specijalna cijena (Special Days)** | Vrijedi za određene dane u tjednu - npr. svaki petak, subota i nedjelja automatski imaju višu cijenu |
| **Posebna cijena (Specific Dates)** | Vrijedi za konkretno definirane datume - npr. Velika Gospa (15. kolovoza), Nova godina, lokalni blagdani i sl. |

**Pravilo prioriteta:** Ako datum pada u "posebnu cijenu", ona ima prednost pred "specijalnom", koja ima prednost pred "osnovnom".

Uz cijenu može biti vezano i:

- **Trajanje** - koliko sati ili dana usluga traje.
- **Kategorija usluge** - za partnere koji nude više vrsta usluga po različitim cijenama.

---

## 5. Tipovi Partnera - Detaljna Specifikacija

### 5.1 Bend / DJ

**Opis**  
Glazbeni izvođači koji nastupaju na vjenčanju.

**Specifični podaci**

- **Popis članova benda** - svaki član ima ime, ulogu (pjevač, gitarist, DJ...) i kontakt.
- **Playlist** - bend može imati jednu ili više playlisti, a svaka playlist sadrži popis pjesama.
- **Pjesme** - svaka pjesma ima:
  - Naziv
  - Izvođač / autor
  - Žanr / kategoriju (pop, rock, narodna, klasična, šlager...)
- **Paketi / kategorije usluga** - npr. "Standard 4h", "Premium 6h", "DJ paket".
- **Cijene po kategorijama** prema MT pricing strukturi.
- **Trajanje nastupa** - u satima.

**Upravljanje terminima**

- Bend se može rezervirati na određeni datum i vremenski raspon (npr. 14.06. od 20:00 do 24:00).
- Sustav mora **automatski spriječiti dvostruku rezervaciju** - ako je bend već rezerviran u nekom terminu, nije dostupan za drugi događaj u istom ili preklapajućem terminu.
- Jedno vjenčanje može imati **više bendova** (npr. bend za ručak i DJ za večer).

**Import podataka**

- Podržava **import playliste putem CSV datoteke**.

### 5.2 Cvjećar

**Opis**  
Partner koji pruža cvijetne aranžmane za vjenčanje.

**Specifični podaci**

- **Katalog aranžmana** - svaki aranžman ima:
  - Naziv (npr. "Bridal bouquet", "Stolni aranžman", "Ukras automobila", "Dekoracija dvorane")
  - Kategoriju (buketi, stolni aranžmani, automobilski ukras, dekoracija ulaza, crkvena dekoracija...)
  - Opis i sadržaj (koje cvijeće, materijali)
  - Cijenu prema MT pricing strukturi
  - Fotografiju (opcionalno)

**Upravljanje terminima**

- Nema upravljanja terminima - cvjećar ne blokira termine, samo se bilježe narudžbe.

**Import podataka**

- Podržava import kataloga aranžmana putem CSV datoteke.

### 5.3 Slastičar / Torte i Kolači

**Opis**  
Partner koji pruža svadbene torte, kolače i desert.

**Specifični podaci**

- Katalog proizvoda: svaki proizvod ima naziv, kategoriju (torta, kolači, desert, candy bar...), opis, cijenu i opciju za veličinu / broj porcija.
- Cijene prema MT pricing strukturi.

**Upravljanje terminima**

- Nema upravljanja terminima.

**Import podataka**

- Podržava CSV import.

### 5.4 Fotograf / Snimatelj

**Opis**  
Partner koji fotografira ili snima vjenčanje.

**Specifični podaci**

- **Paketi usluga** - svaki paket sadrži:
  - Naziv (npr. "Basic foto", "Full day foto+video", "Drone + foto")
  - Što je uključeno (fotografija, video, drone snimanje, album, broj isporučenih fotografija, rok isporuke...)
  - Cijenu prema MT pricing strukturi
  - Trajanje (broj sati ili "cijeli dan")

**Upravljanje terminima**

- Fotograf **ne može biti rezerviran u dva preklapajuća termina** - ista logika kao kod benda.

**Import podataka**

- Podržava CSV import paketa.

### 5.5 Sala / Restoran / Dvorana

**Opis**  
Lokacija gdje se odvija vjenčanje. Može biti restoran, dvorana, hotel, imanje i sl.

**Specifični podaci**

- Kapacitet (broj osoba).
- Opis prostora (interijer, eksterijer, parking, pristupačnost...).
- **Ponude** - sala može imati više vrsta ponuda, npr.:
  - Ponuda hrane (meni A, meni B, meni C - svaki s opisom jela i cijenom po osobi)
  - Ponuda pića (open bar, konzumacija, paket...)
  - Dekorativni paketi koje sala nudi
  - Dodatne usluge (DJ tehnika, projektor, šator...)
- Cijena po osobi ili cijena najma prostora - prema MT pricing strukturi.

**Upravljanje terminima**

- Sala **ne može biti rezervirana u dva preklapajuća termina**.
- Ako agencija ima više sala / dvorana, svaka se tretira kao **zaseban partner** s mogućnošću dupliciranja podataka (clone funkcija).

**Import podataka**

- Podržava CSV import ponuda.

### 5.6 Catering

**Opis**  
Vanjska ketering usluga (ako se ne koristi sala s uključenim cateringom).

**Specifični podaci**

- Meniji i paketi (slično kao sala).
- Cijena po osobi.

**Upravljanje terminima**

- Nema upravljanja terminima.

### 5.7 Ostali Partneri (Generički Tip)

Aplikacija mora podržavati kreiranje **generičkih tipova partnera** (npr. prijevoz, smještaj, fotokabina, pirotehnika...) s:

- Slobodnom listom usluga/proizvoda koje taj partner nudi.
- Cijenama prema MT pricing strukturi.
- Opcionalnim upravljanjem terminima (konfigurabilno po tipu).

---

## 6. Modul: Partneri na Vjenčanju (Linking)

### 6.1 Dodavanje Partnera na Vjenčanje

Svaki partner se može dodijeliti konkretnom vjenčanju. Taj zapis sadrži:

- Koji partner je dodijeljen.
- Koja usluga / paket je odabran.

**Status partnera na vjenčanju**

| Status | Značenje |
|---|---|
| `Predloženo` | agencija je predložila partnera, čeka se odgovor |
| `Ponuđeno` | partner je kontaktiran i dostavio ponudu |
| `Potvrđeno` | dogovor je zaključen, usluga je rezervirana |
| `Otkazano` | partner je otkazan |

- **Planirana cijena** - inicijalno izračunata prema MT pricing strukturi.
- **Stvarna / konačna cijena** - unosi se pri potvrdi (može se razlikovati od planirane).
- **Provizija agencije** - postotak definiran na partneru, primjenjuje se na stvarnu cijenu.
- Napomene vezane uz to konkretno vjenčanje.

### 6.2 Provjera Preklapanja Termina

Prilikom dodavanja partnera na vjenčanje, sustav automatski provjerava:

- Je li partner (bend, fotograf, sala) već rezerviran u tom terminu.
- Ako postoji preklapanje - prikazuje upozorenje i ne dozvoljava potvrdu.

---

## 7. Modul: Ponude i Računi

### 7.1 Ponuda za Klijenta (PDF)

Agencija može u bilo kom trenutku generirati **PDF ponudu** za klijenta (mladence). Ponuda sadrži:

- Naziv agencije i logotip.
- Osnovne podatke o vjenčanju (datum, lokacija).
- Popis svih predloženih / odabranih partnera i usluga.
- Cijene po stavkama (s provizijama uključenim).
- Ukupni iznos.
- Opcionalno: mogućnost "zaokruživanja paketa" - predočenje cijelog paketa kao jedne stavke umjesto rastavno.

### 7.2 Finalni Račun za Klijenta

Izdaje se kada je vjenčanje potvrđeno i svi partneri su potvrđeni. Sadrži:

- Sve stavke s konačnim cijenama (uključujući provizije).
- Ukupan iznos koji klijent plaća.

### 7.3 Interni Obračun za Agenciju

Generira se paralelno s klijentskim računom. Sadrži:

- Po svakom partneru: stvarna cijena partnera, primijenjena provizija, iznos provizije.
- Ukupan prihod agencije od svih provizija.
- Pregled "što je kome isplaćeno" i "što je agencija zaradila".

---

## 8. Import / Export Funkcionalnosti

### 8.1 Import (CSV)

Podržava se CSV import podataka za sljedeće entitete:

| Entitet | Napomena |
|---|---|
| Partneri (osnovna lista) | Import nove liste partnera |
| Bend - playlist / pjesme | Import pjesama za pojedinog partnera tipa "Bend" |
| Cvjećar - katalog aranžmana | Import aranžmana za pojedinog cvjećara |
| Fotograf - paketi | Import paketa usluga fotografa |
| Sala - ponude (meniji) | Import meni ponuda za salu |
| Slastičar - katalog | Import kataloga kolača i torti |

### 8.2 Export (CSV)

Svi navedeni entiteti podržavaju i **export u CSV format** za potrebe arhiviranja, prijenosa podataka ili editiranja u spreadsheet aplikacijama.

### 8.3 Export (PDF)

- Ponuda za klijenta.
- Finalni račun za klijenta.
- Interni obračun za agenciju.
- Opcijsko: lista partnera za interno korištenje.

### 8.4 Dupliciranje (Clone)

Za partnere koji imaju više lokacija ili varijanti (npr. više dvorana istog vlasnika, više ogranaka cvjećara), podržava se **clone funkcija** koja kreira duplikat partnera sa svim podacima, koji se potom može urediti.

---

## 9. Tehnički Zahtjevi i Arhitekturalne Smjernice

### 9.1 Platforma

- Web aplikacija (pristup putem preglednika).
- Bez potrebe za serverskim autentifikacijskim slojem u Fazi 1.
- Podaci se pohranjuju lokalno ili na jednostavnom backendskom API-ju (ovisno o odabranom stacku).

### 9.2 Proširivost

Arhitektura mora biti dizajnirana s proširivošću na umu:

- Lako dodavanje novih tipova događanja (krštenja, krizme, jubileji...).
- Lako dodavanje novih tipova partnera sa custom atributima.
- MT pricing struktura mora biti generička i primjenjiva na sve tipove partnera.

### 9.3 Validacija i Poslovne Regule

- Provjera preklapanja termina za partnere tipa: bend, fotograf, sala.
- Obavezna potvrda stvarne cijene pri statusu "Potvrđeno".
- Provizija se uvijek računa na stvarnu (ne planiranu) cijenu.
- Finalni račun se može generirati samo kada su svi ključni partneri u statusu "Potvrđeno".

### 9.4 Korisničko Sučelje

| Ekran | Namjena |
|---|---|
| Pregledni dashboard vjenčanja | lista svih vjenčanja s filtriranjem po datumu i statusu |
| Detaljna stranica vjenčanja | pregled svih partnera i statusa za pojedino vjenčanje |
| Upravljanje bazom partnera | CRUD nad partnerima i njihovim podacima |
| Upravljanje predlošcima | izrada i održavanje predložaka vjenčanja |
| Stranica za generiranje dokumenata | ponude, računi i ostali dokumenti |

---

*Dokument verzija: 1.0 - inicijalna specifikacija*  
*Posljednje ažuriranje: travanj 2026.*
