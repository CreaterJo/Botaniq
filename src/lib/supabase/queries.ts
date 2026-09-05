import { supabase } from '../supabase';
import type { Plant, PlantImage, UserProfile } from '../supabase';

export interface FavoriteItem {
  plant_id: string;
  plant_name: string;
}

export async function getPlants(
  limit: number = 50,
  offset: number = 0,
  category?: string,
  subcategory?: string
): Promise<{ plants: Plant[]; total: number }> {
  if (!supabase) {
    return { plants: [], total: 0 };
  }

  let query = supabase
    .from('plants')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('name');

  if (category) {
    query = query.eq('kategorie', category);
  }
  if (subcategory) {
    query = query.eq('unterkategorie', subcategory);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('getPlants error:', error);
    throw error;
  }

  return { plants: (data || []) as Plant[], total: count || 0 };
}

export async function searchPlants(
  query: string,
  limit: number = 20
): Promise<Plant[]> {
  if (!supabase || query.trim().length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .or(`name.ilike.%${query}%,deutscher_name.ilike.%${query}%,familie.ilike.%${query}%`)
    .limit(limit)
    .order('name');

  if (error) {
    console.error('searchPlants error:', error);
    throw error;
  }

  return (data || []) as Plant[];
}

export async function getPlantById(id: string): Promise<Plant | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('getPlantById error:', error);
    return null;
  }

  return data as Plant;
}

export async function getPlantByName(name: string): Promise<Plant | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    console.error('getPlantByName error:', error);
    return null;
  }

  return data as Plant;
}

export async function getPlantsByCategory(
  kategorie: string,
  limit: number = 100
): Promise<Plant[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('kategorie', kategorie)
    .limit(limit);

  if (error) {
    console.error('getPlantsByCategory error:', error);
    throw error;
  }

  return (data || []) as Plant[];
}

export async function getCategories(): Promise<string[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('plants')
    .select('kategorie')
    .not('kategorie', 'is', null)
    .order('kategorie');

  if (error) {
    console.error('getCategories error:', error);
    return [];
  }

  return [...new Set((data || []).map(p => p.kategorie).filter(Boolean))] as string[];
}

export async function getSubcategories(kategorie: string): Promise<string[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('plants')
    .select('unterkategorie')
    .eq('kategorie', kategorie)
    .not('unterkategorie', 'is', null)
    .order('unterkategorie');

  if (error) {
    console.error('getSubcategories error:', error);
    return [];
  }

  return [...new Set((data || []).map(p => p.unterkategorie).filter(Boolean))] as string[];
}

export async function getPlantImages(plantId: string, limit: number = 10): Promise<PlantImage[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('plant_images')
    .select('*')
    .eq('plant_id', plantId)
    .order('sort_order')
    .limit(limit);

  if (error) {
    console.error('getPlantImages error:', error);
    return [];
  }

  return (data || []) as PlantImage[];
}

export async function loadLazyImages(plantName: string, plantId: string): Promise<string[]> {
  if (!supabase) return [];

  try {
    const gbifResponse = await fetch(
      `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(plantName)}&limit=1`
    );
    if (gbifResponse.ok) {
      const gbifData = await gbifResponse.json();
      if (gbifData.results?.[0]?.key) {
        const key = gbifData.results[0].key;
        const imagesResponse = await fetch(
          `https://api.gbif.org/v1/occurrence/search?taxonKey=${key}&mediaType=StillImage&limit=5`
        );
        if (imagesResponse.ok) {
          const imageData = await imagesResponse.json();
          const urls: string[] = [];
          for (const occ of (imageData.results || []).slice(0, 5)) {
            if (occ.media?.[0]?.identifier) {
              urls.push(occ.media[0].identifier);
            }
          }
          return urls;
        }
      }
    }
  } catch (e) {
    console.log('GBIF lazy load failed, trying iNaturalist...');
  }

  try {
    const inatResponse = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(plantName)}&rank=species&per_page=1`
    );
    if (inatResponse.ok) {
      const inatData = await inatResponse.json();
      if (inatData.results?.[0]?.id) {
        const obsResponse = await fetch(
          `https://api.inaturalist.org/v1/observations?taxon_id=${inatData.results[0].id}&per_page=5&photos=true`
        );
        if (obsResponse.ok) {
          const obsData = await obsResponse.json();
          return (obsData.results || [])
            .filter((obs: any) => obs.photos?.[0]?.url)
            .map((obs: any) => obs.photos[0].url.replace('square', 'medium'))
            .slice(0, 5);
        }
      }
    }
  } catch (e) {
    console.error('iNaturalist lazy load failed:', e);
  }

  return [];
}

export async function getUserFavorites(userId: string): Promise<FavoriteItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('plant_id, plant_name')
    .eq('user_id', userId);

  if (error) {
    console.error('getUserFavorites error:', error);
    return [];
  }

  return (data || []).map(f => ({
    plant_id: f.plant_id,
    plant_name: f.plant_name || f.plant_id
  }));
}

export async function addToFavorites(userId: string, plantId: string, plantName: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, plant_id: plantId, plant_name: plantName } as any);

  if (error) {
    if (error.code === '23505') return true;
    console.error('addToFavorites error:', error);
    return false;
  }
  return true;
}

export async function removeFromFavorites(userId: string, plantId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('plant_id', plantId);

  if (error) {
    console.error('removeFromFavorites error:', error);
    return false;
  }
  return true;
}

export async function isFavorite(userId: string, plantId: string): Promise<boolean> {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('plant_id', plantId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
