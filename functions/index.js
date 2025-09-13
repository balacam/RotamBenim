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
  console.log('Query içeriği:', query.toLowerCase());
  
  // Mock data ile test (gerçek API çalışana kadar)
  let mockData = { results: [] };
  
  // Berlin için mock data
  if (query.toLowerCase().includes('berlin')) {
    mockData = {
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
  }
  
  // İstanbul için mock data
  if (query.toLowerCase().includes('istanbul')) {
    console.log('İstanbul için mock data döndürülüyor');
    mockData = {
      results: [
        {
          fsq_id: "istanbul1",
          name: "Ayasofya",
          location: {
            country: "Turkey",
            formatted_address: "Sultan Ahmet, Ayasofya Meydanı, 34122 Fatih/İstanbul, Turkey"
          },
          categories: [{ name: "Historic Site" }],
          description: "Bizans döneminden kalma tarihi yapı, şimdi müze olarak kullanılıyor"
        },
        {
          fsq_id: "istanbul2",
          name: "Sultanahmet Camii (Blue Mosque)",
          location: {
            country: "Turkey",
            formatted_address: "Sultan Ahmet, Atmeydanı Cd. No:7, 34122 Fatih/İstanbul, Turkey"
          },
          categories: [{ name: "Religious Site" }],
          description: "Mavi çinileriyle ünlü tarihi cami"
        },
        {
          fsq_id: "istanbul3",
          name: "Topkapı Sarayı",
          location: {
            country: "Turkey",
            formatted_address: "Cankurtaran, 34122 Fatih/İstanbul, Turkey"
          },
          categories: [{ name: "Palace" }],
          description: "Osmanlı İmparatorluğu'nun yönetim merkezi olan tarihi saray"
        },
        {
          fsq_id: "istanbul4",
          name: "Kapalıçarşı",
          location: {
            country: "Turkey",
            formatted_address: "Beyazıt, Kalpakçılar Cd. No:22, 34126 Fatih/İstanbul, Turkey"
          },
          categories: [{ name: "Shopping Center" }],
          description: "Dünyanın en büyük kapalı çarşılarından biri"
        },
        {
          fsq_id: "istanbul5",
          name: "Boğaziçi Köprüsü",
          location: {
            country: "Turkey",
            formatted_address: "Ortaköy, 34347 Beşiktaş/İstanbul, Turkey"
          },
          categories: [{ name: "Bridge" }],
          description: "Avrupa ve Asya kıtalarını birleştiren ikonik köprü"
        },
        {
          fsq_id: "istanbul6",
          name: "Galata Kulesi",
          location: {
            country: "Turkey",
            formatted_address: "Bereketzade, Galata Kulesi Sk., 34421 Beyoğlu/İstanbul, Turkey"
          },
          categories: [{ name: "Tower" }],
          description: "İstanbul'un en eski yapılarından biri, şehrin panoramik manzarasını sunuyor"
        },
        {
          fsq_id: "istanbul7",
          name: "Dolmabahçe Sarayı",
          location: {
            country: "Turkey",
            formatted_address: "Vişnezade, Dolmabahçe Cd., 34357 Beşiktaş/İstanbul, Turkey"
          },
          categories: [{ name: "Palace" }],
          description: "Boğaz kıyısında yer alan görkemli Osmanlı sarayı"
        },
        {
          fsq_id: "istanbul8",
          name: "Süleymaniye Camii",
          location: {
            country: "Turkey",
            formatted_address: "Süleymaniye, Prof. Sıddık Sami Onar Cd. No:1, 34116 Fatih/İstanbul, Turkey"
          },
          categories: [{ name: "Religious Site" }],
          description: "Mimar Sinan'ın başyapıtı olan tarihi cami"
        },
        {
          fsq_id: "istanbul9",
          name: "Yerebatan Sarnıcı",
          location: {
            country: "Turkey",
            formatted_address: "Alemdar, Yerebatan Cd. 1/3, 34110 Fatih/İstanbul, Turkey"
          },
          categories: [{ name: "Historic Site" }],
          description: "Bizans döneminden kalma yeraltı su sarnıcı"
        },
        {
          fsq_id: "istanbul10",
          name: "Ortaköy Camii",
          location: {
            country: "Turkey",
            formatted_address: "Mecidiye, Mecidiye Köprüsü Sk., 34347 Beşiktaş/İstanbul, Turkey"
          },
          categories: [{ name: "Religious Site" }],
          description: "Boğaz kıyısında yer alan zarif cami"
        }
      ]
    };
  }
  
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
