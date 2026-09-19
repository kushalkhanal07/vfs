# Dashboard StudyVault - API Integration Guide

## 📚 Available API Modules

All backend APIs are now available in the dashboard with TypeScript support.

### Location
```
src/api/
├── notes.ts           (Note management)
├── revision.ts        (SM-2 Revision system)
├── notifications.ts   (Notifications)
├── search.ts          (Smart search)
├── dashboard.ts       (Dashboard data)
├── user.ts            (User profile)
└── index.ts           (Export all)
```

---

## 🚀 Quick Start

### Import and Use

```typescript
import { 
  getNotes, 
  createNote, 
  getTodayRevisions, 
  getNotifications,
  globalSearch,
  getDashboardOverview,
  getUserProfile 
} from '@/api'
```

---

## 📋 Notes API

### Functions

```typescript
// Create note
createNote({ 
  title: 'My Note',
  content: 'Content here',
  tags: ['tag1'],
  folderId: 'optional_id'
})

// Get all notes
getNotes({ 
  archived: false, 
  favorite: false, 
  pinned: false,
  folder: 'folder_id'
})

// Get single note
getNote(noteId)

// Update note
updateNote(noteId, { title: 'New Title', content: '...' })

// Delete note
deleteNote(noteId)

// Toggle pin
togglePin(noteId)

// Toggle archive
toggleArchive(noteId)

// Toggle favorite
toggleFavorite(noteId)

// Get recent notes
getRecentNotes(limit: 10)

// Get notes by date
getNotesByDate('2024-01-15')
```

---

## 🔄 Revision (SM-2) API

### Functions

```typescript
// Add to revision queue
addToRevision({
  contentId: 'note_id',
  contentType: 'note', // 'note' | 'file' | 'folder'
  priority: 'High'     // 'High' | 'Medium' | 'Low'
})

// Get today's revisions
getTodayRevisions()

// Get upcoming revisions
getUpcomingRevisions(days: 30)

// Submit review
submitReview({
  scheduleId: 'schedule_id',
  reviewScore: 4,      // 0-5 (0-2: fail, 3-5: pass)
  timeSpent: 300,      // seconds
  notes: 'optional'
})

// Get revision history
getRevisionHistory(limit: 50)

// Get revision stats
getRevisionStats()

// Remove from revision
removeFromRevision(scheduleId)
```

---

## 🔔 Notifications API

### Functions

```typescript
// Get all notifications
getNotifications(limit: 50, skip: 0)

// Get unread count
getUnreadCount()

// Mark as read
markAsRead(notificationId)

// Mark all as read
markAllAsRead()

// Delete notification
deleteNotification(notificationId)

// Cleanup old notifications
cleanupOldNotifications()
```

---

## 🔍 Search API

### Functions

```typescript
// Global search
globalSearch('query')

// Search notes only
searchNotes('query')

// Search files only
searchFiles('query')

// Search folders only
searchFolders('query')

// Get search suggestions
getSearchSuggestions('partial_query')

// Get recent searches
getRecentSearches(limit: 10)

// Clear search history
clearSearchHistory()
```

---

## 📊 Dashboard API

### Functions

```typescript
// Get complete overview
getDashboardOverview()

// Get recent notes
getRecentNotes(limit: 5)

// Get recent files
getRecentFiles(limit: 5)

// Get revision summary
getRevisionSummary()

// Get activity (last 7 days)
getActivitySummary()

// Get study streak
getStudyStreak()

// Get learning recommendations
getLearningRecommendations()

// Get all stats at once
getCompleteStats()
```

---

## 👤 User API

### Functions

```typescript
// Get user profile
getUserProfile()

// Get dashboard profile (with stats)
getDashboardProfile()
```

---

## 💻 Component Examples

### Example 1: Display User Stats

```typescript
import { useEffect, useState } from 'react'
import { getUserProfile, getDashboardProfile } from '@/api'

export function UserWidget() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([getUserProfile(), getDashboardProfile()])
      .then(([userProfile, dashProfile]) => {
        setProfile(userProfile)
        setStats(dashProfile.stats)
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div>
      <h2>{profile?.name}</h2>
      <p>Notes: {stats?.totalNotes}</p>
      <p>Streak: {stats?.revisionStreak} days</p>
    </div>
  )
}
```

---

### Example 2: Today's Revisions

```typescript
import { useEffect, useState } from 'react'
import { getTodayRevisions, submitReview } from '@/api'

export function RevisionWidget() {
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getTodayRevisions()
      .then(data => setRevisions(data.revisions))
      .catch(err => console.error(err))
  }, [])

  const handleReview = async (scheduleId, score) => {
    setLoading(true)
    try {
      await submitReview({
        scheduleId,
        reviewScore: score,
        timeSpent: 300
      })
      // Refresh revisions
      const data = await getTodayRevisions()
      setRevisions(data.revisions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3>Today's Revisions ({revisions.length})</h3>
      {revisions.map(rev => (
        <div key={rev._id}>
          <p>{rev.content?.title}</p>
          <button onClick={() => handleReview(rev._id, 4)}>
            Review (Score 4/5)
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

### Example 3: Search Component

```typescript
import { useEffect, useState } from 'react'
import { globalSearch, getSearchSuggestions } from '@/api'

export function SearchWidget() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])

  const handleSearch = async (q) => {
    setQuery(q)
    if (q.length < 2) return

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
    <div>
      <input
        placeholder="Search..."
        value={query}
        onChange={e => handleInputChange(e.target.value)}
        onKeyPress={e => {
          if (e.key === 'Enter') handleSearch(query)
        }}
      />

      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => handleSearch(s)}>
              {s}
            </li>
          ))}
        </ul>
      )}

      {results.length > 0 && (
        <ul>
          {results.map(r => (
            <li key={r._id}>
              <strong>{r.type}:</strong> {r.title || r.name}
              (Score: {(r.relevanceScore * 100).toFixed(0)}%)
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

### Example 4: Dashboard Overview

```typescript
import { useEffect, useState } from 'react'
import { getCompleteStats } from '@/api'

export function DashboardStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getCompleteStats()
      .then(data => setStats(data))
      .catch(err => console.error(err))
  }, [])

  if (!stats) return <div>Loading...</div>

  return (
    <div className="grid">
      <div className="card">
        <h3>Total Notes</h3>
        <p className="big">{stats.overview?.stats?.totalNotes || 0}</p>
      </div>

      <div className="card">
        <h3>Study Streak</h3>
        <p className="big">{stats.streak?.currentStreak || 0} 🔥</p>
      </div>

      <div className="card">
        <h3>Revisions Today</h3>
        <p className="big">{stats.overview?.stats?.todayRevisions || 0}</p>
      </div>

      <div className="card">
        <h3>Activity (7 days)</h3>
        <ul>
          <li>Notes Created: {stats.activity?.notesCreated}</li>
          <li>Files Uploaded: {stats.activity?.filesUploaded}</li>
          <li>Revisions Done: {stats.activity?.revisionsCompleted}</li>
        </ul>
      </div>
    </div>
  )
}
```

---

### Example 5: Notes Manager

```typescript
import { useEffect, useState } from 'react'
import { getNotes, createNote, updateNote, deleteNote, toggleArchive } from '@/api'

export function NotesManager() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const data = await getNotes({ archived: false })
      setNotes(data.notes)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
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

  const handleArchive = async (noteId) => {
    try {
      await toggleArchive(noteId)
      await loadNotes()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Note content"
        />
        <button type="submit">Create Note</button>
      </form>

      <div className="notes-list">
        {notes.map(note => (
          <div key={note._id} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div className="actions">
              <button onClick={() => handleArchive(note._id)}>Archive</button>
              <button onClick={() => handleDelete(note._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🎯 Error Handling

All API functions throw errors. Always wrap in try-catch:

```typescript
try {
  const notes = await getNotes()
  setNotes(notes.notes)
} catch (error) {
  console.error(error.message)
  // Show user-friendly error message
  showToast(error.message)
}
```

---

## ⚙️ Configuration

All APIs use the environment variable:
```
VITE_API_BASE=http://localhost:4000
```

Or defaults to `http://localhost:4000` if not set.

---

## 🔐 Authentication

All endpoints automatically include:
- Credentials: `include` (for cookies)
- Session cookie: `sid` (managed by browser)

No manual token handling needed!

---

## 📝 TypeScript Support

All functions have TypeScript types:

```typescript
import type { Note, RevisionSchedule, Notification } from '@/api'

const notes: Note[] = await getNotes()
const revisions: RevisionSchedule[] = await getTodayRevisions()
const notifications: Notification[] = await getNotifications()
```

---

## 🧪 Testing

Test endpoints in Postman:
1. Set Base URL: `http://localhost:4000`
2. Add cookie: `sid=your_session_cookie`
3. Try endpoints:
   - `GET /api/notes`
   - `POST /api/notes`
   - `GET /api/revision/today`
   - `GET /api/dashboard/overview`

---

## 📞 Need Help?

- Check server docs: `server/API_DOCUMENTATION.md`
- Integration guide: `server/INTEGRATION_GUIDE.md`
- Quick reference: `server/QUICK_REFERENCE.md`

---

## ✅ Checklist

- [x] API client files created
- [x] TypeScript support added
- [x] Error handling included
- [x] All 40+ endpoints available
- [x] Components examples provided
- [x] Ready for dashboard integration

