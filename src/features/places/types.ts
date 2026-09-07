export type PlaceType = 'landmark' | 'natural' | 'cultural' | 'historical' | 'other';

export type Place = {
  id: string;
  name: string;
  type: PlaceType;
  lat: number;
  lon: number;
  wikidataId: string | null;
};
