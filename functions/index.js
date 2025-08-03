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

const FOURSQUARE_API_KEY = "JOU3DLQL13TMVPJANZOG10AAJJKRCCYG0CW3HDSWTIIJ45ZD";

exports.foursquare = functions.https.onRequest(async (req, res) => {
  // CORS header ekle
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight (OPTIONS) isteğine hemen cevap ver
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "query param required" });
  
  console.log('Mock API çağrısı:', query);
  
  // Mock data ile test (gerçek API çalışana kadar)
  const mockData = {
    results: [
      {
        fsq_id: "berlin1",
        name: "Brandenburg Gate",
        location: {
          country: "Germany",
          formatted_address: "Pariser Platz, 10117 Berlin, Germany"
        },
        categories: [{ name: "Historic Site" }],
        description: "Berlin'in en ünlü simgesi olan Brandenburg Kapısı"
      },
      {
        fsq_id: "berlin2", 
        name: "Berlin Wall Memorial",
        location: {
          country: "Germany",
          formatted_address: "Bernauer Str. 111, 13355 Berlin, Germany"
        },
        categories: [{ name: "Historic Site" }],
        description: "Berlin Duvarı Anıtı ve müzesi"
      },
      {
        fsq_id: "berlin3",
        name: "Reichstag Building",
        location: {
          country: "Germany", 
          formatted_address: "Platz der Republik 1, 11011 Berlin, Germany"
        },
        categories: [{ name: "Government Building" }],
        description: "Alman Parlamentosu'nun bulunduğu tarihi bina"
      },
      {
        fsq_id: "berlin4",
        name: "Museum Island",
        location: {
          country: "Germany",
          formatted_address: "Museumsinsel, 10117 Berlin, Germany"
        },
        categories: [{ name: "Museum" }],
        description: "UNESCO Dünya Mirası listesinde yer alan müze adası"
      },
      {
        fsq_id: "berlin5",
        name: "Checkpoint Charlie",
        location: {
          country: "Germany",
          formatted_address: "Friedrichstraße 43-45, 10117 Berlin, Germany"
        },
        categories: [{ name: "Historic Site" }],
        description: "Soğuk Savaş döneminin en ünlü sınır kapısı"
      },
      {
        fsq_id: "berlin6",
        name: "Tiergarten Park",
        location: {
          country: "Germany",
          formatted_address: "Tiergarten, 10785 Berlin, Germany"
        },
        categories: [{ name: "Park" }],
        description: "Berlin'in kalbinde yer alan 210 hektarlık büyük park"
      },
      {
        fsq_id: "berlin7",
        name: "Potsdamer Platz",
        location: {
          country: "Germany",
          formatted_address: "Potsdamer Platz, 10117 Berlin, Germany"
        },
        categories: [{ name: "Shopping Center" }],
        description: "Modern Berlin'in kalbi olan bu meydan"
      },
      {
        fsq_id: "berlin8",
        name: "Berlin Cathedral",
        location: {
          country: "Germany",
          formatted_address: "Am Lustgarten, 10178 Berlin, Germany"
        },
        categories: [{ name: "Religious Site" }],
        description: "Spree Nehri kıyısında yer alan görkemli Protestan katedrali"
      },
      {
        fsq_id: "berlin9",
        name: "Alexanderplatz",
        location: {
          country: "Germany",
          formatted_address: "Alexanderplatz, 10178 Berlin, Germany"
        },
        categories: [{ name: "Square" }],
        description: "Berlin'in en büyük meydanlarından biri"
      },
      {
        fsq_id: "berlin10",
        name: "Charlottenburg Palace",
        location: {
          country: "Germany",
          formatted_address: "Spandauer Damm 10-22, 14059 Berlin, Germany"
        },
        categories: [{ name: "Palace" }],
        description: "Berlin'in en büyük sarayı ve Prusya kraliyet ailesinin eski ikametgahı"
      }
    ]
  };
  
  console.log('Mock data döndürülüyor:', mockData);
  res.json(mockData);
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
