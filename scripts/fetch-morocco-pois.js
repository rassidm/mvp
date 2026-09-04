#!/usr/bin/env node

/**
 * Fetch Morocco tourist attractions from OpenStreetMap via Overpass API
 *
 * Usage: node scripts/fetch-morocco-pois.js
 * Output: assets/morocco_pois.json
 *
 * Filters:
 * - tourism=attraction|museum|viewpoint|artwork|gallery|zoo|theme_park
 * - wikidata=* (ensures quality/popularity)
 * - Morocco bounding box: (21.0, -17.0, 36.0, -1.0)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Overpass API endpoint
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Morocco bounding box: (south, west, north, east)
const MOROCCO_BBOX = '21.0,-17.0,36.0,-1.0';

// Overpass QL query
const OVERPASS_QUERY = `
[out:json][timeout:180];
(
  node["tourism"~"attraction|museum|viewpoint|artwork|gallery|zoo|theme_park"]["wikidata"](${MOROCCO_BBOX});
  way["tourism"~"attraction|museum|viewpoint|artwork|gallery|zoo|theme_park"]["wikidata"](${MOROCCO_BBOX});
  relation["tourism"~"attraction|museum|viewpoint|artwork|gallery|zoo|theme_park"]["wikidata"](${MOROCCO_BBOX});
);
out center tags;
`;

/**
 * Send POST request to Overpass API
 */
function queryOverpass(query) {
  return new Promise((resolve, reject) => {
    const postData = `data=${encodeURIComponent(query)}`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    console.log('📡 Querying Overpass API...');
    console.log('⏱️  This may take 1-3 minutes for Morocco dataset...\n');

    const req = https.request(OVERPASS_API, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
        // Show progress dots
        process.stdout.write('.');
      });

      res.on('end', () => {
        console.log('\n✅ Query completed\n');

        if (res.statusCode !== 200) {
          reject(new Error(`Overpass API returned status ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(new Error(`Failed to parse JSON response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Request failed: ${err.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Transform Overpass response to app format
 */
function transformData(overpassData) {
  const places = [];

  for (const element of overpassData.elements) {
    // Extract coordinates (use center for ways/relations)
    let lat, lon;
    if (element.type === 'node') {
      lat = element.lat;
      lon = element.lon;
    } else if (element.center) {
      lat = element.center.lat;
      lon = element.center.lon;
    } else {
      // Skip elements without coordinates
      continue;
    }

    // Extract tags
    const tags = element.tags || {};
    const name = tags.name || tags['name:en'] || tags['name:fr'] || 'Unnamed Place';
    const type = tags.tourism;
    const wikidata = tags.wikidata;

    // Skip if missing required fields
    if (!name || !type || !lat || !lon) {
      continue;
    }

    places.push({
      name,
      lat,
      lon,
      type,
      wikidata: wikidata || null,
    });
  }

  return places;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🇲🇦 OurMorocco - Fetching Tourist Attractions\n');
    console.log('Filter: tourism=attraction|museum|viewpoint|artwork|gallery|zoo|theme_park');
    console.log('Quality: wikidata=* (ensures popular places)');
    console.log(`Region: Morocco (${MOROCCO_BBOX})\n`);

    // Query Overpass API
    const overpassData = await queryOverpass(OVERPASS_QUERY);

    console.log(`📊 Raw elements received: ${overpassData.elements.length}`);

    // Transform to app format
    const places = transformData(overpassData);

    console.log(`✨ Valid places extracted: ${places.length}`);

    // Calculate size
    const jsonString = JSON.stringify(places, null, 2);
    const sizeKB = (Buffer.byteLength(jsonString) / 1024).toFixed(2);
    const sizeMB = (sizeKB / 1024).toFixed(2);

    console.log(`💾 Output size: ${sizeKB} KB (${sizeMB} MB)\n`);

    // Write to assets folder
    const outputDir = path.join(__dirname, '..', 'assets');
    const outputPath = path.join(outputDir, 'morocco_pois.json');

    // Create assets directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, jsonString, 'utf8');

    console.log(`✅ Saved to: ${outputPath}`);
    console.log('\n📱 You can now bundle this file in your React Native app.\n');

    // Show sample places
    console.log('🔍 Sample places (first 5):');
    places.slice(0, 5).forEach((place, i) => {
      console.log(`  ${i + 1}. ${place.name} (${place.type}) - ${place.lat.toFixed(4)}, ${place.lon.toFixed(4)}`);
    });

    // Show type distribution
    const typeCounts = {};
    places.forEach(p => {
      typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    });
    console.log('\n📈 Distribution by type:');
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Check your internet connection');
    console.error('- Overpass API may be rate-limited (wait a few minutes)');
    console.error('- Try again or use a different Overpass instance');
    process.exit(1);
  }
}

main();
