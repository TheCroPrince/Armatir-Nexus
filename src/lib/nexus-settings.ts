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

const nexusSettingsStorageKey = 'armatir:nexus-settings:v1'

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function readThreshold(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return defaultNexusSettings.threshold
  return Math.min(96, Math.max(60, Math.round(value)))
}

export function normalizeNexusSettings(value: unknown): NexusSettings {
  if (!isRecord(value)) return defaultNexusSettings

  return {
    aiTriage: readBoolean(value.aiTriage, defaultNexusSettings.aiTriage),
    autoEscalation: readBoolean(value.autoEscalation, defaultNexusSettings.autoEscalation),
    emailAlerts: readBoolean(value.emailAlerts, defaultNexusSettings.emailAlerts),
    slackAlerts: readBoolean(value.slackAlerts, defaultNexusSettings.slackAlerts),
    dailyDigest: readBoolean(value.dailyDigest, defaultNexusSettings.dailyDigest),
    compactMode: readBoolean(value.compactMode, defaultNexusSettings.compactMode),
    reduceMotion: readBoolean(value.reduceMotion, defaultNexusSettings.reduceMotion),
    sampleData: readBoolean(value.sampleData, defaultNexusSettings.sampleData),
    threshold: readThreshold(value.threshold),
  }
}

export function loadStoredNexusSettings(): NexusSettings {
  if (typeof window === 'undefined') return defaultNexusSettings

  try {
    const raw = window.localStorage.getItem(nexusSettingsStorageKey)
    return raw ? normalizeNexusSettings(JSON.parse(raw)) : defaultNexusSettings
  } catch {
    return defaultNexusSettings
  }
}

export function saveNexusSettings(settings: NexusSettings) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(nexusSettingsStorageKey, JSON.stringify(settings))
  } catch {
    // Storage can fail in private modes; settings should still work for the session.
  }
}
