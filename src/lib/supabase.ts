import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  username: string;
  created_at: string;
  last_seen: string;
}

export interface Plant {
  id: string;
  name: string;
  deutscher_name: string;
  familie: string;
  kategorie?: string;
  unterkategorie?: string;
  herkunft: string;
  lichtbedarf: string;
  standort: string;
  bluehzeit: string;
  wuchshoehe: string;
  giessplan: string;
  pflegehinweise: string;
  pflegeaufwand: string;
  besonderheiten?: string;
  created_at: string;
  updated_at: string;
}

export interface PlantImage {
  id: number;
  plant_id: string;
  url: string;
  source: string;
  sort_order: number;
  created_at: string;
}

export interface FavoritePlant {
  id: string;
  user_id: string;
  plant_name: string;
  plant_id: string;
  created_at: string;
}

export function getSupabase() {
  return supabase;
}
