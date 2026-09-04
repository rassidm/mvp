-Very simple Mobile application for Android and iOS developed with React Native and Expo.
-Authentification with open connect ID using supabase auth (Google for Android users and Apple ID for iOS users). 
-Main and only feature of this app : When a user is Authentificated and login the application autodetect his location and show him a list of the five nearest touristic places.
-MVP will be lainched only for places in morocco.
-Use Overpass API to query OSM for Morocco tourist attractions , Filter: tourism=* + wikidata=* (ensures popularity) Since the data is small and rarely changes, do not use a server at all. Ship the data directly inside your React Native app.

    Extract Once: Run an Overpass query on your laptop (see the query below) and save the result as morocco_pois.json.
    Bundle: Put this JSON file in the assets folder of your Expo project. (It will only be about 5MB to 15MB in size).
    Local Query: When the app opens, read the local JSON file into memory. Use a lightweight JavaScript library like geolib or kdbush to calculate the distance between the user's GPS coordinates and the local JSON array, and pick the top 5.
    
-very simplist MVP
-I will use this react native ready to use template to bootstrap my MVP : https://github.com/obytes/react-native-template-obytes