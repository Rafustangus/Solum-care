const DB_NAME = 'solumcare-media'
const DB_VERSION = 1
const STORE = 'photos'
const FALLBACK_PREFIX = 'solumcare:photo:'

let dbPromise = null
const photoCache = new Map()
const pendingReads = new Map()

function hasIndexedDB() {
  return typeof indexedDB !== 'undefined'
}

function openDB() {
  if (!hasIndexedDB()) return Promise.resolve(null)
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

export async function putPhoto(id, dataUrl) {
  photoCache.set(id, dataUrl)
  const db = await openDB()
  if (!db) {
    localStorage.setItem(`${FALLBACK_PREFIX}${id}`, dataUrl)
    return id
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite')
    transaction.objectStore(STORE).put({ id, dataUrl, savedAt: Date.now() })
    transaction.oncomplete = () => resolve(id)
    transaction.onerror = () => {
      photoCache.delete(id)
      reject(transaction.error)
    }
  })
}

export async function getPhoto(id) {
  if (photoCache.has(id)) return photoCache.get(id)
  if (pendingReads.has(id)) return pendingReads.get(id)

  const pending = (async () => {
    const db = await openDB()
    if (!db) return localStorage.getItem(`${FALLBACK_PREFIX}${id}`)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readonly')
      const request = transaction.objectStore(STORE).get(id)
      request.onsuccess = () => resolve(request.result?.dataUrl || null)
      request.onerror = () => reject(request.error)
    })
  })()

  pendingReads.set(id, pending)
  try {
    const value = await pending
    photoCache.set(id, value)
    return value
  } finally {
    pendingReads.delete(id)
  }
}

export async function deletePhoto(id) {
  photoCache.delete(id)
  const db = await openDB()
  if (!db) {
    localStorage.removeItem(`${FALLBACK_PREFIX}${id}`)
    return
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite')
    transaction.objectStore(STORE).delete(id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function clearPhotos() {
  photoCache.clear()
  pendingReads.clear()
  if (hasIndexedDB()) {
    try {
      const db = await openDB()
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readwrite')
        transaction.objectStore(STORE).clear()
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })
    } catch {
      // noop
    }
  }

  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(FALLBACK_PREFIX))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    // noop
  }
}
