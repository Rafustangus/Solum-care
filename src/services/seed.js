import { assetUrl } from '../lib/assets'
import { daysAgoISO, parseISODate, toISODate } from '../lib/dates'
import { generateChecklist, getHealingDay } from '../lib/healing'

export const SEED_VERSION = 4
export const STUDIO_ID = 'studio-solum'

export const SEED_USERS = [
  {
    id: 'user-mara',
    name: 'Mara Sol',
    email: 'mara@solumcare.app',
    password: 'Solum2026!',
    role: 'artist',
    studioId: STUDIO_ID,
    status: 'active',
    specialty: 'Fundadora · fine line'
  },
  {
    id: 'user-nico',
    name: 'Nico Vela',
    email: 'nico@solumcare.app',
    password: 'Nico2026!',
    role: 'artist',
    studioId: STUDIO_ID,
    status: 'active',
    specialty: 'Blackwork · color'
  },
  {
    id: 'user-lucia',
    name: 'Lucía Ferrer',
    email: 'lucia@example.com',
    password: 'Lucia2026!',
    role: 'client',
    studioId: STUDIO_ID,
    clientId: 'client-lucia',
    status: 'active'
  },
  {
    id: 'user-diego',
    name: 'Diego Ramos',
    email: 'diego@example.com',
    password: 'Cliente2026!',
    role: 'client',
    studioId: STUDIO_ID,
    clientId: 'client-diego',
    status: 'active'
  },
  {
    id: 'user-alba',
    name: 'Alba Ruiz',
    email: 'alba@example.com',
    password: 'Cliente2026!',
    role: 'client',
    studioId: STUDIO_ID,
    clientId: 'client-alba',
    status: 'active'
  },
  {
    id: 'user-marcos',
    name: 'Marcos Vidal',
    email: 'marcos@example.com',
    password: 'Cliente2026!',
    role: 'client',
    studioId: STUDIO_ID,
    clientId: 'client-marcos',
    status: 'active'
  }
]

function timestampDaysAgo(days, hour = 18, minute = 30) {
  const date = parseISODate(daysAgoISO(days))
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function timestampHoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function buildChecklist(technique, currentDay, total, currentDone) {
  const checklist = {}
  for (let day = 1; day <= Math.max(1, currentDay); day += 1) {
    const tasks = generateChecklist(technique, day, total).map((task) => task.id)
    if (day < currentDay) {
      checklist[day] = tasks
    } else {
      checklist[day] = currentDone.filter((id) => tasks.includes(id))
    }
  }
  return checklist
}

function photo({ id, day, src, note, status = 'approved', comment = '', daysAgo, clientId }) {
  return {
    id,
    clientId,
    day,
    src,
    storageKey: null,
    note,
    status,
    artistComment: comment,
    createdAt: timestampDaysAgo(daysAgo),
    reviewedAt: status === 'pending' ? null : timestampDaysAgo(Math.max(0, daysAgo - 1), 19)
  }
}

export function createSeedData() {
  const luciaStart = daysAgoISO(3)
  const diegoStart = daysAgoISO(8)
  const albaStart = daysAgoISO(1)
  const marcosStart = daysAgoISO(11)

  const luciaHealing = getHealingDay(luciaStart, 14)
  const diegoHealing = getHealingDay(diegoStart, 21)
  const albaHealing = getHealingDay(albaStart, 30)
  const marcosHealing = getHealingDay(marcosStart, 21)

  const luciaPhotos = [
    photo({
      id: 'photo-lucia-1',
      clientId: 'client-lucia',
      day: 1,
      src: assetUrl('demo-tattoo-1.svg'),
      note: 'Primer día. La zona está limpia y cubierta.',
      daysAgo: 3
    }),
    photo({
      id: 'photo-lucia-2',
      clientId: 'client-lucia',
      day: 2,
      src: assetUrl('demo-tattoo-2.svg'),
      note: 'Sin rojeces extrañas. Un poco de picor.',
      comment: 'Perfecto, mantén la capa fina de crema.',
      daysAgo: 2
    }),
    photo({
      id: 'photo-lucia-3',
      clientId: 'client-lucia',
      day: 3,
      src: assetUrl('demo-tattoo-3.svg'),
      note: 'Ya se ve más mate. Sin dolor.',
      comment: 'Todo correcto. Hoy toca revisar bordes.',
      daysAgo: 1
    })
  ]

  const diegoPhotos = [1, 3, 5, 7, 9].map((day, index) =>
    photo({
      id: `photo-diego-${day}`,
      clientId: 'client-diego',
      day,
      src: assetUrl(`demo-tattoo-${(index % 4) + 1}.svg`),
      note:
        day === 9
          ? 'Día 9, el film ya retirado. La piel está estable.'
          : 'Control de rutina, sin incidencias.',
      comment: day === 9 ? 'Buena evolución, seguimos.' : 'Revisado, todo bien.',
      daysAgo: 9 - day
    })
  )

  const albaPhotos = [
    photo({
      id: 'photo-alba-1',
      clientId: 'client-alba',
      day: 1,
      src: assetUrl('demo-tattoo-4.svg'),
      note: 'Primera foto tras la sesión.',
      status: 'pending',
      daysAgo: 1
    })
  ]

  const marcosPhotos = [1, 4, 7, 10].map((day, index) =>
    photo({
      id: `photo-marcos-${day}`,
      clientId: 'client-marcos',
      day,
      src: assetUrl(`demo-tattoo-${(index % 4) + 1}.svg`),
      note: 'Seguimiento de la zona de fricción.',
      comment: 'Sin signos de irritación. Bien.',
      daysAgo: 12 - day
    })
  )

  const clients = [
    {
      id: 'client-lucia',
      userId: 'user-lucia',
      studioId: STUDIO_ID,
      assignedArtistId: 'user-mara',
      name: 'Lucía Ferrer',
      email: 'lucia@example.com',
      phone: '+34 611 220 331',
      tattooZone: 'Antebrazo interior',
      technique: 'second-skin',
      startDate: luciaStart,
      durationDays: 14,
      photoFrequency: 'daily',
      planNotes: 'Retirar la segunda piel en la ducha el día 5. Sin piscina.',
      checklist: buildChecklist('second-skin', luciaHealing.day, 14, [
        'wash',
        'dry',
        'cream',
        'second-skin-edges'
      ]),
      photos: luciaPhotos,
      alert: null,
      createdAt: timestampDaysAgo(3, 11)
    },
    {
      id: 'client-diego',
      userId: 'user-diego',
      studioId: STUDIO_ID,
      assignedArtistId: 'user-nico',
      name: 'Diego Ramos',
      email: 'diego@example.com',
      phone: '+34 622 440 118',
      tattooZone: 'Gemelo derecho',
      technique: 'traditional-film',
      startDate: diegoStart,
      durationDays: 21,
      photoFrequency: 'every-2-days',
      planNotes: 'Cambio de film cada 24 h durante los primeros 3 días.',
      checklist: buildChecklist('traditional-film', diegoHealing.day, 21, [
        'wash',
        'cream',
        'film-change'
      ]),
      photos: diegoPhotos,
      alert: null,
      createdAt: timestampDaysAgo(8, 12)
    },
    {
      id: 'client-alba',
      userId: 'user-alba',
      studioId: STUDIO_ID,
      assignedArtistId: 'user-mara',
      name: 'Alba Ruiz',
      email: 'alba@example.com',
      phone: '+34 633 908 442',
      tattooZone: 'Costado / zona de sujeción',
      technique: 'friction-zone',
      startDate: albaStart,
      durationDays: 30,
      photoFrequency: 'daily',
      planNotes: 'Evitar ropa ajustada y revisar pliegues cada noche.',
      checklist: buildChecklist('friction-zone', albaHealing.day, 30, ['wash', 'dry']),
      photos: albaPhotos,
      alert: {
        active: true,
        symptoms: ['rojo', 'hinchazón'],
        note: 'La zona está más roja y caliente de lo normal. Me preocupa el roce del sujetador.',
        createdAt: timestampHoursAgo(5)
      },
      createdAt: timestampDaysAgo(1, 12)
    },
    {
      id: 'client-marcos',
      userId: 'user-marcos',
      studioId: STUDIO_ID,
      assignedArtistId: 'user-nico',
      name: 'Marcos Vidal',
      email: 'marcos@example.com',
      phone: '+34 644 771 509',
      tattooZone: 'Cadera',
      technique: 'second-skin',
      startDate: marcosStart,
      durationDays: 21,
      photoFrequency: 'every-3-days',
      planNotes: 'Cuidado extra con el borde del pantalón.',
      checklist: buildChecklist('second-skin', marcosHealing.day, 21, [
        'wash',
        'cream',
        'second-skin-water',
        'friction-check'
      ]),
      photos: marcosPhotos,
      alert: null,
      createdAt: timestampDaysAgo(11, 17)
    }
  ]

  const notes = [
    {
      id: 'note-lucia-1',
      clientId: 'client-lucia',
      authorId: 'user-mara',
      authorRole: 'artist',
      authorName: 'Mara Sol',
      text: 'Lucía, mantén la segunda piel sin remojar y revisa los bordes esta noche. Si ves líquido acumulado, mándame una foto.',
      linkedDay: 2,
      pinned: true,
      createdAt: timestampHoursAgo(32),
      updatedAt: null,
      edited: false
    },
    {
      id: 'note-lucia-2',
      clientId: 'client-lucia',
      authorId: 'user-lucia',
      authorRole: 'client',
      authorName: 'Lucía Ferrer',
      text: 'Hoy noto algo de picor en el borde, pero no hay rojo. ¿Es normal?',
      linkedDay: 3,
      pinned: false,
      createdAt: timestampHoursAgo(20),
      updatedAt: null,
      edited: false
    },
    {
      id: 'note-lucia-3',
      clientId: 'client-lucia',
      authorId: 'user-mara',
      authorRole: 'artist',
      authorName: 'Mara Sol',
      text: 'Sí, el picor es habitual en esta fase. No rasques y sigue con la crema en capa fina. Lo estamos viendo bien.',
      linkedDay: 3,
      pinned: false,
      createdAt: timestampHoursAgo(18),
      updatedAt: null,
      edited: false
    },
    {
      id: 'note-alba-1',
      clientId: 'client-alba',
      authorId: 'user-alba',
      authorRole: 'client',
      authorName: 'Alba Ruiz',
      text: 'He dormido con la zona cubierta y noto calor. Prefiero avisar antes de cambiar nada.',
      linkedDay: 2,
      pinned: true,
      createdAt: timestampHoursAgo(5),
      updatedAt: null,
      edited: false
    },
    {
      id: 'note-diego-1',
      clientId: 'client-diego',
      authorId: 'user-nico',
      authorRole: 'artist',
      authorName: 'Nico Vela',
      text: 'Diego, el film lo puedes retirar hoy. Lava suave y deja respirar la zona. Nos vemos en la revisión.',
      linkedDay: 9,
      pinned: true,
      createdAt: timestampHoursAgo(40),
      updatedAt: null,
      edited: false
    }
  ]

  const notifications = [
    {
      id: 'notif-1',
      audienceRole: 'artist',
      clientId: 'client-alba',
      type: 'alert',
      title: 'Alerta de Alba Ruiz',
      body: 'Ha reportado rojo, hinchazón y calor en la zona.',
      read: false,
      createdAt: timestampHoursAgo(5)
    },
    {
      id: 'notif-2',
      audienceRole: 'artist',
      clientId: 'client-diego',
      type: 'photo',
      title: 'Nueva foto de Diego Ramos',
      body: 'Diego ha subido la evidencia del día 9.',
      read: false,
      createdAt: timestampHoursAgo(7)
    },
    {
      id: 'notif-3',
      audienceRole: 'artist',
      clientId: 'client-lucia',
      type: 'note',
      title: 'Nota de Lucía Ferrer',
      body: '“Hoy noto algo de picor en el borde…”',
      read: true,
      createdAt: timestampHoursAgo(20)
    },
    {
      id: 'notif-4',
      audienceRole: 'client',
      clientId: 'client-lucia',
      type: 'approval',
      title: 'Foto del día 3 aprobada',
      body: 'Mara ha revisado tu evidencia: “Todo correcto. Hoy toca revisar bordes.”',
      read: false,
      createdAt: timestampHoursAgo(23)
    },
    {
      id: 'notif-5',
      audienceRole: 'client',
      clientId: 'client-lucia',
      type: 'note',
      title: 'Nueva nota de Mara Sol',
      body: '“Sí, el picor es habitual en esta fase. No rasques…”',
      read: false,
      createdAt: timestampHoursAgo(18)
    }
  ]

  return {
    version: SEED_VERSION,
    clients,
    notes,
    notifications,
    careTemplates: [],
    settings: {
      studioWhatsApp: '+34 600 123 456',
      studioEmail: 'hola@solumcare.app',
      reminderTime: '09:00'
    }
  }
}

export function getSeedClientPlan(technique = 'second-skin') {
  return {
    startDate: toISODate(),
    durationDays: technique === 'friction-zone' ? 21 : 14,
    photoFrequency: 'daily'
  }
}
