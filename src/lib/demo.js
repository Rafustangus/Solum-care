export const DEMO_ACCOUNTS = {
  client: {
    role: 'client',
    label: 'Entrar como Lucía',
    caption: 'Cliente · día 4 de 14',
    email: 'lucia@example.com',
    password: 'Lucia2026!'
  },
  artist: {
    role: 'artist',
    label: 'Entrar como Mara',
    caption: 'Estudio · 4 clientes activos',
    email: 'mara@solumcare.app',
    password: 'Solum2026!'
  }
}

const demoFlag = import.meta.env.VITE_DEMO_MODE

export const isDemoMode =
  demoFlag === 'true' ? true : demoFlag === 'false' ? false : Boolean(import.meta.env.DEV)
