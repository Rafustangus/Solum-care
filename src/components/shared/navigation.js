import { Bell, BookOpen, Camera, Home, Images, StickyNote, Users } from 'lucide-react'

export const NAV_ICONS = {
  home: Home,
  guide: BookOpen,
  photos: Camera,
  notes: StickyNote,
  clients: Users,
  gallery: Images,
  notifications: Bell
}

export const NAV_ITEMS = {
  client: [
    { id: 'home', label: 'Inicio', icon: 'home' },
    { id: 'guide', label: 'Guía', icon: 'guide' },
    { id: 'photos', label: 'Fotos', icon: 'photos' },
    { id: 'notes', label: 'Notas', icon: 'notes' }
  ],
  artist: [
    { id: 'clients', label: 'Clientes', icon: 'clients' },
    { id: 'photos', label: 'Fotos', icon: 'gallery' },
    { id: 'notes', label: 'Notas', icon: 'notes' },
    { id: 'notifications', label: 'Avisos', icon: 'notifications' }
  ]
}

export const SECTION_TITLES = {
  client: {
    home: 'Inicio',
    guide: 'Guía de curación',
    photos: 'Fotos',
    notes: 'Notas'
  },
  artist: {
    clients: 'Clientes',
    photos: 'Evidencias',
    notes: 'Notas',
    notifications: 'Avisos'
  }
}
