// Export all API modules
export * from "./notes";
export * from "./revision";
export * from "./notifications";
export * from "./search";
export * from "./dashboard";
export * from "./user";

// Example usage in components:
// import { getNotes, createNote, getRevisionStats } from '@/api'
//
// Usage in React:
// const [notes, setNotes] = useState([])
// useEffect(() => {
//   getNotes().then(data => setNotes(data.notes))
// }, [])
