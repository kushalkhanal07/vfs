# Quick Reference - API Endpoints

## Base URL: `http://localhost:4000`
## All requests need: `credentials: 'include'` for cookies

---

## USER PROFILE

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/user/me` | GET | Get user profile |
| `/user/dashboard-profile` | GET | Get profile with stats |

---

## NOTES

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notes` | POST | Create note |
| `/api/notes` | GET | Get all notes (with filters) |
| `/api/notes/:id` | GET | Get single note |
| `/api/notes/:id` | PUT | Update note |
| `/api/notes/:id` | DELETE | Delete note |
| `/api/notes/:id/pin` | PATCH | Toggle pin |
| `/api/notes/:id/archive` | PATCH | Toggle archive |
| `/api/notes/:id/favorite` | PATCH | Toggle favorite |
| `/api/notes/recent` | GET | Get recent notes |
| `/api/notes/date/:date` | GET | Get notes by date (YYYY-MM-DD) |

---

## REVISION (SM-2 Spaced Repetition)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/revision/add` | POST | Add to revision queue |
| `/api/revision/review` | POST | Submit review (score 0-5) |
| `/api/revision/today` | GET | Get today's revisions |
| `/api/revision/upcoming` | GET | Get upcoming revisions |
| `/api/revision/history` | GET | Get review history |
| `/api/revision/stats` | GET | Get revision statistics |
| `/api/revision/:scheduleId` | DELETE | Remove from revision |

---

## NOTIFICATIONS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notifications` | GET | Get all notifications |
| `/api/notifications/unread-count` | GET | Get unread count |
| `/api/notifications/:id/read` | PUT | Mark as read |
| `/api/notifications/read-all` | PUT | Mark all as read |
| `/api/notifications/:id` | DELETE | Delete notification |

---

## SEARCH

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/search` | GET | Global search |
| `/api/search/notes` | GET | Search notes only |
| `/api/search/files` | GET | Search files only |
| `/api/search/folders` | GET | Search folders only |
| `/api/search/suggestions` | GET | Get search suggestions |
| `/api/search/recent` | GET | Get recent searches |
| `/api/search/history/clear` | DELETE | Clear search history |

---

## DASHBOARD

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard/overview` | GET | Dashboard overview |
| `/api/dashboard/recent-notes` | GET | Recent notes |
| `/api/dashboard/recent-files` | GET | Recent files |
| `/api/dashboard/revision-summary` | GET | Revision stats |
| `/api/dashboard/activity` | GET | Activity last 7 days |
| `/api/dashboard/streak` | GET | Study streak |
| `/api/dashboard/recommendations` | GET | Learning recommendations |
| `/api/dashboard/stats` | GET | All dashboard data |

---

## Common Query Parameters

```
limit=50          // Number of items to return
skip=0            // Items to skip (pagination)
archived=true     // Filter by archive status
favorite=true     // Filter by favorite
pinned=true       // Filter by pin status
folder=id         // Filter by folder
q=search          // Search query
days=30           // Look ahead days
```

---

## Create Note Example

```javascript
POST /api/notes
{
  "title": "My Note",
  "content": "Note content here",
  "tags": ["tag1", "tag2"],
  "folderId": "optional_folder_id"
}
```

---

## Submit Review Example

```javascript
POST /api/revision/review
{
  "scheduleId": "schedule_id",
  "reviewScore": 4,        // 0-5 (0-2=fail, 3-5=pass)
  "timeSpent": 300,        // seconds
  "notes": "optional notes"
}
```

---

## Search Examples

```
/api/search?q=javascript
/api/search/notes?q=async
/api/search/suggestions?q=jav
/api/search/recent?limit=10
```

---

## Dashboard Examples

```
/api/dashboard/overview
/api/dashboard/stats
/api/dashboard/streak
/api/dashboard/activity
/api/dashboard/recommendations
```

---

## Frontend Integration Pattern

```javascript
// 1. Wrap API calls with error handling
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`http://localhost:4000${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  return await response.json();
}

// 2. Use it everywhere
const notes = await apiCall('/api/notes');
const newNote = await apiCall('/api/notes', {
  method: 'POST',
  body: JSON.stringify({ title: '...', content: '...' })
});
const searchResults = await apiCall(`/api/search?q=${query}`);
```

---

## Response Format

### Success (200, 201)
```json
{
  "message": "Action successful",
  "data": { /* relevant data */ }
}
```

### Error (400, 401, 403, 404, 500)
```json
{
  "error": "Error description"
}
```

---

## HTTP Status Codes

- **200** - OK (GET, PUT, PATCH successful)
- **201** - Created (POST successful)
- **204** - No Content (DELETE successful)
- **400** - Bad Request (Invalid input)
- **401** - Unauthorized (Not logged in)
- **403** - Forbidden (No permission)
- **404** - Not Found (Resource doesn't exist)
- **500** - Server Error

---

## Review Score Guide

| Score | Meaning | Impact |
|-------|---------|--------|
| 0-2 | Failed | Restart learning, review tomorrow |
| 3 | Barely passed | Continue with minimal interval |
| 4 | Good | Follow SM-2 schedule normally |
| 5 | Perfect | Maximum interval increase |

---

## Priority Levels

- `High` - Important, review frequently
- `Medium` - Normal learning pace
- `Low` - Optional, review when time permits

---

## Notification Types

- `revision_reminder` - Time to review
- `missed_revision` - Deadline passed
- `study_streak` - Streak achieved
- `deadline_reminder` - Important date
- `upload_success` - File uploaded
- `learning_recommendation` - Suggested content
- `system` - General notification

---

## Search Features

- **TF-IDF Ranking** - Intelligent relevance scoring
- **Fuzzy Matching** - Handles typos
- **Tag Search** - Search by tags
- **Full-Text Search** - Search content and titles
- **Search History** - Auto-tracked
- **Suggestions** - Smart suggestions while typing

---

## SM-2 Algorithm Summary

```
EASY (score 5):  interval = interval × easeFactor
GOOD (score 4):  interval = interval × easeFactor  
PASS (score 3):  interval = interval × easeFactor (minimal)
FAIL (score <3): interval = 1 (restart)
```

---

## Soft Delete

Notes use soft delete pattern:
- `deleted: false` - Active (default)
- `deleted: true` - Archived/deleted
- Data never permanently removed

---

## Indexes for Performance

All models have optimized indexes:
- User queries fast
- Date-range queries fast
- Tag searches fast
- Search ranking fast

---

## Testing Checklist

- [ ] Create note works
- [ ] Update note works
- [ ] Delete note works (soft delete)
- [ ] Pin/archive/favorite works
- [ ] Search returns results
- [ ] Add to revision works
- [ ] Submit review updates schedule
- [ ] Dashboard loads
- [ ] Notifications fetch
- [ ] Profile loads with stats

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Login first, check cookies |
| 404 Not Found | Verify ID exists and belongs to user |
| 400 Bad Request | Check request body format |
| Empty search results | Query might have only stop words |
| Revision not updating | Must submit review with valid score |

---

## Environment Variables

All use existing config from `server/config/appConfig.js`:
- `DB_URL` - MongoDB connection
- `PORT` - Server port (default: 4000)
- `CLIENT_ORIGIN` - CORS origin
- `SECRET_KEY` - Cookie signing key

---

## Useful Endpoints for Common Tasks

| Task | Endpoint |
|------|----------|
| Show dashboard | GET /api/dashboard/stats |
| Get study info | GET /user/dashboard-profile |
| Start learning session | GET /api/revision/today |
| Find something | GET /api/search?q=... |
| Track progress | GET /api/revision/stats |
| Check notifications | GET /api/notifications |

---

