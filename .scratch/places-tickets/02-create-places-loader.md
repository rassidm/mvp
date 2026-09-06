# 02: Create places data loader service

**What to build:** A singleton service that loads and caches `morocco_pois.json` from assets into Place objects.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Places data loads from bundled JSON on app startup
- [ ] Place objects parsed with: id, name, type, lat, lon, wikidataId
- [ ] Data cached in memory using singleton pattern
- [ ] Error handling for invalid JSON or missing file
