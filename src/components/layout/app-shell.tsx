import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { MobileNav } from './mobile-nav'
import { CommandPalette } from '@/components/shell/command-palette'
import { NotificationsPanel } from '@/components/shell/notifications-panel'
import { SettingsPanel } from '@/components/shell/settings-panel'
import { nexusNotifications } from '@/data/nexus'
import {
  NexusSettingsContext,
  defaultNexusSettings,
  loadStoredNexusSettings,
  notificationAllowedBySettings,
  saveNexusSettings,
} from '@/lib/nexus-settings'
import { cn } from '@/lib/cn'
import { NexusDemoStateProvider } from '@/lib/nexus-demo-state'
import type { NexusNotification } from '@/types/nexus'

const dailyDigestTimestamp = new Date(Date.now() - 2 * 60_000).toISOString()

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NexusNotification[]>(nexusNotifications)
  const [dailyDigestRead, setDailyDigestRead] = useState(false)
  const [settings, setSettings] = useState(loadStoredNexusSettings)

  const updateSetting = useCallback(
    <Key extends keyof typeof defaultNexusSettings>(key: Key, value: (typeof defaultNexusSettings)[Key]) => {
      setSettings((current) => ({ ...current, [key]: value }))
    },
    [],
  )

  const resetSettings = useCallback(() => {
    setSettings(defaultNexusSettings)
  }, [])

  useEffect(() => {
    saveNexusSettings(settings)
  }, [settings])

  // Command palette shortcuts and Escape close handling.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        setNotificationsOpen(false)
        setSettingsOpen(false)
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false)
        setNotificationsOpen(false)
        setSettingsOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const dailyDigestNotification = useMemo<NexusNotification | null>(() => {
    if (!settings.dailyDigest) return null

    return {
      id: 'daily-digest-summary',
      kind: 'system',
      title: 'Daily digest scheduled for 5:00 PM',
      body: 'Approvals, workflow runs, and exceptions will roll up into the operator summary.',
      timestamp: dailyDigestTimestamp,
      read: dailyDigestRead,
      href: '/activity',
      action: 'View digest',
    }
  }, [dailyDigestRead, settings.dailyDigest])

  const notificationsWithSettings = useMemo(
    () => dailyDigestNotification ? [dailyDigestNotification, ...notifications] : notifications,
    [dailyDigestNotification, notifications],
  )

  const visibleNotifications = useMemo(
    () => notificationsWithSettings.filter((notification) => notificationAllowedBySettings(notification, settings)),
    [notificationsWithSettings, settings],
  )
  const unreadCount = visibleNotifications.filter((n) => !n.read).length

  function updateVisibleNotifications(nextVisible: NexusNotification[]) {
    const nextDigest = nextVisible.find((notification) => notification.id === 'daily-digest-summary')
    if (nextDigest) setDailyDigestRead(nextDigest.read)

    setNotifications((current) => current.map((notification) =>
      nextVisible.find((next) => next.id === notification.id) ?? notification,
    ))
  }

  return (
    <NexusSettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      <NexusDemoStateProvider>
        <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'never'}>
          <div
          data-nexus-shell
          data-ai-triage={settings.aiTriage ? 'on' : 'off'}
          data-auto-escalation={settings.autoEscalation ? 'on' : 'off'}
          data-density={settings.compactMode ? 'compact' : 'comfortable'}
          data-daily-digest={settings.dailyDigest ? 'on' : 'off'}
          data-email-alerts={settings.emailAlerts ? 'on' : 'off'}
          data-motion={settings.reduceMotion ? 'reduced' : 'full'}
          data-sample-data={settings.sampleData ? 'on' : 'off'}
          data-slack-alerts={settings.slackAlerts ? 'on' : 'off'}
          className={cn(
            'nexus-canvas nexus-grain relative isolate min-h-dvh',
            settings.compactMode && 'nexus-compact',
            settings.reduceMotion && 'nexus-reduce-motion',
          )}
        >
      {/* Floating decorative blobs — anchor the painterly feel without overwhelming the UI */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[80vh] opacity-90"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 80% 10%, oklch(82% 0.12 295 / 0.6) 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 30% at 15% 0%, oklch(86% 0.10 230 / 0.5) 0%, transparent 60%),' +
            'radial-gradient(ellipse 35% 25% at 50% -5%, oklch(88% 0.10 320 / 0.45) 0%, transparent 70%)',
        }}
      />

      <Topbar
        onOpenPalette={() => { setPaletteOpen(true); setNotificationsOpen(false); setSettingsOpen(false) }}
        onOpenSettings={() => { setSettingsOpen(true); setPaletteOpen(false); setNotificationsOpen(false) }}
        onAskNexus={() => { setPaletteOpen(true); setNotificationsOpen(false); setSettingsOpen(false) }}
        onToggleNotifications={() => { setNotificationsOpen((o) => !o); setPaletteOpen(false); setSettingsOpen(false) }}
        notificationsOpen={notificationsOpen}
        unreadCount={unreadCount}
      />

      <div className="relative z-10 flex">
        <Sidebar onOpenSettings={() => { setSettingsOpen(true); setPaletteOpen(false); setNotificationsOpen(false) }} />

        <div className="flex-1 min-w-0 pb-20 md:pb-0">
          <Outlet />
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <NotificationsPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onOpenSettings={() => { setSettingsOpen(true); setPaletteOpen(false); setNotificationsOpen(false) }}
        notifications={visibleNotifications}
        onUpdate={updateVisibleNotifications}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <MobileNav onOpenSettings={() => { setSettingsOpen(true); setPaletteOpen(false); setNotificationsOpen(false) }} />
          </div>
        </MotionConfig>
      </NexusDemoStateProvider>
    </NexusSettingsContext.Provider>
  )
}
