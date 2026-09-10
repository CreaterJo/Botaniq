CREATE TABLE plants (
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
CREATE TABLE plant_images (
  id SERIAL PRIMARY KEY,
  plant_id TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT DEFAULT 'GBIF',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  plant_id TEXT NOT NULL,
  plant_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plant_id)
);
ALTER TABLE plant_images ADD CONSTRAINT fk_plant_images_plant FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE;
ALTER TABLE favorites ADD CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE favorites ADD CONSTRAINT fk_favorites_plant FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE;
CREATE INDEX idx_plants_name_gin ON plants USING gin (to_tsvector('german', coalesce(name, '')));
CREATE INDEX idx_plants_deutscher_name_gin ON plants USING gin (to_tsvector('german', coalesce(deutscher_name, '')));
CREATE INDEX idx_plants_familie_gin ON plants USING gin (to_tsvector('german', coalesce(familie, '')));
CREATE INDEX idx_plants_kategorie ON plants (kategorie);
CREATE INDEX idx_plants_unterkategorie ON plants (unterkategorie);
CREATE INDEX idx_plants_familie ON plants (familie);
CREATE INDEX idx_plant_images_plant_id ON plant_images (plant_id);
CREATE INDEX idx_favorites_user_id ON favorites (user_id);
CREATE INDEX idx_favorites_plant_id ON favorites (plant_id);
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plants public read" ON plants FOR SELECT USING (true);
CREATE POLICY "Plant images public read" ON plant_images FOR SELECT USING (true);
CREATE POLICY "User read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User create profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "User update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User read own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User create favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION update_updatedat_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();
