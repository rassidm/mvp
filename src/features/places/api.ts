import type { Place } from './types';
import { createQuery } from 'react-query-kit';
import { placesLoaderService } from './loader';

type PlacesResponse = Place[];
type PlacesVariables = void;

export const usePlaces = createQuery<PlacesResponse, PlacesVariables, Error>({
  queryKey: ['places'],
  fetcher: async () => {
    const places = await placesLoaderService.load();
    return places;
  },
});

type PlaceByIdVariables = { id: string };

export const usePlace = createQuery<Place | undefined, PlaceByIdVariables, Error>({
  queryKey: ['places'],
  fetcher: async (variables) => {
    const places = await placesLoaderService.load();
    return places.find(p => p.id === variables.id);
  },
});
