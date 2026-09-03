# Schweizer CPI (LIK) Makrodaten-Dashboard

Interaktives, mehrsprachiges Konsumentenpreis-Dashboard für Schweizer Daten (Bundesamt für Statistik - BFS Landesindex der Konsumentenpreise).

## Architektur & Konzept
- **Backend (R Shiny)**:
  - Dient als schlanker Server zum Ausliefern des Frontends und zum **Upload neuer BFS-Excel-Dateien** (`.xlsx`).
  - Extrahiert beim Start oder nach jedem Dateiupload alle Zeitreihen, Hierarchien (COICOP Level 1 bis 8), Sondergliederungen und Metadaten in strukturierte JSON-Dateien (`www/data/cpi_data.json` und `www/data/cpi_summary.json`).
  - **Dateiname beim Upload ist völlig beliebig**: Der Extraktor analysiert die BFS-Struktur (`INDEX_m`, `VAR_m-1`, `VAR_m-12`, `CONTR_m`, `Weights`).
  - Fallback: Wenn keine Datei hochgeladen wird, nutzt das Dashboard automatisch die zuletzt produzierten JSON-Dateien (initial generiert aus der vorhandenen Beispieldatei `su-d-05.02.66(1).xlsx`).
- **Frontend (reines HTML / CSS / JavaScript)**:
  - Läuft ohne Shiny-Bootstrap-Altlasten als schnelles, modernes Single-Page-Dashboard.
  - Nutzt **ausschließlich die JSON-Dateien** für Renderings, Filterungen und Charts.
  - Viersprachig: **Deutsch (DE, Standard)**, **Français (FR)**, **Italiano (IT)**, **English (EN)**. Alle Positionstexte und Oberflächenelemente passen sich per Klick sofort an.

---

## Hauptfunktionen

1. **Makro-Übersicht auf einen Blick**:
   - 4 KPI-Karten mit Indexstand, Monatsrate (MoM), Vorjahresrate (YoY) und Teuerungsbeiträgen:
     - **Gesamtindex (LIK)**
     - **Kerninflation 1** (exkl. Frische/saisonale Produkte und Energie/Treibstoffe)
     - **Inland- vs. Importgüter** (entscheidend für Schweizer Franken / Wechselkurseffekte)
     - **Waren vs. Dienstleistungen** (Dauerhafte Güter vs. Private Dienstleistungen)
2. **Interaktiver Makro-Vergleichschart**:
   - Multi-Linien-Chart mit Umschaltung zwischen **Vorjahresrate YoY (%)**, **Monatsrate MoM (%)** und **Indexstand (100)**.
   - Zeitbereichswähler: **1 Jahr**, **3 Jahre**, **5 Jahre**, **10 Jahre** oder **Max (seit 1982)**.
   - Ein- und ausblendbare Teuerungsreihen per Klick auf die Farbbalken.
3. **13 Hauptgruppen: Beiträge & Gewichtung**:
   - Balkendiagramm der 13 COICOP-Hauptgruppen.
   - Modi: **Teuerungsbeitrag (in %-Punkten)**, **YoY-Teuerungsrate (%)** und **Warenkorb-Gewichtung (%)**.
   - Klick auf einen Balken springt direkt in die entsprechende Kategorie im Explorer!
4. **Spezial-Aggregate (Sondergliederungen Hub)**:
   - Schnellzugriff auf die offiziellen BFS-Sondergliederungen:
     - *Kerninflation*: Kern 1, Kern 2, Frische/saisonale Produkte, Energie & Treibstoffe
     - *Herkunft*: Inlandgüter vs. Importgüter
     - *Güterart*: Waren (Dauerhaft, Semidauerhaft, Nichtdauerhaft) vs. Dienstleistungen (Privat, Öffentlich)
     - *Preisfestlegung*: Administrierte Preise vs. freie Marktpreise
     - *Ausschlüsse*: Ohne Wohnungsmiete, ohne Erdölprodukte, ohne Gesundheit, ohne Tabak, ohne Alkohol, etc.
5. **Hierarchischer Drilldown-Explorer (COICOP Level 1 bis 8)**:
   - Stufenloses Durchklicken von Ebene 1 (Gesamt) über Ebene 2 (13 Hauptgruppen) und Ebene 3 (Warengruppen) bis auf Ebene 5–8 (Einzelpositionen wie Brot, Reis, Teigwaren, Fleisch etc.).
   - Breadcrumb-Navigation (`🏠 Gesamtindex > Nahrungsmittel > Brot > ...`) mit One-Click-Rücksprung.
   - **Beitrag MoM (%p)**: Monatsbeitrag aus der BFS-Quelle `CONTR_m`.
   - **Beitrag YoY (%p) & Delta zum Vormonat**: Analytisch berechneter Vorjahresbeitrag inklusive Delta zum Vormonat ($\Delta$ MoM) für jede Position.
   - Vollständig sortierbare Spalten (COICOP, BFS-Code, Bezeichnung, Gewicht, Index, MoM, YoY, Beitrag MoM, Beitrag YoY).
   - Globale Echtzeit-Suche über alle ~600 Positionen in der aktiven Sprache.
6. **Detailanalyse & Zeitreihen-Modal**:
   - Detaillierter Zeitreihenchart für jede gewählte Position.
   - Statistische Kennzahlen (12-Monats-Schnitt, 12M-Tief, 12M-Hoch, Gewichtung).
7. **Datei-Upload**:
   - Modernes Drag-and-Drop-Modal oder Dateiauswahldialog für monatliche BFS-Updates (`.xlsx`).
   - Automatische Aktualisierung des Dashboards nach erfolgreicher R-Verarbeitung.

---

## Starten der Anwendung

### Option 1: Per R-Kommandozeile / Terminal
Im Projektordner ausführen:
```bash
Rscript -e "shiny::runApp(port = 3838, host = '127.0.0.1')"
```
Anschließend im Browser öffnen:
👉 `http://127.0.0.1:3838`

### Option 2: In RStudio
- `app.R` in RStudio öffnen und auf **"Run App"** klicken.

### Option 3: Manuelle Standalone-Extraktion
Falls eine neue `.xlsx`-Datei manuell ohne GUI in JSON konvertiert werden soll:
```bash
Rscript extract_cpi_data.R "mein_neuer_cpi_download.xlsx"
```

---

## Projektstruktur
```
├── app.R                     # R Shiny Server & Upload-Schnittstelle
├── extract_cpi_data.R        # R-Extraktionspipeline (Excel -> JSON)
├── su-d-05.02.66(1).xlsx     # BFS-Beispieldatei (Landesindex der Konsumentenpreise)
├── README.md                 # Dokumentation
└── www/                      # Frontend (Reines HTML/CSS/JavaScript)
    ├── index.html            # Single-Page-Applikation
    ├── css/
    │   └── styles.css        # Institutionelles LUKB/Swiss-Macro Styling
    ├── js/
    │   ├── app.js            # App-Logik, I18n, Drilldown, Chart-Rendering
    │   └── vendor/
    │       └── chart.umd.min.js  # Chart.js v4 (lokal gebündelt)
    └── data/
        ├── cpi_data.json     # Vollständiger Datensatz (alle Positionen & 525 Monate)
        └── cpi_summary.json  # Kompakte Summary für Sofort-Initialisierung
```
