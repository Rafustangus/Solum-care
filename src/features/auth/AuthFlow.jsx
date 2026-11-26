import { useState } from 'react'
import { ActivateAccountView } from './ActivateAccountView'
import { ForgotPasswordView } from './ForgotPasswordView'
import { LoginView } from './LoginView'

export function AuthFlow() {
  const [screen, setScreen] = useState('login')

  if (screen === 'activate') {
    return <ActivateAccountView onBack={() => setScreen('login')} />
  }

  if (screen === 'forgot') {
    return <ForgotPasswordView onBack={() => setScreen('login')} />
  }

  return (
    <LoginView
      onActivate={() => setScreen('activate')}
      onForgot={() => setScreen('forgot')}
    />
  )
}
