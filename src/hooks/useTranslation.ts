"use client";

import { useCallback } from 'react';

const TRANSLATION_CACHE_KEY = 'botaniq_translation_cache';

const TRANSLATION_APIS = [
  {
    name: 'LibreTranslate',
    translate: async (text: string): Promise<string> => {
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: 'de',
          format: 'text'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.translatedText || text;
      }
      throw new Error('LibreTranslate failed');
    }
  },
  {
    name: 'Lingva',
    translate: async (text: string): Promise<string> => {
      const response = await fetch(`https://lingva.ml/api/v1/en/de/${encodeURIComponent(text)}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.translation || text;
      }
      throw new Error('Lingva failed');
    }
  }
];

export const useTranslation = () => {
  const getCache = useCallback(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || '{}');
    } catch {
      return {};
    }
  }, []);

  const setCache = useCallback((cache: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Fehler beim Speichern des Cache:', error);
    }
  }, []);

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (!text || text === 'Unbekannt' || text === 'Unknown' || text.length < 2) return text;
    
    const cache = getCache();
    const cacheKey = text.toLowerCase().trim();
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    
    console.log(`Übersetze: "${text}"`);
    
    for (const api of TRANSLATION_APIS) {
      try {
        const translatedText = await api.translate(text);
        
        if (translatedText && translatedText !== text) {
          cache[cacheKey] = translatedText;
          setCache(cache);
          console.log(`✅ "${text}" → "${translatedText}" (${api.name})`);
          return translatedText;
        }
      } catch (error) {
        console.log(`❌ ${api.name} fehlgeschlagen, versuche nächste API...`);
      }
    }
    
    console.log(`❌ Alle APIs fehlgeschlagen für: "${text}"`);
    return text;
  }, [getCache, setCache]);

  const translatePlantData = useCallback(async (plant: any): Promise<any> => {
    const translations = await Promise.all([
      translateText(plant.common_name || ''),
      translateText(plant.family || ''),
      translateText(plant.genus || ''),
    ]);

    return {
      ...plant,
      common_name: translations[0] || plant.common_name,
      family: translations[1] || plant.family,
      genus: translations[2] || plant.genus,
    };
  }, [translateText]);

  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TRANSLATION_CACHE_KEY);
  }, []);

  return { translateText, translatePlantData, clearCache };
};