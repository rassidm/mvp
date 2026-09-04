# Places Feature Spec

## Problem Statement

The app currently shows a feed-based UI that doesn't align with the MVP requirement. The user needs a simple, local-first experience that:

1. Requests and manages location permission
2. Loads tourist places data bundled with the app
3. Calculates distance from user's location to each place
4. Displays the 5 nearest places
5. Allows users to open places in their native maps app

## Solution

Create a new `places` feature that provides:

1. A dedicated location hook (`useLocation`) to manage GPS permission and coordinates
2. A places data module that loads and parses bundled JSON
3. A distance calculation utility using `geolib` for sorting places by proximity
4. A main places screen showing the top 5 nearest attractions
5. A place detail screen with basic info and "Open in Maps" action

## User Stories

1. As a user, I want the app to request location permission when I first open it, so that I can see nearby places
2. As a user, I want to see a loading state while the app loads places data and calculates distances, so that I know the app is working
3. As a user, I want to see my current location displayed, so that I know the app has my position
4. As a user, I want to see a list of the 5 nearest tourist places sorted by distance, so that I can plan my visits efficiently
5. As a user, I want to see each place's name, type, and distance from my location, so that I can identify interesting places quickly
6. As a user, I want to tap on a place to see its details, so that I can learn more about it
7. As a user, I want to see a "Open in Maps" button on the place detail screen, so that I can navigate to the place
8. As a user, I want to see an empty state when I haven't granted location permission, so that I understand why places aren't showing
9. As a user, I want to see an empty state when there are no places nearby, so that I know there's nothing to display
10. As a user, I want the distance to be shown in kilometers, so that I can understand how far away places are
11. As a user, I want to see the place type as a human-readable label (e.g., "Museum" instead of "museum"), so that the app is easy to use
12. As a user, I want to see the distance formatted with one decimal place (e.g., "2.3 km"), so that the display is clean and readable
13. As a user, I want the list to remain static (not auto-refresh as I move), so that I can browse places without constant updates
14. As a user, I want to see a retry button if location fails, so that I can try again without restarting the app
15. As a user, I want to see an error message if the places data fails to load, so that I know something is wrong
16. As a user, I want places with the same name to be differentiated by type and distance, so that I can tell them apart
17. As a user, I want to see all places regardless of whether I'm authenticated, so that places discovery works for guests
18. As a user, I want the app to work offline after initial load, so that I can use it without data connection
19. As a user, I want to see places in Morocco only, so that the results are relevant to my trip
20. As a user, I want to see a "Back" navigation option when viewing place details, so that I can return to the list

## Implementation Decisions

### 1. Places Data Structure
- Load `morocco_pois.json` from assets folder at app startup
- Parse into `Place` objects with: `id`, `name`, `type`, `lat`, `lon`, `wikidataId`
- Cache in memory (singleton service pattern)

### 2. Distance Calculation
- Use `geolib.orderByDistance()` for sorting
- Algorithm: Haversine (straight-line distance)
- Display: distance in kilometers with one decimal place
- Localized unit: "km" (English) or "كم" (Arabic)

### 3. Location Management
- New hook: `useLocation()` in `src/lib/hooks/use-location.ts`
- Returns: `{ coords: Coords | null, status: 'unknown' | 'denied' | 'unavailable' | 'available', requestPermission: () => Promise<void>, retry: () => Promise<void> }`
- Use `expo-location` for GPS access

### 4. Places Service
- New module: `src/lib/places/` directory
- `places.ts`: Load and cache places data
- `distance.ts`: Calculate and sort by distance
- `formatter.ts`: Human-readable labels and distance formatting

### 5. Places Screen
- Route: `/places` (or replace existing feed index)
- Shows list of places with: name, type badge, distance
- Handles all location states (permission denied, unavailable, available)
- Empty states for no places and no permission

### 6. Place Detail Screen
- Route: `/places/[id]`
- Shows: name, type, coordinates, distance, wikidata link
- "Open in Maps" button using `expo-linking`

### 7. Integration with Auth
- Places feature works in both guest and authenticated modes
- No auth dependency required for places
- Auth state doesn't affect places display

### 8. Testing Seam
- Test at `PlacesScreen` component level using React Testing Library
- Mock `useLocation()` hook and places data service
- Verify UI states: loading, empty, permission denied, success

## Testing Decisions

### What Makes a Good Test
- Test external behavior only (UI rendering, state transitions)
- Don't test implementation details (internal state, private methods)
- Mock dependencies (location, places data) to ensure isolation

### Modules to Test
1. **`src/lib/hooks/use-location.ts`**
   - Permission granted → coords populated
   - Permission denied → status = 'denied'
   - GPS unavailable → status = 'unavailable'

2. **`src/lib/places/places.ts`**
   - Load from assets → valid Place array
   - Empty file → empty array
   - Invalid JSON → error handling

3. **`src/lib/places/distance.ts`**
   - Sort places by distance correctly
   - Apply limit parameter
   - Handle edge cases (empty array, same distances)

4. **`src/features/places/places-screen.tsx`**
   - All location states render correct UI
   - Places list renders with correct data
   - Empty states render correctly
   - Navigation to detail screen works

5. **`src/features/places/place-detail-screen.tsx`**
   - Place details render correctly
   - "Open in Maps" button triggers correct action
   - Back navigation works

### Prior Art
- Follow existing testing patterns in `src/features/auth/` and `src/features/feed/`
- Use React Testing Library patterns from existing screens
- Mock `geolib` for distance tests

## Out of Scope

- Real-time location tracking (re-calculate as user moves)
- Turn-by-turn navigation
- Place descriptions, photos, or reviews
- Favorites/bookmarks
- Search or filter functionality
- Map view (only list view)
- Places outside Morocco
- Offline map tiles
- User-generated content for places
- Reviews or ratings system
- Sharing places
- History of visited places

## Further Notes

- The `morocco_pois.json` file must be bundled with the app (assets folder)
- Data will be extracted once using Overpass API query and shipped with the app
- App requires location permission to function (cannot be disabled)
- Distance is straight-line only, not driving/walking distance
- List is a static snapshot (user must restart app for fresh data)
- No network requests after initial bundle load
- Follow the Obytes template patterns for consistency
