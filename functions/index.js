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
  try {
    const url = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&limit=10&fields=fsq_id,name,location,categories,description`;
    const resp = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: FOURSQUARE_API_KEY,
      },
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
