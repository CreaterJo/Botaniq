/**
 * Daten-Hosting-Konfiguration
 *
 * Hier wird die CDN-URL für die Pflanzendatenbank eingestellt.
 * Siehe README.md für die Einrichtungs-Anleitung (Cloudflare R2 empfohlen).
 */

/**
 * CDN-URL zum Pflanzen-Cache.
 * Leere String = keine externe Datenquelle (lokal oder Fehler).
 * Beispiel: 'https://pub-xxxxxxxxxxxx.r2.dev/botaniq'
 */
export const CDN_BASE_URL = '';

/**
 * Name der Cache-Dateien auf dem CDN.
 * Muss mit den hochgeladenen Dateien übereinstimmen.
 */
export const CACHE_FILE_PATTERN = 'cached_plants_part_{index}.json';
export const TOTAL_CACHE_PARTS = 5;
