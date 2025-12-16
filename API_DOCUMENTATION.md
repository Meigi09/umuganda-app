# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a valid JWT token obtained through NextAuth. Include it in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "timestamp": "2024-12-16T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  },
  "timestamp": "2024-12-16T10:30:00.000Z"
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Endpoints

### Authentication

#### Register User

```
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "cellId": "cell-123" // optional
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "COMMUNITY_MEMBER"
  }
}
```

**Error Cases:**

- `400` - Validation failed (missing fields, invalid email, weak password)
- `409` - Email already registered

---

### Posts

#### Create Post (Text)

```
POST /posts
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "content": "Our community cleaned the main road today. Great effort everyone!",
  "category": "CLEANING",
  "cellId": "cell-123",
  "sectorId": "sector-456",
  "districtId": "district-789",
  "hashtags": ["umuganda", "service", "community"]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "post-123",
    "content": "Our community cleaned...",
    "author": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "cell": { "name": "Kigali Cell" },
    "category": "CLEANING",
    "status": "PUBLISHED",
    "hashtags": ["#umuganda", "#service", "#community"],
    "createdAt": "2024-12-16T10:30:00Z"
  }
}
```

**Validation:**

- Content: required, 1-5000 characters
- Category: must be valid ActivityCategory
- Location IDs: must be valid and exist
- Hashtags: max 10, optional

---

#### Create Post (With Images)

```
POST /posts
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "content": "Built a water point for the community",
  "category": "CONSTRUCTION",
  "cellId": "cell-123",
  "sectorId": "sector-456",
  "districtId": "district-789",
  "images": [
    {
      "url": "https://cloudinary.com/image1.jpg",
      "publicId": "umuganda/image1", // optional
      "caption": "Before the work" // optional
    },
    {
      "url": "https://cloudinary.com/image2.jpg",
      "publicId": "umuganda/image2",
      "caption": "After completion"
    }
  ],
  "hashtags": ["water", "construction"]
}
```

**Validation:**

- Minimum 1 image required
- Maximum 5 images allowed
- All images must have valid URLs
- Other fields same as text posts

---

#### Get Posts (Feed)

```
GET /posts?limit=20&skip=0&cellId=cell-123&category=CLEANING
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit`: Number of posts (default: 20, max: 100)
- `skip`: Number to skip for pagination (default: 0)
- `cellId`: Filter by cell (optional)
- `sectorId`: Filter by sector (optional)
- `districtId`: Filter by district (optional)
- `category`: Filter by category (optional)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "post-123",
      "content": "Post content...",
      "author": {
        /* user object */
      },
      "cell": {
        /* cell object */
      },
      "category": "CLEANING",
      "status": "PUBLISHED",
      "images": [
        /* array of images */
      ],
      "comments": [
        /* recent comments */
      ],
      "reactions": [
        /* reaction objects */
      ],
      "reposts": [
        /* repost objects */
      ],
      "createdAt": "2024-12-16T10:30:00Z"
    }
    // ... more posts
  ]
}
```

---

### Comments

#### Add Comment

```
POST /comments
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "content": "Great work everyone! This is what community service is about.",
  "postId": "post-123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "comment-123",
    "content": "Great work everyone!...",
    "postId": "post-123",
    "author": {
      "id": "user-456",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "createdAt": "2024-12-16T10:35:00Z"
  }
}
```

**Validation:**

- Content: required, 1-500 characters
- Post must exist

---

#### Get Comments for Post

```
GET /comments?postId=post-123
```

**Query Parameters:**

- `postId`: The post ID (required)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "comment-123",
      "content": "Great work!",
      "author": {
        /* user object */
      },
      "reactions": [
        /* reactions to this comment */
      ],
      "createdAt": "2024-12-16T10:35:00Z"
    }
    // ... more comments
  ]
}
```

---

### Reactions

#### Add/Toggle Reaction

```
POST /reactions
Authorization: Bearer <token>
```

**Request Body (for Post):**

```json
{
  "type": "LIKE",
  "postId": "post-123"
}
```

**Request Body (for Comment):**

```json
{
  "type": "HELPFUL",
  "commentId": "comment-123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "reaction-123",
    "type": "LIKE",
    "postId": "post-123",
    "userId": "user-456",
    "createdAt": "2024-12-16T10:40:00Z"
  }
}
```

**Note:** Calling again with same type removes the reaction (toggle).

**Reaction Types:**

- `LIKE` - Standard like
- `LOVE` - Heart/love reaction
- `HELPFUL` - Helpful vote
- `INSPIRING` - Inspiring reaction

---

#### Get Reactions

```
GET /reactions?postId=post-123
```

**Query Parameters:**

- `postId`: Post ID (optional)
- `commentId`: Comment ID (optional)
- At least one required

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total": 42,
    "grouped": {
      "LIKE": [
        {
          "id": "reaction-123",
          "type": "LIKE",
          "user": {
            /* user object */
          }
        }
        // ... more LIKE reactions
      ],
      "LOVE": [
        /* love reactions */
      ],
      "HELPFUL": [
        /* helpful reactions */
      ]
    },
    "reactions": [
      /* all reactions */
    ]
  }
}
```

---

### Reposts

#### Create Repost

```
POST /reposts
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "postId": "post-123",
  "caption": "Everyone should see this great work!" // optional
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "repost-123",
    "postId": "post-123",
    "author": {
      /* user object */
    },
    "caption": "Everyone should see...",
    "post": {
      /* full post object */
    },
    "createdAt": "2024-12-16T10:45:00Z"
  }
}
```

**Validation:**

- Post must exist
- User cannot repost same post twice (409 Conflict)

---

#### Delete Repost

```
DELETE /reposts?id=repost-123
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Repost deleted"
  }
}
```

---

#### Get Reposts

```
GET /reposts?postId=post-123
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total": 15,
    "reposts": [
      {
        "id": "repost-123",
        "postId": "post-123",
        "author": {
          /* user object */
        },
        "caption": "Great work!",
        "createdAt": "2024-12-16T10:45:00Z"
      }
      // ... more reposts
    ]
  }
}
```

---

### Analytics

#### Get Summary Statistics

```
GET /analytics/summary?days=180
Authorization: Bearer <token>
```

**Query Parameters:**

- `days`: Number of days to analyze (default: 180 = 6 months)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-06-18T00:00:00Z",
      "endDate": "2024-12-16T23:59:59Z"
    },
    "national": {
      "totalPosts": 1250,
      "totalComments": 3450,
      "totalReactions": 8920,
      "totalReposts": 1205,
      "totalEngagement": 14825
    },
    "topCategories": [
      {
        "category": "CLEANING",
        "count": 450,
        "percentage": 36
      },
      {
        "category": "CONSTRUCTION",
        "count": 320,
        "percentage": 26
      }
      // ... more categories
    ],
    "topHashtags": [
      {
        "hashtag": "#umuganda",
        "count": 892,
        "percentage": 45
      },
      {
        "hashtag": "#service",
        "count": 654,
        "percentage": 33
      }
      // ... top 10 hashtags
    ],
    "cellStats": [
      {
        "name": "Kigali Cell",
        "id": "cell-123",
        "totalPosts": 145,
        "totalEngagement": 892,
        "engagementScore": 6.15,
        "topCategories": [
          {
            "category": "CLEANING",
            "count": 78,
            "percentage": 54
          }
          // ... top 5 categories
        ]
      }
      // ... more cells sorted by engagement
    ],
    "sectorStats": [
      /* same structure as cellStats */
    ],
    "districtStats": [
      /* same structure as cellStats */
    ],
    "lastUpdated": "2024-12-16T10:50:00Z"
  }
}
```

---

## Activity Categories

Valid values for `category` field:

- `CLEANING` - Community cleaning activities
- `CONSTRUCTION` - Building and infrastructure
- `ENVIRONMENT` - Environmental protection
- `HEALTH` - Health and hygiene
- `EDUCATION` - Education and learning
- `INFRASTRUCTURE` - Road, water, electricity
- `AGRICULTURE` - Farming and agriculture
- `SOCIAL_SERVICES` - Social support
- `OTHER` - Other activities

---

## Error Examples

### Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  },
  "timestamp": "2024-12-16T10:30:00Z"
}
```

### Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated"
  },
  "timestamp": "2024-12-16T10:30:00Z"
}
```

### Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Post not found"
  },
  "timestamp": "2024-12-16T10:30:00Z"
}
```

---

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Create Post

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Test post",
    "category": "CLEANING",
    "cellId": "cell-123",
    "sectorId": "sector-456",
    "districtId": "district-789"
  }'
```

### Get Posts

```bash
curl -X GET "http://localhost:3000/api/posts?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Rate Limiting

Currently not implemented. To be added in future versions.

---

## Pagination

All list endpoints support pagination:

- `limit`: Items per page (default: 20, max: 100)
- `skip`: Number of items to skip (default: 0)

Example:

```
GET /posts?limit=20&skip=40
```

This returns items 40-59.

---

## Sorting

Currently sorted by creation date (newest first). Sorting parameters to be added in future versions.

---

## Filtering

Supported filters vary by endpoint. See individual endpoints for details.

---

Last Updated: December 16, 2024  
Version: 1.0.0
