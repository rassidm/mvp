# Data Scripts

## fetch-morocco-pois.js

Fetches tourist attractions from OpenStreetMap for Morocco and generates `assets/morocco_pois.json`.

### Usage

```bash
node scripts/fetch-morocco-pois.js
```

### What it does

1. Queries Overpass API for Morocco tourist attractions
2. Filters for quality places (must have `wikidata` tag)
3. Extracts: name, coordinates, tourism type, wikidata ID
4. Outputs to `assets/morocco_pois.json`

### Output format

```json
[
  {
    "name": "Hassan II Mosque",
    "lat": 33.6084,
    "lon": -7.6327,
    "type": "attraction",
    "wikidata": "Q612237"
  }
]
```

### Expected results

- **Places**: ~500-2000 attractions in Morocco
- **File size**: 5-15 MB
- **Query time**: 1-3 minutes

### Troubleshooting

**Rate limited**: Overpass API may throttle requests. Wait 5-10 minutes and retry.

**Timeout**: Increase timeout in the query (currently 180 seconds).

**Empty results**: Check if Overpass API is down at https://overpass-api.de/api/status

### Re-running

Tourism data rarely changes. Re-run only when:
- Users report missing places
- You want to include newly added OSM places
- Preparing a major app update

After generating new data, you'll need to release a new app version to update the bundled JSON.
