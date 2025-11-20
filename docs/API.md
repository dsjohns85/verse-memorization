# API Documentation

The Verse Memorization API provides endpoints for managing verses, reviews, and user data.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://your-container-app-url.azurecontainerapps.io`

## Authentication

In development, the API accepts a simple header:
```
X-User-Email: test@example.com
```

In production, the API uses Azure AD B2C authentication:
```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response**
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T14:00:00.000Z"
}
```

---

### Verses

#### GET /api/verses

Get all verses for the current user.

**Response**
```json
[
  {
    "id": "verse_id",
    "reference": "John 3:16",
    "text": "For God so loved the world...",
    "translation": "ESV",
    "userId": "user_id",
    "createdAt": "2025-11-19T14:00:00.000Z",
    "updatedAt": "2025-11-19T14:00:00.000Z",
    "reviews": [
      {
        "id": "review_id",
        "quality": 4,
        "easeFactor": 2.5,
        "interval": 6,
        "repetitions": 2,
        "nextReviewAt": "2025-11-25T14:00:00.000Z",
        "reviewedAt": "2025-11-19T14:00:00.000Z"
      }
    ]
  }
]
```

#### GET /api/verses/:id

Get a specific verse by ID.

**Parameters**
- `id` (path): Verse ID

**Response**
```json
{
  "id": "verse_id",
  "reference": "John 3:16",
  "text": "For God so loved the world...",
  "translation": "ESV",
  "userId": "user_id",
  "createdAt": "2025-11-19T14:00:00.000Z",
  "updatedAt": "2025-11-19T14:00:00.000Z",
  "reviews": [...]
}
```

#### GET /api/verses/due

Get all verses due for review.

**Response**
```json
[
  {
    "id": "verse_id",
    "reference": "John 3:16",
    "text": "For God so loved the world...",
    "translation": "ESV",
    "reviews": [...]
  }
]
```

#### GET /api/verses/stats

Get verse statistics for the current user.

**Response**
```json
{
  "totalVerses": 10,
  "versesDue": 3,
  "totalReviews": 45
}
```

#### POST /api/verses

Create a new verse.

**Request Body**
```json
{
  "reference": "John 3:16",
  "text": "For God so loved the world that he gave his one and only Son...",
  "translation": "ESV"
}
```

**Response**
```json
{
  "id": "verse_id",
  "reference": "John 3:16",
  "text": "For God so loved the world...",
  "translation": "ESV",
  "userId": "user_id",
  "createdAt": "2025-11-19T14:00:00.000Z",
  "updatedAt": "2025-11-19T14:00:00.000Z",
  "reviews": [...]
}
```

#### PUT /api/verses/:id

Update a verse.

**Parameters**
- `id` (path): Verse ID

**Request Body**
```json
{
  "reference": "John 3:16-17",
  "text": "Updated text...",
  "translation": "ESV"
}
```

**Response**
```json
{
  "id": "verse_id",
  "reference": "John 3:16-17",
  "text": "Updated text...",
  "translation": "ESV",
  ...
}
```

#### DELETE /api/verses/:id

Delete a verse.

**Parameters**
- `id` (path): Verse ID

**Response**
```json
{
  "message": "Verse deleted successfully"
}
```

---

### Reviews

#### POST /api/reviews

Create a new review (record a practice session).

**Request Body**
```json
{
  "verseId": "verse_id",
  "quality": 4
}
```

**Quality Scale**:
- `0`: Complete blackout
- `1`: Incorrect response; the correct one remembered
- `2`: Incorrect response; where the correct one seemed easy to recall
- `3`: Correct response recalled with serious difficulty
- `4`: Correct response after a hesitation
- `5`: Perfect response

**Response**
```json
{
  "id": "review_id",
  "verseId": "verse_id",
  "userId": "user_id",
  "quality": 4,
  "easeFactor": 2.6,
  "interval": 15,
  "repetitions": 3,
  "nextReviewAt": "2025-12-04T14:00:00.000Z",
  "reviewedAt": "2025-11-19T14:00:00.000Z",
  "verse": {...}
}
```

#### GET /api/reviews/verse/:verseId

Get all reviews for a specific verse.

**Parameters**
- `verseId` (path): Verse ID

**Response**
```json
[
  {
    "id": "review_id",
    "quality": 4,
    "easeFactor": 2.6,
    "interval": 15,
    "repetitions": 3,
    "nextReviewAt": "2025-12-04T14:00:00.000Z",
    "reviewedAt": "2025-11-19T14:00:00.000Z",
    "verse": {...}
  }
]
```

#### GET /api/reviews/history

Get review history for the current user.

**Query Parameters**
- `limit` (optional): Number of reviews to return (default: 50)

**Response**
```json
[
  {
    "id": "review_id",
    "quality": 4,
    "reviewedAt": "2025-11-19T14:00:00.000Z",
    "verse": {
      "id": "verse_id",
      "reference": "John 3:16",
      "text": "For God so loved the world..."
    }
  }
]
```

#### GET /api/reviews/stats

Get review statistics for the current user.

**Query Parameters**
- `days` (optional): Number of days to include (default: 30)

**Response**
```json
{
  "totalReviews": 45,
  "averageQuality": 4.2,
  "reviewsByDate": {
    "2025-11-19": {
      "count": 5,
      "totalQuality": 21
    },
    "2025-11-18": {
      "count": 3,
      "totalQuality": 13
    }
  },
  "days": 30
}
```

---

### Users

#### GET /api/users/me

Get current user information.

**Response**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-11-01T00:00:00.000Z",
  "updatedAt": "2025-11-19T14:00:00.000Z"
}
```

#### PUT /api/users/me

Update current user information.

**Request Body**
```json
{
  "name": "John Doe"
}
```

**Response**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-11-01T00:00:00.000Z",
  "updatedAt": "2025-11-19T14:00:00.000Z"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "message": "Error description",
    "stack": "..." // Only in development
  }
}
```

### Common Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, there is no rate limiting implemented. This should be added for production use.

## Webhooks

Not currently implemented. Future enhancement.
