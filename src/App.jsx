import { useEffect, useState } from 'react'
import { AppShell } from './components/shared/AppShell'
import { BottomNav } from './components/shared/BottomNav'
import { Header } from './components/shared/Header'
import { Logo } from './components/shared/Logo'
import { Sidebar } from './components/shared/Sidebar'
import { SECTION_TITLES } from './components/shared/navigation'
import { Card } from './components/ui/Card'
import { EmptyState } from './components/ui/EmptyState'
import { Sheet } from './components/ui/Sheet'
import { ToastViewport } from './components/ui/ToastViewport'
import { useAppData } from './context/AppDataContext'
import { useAuth } from './context/AuthContext'
import { AuthFlow } from './features/auth/AuthFlow'
import { ArtistNotifications } from './features/artist/ArtistNotifications'
import { ArtistPhotoFeed } from './features/artist/ArtistPhotoFeed'
import { ClientDetail } from './features/artist/ClientDetail'
import { ClientList } from './features/artist/ClientList'
import { NewClientSheet } from './features/artist/NewClientSheet'
import { ClientHome } from './features/client/ClientHome'
import { ClientNotificationsSheet } from './features/client/ClientNotificationsSheet'
import { ClientPhotosView } from './features/client/ClientPhotosView'
import { ClientProfile } from './features/client/ClientProfile'
import { HealingGuide } from './features/client/HealingGuide'
import { PhotoGate } from './features/client/PhotoGate'
import { NotesView } from './features/notes/NotesView'
import { ArtistSettings } from './features/settings/ArtistSettings'
import { isPhotoPending } from './lib/healing'
import { cn } from './lib/cn'
import { UserRound, Users } from 'lucide-react'

function SplashScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-6 animate-fade-in">
      <Logo size="lg" />
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-coffee/10">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-clay" />
      </div>
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-coffee-soft">
        Preparando tu espacio
      </p>
    </div>
  )
}

export function App() {
  const { user, loading, isArtist, isClient } = useAuth()
  const {
    clients,
    getClient,
    getClientByUser,
    notificationsFor,
    unreadCount,
    markNotesRead
  } = useAppData()
  const [tab, setTab] = useState('home')
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [notesClientId, setNotesClientId] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [clientNotificationsOpen, setClientNotificationsOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    setTab(user.role === 'artist' ? 'clients' : 'home')
    setSelectedClientId(null)
    setNotesClientId(null)
    setSettingsOpen(false)
    setNewClientOpen(false)
    setClientNotificationsOpen(false)
  }, [user])

  useEffect(() => {
    if (!user || tab !== 'notes') return
    if (user.role === 'artist') {
      const target = notesClientId ? getClient(notesClientId) : clients[0]
      if (target) markNotesRead('artist', target.id)
    } else {
      const target = getClientByUser(user.id)
      if (target) markNotesRead('client', target.id)
    }
  }, [user, tab, notesClientId, clients, getClient, getClientByUser, markNotesRead])

  if (loading) {
    return (
      <AppShell>
        <SplashScreen />
      </AppShell>
    )
  }

  if (!user) {
    return (
      <AppShell>
        <div className="flex min-h-0 flex-1 flex-col">
          <AuthFlow />
        </div>
        <ToastViewport />
      </AppShell>
    )
  }

  const client = isClient ? getClientByUser(user.id) : null
  const selectedClient = isArtist ? getClient(selectedClientId) : null
  const notesClient = isArtist
    ? getClient(notesClientId) || clients[0] || null
    : client
  const unread = isArtist ? unreadCount('artist') : unreadCount('client', client?.id)
  const notesUnread = (
    isArtist
      ? notificationsFor('artist')
      : notificationsFor('client', client?.id)
  ).filter((notification) => notification.type === 'note' && !notification.read).length
  const photoPending = isClient && client ? isPhotoPending(client) : false

  function handleTabChange(nextTab) {
    setTab(nextTab)
    if (nextTab === 'clients') setSelectedClientId(null)
  }

  function handleOpenClient(clientId) {
    setSelectedClientId(clientId)
    setTab('clients')
  }

  function handleOpenNotes(clientId) {
    if (clientId) setNotesClientId(clientId)
    setTab('notes')
  }

  function handleOpenNotifications() {
    if (isArtist) {
      setTab('notifications')
      return
    }
    setClientNotificationsOpen(true)
  }

  function renderContent() {
    if (isArtist) {
      if (tab === 'clients') {
        return (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div
              className={cn(
                'min-h-0 min-w-0 flex-col overflow-hidden lg:flex lg:w-[22rem] lg:shrink-0 lg:border-r lg:border-coffee/10 xl:w-[24rem]',
                selectedClient ? 'hidden lg:flex' : 'flex'
              )}
            >
              <ClientList
                clients={clients}
                onSelect={handleOpenClient}
                onNewClient={() => setNewClientOpen(true)}
                selectedClientId={selectedClientId}
              />
            </div>

            <div
              className={cn(
                'min-h-0 min-w-0 flex-1 flex-col',
                selectedClient ? 'flex' : 'hidden lg:flex'
              )}
            >
              {selectedClient ? (
                <ClientDetail
                  client={selectedClient}
                  onBack={() => setSelectedClientId(null)}
                  onOpenNotes={() => handleOpenNotes(selectedClient.id)}
                />
              ) : (
                <div className="flex min-h-0 flex-1 items-center justify-center p-8">
                  <Card className="w-full max-w-md">
                    <EmptyState
                      icon={Users}
                      title="Selecciona un cliente"
                      description="Elige una ficha de la lista para revisar su plan, evidencias y notas."
                    />
                  </Card>
                </div>
              )}
            </div>
          </div>
        )
      }

      if (tab === 'photos') {
        return <ArtistPhotoFeed clients={clients} />
      }

      if (tab === 'notes') {
        return (
          <NotesView
            client={notesClient}
            clients={clients}
            onChangeClient={setNotesClientId}
          />
        )
      }

      if (tab === 'notifications') {
        return <ArtistNotifications onOpenClient={handleOpenClient} />
      }
    }

    if (isClient) {
      if (!client) {
        return (
          <div className="phone-scroll flex-1 overflow-y-auto px-4 pb-6 pt-4">
            <EmptyState
              icon={UserRound}
              title="Ficha no encontrada"
              description="Tu cuenta no tiene una ficha de cliente asociada. Contacta con el estudio."
            />
          </div>
        )
      }

      if (tab === 'home') {
        return <ClientHome client={client} onNavigate={setTab} />
      }

      if (tab === 'guide') {
        return <HealingGuide client={client} />
      }

      if (tab === 'photos') {
        return <ClientPhotosView client={client} />
      }

      if (tab === 'notes') {
        return <NotesView client={client} />
      }
    }

    return null
  }

  if (photoPending && tab !== 'photos') {
    return (
      <AppShell>
        <div className="flex min-h-0 flex-1 flex-col">
          <Header
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenNotifications={handleOpenNotifications}
            unreadCount={unread}
            title="Foto pendiente"
          />
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PhotoGate client={client} onOpenPhotos={() => setTab('photos')} />
          </main>
        </div>

        <ToastViewport />

        <Sheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          title="Cuenta y ajustes"
          description="Tu plan, recordatorios y datos de contacto."
        >
          <ClientProfile client={client} />
        </Sheet>

        <ClientNotificationsSheet
          open={clientNotificationsOpen}
          onClose={() => setClientNotificationsOpen(false)}
          client={client}
        />
      </AppShell>
    )
  }

  return (
    <AppShell
      sidebar={
        <Sidebar
          role={user.role}
          active={tab}
          onChange={handleTabChange}
          unreadCount={isArtist ? unread : 0}
          notesUnreadCount={notesUnread}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <Header
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenNotifications={handleOpenNotifications}
          unreadCount={unread}
          title={SECTION_TITLES[user.role]?.[tab] || ''}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden">
            {renderContent()}
          </div>
        </main>

        <BottomNav
          role={user.role}
          active={tab}
          onChange={handleTabChange}
          unreadCount={isArtist ? unread : 0}
          notesUnreadCount={notesUnread}
        />
      </div>

      <ToastViewport />

      <Sheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Cuenta y ajustes"
        description={
          isArtist
            ? 'Marca, equipo, contacto y recordatorios del estudio.'
            : 'Tu plan, recordatorios y datos de contacto.'
        }
      >
        {isArtist ? <ArtistSettings /> : <ClientProfile client={client} />}
      </Sheet>

      {isArtist ? (
        <NewClientSheet open={newClientOpen} onClose={() => setNewClientOpen(false)} />
      ) : null}

      {isClient ? (
        <ClientNotificationsSheet
          open={clientNotificationsOpen}
          onClose={() => setClientNotificationsOpen(false)}
          client={client}
        />
      ) : null}
    </AppShell>
  )
}
