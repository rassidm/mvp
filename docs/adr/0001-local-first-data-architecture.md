# Architecture Decision Record: Local-First Data Architecture

**Status**: Accepted  
**Date**: 2026-09-04  
**Deciders**: Product team

## Context

OurMorocco MVP needs to display the 5 nearest tourist attractions in Morocco based on user's GPS location. Initial PRD proposed using Supabase with PostGIS for geospatial queries against OpenStreetMap data.

The key constraints:
- MVP scope: Morocco only (~500-2000 tourist attractions)
- Data rarely changes (tourism landmarks are stable)
- Simple feature: just show nearest 5 places, no search/filtering
- Need offline capability for tourists with limited connectivity

## Decision

**Adopt a local-first architecture**: Bundle OpenStreetMap data directly in the React Native app as a static JSON file (~5-15MB) and perform distance calculations client-side using `geolib`.

### Implementation approach:

1. **One-time data extraction**: Query Overpass API for Morocco tourism POIs filtered by `tourism=*` + `wikidata=*`
2. **Bundle in app**: Store as `assets/morocco_pois.json` in Expo app bundle
3. **Load at launch**: Parse JSON into memory during onboarding screen
4. **Client-side query**: Use `geolib.orderByDistance()` to find nearest 5 places
5. **Updates**: Re-generate JSON and release new app version (as needed, not automated)

## Consequences

### Positive

- ✅ **Zero server costs** - No backend, database, or API hosting needed
- ✅ **Fully offline** - Works without network after initial app install
- ✅ **Simple architecture** - No API layer, auth tokens, or network error handling
- ✅ **Instant queries** - No network latency, sub-millisecond distance calculations
- ✅ **Predictable performance** - App size and query speed are constant
- ✅ **MVP speed** - Eliminates Supabase setup, PostGIS schema, and API development

### Negative

- ❌ **Static data** - Updates require app release (not suitable for frequently-changing data)
- ❌ **App size** - Adds 5-15MB to app bundle (acceptable for MVP, but grows if expanding regions)
- ❌ **Memory usage** - Loads entire dataset into RAM (~15MB for 2000 places as JSON)
- ❌ **No dynamic filtering** - Cannot add user-submitted places without app update
- ❌ **Scaling limitation** - Does not scale to multiple countries (would balloon app size)

### Mitigations

- **App size**: 5-15MB is acceptable for modern apps; users on slow connections can download over WiFi
- **Memory**: 15MB is trivial for modern smartphones (8GB+ RAM); JSON parsing is fast (<100ms)
- **Data freshness**: Tourism landmarks change infrequently; annual updates are sufficient
- **Future expansion**: If expanding beyond Morocco, migrate to a hybrid approach (bundle popular places, fetch others on-demand)

## Alternatives Considered

### 1. Supabase + PostGIS (original PRD)

**Pros**: Dynamic data updates, server-side spatial queries, supports user-generated content  
**Cons**: Requires backend setup, network dependency, server costs, complex for MVP  
**Why rejected**: Over-engineered for static Morocco-only dataset

### 2. OpenTripMap API (direct)

**Pros**: Always fresh data, no bundling needed  
**Cons**: Network required, API rate limits, query latency, no offline support  
**Why rejected**: Poor UX for tourists with limited connectivity

### 3. Hybrid (bundle + API)

**Pros**: Offline-first with dynamic updates  
**Cons**: Complex cache invalidation, still needs backend  
**Why rejected**: Unnecessary complexity for MVP with stable data

## Implementation Notes

- Use Node.js script (`scripts/fetch-morocco-pois.js`) to query Overpass API and generate JSON
- Filter for `wikidata=*` to ensure quality (only popular/documented places)
- Format: `[{name, lat, lon, type, wikidata}]` - minimal schema for MVP
- Update cadence: As needed (likely quarterly or annually)

## Future Considerations

If the app expands to multiple countries or adds user-generated content, consider:
- **Incremental data loading**: Bundle Morocco, fetch others on-demand
- **Tile-based approach**: Load regions as user travels (similar to map tiles)
- **Hybrid backend**: Supabase for user data (favorites, reviews), keep core POIs bundled

This decision is **reversible** but requires significant refactoring. Suitable for MVP; re-evaluate if requirements change.
