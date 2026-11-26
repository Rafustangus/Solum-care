export function canModifyNote(note, userId) {
  return Boolean(note && userId && note.authorId === userId)
}

export function sortNotes(notes = []) {
  return [...notes].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
}

function matchesAudience(notification, role, clientId) {
  return (
    notification.audienceRole === role &&
    (role === 'artist' || !clientId || notification.clientId === clientId)
  )
}

export function markNotesRead(notifications = [], role, clientId = null) {
  const matches = (notification) =>
    notification.type === 'note' && matchesAudience(notification, role, clientId)
  if (!notifications.some((notification) => matches(notification) && !notification.read)) {
    return notifications
  }
  return notifications.map((notification) =>
    matches(notification) ? { ...notification, read: true } : notification
  )
}

export function countUnreadNotes(notifications = [], role, clientId = null) {
  return notifications.filter(
    (notification) =>
      notification.type === 'note' &&
      !notification.read &&
      matchesAudience(notification, role, clientId)
  ).length
}
