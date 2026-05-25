import { motion } from 'framer-motion'
import { ArrowUpRight, Minus, TrendingUp } from 'lucide-react'
import { nexusMetrics } from '@/data/nexus'
import { Sparkline } from '@/components/ui/sparkline'
import { cn } from '@/lib/cn'

const trendIcon = {
  up:     <ArrowUpRight className="h-3 w-3" strokeWidth={2.2} />,
  down:   <ArrowUpRight className="h-3 w-3 rotate-90" strokeWidth={2.2} />,
  steady: <Minus className="h-3 w-3" strokeWidth={2.2} />,
}

const trendColor = {
  up:     'text-[oklch(40%_0.13_155)] bg-[oklch(94%_0.05_165)]',
  down:   'text-[oklch(40%_0.18_25)] bg-[oklch(94%_0.05_25)]',
  steady: 'text-[var(--color-ink-soft)] bg-[var(--color-canvas-deep)]',
} as const

export function MetricRow() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {nexusMetrics.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] }}
          className="glass relative overflow-hidden rounded-2xl p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11.5px] text-[var(--color-ink-faint)]">{m.label}</div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-[26px] font-semibold tracking-tight text-[var(--color-ink)] tabular-nums">
                  {m.value}
                </span>
              </div>
            </div>

            <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-medium', trendColor[m.trend])}>
              {trendIcon[m.trend]}
              <span className="tabular-nums">{m.delta}</span>
            </span>
          </div>

          <div className="mt-2 -mx-1">
            <Sparkline
              values={m.sparkline}
              width={200}
              height={28}
              color={m.trend === 'down' ? 'oklch(55% 0.20 25)' : 'oklch(55% 0.20 280)'}
            />
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--color-ink-faint)]">
            <TrendingUp className="h-3 w-3" strokeWidth={1.6} />
            <span className="line-clamp-1">{m.caption}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
