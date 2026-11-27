import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  createCareTemplateId,
  isCareTemplateAllowed,
  listStudioCareTemplates,
  normalizeCareTemplateInput,
  validateCareTemplateInput
} from '../lib/careTemplates'
import { generateId } from '../lib/crypto'
import { nowISOString } from '../lib/dates'
import { canModifyNote, markNotesRead as readNotes } from '../lib/notes'
import { canAccessStudioData, canManageStudioData } from '../lib/permissions'
import { loadData, resetData, saveData } from '../services/repository'
import { clearPhotos } from '../services/photoStore'
import { useAuth } from './AuthContext'

const AppDataContext = createContext(null)

function makeNotification({ audienceRole, clientId, type, title, body }) {
  return {
    id: generateId('notif'),
    audienceRole,
    clientId,
    type,
    title,
    body,
    read: false,
    createdAt: nowISOString()
  }
}

function withNotification(state, payload) {
  return {
    ...state,
    notifications: [makeNotification(payload), ...state.notifications]
  }
}

function updateClientInState(state, clientId, updater) {
  return {
    ...state,
    clients: state.clients.map((client) =>
      client.id === clientId ? updater(client) : client
    )
  }
}

function photoPreview(note = '') {
  const clean = String(note).trim()
  if (!clean) return 'Ha subido una nueva evidencia.'
  return clean.length > 72 ? `${clean.slice(0, 72)}…` : clean
}

export function AppDataProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState(() => {
    const loaded = loadData()
    return {
      ...loaded,
      careTemplates: Array.isArray(loaded.careTemplates) ? loaded.careTemplates : []
    }
  })
  const saveTimer = useRef(null)
  const latestData = useRef(data)

  useEffect(() => {
    latestData.current = data
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null
      saveData(latestData.current)
    }, 500)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [data])

  useEffect(() => {
    function flush() {
      if (!saveTimer.current) return
      clearTimeout(saveTimer.current)
      saveTimer.current = null
      saveData(latestData.current)
    }

    function handleVisibility() {
      if (document.visibilityState === 'hidden') flush()
    }

    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const getClient = useCallback(
    (clientId) => data.clients.find((client) => client.id === clientId) || null,
    [data.clients]
  )

  const getClientByUser = useCallback(
    (userId) => data.clients.find((client) => client.userId === userId) || null,
    [data.clients]
  )

  const notificationsFor = useCallback(
    (role, clientId = null) =>
      data.notifications
        .filter(
          (notification) =>
            notification.audienceRole === role &&
            (role === 'artist' || !clientId || notification.clientId === clientId)
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [data.notifications]
  )

  const unreadCount = useCallback(
    (role, clientId = null) =>
      notificationsFor(role, clientId).filter((notification) => !notification.read).length,
    [notificationsFor]
  )

  const addNotification = useCallback((payload) => {
    setData((previous) => withNotification(previous, payload))
  }, [])

  const markNotificationRead = useCallback((notificationId) => {
    setData((previous) => ({
      ...previous,
      notifications: previous.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    }))
  }, [])

  const markAllNotificationsRead = useCallback((role, clientId = null) => {
    setData((previous) => ({
      ...previous,
      notifications: previous.notifications.map((notification) => {
        const matches =
          notification.audienceRole === role &&
          (role === 'artist' || !clientId || notification.clientId === clientId)
        return matches ? { ...notification, read: true } : notification
      })
    }))
  }, [])

  const markNotesRead = useCallback((role, clientId = null) => {
    setData((previous) => {
      const notifications = readNotes(previous.notifications, role, clientId)
      if (notifications === previous.notifications) return previous
      return { ...previous, notifications }
    })
  }, [])

  const listCareTemplates = useCallback(() => {
    if (!canAccessStudioData(user, user?.studioId)) return []
    return listStudioCareTemplates(latestData.current.careTemplates, user.studioId)
  }, [user])

  const createCareTemplate = useCallback(
    (input) => {
      if (!canManageStudioData(user) || !user.studioId) {
        throw new Error('Solo un artista activo puede crear pautas de curación.')
      }
      const error = validateCareTemplateInput(input, {
        templates: latestData.current.careTemplates,
        studioId: user.studioId
      })
      if (error) throw new Error(error)

      const template = {
        id: createCareTemplateId(),
        studioId: user.studioId,
        ...normalizeCareTemplateInput(input),
        createdAt: nowISOString(),
        updatedAt: null
      }
      setData((previous) => ({
        ...previous,
        careTemplates: [...(previous.careTemplates || []), template]
      }))
      return template
    },
    [user]
  )

  const updateCareTemplate = useCallback(
    (templateId, input) => {
      if (!canAccessStudioData(user, user?.studioId)) {
        throw new Error('Solo el estudio puede editar sus pautas de curación.')
      }
      const existing = latestData.current.careTemplates.find(
        (template) => template.id === templateId && template.studioId === user.studioId
      )
      if (!existing) throw new Error('No se ha encontrado la pauta de curación.')

      const error = validateCareTemplateInput(input, {
        templates: latestData.current.careTemplates,
        studioId: user.studioId,
        templateId
      })
      if (error) throw new Error(error)

      const updated = {
        ...existing,
        ...normalizeCareTemplateInput(input),
        updatedAt: nowISOString()
      }
      setData((previous) => ({
        ...previous,
        careTemplates: previous.careTemplates.map((template) =>
          template.id === templateId ? updated : template
        )
      }))
      return updated
    },
    [user]
  )

  const deleteCareTemplate = useCallback(
    (templateId) => {
      if (!canAccessStudioData(user, user?.studioId)) {
        throw new Error('Solo el estudio puede borrar sus pautas de curación.')
      }
      const existing = latestData.current.careTemplates.find(
        (template) => template.id === templateId && template.studioId === user.studioId
      )
      if (!existing) throw new Error('No se ha encontrado la pauta de curación.')

      const inUse = latestData.current.clients.filter(
        (client) => client.technique === templateId
      ).length
      if (inUse) {
        throw new Error(
          `No se puede borrar: ${inUse} ${inUse === 1 ? 'cliente la está usando' : 'clientes la están usando'}.`
        )
      }

      setData((previous) => ({
        ...previous,
        careTemplates: previous.careTemplates.filter((template) => template.id !== templateId)
      }))
      return true
    },
    [user]
  )

  const toggleTask = useCallback((clientId, day, taskId) => {
    setData((previous) =>
      updateClientInState(previous, clientId, (client) => {
        const key = String(day)
        const completed = new Set(client.checklist?.[key] || [])
        if (completed.has(taskId)) completed.delete(taskId)
        else completed.add(taskId)
        return {
          ...client,
          checklist: {
            ...client.checklist,
            [key]: Array.from(completed)
          }
        }
      })
    )
  }, [])

  const addPhoto = useCallback(
    (clientId, { day, src = null, storageKey = null, note = '' }) => {
      const photo = {
        id: generateId('photo'),
        clientId,
        day,
        src,
        storageKey,
        note,
        status: 'pending',
        artistComment: '',
        createdAt: nowISOString(),
        reviewedAt: null
      }

      setData((previous) => {
        const next = updateClientInState(previous, clientId, (client) => ({
          ...client,
          photos: [...(client.photos || []), photo]
        }))
        const client = previous.clients.find((item) => item.id === clientId)
        return withNotification(next, {
          audienceRole: 'artist',
          clientId,
          type: 'photo',
          title: `Nueva foto de ${client?.name || 'un cliente'}`,
          body: `Día ${day}: ${photoPreview(note)}`
        })
      })

      return photo
    },
    []
  )

  const reviewPhoto = useCallback((clientId, photoId, status, comment = '') => {
    setData((previous) => {
      const next = updateClientInState(previous, clientId, (client) => ({
        ...client,
        photos: (client.photos || []).map((photo) =>
          photo.id === photoId
            ? {
                ...photo,
                status,
                artistComment: comment,
                reviewedAt: nowISOString()
              }
            : photo
        )
      }))

      const client = previous.clients.find((item) => item.id === clientId)
      return withNotification(next, {
        audienceRole: 'client',
        clientId,
        type: status === 'approved' ? 'approval' : 'changes',
        title:
          status === 'approved'
            ? 'Foto aprobada por el estudio'
            : 'El estudio ha pedido cambios',
        body:
          comment ||
          (status === 'approved'
            ? `La evidencia de ${client?.name || 'tu tatuaje'} está aprobada.`
            : 'Revisa la nota del estudio y vuelve a subir una foto.')
      })
    })
  }, [])

  const updatePlan = useCallback(
    (clientId, plan) => {
      if (
        plan.technique &&
        !isCareTemplateAllowed(
          plan.technique,
          latestData.current.careTemplates,
          user?.studioId
        )
      ) {
        throw new Error('Esa pauta de curación no está disponible para tu estudio.')
      }

      setData((previous) => {
        const next = updateClientInState(previous, clientId, (client) => ({
          ...client,
          ...plan
        }))
        return withNotification(next, {
          audienceRole: 'client',
          clientId,
          type: 'plan',
          title: 'Tu plan de curación se ha actualizado',
          body: 'Revisa la duración, la pauta y la frecuencia de fotos en tu inicio.'
        })
      })
    },
    [user]
  )

  const reportAlert = useCallback((clientId, symptoms, note) => {
    setData((previous) => {
      const next = updateClientInState(previous, clientId, (client) => ({
        ...client,
        alert: {
          active: true,
          symptoms,
          note,
          createdAt: nowISOString()
        }
      }))
      const client = previous.clients.find((item) => item.id === clientId)
      return withNotification(next, {
        audienceRole: 'artist',
        clientId,
        type: 'alert',
        title: `Alerta de ${client?.name || 'un cliente'}`,
        body: symptoms.length
          ? `Síntomas: ${symptoms.join(', ')}. ${note || ''}`.trim()
          : note || 'El cliente ha reportado una incidencia.'
      })
    })
  }, [])

  const resolveAlert = useCallback((clientId) => {
    setData((previous) => {
      const next = updateClientInState(previous, clientId, (client) => ({
        ...client,
        alert: client.alert
          ? { ...client.alert, active: false, resolvedAt: nowISOString() }
          : null
      }))
      return withNotification(next, {
        audienceRole: 'client',
        clientId,
        type: 'alert_resolved',
        title: 'Alerta revisada por el estudio',
        body: 'El estudio ha revisado tu incidencia. Sigue las indicaciones de tu plan.'
      })
    })
  }, [])

  const addNote = useCallback(
    (clientId, { text, pinned = false, linkedDay = null }) => {
      if (!user) throw new Error('Debes iniciar sesión para escribir una nota.')
      const clean = String(text || '').trim()
      if (!clean) throw new Error('La nota está vacía.')

      const note = {
        id: generateId('note'),
        clientId,
        authorId: user.id,
        authorRole: user.role,
        authorName: user.name,
        text: clean,
        linkedDay,
        pinned,
        createdAt: nowISOString(),
        updatedAt: null,
        edited: false
      }

      setData((previous) => {
        const next = {
          ...previous,
          notes: [note, ...previous.notes]
        }
        return withNotification(next, {
          audienceRole: user.role === 'artist' ? 'client' : 'artist',
          clientId,
          type: 'note',
          title: `Nueva nota de ${user.name}`,
          body: clean.length > 90 ? `${clean.slice(0, 90)}…` : clean
        })
      })

      return note
    },
    [user]
  )

  const updateNote = useCallback(
    (noteId, text) => {
      const clean = String(text || '').trim()
      if (!clean) throw new Error('La nota está vacía.')
      setData((previous) => ({
        ...previous,
        notes: previous.notes.map((note) =>
          note.id === noteId && canModifyNote(note, user?.id)
            ? {
                ...note,
                text: clean,
                updatedAt: nowISOString(),
                edited: true
              }
            : note
        )
      }))
    },
    [user]
  )

  const deleteNote = useCallback(
    (noteId) => {
      setData((previous) => ({
        ...previous,
        notes: previous.notes.filter(
          (note) => !(note.id === noteId && canModifyNote(note, user?.id))
        )
      }))
    },
    [user]
  )

  const togglePinNote = useCallback((noteId) => {
    setData((previous) => ({
      ...previous,
      notes: previous.notes.map((note) =>
        note.id === noteId && canModifyNote(note, user?.id)
          ? { ...note, pinned: !note.pinned }
          : note
      )
    }))
  }, [user])

  const addClient = useCallback(
    (client) => {
      const studioId = client.studioId || user?.studioId || 'studio-solum'
      if (!isCareTemplateAllowed(client.technique, latestData.current.careTemplates, studioId)) {
        throw new Error('Esa pauta de curación no está disponible para tu estudio.')
      }

      const nextClient = {
        id: client.id || generateId('client'),
        userId: client.userId || null,
        studioId,
        assignedArtistId: client.assignedArtistId || null,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        tattooZone: client.tattooZone || '',
        technique: client.technique || 'second-skin',
        startDate: client.startDate,
        durationDays: Number(client.durationDays) || 14,
        photoFrequency: client.photoFrequency || 'daily',
        planNotes: client.planNotes || '',
        checklist: client.checklist || {},
        photos: client.photos || [],
        alert: null,
        createdAt: nowISOString()
      }
      setData((previous) => ({
        ...previous,
        clients: [nextClient, ...previous.clients]
      }))
      return nextClient
    },
    [user]
  )

  const updateSettings = useCallback((patch) => {
    setData((previous) => ({
      ...previous,
      settings: { ...previous.settings, ...patch }
    }))
  }, [])

  const resetDemo = useCallback(async () => {
    await clearPhotos()
    setData(resetData())
  }, [])

  const value = useMemo(
    () => ({
      data,
      clients: data.clients,
      notes: data.notes,
      notifications: data.notifications,
      settings: data.settings,
      careTemplates: data.careTemplates || [],
      getClient,
      getClientByUser,
      notificationsFor,
      unreadCount,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      markNotesRead,
      listCareTemplates,
      createCareTemplate,
      updateCareTemplate,
      deleteCareTemplate,
      toggleTask,
      addPhoto,
      reviewPhoto,
      updatePlan,
      reportAlert,
      resolveAlert,
      addNote,
      updateNote,
      deleteNote,
      togglePinNote,
      addClient,
      updateSettings,
      resetDemo
    }),
    [
      data,
      getClient,
      getClientByUser,
      notificationsFor,
      unreadCount,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      markNotesRead,
      listCareTemplates,
      createCareTemplate,
      updateCareTemplate,
      deleteCareTemplate,
      toggleTask,
      addPhoto,
      reviewPhoto,
      updatePlan,
      reportAlert,
      resolveAlert,
      addNote,
      updateNote,
      deleteNote,
      togglePinNote,
      addClient,
      updateSettings,
      resetDemo
    ]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData debe usarse dentro de AppDataProvider')
  return context
}
