# OurMorocco - Domain Context

## Overview

OurMorocco is a local-first mobile app that helps users discover nearby tourist attractions in Morocco. The app uses bundled OpenStreetMap data and the device's GPS to show the five nearest places of interest.

## Core Concepts

### Place
A tourist attraction, museum, viewpoint, or other point of interest in Morocco.

**Attributes:**
- **Name**: The place's name (e.g., "Hassan II Mosque")
- **Type**: Tourism category from OSM (attraction, museum, viewpoint, artwork, gallery, zoo, theme_park)
- **Coordinates**: Latitude and longitude (WGS84)
- **Wikidata ID**: Optional reference to Wikidata for additional information
- **Distance**: Calculated distance from user's current location (not stored, computed at runtime)

**Source:** OpenStreetMap data filtered for `tourism=attraction|museum|viewpoint|artwork|gallery|zoo|theme_park` with `wikidata=*` to ensure quality/popularity.

**Storage:** Bundled as static JSON (`morocco_pois.json`) in the app's assets folder, loaded into memory at app launch.

### User Location
The device's current GPS coordinates obtained via `expo-location`.

**States:**
- **Unknown**: App just launched, location not yet requested
- **Permission Denied**: User declined location permission
- **Unavailable**: Location services disabled or GPS signal unavailable
- **Available**: Valid GPS coordinates obtained

**Behavior:** The app requires location to function. If unavailable, show an empty state with "Open Settings" and "Retry" buttons.

### Distance Calculation
Straight-line (as-the-crow-flies) distance between user's coordinates and a place's coordinates.

**Library:** `geolib` - provides `orderByDistance()` to sort places by proximity.

**Algorithm:** Haversine formula (implemented by geolib) - accurate for distances up to ~1000km.

**Display:** Show distance in kilometers (e.g., "2.3 km away").

### Tourism Type
The category of a tourist attraction, derived from OSM's `tourism` tag.

**Supported types for MVP:**
- `attraction` - General tourist attraction (monuments, landmarks)
- `museum` - Museums
- `viewpoint` - Scenic viewpoints
- `artwork` - Public art, sculptures
- `gallery` - Art galleries
- `zoo` - Zoos
- `theme_park` - Theme parks, amusement parks

**Display:** Show as human-readable labels (e.g., `museum` → "Museum", `theme_park` → "Theme Park").

## User Modes

### Guest Mode (MVP Default)
Users access the app without authentication. No login required, no user identity tracked.

**Enabled by:** `AUTH_ENABLED = false` in environment config.

**Limitations:** 
- Cannot save favorites (future feature)
- Cannot sync data across devices (future feature)
- Full read-only access to places data

### Authenticated Mode (Future)
Users sign in with Google (Android) or Apple (iOS) via Supabase Auth.

**Enabled by:** `AUTH_ENABLED = true` + Supabase configuration.

**Unlocks:**
- User-specific favorites
- History tracking
- Cross-device sync

**Design principle:** Auth is orthogonal to core functionality. The places discovery feature works identically in both modes.

## Data Flow

1. **App Launch** → Load `morocco_pois.json` into memory (happens once, ~5-15MB)
2. **User grants location permission** → Get GPS coordinates via `expo-location`
3. **Calculate distances** → Use `geolib.orderByDistance(userCoords, allPlaces)`
4. **Show top 5** → Display the 5 nearest places in a list
5. **User taps place** → Show detail screen
6. **User taps "Open in Maps"** → Launch native Maps app with place coordinates

**No network requests** - fully offline after initial app load.

## Invariants

- There are always at least 0 places (empty state possible in remote areas)
- Distance is always calculated as straight-line, never driving/walking distance
- Places data is static (bundled at build time, updates require app release)
- Location permission is mandatory (app cannot function without it)
- Each place has a name and coordinates (required fields)
- Wikidata ID is optional but preferred (ensures place quality)

## Edge Cases

### No nearby places
If no places exist within reasonable distance, show all 5 nearest regardless of distance, or show fewer than 5 if total dataset < 5 (unlikely in Morocco).

### Location permission denied
Show empty state with explanation and call-to-action buttons.

### Duplicate place names
Possible if multiple places share a name (e.g., "Mohammed V Mosque"). Differentiate by type and distance in the UI.

### User moving while viewing list
List does not auto-refresh. User must reopen the app to recalculate distances. (Static snapshot approach for MVP.)

## Out of Scope for MVP

- Real-time location tracking
- Turn-by-turn navigation
- Place descriptions/photos
- Reviews or ratings
- Favorites/bookmarks
- Search or filtering
- Map view (only list view)
- Places outside Morocco
- Offline map tiles
