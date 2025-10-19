/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const functions = require("firebase-functions");
const fetch = require("node-fetch");
const admin = require("firebase-admin");

// Firebase Admin SDK'yı başlat
if (!admin.apps.length) {
  admin.initializeApp();
}

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Get API key from environment - set via: firebase functions:config:set foursquare.api_key="YOUR_KEY"
const config = functions.config();
const FOURSQUARE_API_KEY = config.foursquare && config.foursquare.api_key;
if (!FOURSQUARE_API_KEY) {
  console.error('ERROR: Foursquare API key not configured. Run: firebase functions:config:set foursquare.api_key="YOUR_KEY"');
}

exports.foursquare = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Validate API key
  if (!FOURSQUARE_API_KEY) {
    console.error("Foursquare API key is not configured");
    return res.status(500).json({
      error: "API configuration error",
      message: "Foursquare API key not configured",
    });
  }

  // Extract and validate query parameter
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({
      error: "Missing required parameter",
      message: "Query parameter is required",
    });
  }

  // Extract optional parameters
  const limit = parseInt(req.query.limit) || 20;
  const ll = req.query.ll; // latitude,longitude
  const near = req.query.near; // location string
  const categories = req.query.categories; // category IDs

  console.log("Foursquare API request:", {
    query,
    limit,
    ll,
    near,
    categories,
  });

  try {
    // Build Foursquare API URL
    const baseUrl = "https://api.foursquare.com/v3/places/search";
    const params = new URLSearchParams();
    
    params.append("query", query);
    params.append("limit", Math.min(limit, 50).toString()); // Max 50 per request
    params.append("fields", "fsq_id,name,location,categories,description,photos,rating,price,hours,website,tel,email");
    
    if (ll) {
      params.append("ll", ll);
    } else if (near) {
      params.append("near", near);
    }
    
    if (categories) {
      params.append("categories", categories);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;
    
    console.log("Making request to Foursquare API:", apiUrl);

    // Make request to Foursquare API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": FOURSQUARE_API_KEY,
      },
    });

    // Check if request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Foursquare API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      return res.status(response.status).json({
        error: "Foursquare API error",
        message: `API request failed with status ${response.status}`,
        details: errorText,
      });
    }

    // Parse response
    const data = await response.json();
    
    console.log(`Foursquare API returned ${(data.results && data.results.length) || 0} results`);

    // Transform data to match expected format
    const transformedResults = data.results ? data.results.map(place => ({
      fsq_id: place.fsq_id,
      name: place.name,
      location: {
        address: place.location && place.location.address,
        country: place.location && place.location.country,
        formatted_address: place.location && place.location.formatted_address,
        locality: place.location && place.location.locality,
        postcode: place.location && place.location.postcode,
        region: place.location && place.location.region,
        lat: place.location && place.location.lat,
        lng: place.location && place.location.lng,
      },
      categories: place.categories ? place.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
      })) : [],
      description: place.description,
      rating: place.rating,
      price: place.price,
      photos: place.photos ? place.photos.map(photo => ({
        id: photo.id,
        url: `${photo.prefix}original${photo.suffix}`,
        thumb: `${photo.prefix}300x300${photo.suffix}`,
      })) : [],
      hours: place.hours,
      website: place.website,
      tel: place.tel,
      email: place.email,
    })) : [];

    // Return transformed data
    res.json({
      results: transformedResults,
      total: transformedResults.length,
      query: query,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error calling Foursquare API:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch places from Foursquare API",
      details: error.message,
    });
  }
});

// Get place details by ID
exports.foursquarePlace = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (!FOURSQUARE_API_KEY) {
    return res.status(500).json({
      error: "API configuration error",
      message: "Foursquare API key not configured",
    });
  }

  const placeId = req.query.fsq_id || req.params.fsq_id;
  if (!placeId) {
    return res.status(400).json({
      error: "Missing required parameter",
      message: "Place ID (fsq_id) is required",
    });
  }

  try {
    const apiUrl = `https://api.foursquare.com/v3/places/${placeId}?fields=fsq_id,name,location,categories,description,photos,rating,price,hours,website,tel,email,social_media,tips,tastes,features`;
    
    console.log("Fetching place details:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": FOURSQUARE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Foursquare API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      return res.status(response.status).json({
        error: "Foursquare API error",
        message: `Failed to fetch place details: ${response.status}`,
        details: errorText,
      });
    }

    const place = await response.json();
    
    // Transform the place data
    const transformedPlace = {
      fsq_id: place.fsq_id,
      name: place.name,
      location: {
        address: place.location && place.location.address,
        country: place.location && place.location.country,
        formatted_address: place.location && place.location.formatted_address,
        locality: place.location && place.location.locality,
        postcode: place.location && place.location.postcode,
        region: place.location && place.location.region,
        lat: place.location && place.location.lat,
        lng: place.location && place.location.lng,
      },
      categories: place.categories ? place.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
      })) : [],
      description: place.description,
      rating: place.rating,
      price: place.price,
      photos: place.photos ? place.photos.map(photo => ({
        id: photo.id,
        url: `${photo.prefix}original${photo.suffix}`,
        thumb: `${photo.prefix}300x300${photo.suffix}`,
      })) : [],
      hours: place.hours,
      website: place.website,
      tel: place.tel,
      email: place.email,
      social_media: place.social_media,
      tips: place.tips,
      tastes: place.tastes,
      features: place.features,
    };

    res.json({
      place: transformedPlace,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error fetching place details:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch place details",
      details: error.message,
    });
  }
});

// Get nearby places by location
exports.foursquareNearby = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (!FOURSQUARE_API_KEY) {
    return res.status(500).json({
      error: "API configuration error",
      message: "Foursquare API key not configured",
    });
  }

  const ll = req.query.ll; // latitude,longitude
  if (!ll) {
    return res.status(400).json({
      error: "Missing required parameter",
      message: "Location (ll) parameter is required (format: lat,lng)",
    });
  }

  // Validate lat,lng format
  const coordinates = ll.split(',');
  if (coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
    return res.status(400).json({
      error: "Invalid parameter format",
      message: "Location (ll) must be in format: latitude,longitude",
    });
  }

  const limit = parseInt(req.query.limit) || 20;
  const radius = parseInt(req.query.radius) || 1000; // meters
  const categories = req.query.categories;
  const sort = req.query.sort || "DISTANCE";

  try {
    const baseUrl = "https://api.foursquare.com/v3/places/nearby";
    const params = new URLSearchParams();
    
    params.append("ll", ll);
    params.append("limit", Math.min(limit, 50).toString());
    params.append("radius", Math.min(radius, 100000).toString()); // Max 100km
    params.append("sort", sort);
    params.append("fields", "fsq_id,name,location,categories,description,photos,rating,price,hours,distance");
    
    if (categories) {
      params.append("categories", categories);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;
    
    console.log("Finding nearby places:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": FOURSQUARE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Foursquare API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      return res.status(response.status).json({
        error: "Foursquare API error",
        message: `Failed to find nearby places: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    
    console.log(`Found ${(data.results && data.results.length) || 0} nearby places`);

    const transformedResults = data.results ? data.results.map(place => ({
      fsq_id: place.fsq_id,
      name: place.name,
      location: {
        address: place.location && place.location.address,
        country: place.location && place.location.country,
        formatted_address: place.location && place.location.formatted_address,
        locality: place.location && place.location.locality,
        postcode: place.location && place.location.postcode,
        region: place.location && place.location.region,
        lat: place.location && place.location.lat,
        lng: place.location && place.location.lng,
      },
      categories: place.categories ? place.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
      })) : [],
      description: place.description,
      rating: place.rating,
      price: place.price,
      distance: place.distance,
      photos: place.photos ? place.photos.map(photo => ({
        id: photo.id,
        url: `${photo.prefix}original${photo.suffix}`,
        thumb: `${photo.prefix}300x300${photo.suffix}`,
      })) : [],
      hours: place.hours,
    })) : [];

    res.json({
      results: transformedResults,
      total: transformedResults.length,
      location: ll,
      radius: radius,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error finding nearby places:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to find nearby places",
      details: error.message,
    });
  }
});

// Test endpoint
exports.test = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.json({ 
    message: 'Firebase Functions çalışıyor!',
    apiKey: FOURSQUARE_API_KEY ? 'API Key mevcut' : 'API Key eksik',
    timestamp: new Date().toISOString()
  });
});

// Toplu veri temizleme fonksiyonu - Admin kullanımı için
exports.cleanupTestData = functions.https.onCall(async (data, context) => {
  // Kullanıcının kimlik doğrulaması yapılmış olması gerekiyor
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Kullanıcı kimlik doğrulaması gerekli');
  }

  const uid = context.auth.uid;
  console.log('Test verisi temizleme işlemi başlatılıyor:', uid);

  try {
    const db = admin.firestore();
    let totalDeleted = 0;
    
    // Kullanıcının tüm koleksiyonlarını temizle
    const userDocRef = db.collection('users').doc(uid);
    
    // Places koleksiyonunu temizle
    const placesRef = userDocRef.collection('places');
    const placesSnapshot = await placesRef.get();
    
    if (!placesSnapshot.empty) {
      const batch = db.batch();
      placesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        totalDeleted++;
      });
      await batch.commit();
      console.log('Places koleksiyonu temizlendi:', totalDeleted);
    }
    
    // Ana kullanıcı dokümanını kontrol et ve gereksiz alanları temizle
    const userDoc = await userDocRef.get();
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Sadece gerekli alanları koru
      const cleanData = {
        email: userData.email || '',
        displayName: userData.displayName || '',
        createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp()
      };
      await userDocRef.set(cleanData);
      console.log('Kullanıcı dokümanı temizlendi');
    }
    
    return {
      success: true,
      message: 'Test verileri başarıyla temizlendi',
      deletedPlaces: totalDeleted,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Test verisi temizleme hatası:', error);
    throw new functions.https.HttpsError('internal', 'Test verisi temizleme işlemi başarısız: ' + error.message);
  }
});

// Hesap silme fonksiyonu - Server-side
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  // Kullanıcının kimlik doğrulaması yapılmış olması gerekiyor
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Kullanıcı kimlik doğrulaması gerekli');
  }

  const uid = context.auth.uid;
  console.log('Hesap silme işlemi başlatılıyor:', uid);

  try {
    const db = admin.firestore();
    
    // Kullanıcının places koleksiyonunu sil
    const placesRef = db.collection('users').doc(uid).collection('places');
    const placesSnapshot = await placesRef.get();
    
    console.log('Silinecek yer sayısı:', placesSnapshot.size);
    
    // Tüm places dokümanlarını sil
    const batch = db.batch();
    placesSnapshot.docs.forEach(doc => {
      console.log('Batch\'e ekleniyor:', doc.id);
      batch.delete(doc.ref);
    });
    
    // Ana kullanıcı dokümanını da batch'e ekle
    const userDocRef = db.collection('users').doc(uid);
    batch.delete(userDocRef);
    
    // Batch işlemini çalıştır
    await batch.commit();
    console.log('Firestore verileri batch ile silindi');
    
    // Firebase Auth'dan kullanıcıyı sil
    await admin.auth().deleteUser(uid);
    console.log('Auth hesabı silindi:', uid);
    
    return {
      success: true,
      message: 'Hesap başarıyla silindi',
      deletedPlaces: placesSnapshot.size
    };
    
  } catch (error) {
    console.error('Hesap silme hatası:', error);
    throw new functions.https.HttpsError('internal', 'Hesap silme işlemi başarısız: ' + error.message);
  }
});
