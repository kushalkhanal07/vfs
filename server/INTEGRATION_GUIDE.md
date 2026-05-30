# Backend Module Integration Guide

## 📋 Overview

This guide explains how to integrate and use the newly added modules in your MERN backend:

1. **User Profile Integration** - Fetch user data with stats
2. **Notes Module** - Complete note management system
3. **Smart Search** - TF-IDF powered intelligent search
4. **Revision System** - SM-2 spaced repetition algorithm
5. **Notifications** - Real-time notification system
6. **Dashboard** - Comprehensive dashboard aggregations

---

## ⚙️ Installation & Setup

### 1. Verify Database Connection
The modules use your existing MongoDB connection:
```javascript
// Already configured in server/config/db.js
// All modules auto-use the connected database
```

### 2. Check Models Are Registered
All models are auto-registered on server startup:
- ✅ `Note` - For note management
- ✅ `RevisionSchedule` - For SM-2 scheduling
- ✅ `RevisionHistory` - For revision tracking
- ✅ `Notification` - For notifications
- ✅ `SearchHistory` - For search analytics

### 3. Verify Routes Are Mounted
All new routes are mounted in `app.js`:
```javascript
app.use("/api/notes", notesRoutes);
app.use("/api/revision", revisionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/dashboard", dashboardRoutes);
```

### 4. Update Node Dependencies
If needed, ensure you have all required packages:
```bash
cd server
npm install  # Should already be installed
```

### 5. Restart Server
```bash
npm start  # Server will auto-initialize all models
```

---

## 🚀 Quick Start Examples

### Example 1: Create and Manage Notes

```javascript
// Create a note
const createNote = async (token) => {
  const response = await fetch('http://localhost:4000/api/notes', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'JavaScript Concepts',
      content: 'Closures, async/await, promises...',
      tags: ['javascript', 'learning'],
      folderId: null // Optional folder ID
    })
  });
  return await response.json();
};

// Get all notes with filters
const getNotes = async (archived = false, favorite = false) => {
  const query = new URLSearchParams({
    archived: archived.toString(),
    favorite: favorite.toString()
  });
  const response = await fetch(`http://localhost:4000/api/notes?${query}`, {
    credentials: 'include'
  });
  return await response.json();
};

// Update a note
const updateNote = async (noteId, updates) => {
  const response = await fetch(`http://localhost:4000/api/notes/${noteId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return await response.json();
};

// Pin a note
const togglePin = async (noteId) => {
  const response = await fetch(`http://localhost:4000/api/notes/${noteId}/pin`, {
    method: 'PATCH',
    credentials: 'include'
  });
  return await response.json();
};
```

---

### Example 2: Spaced Repetition Workflow

```javascript
// 1. Add content to revision queue
const addToRevision = async (contentId, contentType = 'note', priority = 'High') => {
  const response = await fetch('http://localhost:4000/api/revision/add', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentId,
      contentType,
      priority
    })
  });
  return await response.json();
};

// 2. Get today's revisions
const getTodayRevisions = async () => {
  const response = await fetch('http://localhost:4000/api/revision/today', {
    credentials: 'include'
  });
  return await response.json();
};

// 3. Submit a review
const submitReview = async (scheduleId, reviewScore, timeSpent) => {
  const response = await fetch('http://localhost:4000/api/revision/review', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scheduleId,
      reviewScore, // 0-5 (0-2 = failed, 3-5 = passed)
      timeSpent, // in seconds
      notes: 'Review session notes' // optional
    })
  });
  return await response.json();
};

// 4. Track study streak
const getStudyStreak = async () => {
  const response = await fetch('http://localhost:4000/api/dashboard/streak', {
    credentials: 'include'
  });
  return await response.json();
};

// 5. Get revision statistics
const getRevisionStats = async () => {
  const response = await fetch('http://localhost:4000/api/revision/stats', {
    credentials: 'include'
  });
  return await response.json();
};
```

---

### Example 3: Intelligent Search

```javascript
// Global search across notes, files, and folders
const globalSearch = async (query) => {
  const response = await fetch(
    `http://localhost:4000/api/search?q=${encodeURIComponent(query)}`,
    { credentials: 'include' }
  );
  return await response.json();
};

// Search specific type
const searchNotes = async (query) => {
  const response = await fetch(
    `http://localhost:4000/api/search/notes?q=${encodeURIComponent(query)}`,
    { credentials: 'include' }
  );
  return await response.json();
};

// Get search suggestions
const getSearchSuggestions = async (partial) => {
  const response = await fetch(
    `http://localhost:4000/api/search/suggestions?q=${encodeURIComponent(partial)}`,
    { credentials: 'include' }
  );
  return await response.json();
};

// Get recent searches
const getRecentSearches = async () => {
  const response = await fetch('http://localhost:4000/api/search/recent?limit=10', {
    credentials: 'include'
  });
  return await response.json();
};
```

---

### Example 4: Notifications

```javascript
// Get all notifications
const getNotifications = async (limit = 50, skip = 0) => {
  const query = new URLSearchParams({ limit, skip });
  const response = await fetch(
    `http://localhost:4000/api/notifications?${query}`,
    { credentials: 'include' }
  );
  return await response.json();
};

// Get unread count
const getUnreadCount = async () => {
  const response = await fetch('http://localhost:4000/api/notifications/unread-count', {
    credentials: 'include'
  });
  return await response.json();
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  const response = await fetch(
    `http://localhost:4000/api/notifications/${notificationId}/read`,
    {
      method: 'PUT',
      credentials: 'include'
    }
  );
  return await response.json();
};

// Mark all as read
const markAllAsRead = async () => {
  const response = await fetch('http://localhost:4000/api/notifications/read-all', {
    method: 'PUT',
    credentials: 'include'
  });
  return await response.json();
};
```

---

### Example 5: Dashboard Data

```javascript
// Get complete dashboard overview
const getDashboardOverview = async () => {
  const response = await fetch('http://localhost:4000/api/dashboard/overview', {
    credentials: 'include'
  });
  return await response.json();
};

// Get all dashboard stats at once
const getCompleteStats = async () => {
  const response = await fetch('http://localhost:4000/api/dashboard/stats', {
    credentials: 'include'
  });
  return await response.json();
};

// Get recent notes for dashboard
const getRecentNotes = async (limit = 5) => {
  const response = await fetch(
    `http://localhost:4000/api/dashboard/recent-notes?limit=${limit}`,
    { credentials: 'include' }
  );
  return await response.json();
};

// Get activity summary (last 7 days)
const getActivity = async () => {
  const response = await fetch('http://localhost:4000/api/dashboard/activity', {
    credentials: 'include'
  });
  return await response.json();
};

// Get learning recommendations
const getRecommendations = async () => {
  const response = await fetch('http://localhost:4000/api/dashboard/recommendations', {
    credentials: 'include'
  });
  return await response.json();
};
```

---

## 🔄 Workflow Examples

### Workflow 1: Note-Taking & Revision

```javascript
// Step 1: Create note during study
const note = await createNote({
  title: 'React Hooks',
  content: 'useState, useEffect, useContext...',
  tags: ['react', 'hooks']
});

// Step 2: Mark important, pin it
await togglePin(note.note._id);

// Step 3: Add to revision when done with section
await addToRevision(note.note._id, 'note', 'High');

// Step 4: Review today
const todayRevisions = await getTodayRevisions();

// Step 5: Submit review after reading
await submitReview(
  todayRevisions.revisions[0]._id,
  4, // Review score 4/5
  300 // Spent 5 minutes
);
```

---

### Workflow 2: Search & Discovery

```javascript
// User searches for content
const results = await globalSearch('async programming');

// Results contain ranked items
// {
//   results: [
//     { type: 'note', title: '...', relevanceScore: 0.95 },
//     { type: 'file', name: '...', relevanceScore: 0.87 }
//   ]
// }

// Show suggestions while typing
const suggestions = await getSearchSuggestions('async');

// Track search in history automatically (happens on search)
```

---

### Workflow 3: Dashboard Summary

```javascript
// Load dashboard with all stats
const dashData = await getCompleteStats();

// Data structure:
// {
//   overview: { user, stats },
//   streak: { currentStreak, longestStreak },
//   activity: { notesCreated, revisionsCompleted, ... },
//   recommendations: { reviewAgain, oldNotes, unvisitedNotes }
// }

// Show summary widgets
showDashboardWidget('Study Streak', dashData.streak.currentStreak);
showDashboardWidget('Notes Created This Week', dashData.activity.notesCreated);
showDashboardWidget('Revisions Due', dashData.overview.stats.todayRevisions);
```

---

## 🔐 Authentication & Security

All endpoints use the existing authentication middleware:

```javascript
// Session is managed via signed cookie (sid)
// Automatically included when:
credentials: 'include'  // is set in fetch options

// req.user is populated by authMiddleware
// Contains: _id, name, email, role, status
```

**Security Features:**
- ✅ Signed cookies (verified by secret key)
- ✅ User ownership validation (all queries filtered by userId)
- ✅ Authorization middleware on sensitive operations
- ✅ Soft deletes (data never permanently deleted)
- ✅ Input validation on all endpoints

---

## 📊 SM-2 Algorithm Details

The spaced repetition system uses the proven SM-2 algorithm:

**Review Score Meanings:**
- **0-2**: Difficulty too high, repeat tomorrow
- **3**: Barely passed, increase interval minimally
- **4**: Good review, follow SM-2 schedule
- **5**: Perfect recall, maximize interval

**Example Schedule:**
```
Review 1: Today (Score: 4)
  → Next: 3 days (interval × 1.0)

Review 2: 3 days later (Score: 5)
  → Next: 9 days (interval × 3.0)

Review 3: 9 days later (Score: 4)
  → Next: 27 days (interval × 3.0)
```

**Ease Factor:**
- Starts at 2.5
- Increases with high scores
- Decreases with low scores
- Minimum: 1.3

---

## 🔍 Search Algorithm

Uses TF-IDF (Term Frequency-Inverse Document Frequency):

1. **Tokenization**: Split text into words, remove stop words
2. **TF Calculation**: How often term appears in document
3. **IDF Calculation**: How unique term is across all documents
4. **TF-IDF Score**: TF × IDF for each term
5. **Ranking**: Sort results by total TF-IDF score
6. **Fuzzy Matching**: Handle typos with Levenshtein distance

**Example:**
```
Query: "javascript"
Results ranked by relevance:
1. "JavaScript Fundamentals" (score: 0.95) ← exact match, recent
2. "Learning JS concepts" (score: 0.87) ← fuzzy match
3. "Programming languages" (score: 0.42) ← tangential
```

---

## 📝 Database Indexes

All models have optimized indexes for common queries:

```javascript
// Notes
- userId, isArchived, deleted
- userId, tags
- userId, folderId
- userId, lastEditedAt
- Full-text search on content, title, tags

// Revision
- userId, nextReviewDate
- userId, isActive, dueToday
- userId, priority

// Notifications
- userId, createdAt
- userId, isRead

// Search History
- userId, createdAt
- userId, query
```

---

## 🚨 Error Handling

All controllers include try-catch error handling:

```javascript
try {
  // Operation
  const result = await Model.find(...);
  res.json(result);
} catch (err) {
  next(err); // Passes to Express error middleware
}
```

**Error Response Format:**
```json
{
  "error": "Descriptive error message",
  "status": 400
}
```

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Create note
curl -X POST http://localhost:4000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "content": "Test content",
    "tags": ["test"]
  }' \
  --cookie "sid=your_session_id"

# Search
curl "http://localhost:4000/api/search?q=test" \
  --cookie "sid=your_session_id"

# Get revisions
curl http://localhost:4000/api/revision/today \
  --cookie "sid=your_session_id"
```

### Using Postman

1. Set Base URL: `http://localhost:4000`
2. Add Cookie: `sid=your_session_cookie_value`
3. Create requests for each endpoint
4. Import API_DOCUMENTATION.md for endpoint details

---

## 📦 File Structure

```
server/
├── models/
│   ├── noteModel.js              (new)
│   ├── revisionScheduleModel.js  (new)
│   ├── revisionHistoryModel.js   (new)
│   ├── notificationModel.js      (new)
│   ├── searchHistoryModel.js     (new)
│   └── ... existing models
├── controllers/
│   ├── notesController.js        (new)
│   ├── revisionController.js     (new)
│   ├── notificationController.js (new)
│   ├── searchController.js       (new)
│   ├── dashboardController.js    (new)
│   └── ... existing controllers
├── routes/
│   ├── notesRoutes.js            (new)
│   ├── revisionRoutes.js         (new)
│   ├── notificationRoutes.js     (new)
│   ├── searchRoutes.js           (new)
│   ├── dashboardRoutes.js        (new)
│   └── ... existing routes
├── services/
│   ├── sm2Service.js             (new)
│   ├── dashboardService.js       (new)
│   └── ... existing services
├── utils/
│   └── searchUtils.js            (new)
├── app.js                         (updated)
├── API_DOCUMENTATION.md          (new)
└── INTEGRATION_GUIDE.md           (new, this file)
```

---

## ✅ Verification Checklist

- [ ] Server starts without errors: `npm start`
- [ ] Can create note: `POST /api/notes`
- [ ] Can retrieve notes: `GET /api/notes`
- [ ] Can search: `GET /api/search?q=test`
- [ ] Can add to revision: `POST /api/revision/add`
- [ ] Can get dashboard: `GET /api/dashboard/overview`
- [ ] Can fetch notifications: `GET /api/notifications`
- [ ] User profile loads: `GET /user/me`

---

## 🎓 Learning Resources

**SM-2 Algorithm:**
- Original Paper: "Optimization of learning" by Piotr Wozniak
- Implementation: Uses proven formulas from SuperMemo

**TF-IDF Search:**
- Wikipedia: TF-IDF
- Information Retrieval textbooks

**Database Design:**
- MongoDB best practices
- Indexing strategies for performance

---

## 🔗 References

- Complete API docs: See `API_DOCUMENTATION.md`
- User authentication: Existing auth middleware
- Database: MongoDB/Mongoose
- Framework: Express.js

---

## 💡 Tips & Best Practices

1. **Use Pagination**: Always use `limit` and `skip` for large datasets
2. **Search Often**: Search history is auto-tracked, no manual logging needed
3. **Regular Reviews**: Consistent SM-2 reviews improve long-term retention
4. **Tag Organization**: Use tags wisely for better search and categorization
5. **Monitor Streaks**: Track study streaks to maintain motivation
6. **Use Priorities**: Set priority levels in revision for focused learning

---

## 🆘 Troubleshooting

**Q: Notes not showing up?**
- A: Check if `deleted: false` in query filters. Soft deletes are used.

**Q: Search results empty?**
- A: Ensure query has at least 1 character. Stop words are filtered.

**Q: Revision date not updating?**
- A: Must submit review with score 0-5. SM-2 calculates next date.

**Q: Getting 401 Unauthorized?**
- A: Check session cookie. Ensure `credentials: 'include'` in fetch.

**Q: Can't find revision to review?**
- A: Use `/api/revision/today` for today's revisions specifically.

---

## 📞 Support

For issues or questions:
1. Check `API_DOCUMENTATION.md` for endpoint details
2. Review error messages - they indicate the issue
3. Verify authentication is working
4. Check MongoDB connection

