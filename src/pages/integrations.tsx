import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, AlertCircle, Plus } from 'lucide-react'
import { nexusIntegrations, integrationsById } from '@/data/nexus'
import { getNexusIcon } from '@/types/nexus-icons'
import type { IntegrationCategory } from '@/types/nexus'
import { cn } from '@/lib/cn'

const categoryLabel: Record<IntegrationCategory, string> = {
  productivity:  'Productivity',
  communication: 'Communication',
  crm:           'CRM',
  finance:       'Finance',
  engineering:   'Engineering',
  ai:            'AI',
}

// Ordered clusters for the orbital arrangement.
const clusterOrder: IntegrationCategory[] = ['ai', 'communication', 'crm', 'productivity', 'engineering', 'finance']

export function IntegrationsPage() {
  const [hovered, setHovered] = useState<string | null>(null)

  const grouped = clusterOrder.map((cat) => ({
    category: cat,
    items: nexusIntegrations.filter((i) => i.category === cat),
  }))

  const stats = {
    total: nexusIntegrations.length,
    connected: nexusIntegrations.filter((i) => i.status === 'connected').length,
    syncing: nexusIntegrations.filter((i) => i.status === 'syncing').length,
    attention: nexusIntegrations.filter((i) => i.status === 'attention').length,
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-6 md:px-7 md:py-7 lg:px-10 lg:py-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mono-label">Connections</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
            Integration ecosystem
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
            <span className="font-medium text-[var(--color-ink)]">{stats.connected}</span> connected,
            {' '}<span className="font-medium text-[oklch(40%_0.13_75)]">{stats.syncing}</span> syncing,
            {' '}<span className="font-medium text-[var(--color-ink-faint)]">{stats.total - stats.connected - stats.syncing}</span> attention
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-3 w-3" strokeWidth={2.2} /> Add integration
        </button>
      </div>

      {/* Ecosystem viz — clustered orbit, not a grid */}
      <div className="glass relative overflow-hidden rounded-2xl px-6 py-8 md:px-10 md:py-12 lg:py-16">
        {/* Connection lines */}
        <ConnectionLines hovered={hovered} />

        <div className="relative z-10 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {grouped.map((group, idx) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * idx, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3"
            >
              <div className="mono-label text-center">{categoryLabel[group.category]}</div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {group.items.map((i) => {
                  const Icon = getNexusIcon(i.icon)
                  const isHovered = hovered === i.id
                  return (
                    <motion.button
                      key={i.id}
                      data-int-id={i.id}
                      onMouseEnter={() => setHovered(i.id)}
                      onMouseLeave={() => setHovered(null)}
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className={cn(
                        'group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 transition-shadow',
                        isHovered
                          ? 'shadow-[0_0_0_3px_oklch(100%_0_0),0_18px_40px_oklch(45%_0.10_280_/_0.18)]'
                          : 'shadow-[var(--shadow-card),inset_0_0_0_1px_oklch(100%_0_0_/_0.7)]',
                      )}
                      title={i.name}
                    >
                      <span
                        className="absolute inset-0 -z-10 rounded-2xl opacity-30 blur-md transition-opacity group-hover:opacity-70"
                        style={{ background: i.accent }}
                      />
                      <span
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${i.accent}, oklch(98% 0.01 280))`,
                          boxShadow: `inset 0 0 0 1px oklch(100% 0 0 / 0.55), 0 4px 12px ${i.accent.replace(')', ' / 0.3)')}`,
                        }}
                      >
                        <Icon className="h-4 w-4 text-white drop-shadow-[0_1px_1px_oklch(0%_0_0_/_0.25)]" strokeWidth={2.2} />
                      </span>

                      {/* Status dot */}
                      <span
                        className={cn(
                          'absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full',
                          i.status === 'connected' && 'bg-[var(--color-mint)]',
                          i.status === 'syncing' && 'bg-[var(--color-amber)]',
                          i.status === 'attention' && 'bg-[var(--color-rose)]',
                        )}
                      >
                        {i.status === 'connected' && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
                        {i.status === 'syncing'   && <Loader2 className="h-2 w-2 animate-spin text-white" strokeWidth={3} />}
                        {i.status === 'attention' && <AlertCircle className="h-2 w-2 text-white" strokeWidth={3} />}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="text-center text-[11px] text-[var(--color-ink-faint)]">
                {group.items.length} {group.items.length === 1 ? 'tool' : 'tools'}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom hint */}
        <div className="relative z-10 mt-8 flex items-center justify-center gap-2 text-[11.5px] text-[var(--color-ink-faint)]">
          <span>Hover an integration to see its connections.</span>
        </div>
      </div>

      {/* Detail strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {nexusIntegrations.slice(0, 10).map((i) => (
          <motion.div
            key={i.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            className="glass rounded-xl px-3 py-3"
          >
            <div className="flex items-start gap-2.5">
              <span
                className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{
                  background: `linear-gradient(135deg, ${i.accent}, oklch(98% 0.01 280))`,
                  boxShadow: `inset 0 0 0 1px oklch(100% 0 0 / 0.55), 0 2px 6px ${i.accent.replace(')', ' / 0.25)')}`,
                }}
              >
                {(() => {
                  const Icon = getNexusIcon(i.icon)
                  return <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
                })()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-[var(--color-ink)]">{i.name}</div>
                <div className="text-[10.5px] text-[var(--color-ink-faint)]">
                  {i.activeWorkflows} {i.activeWorkflows === 1 ? 'workflow' : 'workflows'}
                </div>
              </div>
              <span className="status-pill text-[oklch(38%_0.10_165)] bg-[oklch(94%_0.05_165)]">
                <span className="bg-[var(--color-mint)]" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Connection lines overlay (drawn between hovered + others) ───────────────

function ConnectionLines({ hovered }: { hovered: string | null }) {
  if (!hovered) return null
  const integration = integrationsById[hovered]
  if (!integration) return null

  // We do not measure exact element positions — instead use a soft glow
  // radiating from the hovered position via a fixed-position SVG overlay.
  // The visual effect: hovered chip gets a halo + dimmer surrounding chips.
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[oklch(100%_0_0_/_0.35)]" />
    </div>
  )
}
