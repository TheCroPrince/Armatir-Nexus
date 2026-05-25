import { motion } from 'framer-motion'
import { ChevronDown, Filter, Plus } from 'lucide-react'

export function WorkspaceHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-end justify-between gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="mono-label">Tuesday · 11:42 am</span>
          <span className="h-1 w-1 rounded-full bg-[var(--color-ink-ghost)]" />
          <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-soft)]">
            <span className="live-dot" />
            <span>3 workflows running · all systems nominal</span>
          </span>
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight text-[var(--color-ink)]">
          Welcome back, Matthew.
        </h1>
        <p className="text-[13px] text-[var(--color-ink-soft)]">
          Nexus handled <span className="font-medium text-[var(--color-ink)]">31 things</span> while you were away
          — <span className="font-medium text-[var(--color-violet)]">4 need your eyes</span>.
        </p>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <button className="pill !py-1.5 group">
          <Filter className="h-3 w-3" strokeWidth={1.8} />
          <span>Last 7 days</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
        <button className="flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-3 w-3" strokeWidth={2.2} />
          New workflow
        </button>
      </div>
    </motion.div>
  )
}
