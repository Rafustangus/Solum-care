import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/manrope'
import './assets/styles/globals.css'
import { App } from './App'
import { AppDataProvider } from './context/AppDataContext'
import { AuthProvider } from './context/AuthContext'
import { BrandingProvider } from './context/BrandingContext'
import { NotificationProvider } from './context/NotificationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrandingProvider>
        <AppDataProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AppDataProvider>
      </BrandingProvider>
    </AuthProvider>
  </StrictMode>
)
