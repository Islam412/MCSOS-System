export function restoreSessionPlacement(sessions, sessionId, previousPlacement) {
  return sessions.map((session) => {
    if (String(session.id) !== String(sessionId)) return session
    return {
      ...session,
      doctor_id: previousPlacement.doctor_id,
      doctor: previousPlacement.doctor,
      room_id: previousPlacement.room_id,
      room: previousPlacement.room,
      session_date: previousPlacement.session_date,
    }
  })
}
