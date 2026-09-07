import type { Place } from './types';

// In-memory storage for places data
let placesCache: Place[] = [];
let loadedAt: number | null = null;
let isLoading = false;
let loadPromise: Promise<Place[]> | null = null;

/**
 * Load places data from the bundled JSON file
 * Uses singleton pattern to ensure data is only loaded once
 */
async function load(): Promise<Place[]> {
  if (placesCache.length > 0) {
    return placesCache;
  }

  if (isLoading) {
    return loadPromise!;
  }

  isLoading = true;
  loadPromise = doLoad();
  return loadPromise;
}

/**
 * Actually load and parse the JSON file
 */
async function doLoad(): Promise<Place[]> {
  try {
    // Load the JSON directly from the bundled asset
    // In Expo, require() on JSON files bundles them automatically
    const data = require('../../../assets/morocco_pois.json') as Place[];

    // Validate the data
    const validatedPlaces = validatePlaces(data);

    placesCache = validatedPlaces;
    loadedAt = Date.now();
    isLoading = false;
    loadPromise = null;

    return validatedPlaces;
  }
  catch (error) {
    isLoading = false;
    loadPromise = null;

    console.error('Failed to load places data:', error);
    throw new Error(
      `Failed to load places data: ${(error as Error).message}`,
    );
  }
}

/**
 * Validate that each place has the required fields
 */
function validatePlaces(places: unknown[]): Place[] {
  if (!Array.isArray(places)) {
    throw new TypeError('Places data must be an array');
  }

  const validated: Place[] = [];

  for (const place of places) {
    // Type guard to check if place has required properties
    if (
      place
      && typeof place === 'object'
      && 'id' in place
      && 'name' in place
      && 'type' in place
      && 'lat' in place
      && 'lon' in place
      && 'wikidataId' in place
    ) {
      const placeAsAny = place as any;

      if (
        typeof placeAsAny.id === 'string'
        && typeof placeAsAny.name === 'string'
        && typeof placeAsAny.type === 'string'
        && typeof placeAsAny.lat === 'number'
        && typeof placeAsAny.lon === 'number'
        && (placeAsAny.wikidataId === null || typeof placeAsAny.wikidataId === 'string')
      ) {
        validated.push({
          id: placeAsAny.id,
          name: placeAsAny.name,
          type: placeAsAny.type,
          lat: placeAsAny.lat,
          lon: placeAsAny.lon,
          wikidataId: placeAsAny.wikidataId,
        });
      }
    }
  }

  return validated;
}

/**
 * Get the cached places data
 * Returns empty array if data hasn't been loaded yet
 */
function getCached(): Place[] {
  return placesCache;
}

/**
 * Check if data has been loaded
 */
function isLoaded(): boolean {
  return placesCache.length > 0;
}

/**
 * Get the time when data was loaded
 */
function getLoadedAt(): number | null {
  return loadedAt;
}

/**
 * Clear the cache and reset the service
 * Useful for testing or when data needs to be reloaded
 */
function clearCache(): void {
  placesCache = [];
  loadedAt = null;
  isLoading = false;
  loadPromise = null;
}

export const placesLoaderService = {
  load,
  getCached,
  isLoaded,
  getLoadedAt,
  clearCache,
};
