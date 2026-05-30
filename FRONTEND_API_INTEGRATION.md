# Frontend Implementation Guide - All APIs

## 📁 Files Updated/Created

### frontend_sanchit/src/api/
```
✅ notes.ts         (Updated - 10 functions)
✅ revision.ts      (Updated - 7 functions)
✅ notifications.ts (Updated - 6 functions)
✅ search.ts        (Updated - 7 functions)
✅ dashboard.ts     (New - 8 functions)
✅ user.ts          (New - 2 functions)
```

### dashboard_sanchit/src/api/
```
✅ notes.ts         (New - 10 functions)
✅ revision.ts      (New - 7 functions)
✅ notifications.ts (New - 6 functions)
✅ search.ts        (New - 7 functions)
✅ dashboard.ts     (New - 8 functions)
✅ user.ts          (New - 2 functions)
✅ index.ts         (New - exports all)
```

---

## 🚀 Quick Usage Examples

### Frontend Sanchit

```typescript
import { 
  getNotes, 
  createNote, 
  getTodayRevisions,
  globalSearch,
  getDashboardProfile,
  getNotifications 
} from '@/api'

// In your component:
useEffect(() => {
  getNotes().then(data => setNotes(data.notes))
}, [])
```

### Dashboard Sanchit

```typescript
import { 
  getNotes, 
  createNote, 
  getTodayRevisions,
  globalSearch,
  getDashboardProfile,
  getNotifications 
} from '@/api'

// In your component:
useEffect(() => {
  getNotes().then(data => setNotes(data.notes))
}, [])
```

---

## 📚 All Available APIs

### Notes (10 endpoints)
- `createNote(payload)` - Create new note
- `getNotes(filters)` - Get all notes with optional filters
- `getNote(id)` - Get single note
- `updateNote(id, payload)` - Update note
- `deleteNote(id)` - Delete note (soft delete)
- `togglePin(id)` - Toggle pin status
- `toggleArchive(id)` - Toggle archive status
- `toggleFavorite(id)` - Toggle favorite status
- `getRecentNotes(limit)` - Get recent notes
- `getNotesByDate(date)` - Get notes from specific date

### Revision (7 endpoints)
- `addToRevision(payload)` - Add content to revision queue
- `submitReview(payload)` - Submit a review (score 0-5)
- `getTodayRevisions()` - Get today's due revisions
- `getUpcomingRevisions(days)` - Get upcoming revisions
- `getRevisionHistory(limit)` - Get review history
- `getRevisionStats()` - Get revision statistics
- `removeFromRevision(scheduleId)` - Remove from queue

### Notifications (6 endpoints)
- `getNotifications(limit, skip)` - Get paginated notifications
- `getUnreadCount()` - Get unread notification count
- `markAsRead(id)` - Mark single notification as read
- `markAllAsRead()` - Mark all notifications as read
- `deleteNotification(id)` - Delete notification
- `cleanupOldNotifications()` - Remove old notifications

### Search (7 endpoints)
- `globalSearch(query)` - Search across all content
- `searchNotes(query)` - Search notes only
- `searchFiles(query)` - Search files only
- `searchFolders(query)` - Search folders only
- `getSearchSuggestions(partial)` - Get search suggestions
- `getRecentSearches(limit)` - Get recent search queries
- `clearSearchHistory()` - Clear search history

### Dashboard (8 endpoints)
- `getDashboardOverview()` - Get complete dashboard overview
- `getRecentNotes(limit)` - Get recent notes widget
- `getRecentFiles(limit)` - Get recent files widget
- `getRevisionSummary()` - Get revision stats
- `getActivitySummary()` - Get activity last 7 days
- `getStudyStreak()` - Get study streak info
- `getLearningRecommendations()` - Get recommendations
- `getCompleteStats()` - Get all stats at once

### User (2 endpoints)
- `getUserProfile()` - Get user profile
- `getDashboardProfile()` - Get profile with statistics

---

## 💡 Implementation Examples

### Example 1: Notes Page

```typescript
import { useEffect, useState } from 'react'
import { getNotes, createNote, deleteNote } from '@/api/notes'

export function NotesPage() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const data = await getNotes()
      setNotes(data.notes)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async () => {
    try {
      await createNote({ title, content })
      setTitle('')
      setContent('')
      await loadNotes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId)
      await loadNotes()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <input 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        placeholder="Title"
      />
      <textarea 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        placeholder="Content"
      />
      <button onClick={handleCreate}>Create</button>

      <ul>
        {notes.map(note => (
          <li key={note._id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={() => handleDelete(note._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Example 2: Revision Page

```typescript
import { useEffect, useState } from 'react'
import { getTodayRevisions, submitReview, addToRevision } from '@/api/revision'

export function RevisionPage() {
  const [revisions, setRevisions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    loadRevisions()
  }, [])

  const loadRevisions = async () => {
    try {
      const data = await getTodayRevisions()
      setRevisions(data.revisions)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReview = async (score) => {
    const revision = revisions[currentIndex]
    try {
      await submitReview({
        scheduleId: revision._id,
        reviewScore: score,
        timeSpent: 300
      })
      setCurrentIndex(currentIndex + 1)
    } catch (err) {
      console.error(err)
    }
  }

  if (revisions.length === 0) return <div>No revisions today!</div>

  const current = revisions[currentIndex]
  const progress = Math.round(((currentIndex + 1) / revisions.length) * 100)

  return (
    <div>
      <p>Progress: {progress}%</p>
      <div className="revision-card">
        <h2>{current.content?.title}</h2>
        <p>{current.content?.content}</p>
        <div className="buttons">
          <button onClick={() => handleReview(0)}>❌ Failed (0)</button>
          <button onClick={() => handleReview(2)}>😕 Hard (2)</button>
          <button onClick={() => handleReview(4)}>✅ Good (4)</button>
          <button onClick={() => handleReview(5)}>🎯 Perfect (5)</button>
        </div>
      </div>
    </div>
  )
}
```

### Example 3: Dashboard

```typescript
import { useEffect, useState } from 'react'
import { getCompleteStats, getDashboardProfile } from '@/api'

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    Promise.all([
      getCompleteStats(),
      getDashboardProfile()
    ]).then(([statsData, profileData]) => {
      setStats(statsData)
      setProfile(profileData)
    })
  }, [])

  if (!stats || !profile) return <div>Loading...</div>

  return (
    <div className="dashboard">
      <h1>Welcome, {profile.user.name}!</h1>

      <div className="widgets">
        <div className="widget">
          <h3>Study Streak</h3>
          <p className="big">{stats.streak.currentStreak} 🔥</p>
        </div>

        <div className="widget">
          <h3>Notes</h3>
          <p className="big">{stats.overview.stats.totalNotes}</p>
        </div>

        <div className="widget">
          <h3>Revisions Today</h3>
          <p className="big">{stats.overview.stats.todayRevisions}</p>
        </div>

        <div className="widget">
          <h3>Activity (7 days)</h3>
          <ul>
            <li>📝 Notes: {stats.activity.notesCreated}</li>
            <li>📁 Files: {stats.activity.filesUploaded}</li>
            <li>🔄 Reviews: {stats.activity.revisionsCompleted}</li>
          </ul>
        </div>
      </div>

      <div className="recommendations">
        <h3>Recommendations</h3>
        {stats.recommendations.oldNotes.length > 0 && (
          <div>
            <h4>Old Notes to Review:</h4>
            <ul>
              {stats.recommendations.oldNotes.map(note => (
                <li key={note._id}>{note.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Example 4: Search Component

```typescript
import { useEffect, useState } from 'react'
import { globalSearch, getSearchSuggestions, getRecentSearches } from '@/api/search'

export function SearchComponent() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])

  useEffect(() => {
    getRecentSearches().then(data => setRecentSearches(data.searches))
  }, [])

  const handleSearch = async (q) => {
    try {
      const data = await globalSearch(q)
      setResults(data.results)
    } catch (err) {
      console.error(err)
    }
  }

  const handleInputChange = async (value) => {
    setQuery(value)
    if (value.length >= 2) {
      try {
        const data = await getSearchSuggestions(value)
        setSuggestions(data.suggestions)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="search">
      <input
        value={query}
        onChange={e => handleInputChange(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && handleSearch(query)}
        placeholder="Search notes, files, folders..."
      />

      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => {
                setQuery(s)
                handleSearch(s)
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="results">
          {results.map(result => (
            <div key={result._id} className="result-item">
              <span className="type">{result.type}</span>
              <span className="title">{result.title || result.name}</span>
              <span className="score">{(result.relevanceScore * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="recent">
        <p>Recent searches:</p>
        <ul>
          {recentSearches.map((s, i) => (
            <li key={i} onClick={() => handleSearch(s)}>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

### Example 5: Notifications Widget

```typescript
import { useEffect, useState } from 'react'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/api/notifications'

export function NotificationsWidget() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const [notifData, countData] = await Promise.all([
        getNotifications(10),
        getUnreadCount()
      ])
      setNotifications(notifData.notifications)
      setUnreadCount(countData.unreadCount)
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      await loadNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      await loadNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="notifications">
      <div className="header">
        <h3>Notifications</h3>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead}>Mark all as read</button>
        )}
      </div>

      <div className="list">
        {notifications.map(notif => (
          <div
            key={notif._id}
            className={`notification ${notif.isRead ? 'read' : 'unread'}`}
          >
            <h4>{notif.title}</h4>
            <p>{notif.message}</p>
            {!notif.isRead && (
              <button onClick={() => handleMarkAsRead(notif._id)}>
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🎯 Integration Checklist

- [ ] Import needed API functions
- [ ] Handle loading states
- [ ] Add error handling (try/catch)
- [ ] Show error messages to users
- [ ] Test all endpoints
- [ ] Add TypeScript types if using TypeScript
- [ ] Implement pagination where needed
- [ ] Add refresh/reload functionality
- [ ] Setup polling for real-time data if needed

---

## 📝 Notes

1. **All APIs require authentication** - Session cookie is automatically sent
2. **Error Handling** - All functions throw errors, use try-catch
3. **Pagination** - Use `limit` and `skip` for large datasets
4. **TypeScript** - Full types available in each file
5. **Base URL** - Uses `VITE_API_BASE` env variable

---

## 🔗 File Locations

### Frontend Sanchit
```
frontend_sanchit/src/api/
├── notes.ts
├── revision.ts
├── notifications.ts
├── search.ts
├── dashboard.ts
└── user.ts
```

### Dashboard Sanchit
```
dashboard_sanchit/src/api/
├── notes.ts
├── revision.ts
├── notifications.ts
├── search.ts
├── dashboard.ts
├── user.ts
└── index.ts
```

---

## 🚀 Next Steps

1. Start using the APIs in your components
2. Test all endpoints in development
3. Handle error states gracefully
4. Add loading indicators
5. Implement real-time features if needed
6. Deploy to production

---

## 📞 Reference

For more details:
- See `server/API_DOCUMENTATION.md` for backend details
- See `server/QUICK_REFERENCE.md` for endpoint summary
- See individual `API_INTEGRATION.md` in each frontend

