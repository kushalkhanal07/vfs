import { getIO } from "../utils/socket.js";

function emitToParticipantRooms(participants, eventName, payload) {
  const io = getIO();
  if (!io) return;

  const participantIds = [...new Set((participants || []).map((participant) => String(participant)).filter(Boolean))];
  for (const participantId of participantIds) {
    io.to(`user_${participantId}`).emit(eventName, payload);
  }
}

export function emitSessionReminder(session, minutesLeft) {
  emitToParticipantRooms(session.participants, "session-reminder", {
    sessionId: String(session._id),
    message: `Session starts in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}`,
    minutesLeft,
  });
}

export function emitSessionStarting(session) {
  emitToParticipantRooms(session.participants, "session-starting", {
    sessionId: String(session._id),
    message: "Session is starting now",
  });
}

export function emitSessionUpdated(session) {
  emitToParticipantRooms(session.participants, "session-updated", {
    sessionId: String(session._id),
    status: session.status,
  });
}