import { createSeedData, SEED_VERSION } from './seed'
import { STORAGE_KEYS, readJSON, removeItem, writeJSON } from './storage'

export function loadData() {
  const stored = readJSON(STORAGE_KEYS.data, null)
  if (!stored || stored.version !== SEED_VERSION) {
    const seeded = createSeedData()
    writeJSON(STORAGE_KEYS.data, seeded)
    return seeded
  }
  return stored
}

export function saveData(data) {
  return writeJSON(STORAGE_KEYS.data, data)
}

export function resetData() {
  removeItem(STORAGE_KEYS.data)
  removeItem(STORAGE_KEYS.notified)
  const seeded = createSeedData()
  writeJSON(STORAGE_KEYS.data, seeded)
  return seeded
}

export function loadBranding() {
  return readJSON(STORAGE_KEYS.branding, null)
}

export function saveBranding(branding) {
  return writeJSON(STORAGE_KEYS.branding, branding)
}
