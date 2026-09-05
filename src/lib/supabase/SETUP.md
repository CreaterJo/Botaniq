# Botaniq Supabase Setup

## Projekt-Details

- **Project URL:** https://yagiqadbqdufpzapdrvc.supabase.co
- **Anon Key:** `sb_publishable_Ka8Idhgn5TPkrIKt0rucvg_xL5xHXCJ`
- **Dashboard:** https://supabase.com/dashboard/project/yagiqadbqdufpzapdrvc

## Setup-Schritte

### 1. SQL Schema ausführen

1. Öffne den **Supabase SQL Editor**: https://supabase.com/dashboard/project/yagiqadbqdufpzapdrvc/sql/new
2. Kopiere den Inhalt aus `supabase/migrations/20260902141500_botaniq_schema.sql`
3. Füge ihn ein und klicke **Run**

Alternativ - kopiere das komplette SQL:

```sql
-- Botaniq Supabase Schema
-- Migration: 20260902141500_botaniq_schema.sql

-- =====================================================
-- TABLES
-- =====================================================

-- Plants Tabelle (87.000 Pflanzen mit Volltext-Suche)
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  deutscher_name TEXT NOT NULL,
  familie TEXT NOT NULL,
  kategorie TEXT,
  unterkategorie TEXT,
  herkunft TEXT DEFAULT 'Unbekannt',
  lichtbedarf TEXT DEFAULT 'Sonne bis Halbschatten',
  standort TEXT DEFAULT 'Unbekannt',
  bluehzeit TEXT DEFAULT 'Unbekannt',
  wuchshoehe TEXT DEFAULT 'Unbekannt',
  giessplan TEXT DEFAULT 'Regelmäßig gießen',
  pflegehinweise TEXT DEFAULT 'Basierend auf botanischen Daten',
  pflegeaufwand TEXT DEFAULT 'Mittel',
  besonderheiten TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plant Images (primäre + Lazy-Load URLs von APIs)
CREATE TABLE IF NOT EXISTS plant_images (
  id SERIAL PRIMARY KEY,
  plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source TEXT DEFAULT 'GBIF',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (Anonymous Auth mit unique username)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- User Favorites (Private Favoriten pro User)
CREATE TABLE IF NOT EXISTS user_favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plant_id)
);

-- =====================================================
-- INDIZES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_plants_name_gin ON plants USING gin (to_tsvector('german', coalesce(name, '')));
CREATE INDEX IF NOT EXISTS idx_plants_deutscher_name_gin ON plants USING gin (to_tsvector('german', coalesce(deutscher_name, '')));
CREATE INDEX IF NOT EXISTS idx_plants_familie_gin ON plants USING gin (to_tsvector('german', coalesce(familie, '')));
CREATE INDEX IF NOT EXISTS idx_plants_kategorie ON plants (kategorie);
CREATE INDEX IF NOT EXISTS idx_plants_unterkategorie ON plants (unterkategorie);
CREATE INDEX IF NOT EXISTS idx_plants_familie ON plants (familie);
CREATE INDEX IF NOT EXISTS idx_plant_images_plant_id ON plant_images (plant_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites (user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plants sind öffentlich lesbar" ON plants FOR SELECT USING (true);
CREATE POLICY "Plant Images sind öffentlich lesbar" ON plant_images FOR SELECT USING (true);
CREATE POLICY "User liest eigenes Profil" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User erstellt Profil" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "User aktualisiert eigenes Profil" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User sieht eigene Favoriten" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User erstellt Favoriten" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User löscht eigene Favoriten" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-images', 'plant-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'plant-images');
```

### 2. Verbindung testen

Nachdem du das SQL ausgeführt hast:

```bash
node src/lib/supabase/validate-setup.js
```

### 3. Validierung im SQL Editor

```sql
-- Prüfe Tabellen
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Prüfe Indizes
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Prüfe RLS
SELECT relname as table_name, relrowsecurity as rls_enabled
FROM pg_class
WHERE relname IN ('plants', 'plant_images', 'user_profiles', 'user_favorites');

-- Prüfe Policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Erstellte Tabellen

| Tabelle | Beschreibung | RLS |
|---------|-------------|-----|
| `plants` | 87.000 Pflanzen mit Volltext-Suche | Public read |
| `plant_images` | Multi-Bild Support | Public read |
| `user_profiles` | Anonymous Auth | User liest eigenen |
| `user_favorites` | Private Favoriten | Nur eigene |

## Indizes

**Full-Text Search:**
- `idx_plants_name_gin` - GIN Index auf `name`
- `idx_plants_deutscher_name_gin` - GIN Index auf `deutscher_name`
- `idx_plants_familie_gin` - GIN Index auf `familie`

**Filter-Queries:**
- `idx_plants_kategorie` - B-tree auf `kategorie`
- `idx_plants_unterkategorie` - B-tree auf `unterkategorie`
- `idx_plants_familie` - B-tree auf `familie`

**Foreign Keys:**
- `idx_plant_images_plant_id` - Join-Optimierung
- `idx_user_favorites_user_id` - Join-Optimierung

## Client Usage

```typescript
import { supabase } from './src/lib/supabase/client'

// Full-Text Search
const { data: plants } = await supabase
  .from('plants')
  .select('*')
  .textSearch('deutscher_name', 'rose')

// Filter nach Kategorie
const { data: orchids } = await supabase
  .from('plants')
  .select('*')
  .eq('kategorie', 'Orchideen')

// Favoriten abrufen (mit User Context)
const { data: favorites } = await supabase
  .from('user_favorites')
  .select('*, plants(*)')
```

## Storage

Bucket `plant-images` mit Public Read Access. Bilder können via URL abgerufen werden:

```
https://yagiqadbqdufpzapdrvc.supabase.co/storage/v1/object/public/plant-images/{filename}
```