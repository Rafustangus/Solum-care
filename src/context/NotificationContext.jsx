import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { assetUrl } from '../lib/assets'
import { generateId } from '../lib/crypto'
import { toISODate } from '../lib/dates'
import { isPhotoPending } from '../lib/healing'
import {
  canUseNotifications,
  isIOS,
  isStandalone,
  notificationPermission
} from '../lib/platform'
import { STORAGE_KEYS, readJSON, writeJSON } from '../services/storage'

const NotificationContext = createContext(null)

async function showSystemNotification(title, options = {}) {
  if (!canUseNotifications() || Notification.permission !== 'granted') return false
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration?.showNotification) {
        await registration.showNotification(title, {
          badge: assetUrl('icon-192.png'),
          icon: assetUrl('icon-192.png'),
          ...options
        })
        return true
      }
    }
    new Notification(title, {
      icon: assetUrl('icon-192.png'),
      ...options
    })
    return true
  } catch (error) {
    console.warn('No se pudo mostrar la notificación', error)
    return false
  }
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [permission, setPermission] = useState(() => notificationPermission())
  const [remindersEnabled, setRemindersEnabled] = useState(
    () => Boolean(readJSON(STORAGE_KEYS.reminders, null)?.enabled)
  )
  const timers = useRef(new Map())

  useEffect(() => {
    const timerMap = timers.current
    setPermission(notificationPermission())
    return () => {
      timerMap.forEach((timer) => clearTimeout(timer))
      timerMap.clear()
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const pushToast = useCallback(
    ({ title, message = '', tone = 'info', duration = 4200 }) => {
      const id = generateId('toast')
      setToasts((previous) => [...previous.slice(-2), { id, title, message, tone }])
      const timer = setTimeout(() => removeToast(id), duration)
      timers.current.set(id, timer)
      return id
    },
    [removeToast]
  )

  const saveReminderPreference = useCallback((enabled) => {
    setRemindersEnabled(enabled)
    writeJSON(STORAGE_KEYS.reminders, {
      enabled,
      updatedAt: new Date().toISOString()
    })
  }, [])

  const sendTestNotification = useCallback(async () => {
    const shown = await showSystemNotification('Solum-care · Recordatorios activos', {
      body: 'Te avisaremos cuando toque la foto o el checklist del día.',
      tag: 'solumcare-test',
      data: { url: '/' }
    })
    if (!shown) {
      pushToast({
        title: 'No se pudo mostrar la notificación',
        message: 'Revisa los permisos del navegador e inténtalo de nuevo.',
        tone: 'warning'
      })
    }
    return shown
  }, [pushToast])

  const notify = useCallback(
    async ({ title, body = '', tag, url = '/' }) => {
      if (!remindersEnabled || permission !== 'granted') return false
      return showSystemNotification(title, {
        body,
        tag,
        data: { url }
      })
    },
    [permission, remindersEnabled]
  )

  const requestReminders = useCallback(async () => {
    if (!canUseNotifications()) {
      pushToast({
        title: 'Notificaciones no disponibles',
        message: 'Este navegador no permite recordatorios del sistema.',
        tone: 'warning'
      })
      return false
    }

    if (isIOS() && !isStandalone()) {
      pushToast({
        title: 'Añade Solum-care a inicio',
        message:
          'En iPhone, los recordatorios push requieren instalar la PWA desde Compartir → Añadir a pantalla de inicio.',
        tone: 'info',
        duration: 6500
      })
      return false
    }

    if (Notification.permission === 'denied') {
      pushToast({
        title: 'Permiso bloqueado',
        message: 'Activa las notificaciones de Solum-care desde los ajustes del navegador.',
        tone: 'warning'
      })
      return false
    }

    const result =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      saveReminderPreference(true)
      await sendTestNotification()
      pushToast({
        title: 'Recordatorios activados',
        message: 'Te avisaremos de la foto y los cuidados pendientes.',
        tone: 'success'
      })
      return true
    }

    pushToast({
      title: 'Recordatorios no activados',
      message: 'Puedes usar el email de respaldo o activarlos más tarde.',
      tone: 'info'
    })
    return false
  }, [pushToast, saveReminderPreference, sendTestNotification])

  const disableReminders = useCallback(() => {
    saveReminderPreference(false)
    pushToast({
      title: 'Recordatorios desactivados',
      message: 'Puedes volver a activarlos cuando quieras.',
      tone: 'info'
    })
  }, [pushToast, saveReminderPreference])

  const maybeRemindToday = useCallback(
    async (client) => {
      if (!client || !remindersEnabled || permission !== 'granted') return false
      if (!isPhotoPending(client)) return false

      const today = toISODate()
      const stored = readJSON(STORAGE_KEYS.notified, null)
      const notifiedToday =
        stored?.date === today
          ? Array.isArray(stored.clientIds)
            ? stored.clientIds
            : stored.clientId
              ? [stored.clientId]
              : []
          : []
      if (notifiedToday.includes(client.id)) return false

      const shown = await showSystemNotification('Solum-care · Foto pendiente', {
        body: `Hoy toca subir la foto de seguimiento de ${client.name.split(' ')[0]}.`,
        tag: `solumcare-photo-${client.id}-${today}`,
        data: { url: '/?tab=photos' }
      })

      if (shown) {
        writeJSON(STORAGE_KEYS.notified, {
          date: today,
          clientIds: [...notifiedToday, client.id]
        })
      }
      return shown
    },
    [permission, remindersEnabled]
  )

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      removeToast,
      permission,
      remindersEnabled,
      requestReminders,
      disableReminders,
      sendTestNotification,
      notify,
      maybeRemindToday,
      notificationsSupported: canUseNotifications(),
      isIOSDevice: isIOS(),
      isInstalled: isStandalone()
    }),
    [
      toasts,
      pushToast,
      removeToast,
      permission,
      remindersEnabled,
      requestReminders,
      disableReminders,
      sendTestNotification,
      notify,
      maybeRemindToday
    ]
  )

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider')
  }
  return context
}
