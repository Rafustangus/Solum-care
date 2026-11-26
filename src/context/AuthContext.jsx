import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  activateAccount as activateAccountService,
  ensureAuthSeed,
  inviteUser as inviteUserService,
  login as loginService,
  logout as logoutService,
  requestPasswordReset,
  resetPassword as resetPasswordService,
  restoreSession,
  updateAccount as updateAccountService
} from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function boot() {
      try {
        await ensureAuthSeed()
        const restored = await restoreSession()
        if (mounted) setUser(restored)
      } catch (error) {
        console.error('Error al iniciar autenticación', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    boot()
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (email, password, remember = true) => {
    const nextUser = await loginService(email, password, remember)
    setUser(nextUser)
    return nextUser
  }, [])

  const logout = useCallback(() => {
    logoutService()
    setUser(null)
  }, [])

  const activate = useCallback(async (email, code, password) => {
    const nextUser = await activateAccountService(email, code, password)
    setUser(nextUser)
    return nextUser
  }, [])

  const inviteUser = useCallback(async (payload) => inviteUserService(payload), [])

  const requestReset = useCallback(async (email) => requestPasswordReset(email), [])

  const resetPassword = useCallback(
    async (email, code, password) => resetPasswordService(email, code, password),
    []
  )

  const updateAccount = useCallback(
    async (patch) => {
      if (!user) return null
      const nextUser = await updateAccountService(user.id, patch)
      setUser(nextUser)
      return nextUser
    },
    [user]
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isArtist: user?.role === 'artist',
      isClient: user?.role === 'client',
      login,
      logout,
      activate,
      inviteUser,
      requestReset,
      resetPassword,
      updateAccount
    }),
    [
      user,
      loading,
      login,
      logout,
      activate,
      inviteUser,
      requestReset,
      resetPassword,
      updateAccount
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
