import { getDataMode } from '../lib/dataMode'
import {
  loadBranding as loadLocalBranding,
  loadData as loadLocalData,
  resetData as resetLocalData,
  saveBranding as saveLocalBranding,
  saveData as saveLocalData
} from './api'

export const dataRepositoryMode = getDataMode()

function requireMockMode() {
  if (dataRepositoryMode === 'supabase') {
    throw new Error(
      'El adaptador de Supabase todavía no está implementado. Usa VITE_DATA_MODE=mock.'
    )
  }
}

export function loadData() {
  requireMockMode()
  return loadLocalData()
}

export function saveData(data) {
  requireMockMode()
  return saveLocalData(data)
}

export function resetData() {
  requireMockMode()
  return resetLocalData()
}

export function loadBranding() {
  requireMockMode()
  return loadLocalBranding()
}

export function saveBranding(branding) {
  requireMockMode()
  return saveLocalBranding(branding)
}
