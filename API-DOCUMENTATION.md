# RotamBenim API Documentation

## Overview
The RotamBenim Firebase Functions now provide real Foursquare API integration instead of mock data. All endpoints support CORS and return structured JSON responses.

## Base URL
```
https://<your-region>-<your-project-id>.cloudfunctions.net/
```

## Authentication
All endpoints require the Foursquare API key to be configured:
```bash
firebase functions:config:set foursquare.api_key="YOUR_FOURSQUARE_API_KEY"
```

## Endpoints

### 1. Search Places
**Endpoint:** `/foursquare`  
**Method:** GET  
**Description:** Search for places using text query

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search term (e.g., "restaurants", "coffee", "Berlin") |
| `limit` | integer | No | Number of results (default: 20, max: 50) |
| `ll` | string | No | Location as "latitude,longitude" |
| `near` | string | No | Location as text (e.g., "Berlin, Germany") |
| `categories` | string | No | Foursquare category IDs (comma-separated) |

#### Example Request
```
GET /foursquare?query=restaurants&near=Berlin&limit=10
```

#### Response
```json
{
  "results": [
    {
      "fsq_id": "4bf58dd8d48988d1c4941735",
      "name": "Restaurant Name",
      "location": {
        "address": "Street Address",
        "country": "Germany",
        "formatted_address": "Full Address",
        "locality": "Berlin",
        "lat": 52.520008,
        "lng": 13.404954
      },
      "categories": [
        {
          "id": "4bf58dd8d48988d1c4941735",
          "name": "Restaurant",
          "icon": "..."
        }
      ],
      "description": "Place description",
      "rating": 8.5,
      "price": 2,
      "photos": [
        {
          "id": "photo_id",
          "url": "https://...",
          "thumb": "https://..."
        }
      ],
      "hours": {...},
      "website": "https://...",
      "tel": "+49...",
      "email": "..."
    }
  ],
  "total": 10,
  "query": "restaurants",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### 2. Get Place Details
**Endpoint:** `/foursquarePlace`  
**Method:** GET  
**Description:** Get detailed information about a specific place

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fsq_id` | string | Yes | Foursquare place ID |

#### Example Request
```
GET /foursquarePlace?fsq_id=4bf58dd8d48988d1c4941735
```

#### Response
```json
{
  "place": {
    "fsq_id": "4bf58dd8d48988d1c4941735",
    "name": "Place Name",
    "location": {...},
    "categories": [...],
    "description": "Detailed description",
    "rating": 8.5,
    "photos": [...],
    "hours": {...},
    "website": "https://...",
    "social_media": {...},
    "tips": [...],
    "tastes": [...],
    "features": [...]
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### 3. Find Nearby Places
**Endpoint:** `/foursquareNearby`  
**Method:** GET  
**Description:** Find places near a specific location

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ll` | string | Yes | Location as "latitude,longitude" |
| `limit` | integer | No | Number of results (default: 20, max: 50) |
| `radius` | integer | No | Search radius in meters (default: 1000, max: 100000) |
| `categories` | string | No | Foursquare category IDs (comma-separated) |
| `sort` | string | No | Sort order: "DISTANCE", "POPULARITY" (default: "DISTANCE") |

#### Example Request
```
GET /foursquareNearby?ll=52.520008,13.404954&radius=2000&limit=20
```

#### Response
```json
{
  "results": [
    {
      "fsq_id": "...",
      "name": "Place Name",
      "location": {...},
      "categories": [...],
      "distance": 150,
      "rating": 8.2,
      "photos": [...]
    }
  ],
  "total": 20,
  "location": "52.520008,13.404954",
  "radius": 2000,
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### 4. Test Endpoint
**Endpoint:** `/test`  
**Method:** GET  
**Description:** Test if the API is working and configured correctly

#### Response
```json
{
  "message": "Firebase Functions çalışıyor!",
  "apiKey": "API Key mevcut",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": "Additional error information (if available)"
}
```

### Common Error Status Codes
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (invalid API key)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limits
Foursquare API has rate limits:
- **Free tier:** 5,000 requests/day
- **Personal tier:** 100,000 requests/day

## Migration Notes

### Breaking Changes from Mock Data
1. **Response structure:** Real API returns more detailed data
2. **Field names:** Some field names may differ from mock data
3. **Error handling:** Proper HTTP status codes and error messages
4. **Rate limits:** Real API has usage limits

### Frontend Updates Required
Update your frontend code to handle:
1. New response structure
2. Error responses with proper status codes
3. Loading states for API calls
4. Rate limit handling

## Development Setup

1. Set your Foursquare API key:
```bash
firebase functions:config:set foursquare.api_key="YOUR_API_KEY_HERE"
```

2. Deploy functions:
```bash
firebase deploy --only functions
```

3. Test the endpoints:
```bash
curl "https://your-region-your-project.cloudfunctions.net/test"
```

## Support

For issues or questions:
1. Check Firebase Functions logs
2. Verify API key configuration  
3. Check Foursquare API status
4. Review rate limit usage