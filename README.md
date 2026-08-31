# 🌿 Botaniq

Eine Pflanzendatenbank-Web-App mit **200.000+ Pflanzen** und **Millionen von Bildern**.  
Erstellt mit Next.js, TailwindCSS und React.

---

## Was ist Botaniq?

Botaniq ist eine moderne, performante Pflanzenreferenz-Web-App, die Daten aus zwei der größten öffentlichen Biodiversitäts-APIs der Welt kombiniert:

- **GBIF** (Global Biodiversity Information Facility) — 2,6 Mio. Beobachtungen
- **iNaturalist** — 96 Mio. Pflanzenfotos mit Community-Verifizierung

Das Ergebnis: Eine durchsuchbare, bildreiche Datenbank, die auf deinem Browser läuft — schnell, offline-fähig und ohne eigenen Server.

### Features

| Feature | Beschreibung |
|---------|-------------|
| 🔍 **Volltextsuche** | Schnelle Suche nach Pflanzenname, Familie oderGattung |
| 🖼️ **Bildergalerien** | Mehrere Fotos pro Pflanze, automatisch von GBIF + iNaturalist geladen |
| 🌱 **Nach Familie** | Alle Pflanzen einer Familie browsen |
| 💾 **Offline-PWA** | App installieren und auch ohne Internet nutzen |
| ⚡ **Lazy Loading** | Schneller Start, Daten laden im Hintergrund nach |
| ❤️ **Favoriten** | Pflanzen speichern und später wiederfinden |
| 📊 **200.000+ Pflanzen** | Umfassende Datenbank aus GBIF und iNaturalist |

---

## Architektur

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js 14, TypeScript)              │
│  ├─ Such- & Filter-UI                           │
│  ├─ PWA (Service Worker + Manifest)             │
│  └─ Lazy-Loading Cache                          │
├─────────────────────────────────────────────────┤
│  Datenquellen (CDN)                             │
│  ├─ cached_plants_part_*.json  (6 × ~60 MB)     │
│  └─ cached_plants.json          (313 MB)        │
├─────────────────────────────────────────────────┤
│  Live-APIs (optional)                           │
│  ├─ GBIF API (gratis, keine Registrierung)      │
│  └─ iNaturalist API (gratis, keine Registrierung)│
└─────────────────────────────────────────────────┘
```

### Daten-Hosting (wichtig!)

Die **1,4 GB Pflanzendaten** liegen **nicht im Repository** — zu groß für Git.  
Sie werden von einem **CDN** (Cloudflare R2) geladen. Das ist kostenlos und extrem schnell.

**So richtest du das ein:**

1. **Cloudflare R2-Konto erstellen** → https://dash.cloudflare.com/sign-up
2. **Bucket anlegen** (z.B. `botaniq-data`)
3. **API-Token generieren** (Bucket-Admin)
4. **Daten hochladen**:
   ```bash
   # Alle JSON-Dateien aus public/data/ hochladen
   # Mit rclone (empfohlen):
   rclone copy public/data/ cloudflare-r2:botaniq-data/
   # Oder manuell über das Cloudflare Dashboard
   ```
5. **Bucket öffentlich machen** (CORS erlauben)
6. **URL in `src/lib/dataConfig.ts` eintragen**:
   ```typescript
   export const CDN_BASE_URL = 'https://pub-xxxxxxxxxxxx.r2.dev';
   ```
7. **App bauen & deployen** (z.B. auf Vercel)

Die App versucht automatisch:
1. CDN-Laden (wenn URL gesetzt)
2. Lokale Dateien (`public/data/`)
3. Fehlermeldung mit Setup-Anleitung, wenn nichts gefunden wird

---

## Schnellstart

### Entwicklung lokal

```bash
# 1. Dependencies installieren
npm install

# 2. Daten-CDN konfigurieren (siehe oben)
# Editiere src/lib/dataConfig.ts

# 3. Development-Server starten
npm run dev
# → http://localhost:3000
```

### Build & Deployment

```bash
# Production-Build
npm run build

# Preview
npm start
```

Empfohlener Deploy-Ziel: **Vercel** (kostenlos für Hobby-Projekte)
```bash
npm i -g vercel
vercel
```

---

## Projektstruktur

```
Botaniq/
├── src/
│   ├── app/                    # Next.js App Router (Seiten)
│   │   ├── page.tsx            # Startseite (Hero + Suche)
│   │   ├── plant/[name]/       # Einzelpflanzen-Ansicht
│   │   ├── family/[name]/      # Familien-Ansicht
│   │   └── all-plants/         # Alle Pflanzen durchsuchen
│   ├── components/             # React-Komponenten
│   │   ├── PlantCard.tsx       # Pflanzen-Karte
│   │   ├── ImageCarousel.tsx   # Bildergalerie
│   │   ├── Search.tsx          # Suchleiste
│   │   ├── PlantGrid.tsx       # Pflanzen-Grid
│   │   └── OfflineIndicator.tsx # PWA-Offline-Hinweis
│   ├── hooks/
│   │   ├── usePlantData.ts     # Haupt-Datenlogik (Lazy Loading)
│   │   ├── usePlantCleaner.ts  # Datenbereinigung
│   │   └── useFavorites.ts     # Favoriten (localStorage)
│   └── lib/
│       ├── dataConfig.ts       # CDN-Konfiguration ⚙️
│       ├── apiSync.ts          # GBIF + iNaturalist Sync
│       └── apiClients/
│           ├── gbifClient.ts   # GBIF API Client
│           └── inaturalistClient.ts  # iNaturalist API Client
├── public/
│   ├── data/                   # Pflanzen-Daten (NICHT im Repo)
│   │   ├── cached_plants_part_1.json  (66 MB)
│   │   ├── cached_plants_part_2.json  (66 MB)
│   │   ├── cached_plants_part_3.json  (66 MB)
│   │   ├── cached_plants_part_4.json  (66 MB)
│   │   ├── cached_plants_part_5.json  (52 MB)
│   │   └── cached_plants.json       (313 MB — Full-Backup)
│   ├── manifest.json           # PWA Manifest
│   └── sw.js                   # Service Worker
├── .gitignore                  # Daten-Ordner ignoriert
└── README.md
```

---

## Daten-Dateien erklären

| Datei | Größe | Inhalt |
|-------|-------|--------|
| `cached_plants_part_1.json` | 66 MB | Pflanzen A–K (schneller Start) |
| `cached_plants_part_2.json` | 66 MB | Pflanzen L–R |
| `cached_plants_part_3.json` | 66 MB | Pflanzen R–Z |
| `cached_plants_part_4.json` | 66 MB | Familien-Übersicht |
| `cached_plants_part_5.json` | 52 MB | Metadaten & Bilder |
| `cached_plants.json` | 313 MB | Komplette Datenbank (Fallback) |

**Total: ~1,4 GB** — daher liegt das nicht im Git-Repository.

Jede Datei enthält:
```json
{
  "message": "Botaniq Cache - Teil 1/5 - 87242 Pflanzen",
  "plants": [
    {
      "name": "Quercus rotundifolia",
      "family": "Fagaceae",
      "images": ["https://..."],
      "synonyms": ["..."],
      ...
    }
  ]
}
```

---

## Cloudflare R2 — Schritt-für-Schritt

### 1. Konto & Bucket

1. Gehe zu https://dash.cloudflare.com → **Sign Up**
2. Dashboard → **R2** → **Create Bucket**
3. Name: `botaniq-data`, Region: automatisch

### 2. API-Token

Dashboard → **R2** → **Manage R2 API Tokens** → **Create API Token**
- Name: `botaniq-upload`
- Permission: **Bucket Admin** für `botaniq-data`
- Token speichern (wird nur einmal gezeigt!)

### 3. Dateien hochladen

**Mit rclone** (empfohlen):
```bash
# rclone installieren: https://rclone.org/downloads/
rclone config  # r2 remote hinzufügen
rclone copy public/data/ r2:botaniq-data/ --progress
```

**Ohne rclone** (manuell):
- Im R2 Dashboard den Bucket öffnen
- Ordner `data` erstellen
- Jede JSON-Datei einzeln hochladen (Drag & Drop)

### 4. Öffentlicher Zugriff

R2 Dashboard → Bucket `botaniq-data` → **Settings** → **Static Website Hosting**:
- Enable: **Ja**
- Index document: `cached_plants_part_1.json` (oder leer lassen)

### 5. CORS erlauben (wichtig für Next.js)

R2 Dashboard → Bucket → **Settings** → **CORS Configuration**:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"]
  }
]
```

### 6. URL eintragen

Editiere `src/lib/dataConfig.ts`:
```typescript
export const CDN_BASE_URL = 'https://pub-xxxxxxxxxxxx.r2.dev';
// Die URL findest du unter: R2 Dashboard → Bucket → Details
```

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| „Keine Pflanzendaten gefunden" | CDN-URL in `dataConfig.ts` prüfen oder lokale Daten in `public/data/` ablegen |
| Bilder laden nicht | CORS auf R2 prüfen (Settings → CORS) |
| App lädt zu langsam | Prüfe, ob `cached_plants_part_1.json` zuerst geladen wird (Lazy Loading) |
| `npm run build` fehlschlägt | `npm install` nochmal ausführen, dann `rm -rf node_modules/.cache` |
| Datenschutz / DSGVO | Die App speichert keine Daten auf einem Server — alles läuft im Browser |

---

## Lizenz

Open Source — frei verwendbar für private und kommerzielle Projekte.

Datenquelle: [GBIF](https://www.gbif.org/) & [iNaturalist](https://www.inaturalist.org/)
