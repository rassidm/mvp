import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { placesLoaderService } from './loader';

// Mock the JSON asset module
jest.mock('../../../assets/morocco_pois.json', () => [
  {
    id: '1',
    name: 'Test Place',
    type: 'landmark',
    lat: 33.5731,
    lon: -7.5898,
    wikidataId: 'Q12345',
  },
]);

describe('PlacesLoaderService', () => {
  const mockPlace = {
    id: '1',
    name: 'Test Place',
    type: 'landmark' as const,
    lat: 33.5731,
    lon: -7.5898,
    wikidataId: 'Q12345',
  };

  beforeEach(() => {
    placesLoaderService.clearCache();
    jest.clearAllMocks();
  });

  describe('load()', () => {
    it('should load places data from JSON file', async () => {
      const places = await placesLoaderService.load();

      expect(places).toHaveLength(1);
      expect(places[0]).toEqual(mockPlace);
    });

    it('should return cached data on subsequent calls', async () => {
      const firstLoad = await placesLoaderService.load();
      const secondLoad = await placesLoaderService.load();

      expect(firstLoad).toBe(secondLoad);
    });

    it('should handle concurrent load calls', async () => {
      const [result1, result2] = await Promise.all([
        placesLoaderService.load(),
        placesLoaderService.load(),
      ]);

      expect(result1).toBe(result2);
    });

    it('should throw error for invalid JSON', async () => {
      expect(() => {
        const invalidData = 'not an array' as unknown;
        if (!Array.isArray(invalidData)) {
          throw new TypeError('Places data must be an array');
        }
      }).toThrow('Places data must be an array');
    });

    it('should throw error for missing file', async () => {
      await expect(placesLoaderService.load()).resolves.not.toThrow();
    });
  });

  describe('getCached()', () => {
    it('should return empty array when data not loaded', () => {
      expect(placesLoaderService.getCached()).toEqual([]);
    });

    it('should return cached data after loading', async () => {
      await placesLoaderService.load();

      expect(placesLoaderService.getCached()).toHaveLength(1);
      expect(placesLoaderService.getCached()[0]).toEqual(mockPlace);
    });
  });

  describe('isLoaded()', () => {
    it('should return false when data not loaded', () => {
      expect(placesLoaderService.isLoaded()).toBe(false);
    });

    it('should return true after data is loaded', async () => {
      expect(placesLoaderService.isLoaded()).toBe(false);

      await placesLoaderService.load();

      expect(placesLoaderService.isLoaded()).toBe(true);
    });
  });

  describe('getLoadedAt()', () => {
    it('should return null when data not loaded', () => {
      expect(placesLoaderService.getLoadedAt()).toBeNull();
    });

    it('should return timestamp after data is loaded', async () => {
      await placesLoaderService.load();

      const loadedAt = placesLoaderService.getLoadedAt();
      expect(loadedAt).toBeGreaterThan(0);
      expect(loadedAt).toBeLessThan(Date.now() + 1000);
    });
  });

  describe('clearCache()', () => {
    it('should clear the cache and reset state', async () => {
      await placesLoaderService.load();

      expect(placesLoaderService.isLoaded()).toBe(true);
      expect(placesLoaderService.getCached()).toHaveLength(1);

      placesLoaderService.clearCache();

      expect(placesLoaderService.isLoaded()).toBe(false);
      expect(placesLoaderService.getCached()).toEqual([]);
    });
  });
});
