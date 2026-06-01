import { createContext, useContext } from 'react'
import type { NexusNotification } from '@/types/nexus'

export interface NexusSettings {
  aiTriage: boolean
  autoEscalation: boolean
  emailAlerts: boolean
  slackAlerts: boolean
  dailyDigest: boolean
  compactMode: boolean
  reduceMotion: boolean
  sampleData: boolean
  threshold: number
}

export const defaultNexusSettings: NexusSettings = {
  aiTriage: true,
  autoEscalation: true,
  emailAlerts: true,
  slackAlerts: true,
  dailyDigest: false,
  compactMode: false,
  reduceMotion: false,
  sampleData: true,
  threshold: 86,
}

export interface NexusSettingsContextValue {
  settings: NexusSettings
  updateSetting: <Key extends keyof NexusSettings>(key: Key, value: NexusSettings[Key]) => void
  resetSettings: () => void
}

export const NexusSettingsContext = createContext<NexusSettingsContextValue | null>(null)

export function useNexusSettings() {
  const context = useContext(NexusSettingsContext)
  if (!context) {
    throw new Error('useNexusSettings must be used inside NexusSettingsContext.Provider')
  }
  return context
}

export function notificationAllowedBySettings(notification: NexusNotification, settings: NexusSettings) {
  if (!settings.emailAlerts && notification.source === 'gmail') return false
  if (!settings.slackAlerts && notification.source === 'slack') return false
  return true
}
