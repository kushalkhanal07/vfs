# Complete Backend API Documentation

## Base URL
```
http://localhost:4000
```

## Authentication
All endpoints except auth endpoints require authenticated user session via JWT cookie (`sid`).

---

## 1. USER PROFILE APIs

### 1.1 Get User Profile
```
GET /user/me
```
**Description:** Get logged-in user profile details
**Auth:** Required ✅
**Response:**
```json
{
  "_id": "65a1234567890abcdef12345",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://example.com/picture.jpg",
  "role": "User",
  "status": "Active",
  "storageUsed": 1048576,
  "storageLimit": 5242880
}
```

---

### 1.2 Get Dashboard Profile
```
GET /user/dashboard-profile
```
**Description:** Get user profile with dashboard stats
**Auth:** Required ✅
**Response:**
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://example.com/picture.jpg",
    "role": "User",
    "subscriptionActive": false,
    "loginProvider": "google"
  },
  "stats": {
    "totalNotes": 42,
    "totalFiles": 15,
    "upcomingRevisions": 8,
    "revisionStreak": 5
  }
}
```

---

## 2. NOTES APIs

### 2.1 Create Note
```
POST /api/notes
```
**Auth:** Required ✅
**Request Body:**
```json
{
  "title": "My Note Title",
  "content": "Rich text content here...",
  "folderId": "65a1234567890abcdef12345",
  "tags": ["important", "review"]
}
```
**Response:**
```json
{
  "message": "Note created",
  "note": {
    "_id": "65a1234567890abcdef12346",
    "title": "My Note Title",
    "content": "Rich text content here...",
    "userId": "65a1234567890abcdef12345",
    "folderId": "65a1234567890abcdef12345",
    "tags": ["important", "review"],
    "isPinned": false,
    "isArchived": false,
    "isFavorite": false,
    "wordCount": 5,
    "deleted": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2.2 Get All Notes
```
GET /api/notes?archived=false&favorite=false&pinned=false&folder=65a1234567890abcdef12345
```
**Auth:** Required ✅
**Query Parameters:**
- `archived` (boolean) - Filter archived notes
- `favorite` (boolean) - Filter favorite notes
- `pinned` (boolean) - Filter pinned notes
- `folder` (string) - Filter by folder ID

**Response:**
```json
{
  "notes": [
    {
      "_id": "65a1234567890abcdef12346",
      "title": "Note Title",
      "content": "...",
      "tags": ["tag1"],
      "isPinned": true,
      "isArchived": false,
      "isFavorite": true,
      "lastEditedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### 2.3 Get Single Note
```
GET /api/notes/:id
```
**Auth:** Required ✅
**Response:** Full note object

---

### 2.4 Update Note
```
PUT /api/notes/:id
```
**Auth:** Required ✅
**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["updated", "tags"],
  "folderId": "65a1234567890abcdef12325"
}
```

---

### 2.5 Delete Note (Soft Delete)
```
DELETE /api/notes/:id
```
**Auth:** Required ✅

---

### 2.6 Pin/Unpin Note
```
PATCH /api/notes/:id/pin
```
**Auth:** Required ✅
**Response:**
```json
{
  "message": "Pin status updated",
  "isPinned": true
}
```

---

### 2.7 Archive/Unarchive Note
```
PATCH /api/notes/:id/archive
```
**Auth:** Required ✅
**Response:**
```json
{
  "message": "Archive status updated",
  "isArchived": true
}
```

---

### 2.8 Favorite/Unfavorite Note
```
PATCH /api/notes/:id/favorite
```
**Auth:** Required ✅
**Response:**
```json
{
  "message": "Favorite status updated",
  "isFavorite": true
}
```

---

### 2.9 Get Recent Notes
```
GET /api/notes/recent?limit=10
```
**Auth:** Required ✅
**Query Parameters:**
- `limit` (number) - Number of notes to return (default: 10)

---

### 2.10 Get Notes by Date
```
GET /api/notes/date/:date
```
**Auth:** Required ✅
**Parameters:**
- `date` (string) - Date in YYYY-MM-DD format

---

## 3. REVISION (SM-2 Spaced Repetition) APIs

### 3.1 Add Content to Revision
```
POST /api/revision/add
```
**Auth:** Required ✅
**Request Body:**
```json
{
  "contentId": "65a1234567890abcdef12346",
  "contentType": "note",
  "priority": "High"
}
```
**Content Types:** `"note"`, `"file"`, `"folder"`
**Priority Levels:** `"High"`, `"Medium"`, `"Low"`

**Response:**
```json
{
  "message": "Added to revision",
  "schedule": {
    "_id": "65a1234567890abcdef12350",
    "userId": "65a1234567890abcdef12325",
    "contentId": "65a1234567890abcdef12346",
    "contentType": "note",
    "nextReviewDate": "2024-01-16T10:30:00Z",
    "priority": "High",
    "easeFactor": 2.5,
    "repetitionCount": 0,
    "interval": 1,
    "isActive": true
  }
}
```

---

### 3.2 Submit Review
```
POST /api/revision/review
```
**Auth:** Required ✅
**Request Body:**
```json
{
  "scheduleId": "65a1234567890abcdef12350",
  "reviewScore": 4,
  "timeSpent": 120,
  "notes": "Good review session"
}
```
**Review Score:** 0-5 (0-2 = failed, 3-5 = passed)
**Time Spent:** In seconds

**Response:**
```json
{
  "message": "Review submitted",
  "history": {
    "_id": "65a1234567890abcdef12351",
    "userId": "65a1234567890abcdef12325",
    "revisionScheduleId": "65a1234567890abcdef12350",
    "contentId": "65a1234567890abcdef12346",
    "contentType": "note",
    "reviewScore": 4,
    "timeSpent": 120,
    "notes": "Good review session",
    "reviewDate": "2024-01-15T10:30:00Z",
    "nextEaseFactor": 2.6,
    "nextInterval": 3,
    "nextRepetitionCount": 1
  },
  "nextSchedule": {
    "nextReviewDate": "2024-01-18T10:30:00Z",
    "easeFactor": 2.6,
    "interval": 3,
    "repetitionCount": 1
  }
}
```

---

### 3.3 Get Today's Revisions
```
GET /api/revision/today
```
**Auth:** Required ✅
**Response:**
```json
{
  "revisions": [
    {
      "_id": "65a1234567890abcdef12350",
      "contentType": "note",
      "priority": "High",
      "nextReviewDate": "2024-01-15T10:30:00Z",
      "content": {
        "_id": "65a1234567890abcdef12346",
        "title": "Note to Review",
        "tags": ["important"]
      }
    }
  ],
  "count": 1
}
```

---

### 3.4 Get Upcoming Revisions
```
GET /api/revision/upcoming?days=30
```
**Auth:** Required ✅
**Query Parameters:**
- `days` (number) - Look ahead days (default: 30)

**Response:**
```json
{
  "grouped": {
    "2024-01-16": [
      { "_id": "...", "contentType": "note", "priority": "High" }
    ],
    "2024-01-17": [
      { "_id": "...", "contentType": "file", "priority": "Medium" }
    ]
  }
}
```

---

### 3.5 Get Revision History
```
GET /api/revision/history?limit=50
```
**Auth:** Required ✅

---

### 3.6 Get Revision Stats
```
GET /api/revision/stats
```
**Auth:** Required ✅
**Response:**
```json
{
  "activeRevisions": 15,
  "completedRevisions": 5,
  "stats": {
    "totalReviews": 20,
    "averageQuality": 3.5,
    "successRate": 75,
    "averageTimeSpent": 150
  }
}
```

---

### 3.7 Remove from Revision
```
DELETE /api/revision/:scheduleId
```
**Auth:** Required ✅

---

## 4. NOTIFICATION APIs

### 4.1 Get All Notifications
```
GET /api/notifications?limit=50&skip=0
```
**Auth:** Required ✅
**Response:**
```json
{
  "notifications": [
    {
      "_id": "65a1234567890abcdef12352",
      "userId": "65a1234567890abcdef12325",
      "title": "Revision Reminder",
      "message": "You have 5 revisions due today",
      "type": "revision_reminder",
      "isRead": false,
      "metadata": { "contentId": "..." },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 10
}
```

---

### 4.2 Get Unread Count
```
GET /api/notifications/unread-count
```
**Auth:** Required ✅
**Response:**
```json
{
  "unreadCount": 3
}
```

---

### 4.3 Mark Notification as Read
```
PUT /api/notifications/:id/read
```
**Auth:** Required ✅

---

### 4.4 Mark All as Read
```
PUT /api/notifications/read-all
```
**Auth:** Required ✅

---

### 4.5 Delete Notification
```
DELETE /api/notifications/:id
```
**Auth:** Required ✅

---

## 5. SEARCH APIs

### 5.1 Global Search
```
GET /api/search?q=keyword
```
**Auth:** Required ✅
**Query Parameters:**
- `q` (string) - Search query

**Response:**
```json
{
  "results": [
    {
      "_id": "65a1234567890abcdef12346",
      "type": "note",
      "title": "My Note",
      "relevanceScore": 0.85
    },
    {
      "_id": "65a1234567890abcdef12347",
      "type": "file",
      "name": "Document.pdf",
      "relevanceScore": 0.72
    }
  ],
  "total": 2
}
```

---

### 5.2 Search Notes
```
GET /api/search/notes?q=keyword
```
**Auth:** Required ✅

---

### 5.3 Search Files
```
GET /api/search/files?q=keyword
```
**Auth:** Required ✅

---

### 5.4 Search Folders
```
GET /api/search/folders?q=keyword
```
**Auth:** Required ✅

---

### 5.5 Get Search Suggestions
```
GET /api/search/suggestions?q=key
```
**Auth:** Required ✅
**Response:**
```json
{
  "suggestions": ["keyword", "key term", "key notes"]
}
```

---

### 5.6 Get Recent Searches
```
GET /api/search/recent?limit=10
```
**Auth:** Required ✅
**Response:**
```json
{
  "searches": ["recent query", "previous search", "old search"]
}
```

---

### 5.7 Clear Search History
```
DELETE /api/search/history/clear
```
**Auth:** Required ✅

---

## 6. DASHBOARD APIs

### 6.1 Get Dashboard Overview
```
GET /api/dashboard/overview
```
**Auth:** Required ✅
**Response:**
```json
{
  "user": {
    "_id": "65a1234567890abcdef12325",
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://example.com/pic.jpg",
    "role": "User"
  },
  "stats": {
    "totalNotes": 42,
    "totalArchived": 5,
    "totalFavorites": 8,
    "totalFolders": 3,
    "totalFiles": 15,
    "todayRevisions": 5,
    "upcomingRevisions": 12
  }
}
```

---

### 6.2 Get Recent Notes
```
GET /api/dashboard/recent-notes?limit=5
```
**Auth:** Required ✅

---

### 6.3 Get Recent Files
```
GET /api/dashboard/recent-files?limit=5
```
**Auth:** Required ✅

---

### 6.4 Get Revision Summary
```
GET /api/dashboard/revision-summary
```
**Auth:** Required ✅
**Response:**
```json
{
  "completed": 10,
  "pending": 5,
  "byPriority": {
    "high": 3,
    "medium": 1,
    "low": 1
  }
}
```

---

### 6.5 Get Activity Summary
```
GET /api/dashboard/activity
```
**Auth:** Required ✅
**Response:**
```json
{
  "notesCreated": 3,
  "notesEdited": 7,
  "filesUploaded": 2,
  "revisionsCompleted": 15
}
```

---

### 6.6 Get Study Streak
```
GET /api/dashboard/streak
```
**Auth:** Required ✅
**Response:**
```json
{
  "currentStreak": 7,
  "longestStreak": 14
}
```

---

### 6.7 Get Learning Recommendations
```
GET /api/dashboard/recommendations
```
**Auth:** Required ✅
**Response:**
```json
{
  "reviewAgain": [
    {
      "contentId": "65a1234567890abcdef12346"
    }
  ],
  "oldNotes": [
    {
      "_id": "65a1234567890abcdef12347",
      "title": "Old Note from 30 days ago"
    }
  ],
  "unvisitedNotes": [
    {
      "_id": "65a1234567890abcdef12348",
      "title": "Note not visited in 60 days"
    }
  ]
}
```

---

### 6.8 Get Complete Stats
```
GET /api/dashboard/stats
```
**Auth:** Required ✅
Returns combined data from all dashboard endpoints

---

## Error Responses

All endpoints follow this error format:
```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes:
- `200 OK` - Successful GET/PUT/PATCH request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - No permission or content not found
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## SM-2 Algorithm Details

The SM-2 (Super-Memo 2) algorithm is used for spacing reviews:

**Review Score Interpretation:**
- 0-2: Failed (restart from beginning)
- 3-4: Passed (continue with increased interval)
- 5: Perfect (highest increase)

**Key Formula:**
```
newEaseFactor = EF + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
interval(1) = 1 day
interval(2) = 3 days
interval(n>2) = interval(n-1) * easeFactor
```

Where `q` is the review score (0-5)

---

## Best Practices

1. **Always use authenticated endpoints** - All new endpoints require `checkAuth`
2. **Handle pagination** - Use `limit` and `skip` for large datasets
3. **Soft deletes** - Notes use soft deletes (deleted flag), permanently removed data is rare
4. **Error handling** - Always check error response format
5. **Search** - Global search uses TF-IDF ranking for best results
6. **Revisions** - Submit reviews regularly to get accurate next review dates
7. **Tags** - Use tags to organize and search notes efficiently

---

## Integration Example (Frontend)

```javascript
// Get logged-in user profile
const response = await fetch('http://localhost:4000/user/me', {
  method: 'GET',
  credentials: 'include', // Include cookies
  headers: { 'Content-Type': 'application/json' }
});
const user = await response.json();

// Create a note
const noteRes = await fetch('http://localhost:4000/api/notes', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Note',
    content: 'Note content',
    tags: ['learning']
  })
});
const newNote = await noteRes.json();

// Search
const searchRes = await fetch('http://localhost:4000/api/search?q=learning', {
  credentials: 'include'
});
const results = await searchRes.json();

// Add to revision
const revRes = await fetch('http://localhost:4000/api/revision/add', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contentId: newNote.note._id,
    contentType: 'note',
    priority: 'High'
  })
});
```

---

## Notification Types

- `revision_reminder` - Time to review something
- `missed_revision` - Revision deadline passed
- `study_streak` - Streak milestone achieved
- `deadline_reminder` - Important date approaching
- `upload_success` - File uploaded successfully
- `learning_recommendation` - AI-suggested content
- `system` - General system notification

