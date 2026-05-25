import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Workflow, Inbox as InboxIcon, Boxes, Radio, LayoutDashboard, ArrowRight } from 'lucide-react'
import { nexusWorkflows, nexusIntegrations } from '@/data/nexus'
import { cn } from '@/lib/cn'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

type Command = {
  id: string
  label: string
  hint?: string
  icon: typeof LayoutDashboard
  group: 'Navigate' | 'Workflows' | 'Integrations' | 'AI actions'
  action: () => void
  keywords?: string
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
      const id = setTimeout(() => {
        setQuery('')
        setSelected(0)
        inputRef.current?.focus()
      }, 60)
      return () => clearTimeout(id)
    }
    restoreFocusRef.current?.focus()
    restoreFocusRef.current = null
  }, [open])

  useEffect(() => {
    if (!open) return
    function keepFocus(e: FocusEvent) {
      const target = e.target as Node | null
      if (!target) return
      const panel = inputRef.current?.closest('[role="dialog"]')
      if (panel && !panel.contains(target)) inputRef.current?.focus()
    }
    document.addEventListener('focusin', keepFocus)
    return () => document.removeEventListener('focusin', keepFocus)
  }, [open])

  const commands: Command[] = useMemo(() => {
    const navTo = (to: string) => () => {
      navigate(to)
      onClose()
    }
    return [
      { id: 'go-overview', label: 'Go to Overview',         icon: LayoutDashboard, group: 'Navigate', action: navTo('/'),             keywords: 'home dashboard' },
      { id: 'go-workflows', label: 'Go to Workflows',       icon: Workflow,        group: 'Navigate', action: navTo('/workflows'),    keywords: 'automation' },
      { id: 'go-inbox', label: 'Go to Inbox',               icon: InboxIcon,       group: 'Navigate', action: navTo('/inbox'),        keywords: 'queue triage' },
      { id: 'go-integ', label: 'Go to Integrations',        icon: Boxes,           group: 'Navigate', action: navTo('/integrations'), keywords: 'tools connections' },
      { id: 'go-activity', label: 'Go to Activity',         icon: Radio,           group: 'Navigate', action: navTo('/activity'),     keywords: 'events log live' },
      ...nexusWorkflows.map((w) => ({
        id: `wf-${w.id}`,
        label: w.name,
        hint: w.impact,
        icon: Workflow,
        group: 'Workflows' as const,
        action: () => { navigate(`/workflows?w=${w.id}`); onClose() },
      })),
      ...nexusIntegrations.map((i) => ({
        id: `int-${i.id}`,
        label: `${i.name} integration`,
        hint: i.status === 'connected' ? 'Connected' : i.status === 'syncing' ? 'Syncing now' : 'Needs attention',
        icon: Boxes,
        group: 'Integrations' as const,
        action: () => { navigate('/integrations'); onClose() },
      })),
      { id: 'ai-draft',   label: 'Draft a reply to the latest inbound', icon: Sparkles, group: 'AI actions', action: () => { navigate('/inbox'); onClose() }, hint: 'Claude · ⌘ ↵' },
      { id: 'ai-summary', label: 'Summarize today\'s activity',          icon: Sparkles, group: 'AI actions', action: () => { navigate('/activity'); onClose() }, hint: 'GPT-4o' },
    ]
  }, [navigate, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) =>
      [c.label, c.hint, c.keywords, c.group].filter(Boolean).some((s) => s!.toLowerCase().includes(q)),
    )
  }, [commands, query])

  // Group results
  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    filtered.forEach((c) => {
      groups[c.group] ??= []
      groups[c.group]!.push(c)
    })
    return groups
  }, [filtered])

  const safeSelected = Math.min(selected, Math.max(filtered.length - 1, 0))
  const activeCommand = filtered[safeSelected]

  // Keyboard handling
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, Math.max(filtered.length - 1, 0)))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        filtered[safeSelected]?.action()
      } else if (e.key === 'Tab') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, safeSelected])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <div
            className="absolute inset-0 bg-[oklch(60%_0.10_280_/_0.18)] backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong relative z-10 w-full max-w-[580px] overflow-hidden rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline-soft)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--color-ink-faint)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                placeholder="Search or run a command…"
                className="flex-1 bg-transparent text-[14px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-ghost)]"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-palette-results"
                aria-activedescendant={activeCommand ? `command-${activeCommand.id}` : undefined}
              />
              <kbd>esc</kbd>
            </div>

            <div id="command-palette-results" className="max-h-[55vh] overflow-y-auto p-2" role="listbox" aria-label="Command results">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-2 last:mb-0">
                  <div className="mono-label px-2 pb-1 pt-1">{group}</div>
                  {items.map((cmd) => {
                    const globalIdx = filtered.indexOf(cmd)
                    const isActive = globalIdx === selected
                    return (
                      <button
                        key={cmd.id}
                        id={`command-${cmd.id}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setSelected(globalIdx)}
                        onClick={cmd.action}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                          isActive ? 'bg-white shadow-[var(--shadow-card)]' : 'hover:bg-white/50',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-md',
                            isActive
                              ? 'bg-[oklch(94%_0.05_285)] text-[var(--color-violet)]'
                              : 'bg-[var(--color-canvas-deep)] text-[var(--color-ink-faint)]',
                          )}
                        >
                          <cmd.icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </span>
                        <span className="flex-1 truncate text-[13px] text-[var(--color-ink)]">{cmd.label}</span>
                        {cmd.hint && (
                          <span className="text-[11px] text-[var(--color-ink-faint)]">{cmd.hint}</span>
                        )}
                        {isActive && <ArrowRight className="h-3.5 w-3.5 text-[var(--color-violet)]" />}
                      </button>
                    )
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-[13px] text-[var(--color-ink-faint)]">
                  No results — try a workflow name or "draft".
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-hairline-soft)] bg-[oklch(99%_0.005_280_/_0.6)] px-3 py-2 text-[11px] text-[var(--color-ink-faint)]">
              <span className="flex items-center gap-1.5">
                <kbd>↑</kbd><kbd>↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd>↵</kbd> run
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[var(--color-violet)]" /> Nexus is listening
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
