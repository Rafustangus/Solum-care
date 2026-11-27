export function canManageStudioData(user) {
  return Boolean(user && user.role === 'artist' && user.status === 'active')
}

export function canAccessStudioData(user, studioId) {
  return canManageStudioData(user) && Boolean(studioId) && user.studioId === studioId
}
