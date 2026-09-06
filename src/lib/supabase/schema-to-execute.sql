-- Botaniq Supabase Schema
-- Führe dieses SQL im Supabase SQL Editor aus:
-- https://supabase.com/dashboard/project/yagiqadbqdufpzapdrvc/sql/new

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
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- User Favorites (Private Favoriten pro User)
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  plant_name TEXT NOT NULL DEFAULT '',
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
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_plant_id ON favorites (plant_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plants sind öffentlich lesbar" ON plants FOR SELECT USING (true);
CREATE POLICY "Plant Images sind öffentlich lesbar" ON plant_images FOR SELECT USING (true);
CREATE POLICY "User liest eigenes Profil" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User erstellt Profil" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "User aktualisiert eigenes Profil" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User sieht eigene Favoriten" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User erstellt Favoriten" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User löscht eigene Favoriten" ON favorites FOR DELETE USING (auth.uid() = user_id);

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