import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { MobileNav } from './mobile-nav'
import { CommandPalette } from '@/components/shell/command-palette'
import { NotificationsPanel } from '@/components/shell/notifications-panel'
import { SettingsPanel } from '@/components/shell/settings-panel'
import { nexusNotifications } from '@/data/nexus'
import type { NexusNotification } from '@/types/nexus'

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NexusNotification[]>(nexusNotifications)

  // ⌘K / Ctrl+K → palette. ESC → close any open overlay.
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

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="nexus-canvas nexus-grain relative isolate min-h-dvh">
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
        notifications={notifications}
        onUpdate={setNotifications}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <MobileNav onOpenSettings={() => { setSettingsOpen(true); setPaletteOpen(false); setNotificationsOpen(false) }} />
    </div>
  )
}
