import { useState } from 'react'
import { Radio, Search, Filter } from 'lucide-react'
import { ActivityFeed } from '@/components/overview/activity-feed'
import type { ActivityStatus } from '@/types/nexus'
import { cn } from '@/lib/cn'

type Filter = 'all' | 'success' | 'info' | 'warning' | 'ai'
type Range = 'today' | '15m'

const filterLabels: Record<Filter, string> = {
  all:     'All',
  success: 'Success',
  info:    'Info',
  warning: 'Warnings',
  ai:      'AI',
}

export function ActivityPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [range, setRange] = useState<Range>('today')
  const statusFilter: ActivityStatus | 'all' = filter
  const sinceMs = range === '15m' ? 15 * 60_000 : 24 * 60 * 60_000

  return (
    <div className="flex flex-col gap-5 px-5 py-6 md:px-7 md:py-7 lg:px-10 lg:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mono-label flex items-center gap-1.5">
            <span className="live-dot" />
            Live · streaming
          </div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
            Activity timeline
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
            Every meaningful operation Nexus performed across your tools — most recent first.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-white/70 px-3 py-1.5 shadow-[var(--shadow-card)]">
            <Search className="h-3.5 w-3.5 text-[var(--color-ink-faint)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events…"
              className="w-44 bg-transparent text-[12px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-ghost)]"
            />
          </label>
          <button
            onClick={() => setRange((current) => current === 'today' ? '15m' : 'today')}
            className="pill !py-1.5"
            aria-label={`Activity range: ${range === 'today' ? 'Today' : 'Last 15 minutes'}`}
          >
            <Filter className="h-3 w-3" /> {range === 'today' ? 'Today' : 'Last 15m'}
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(Object.keys(filterLabels) as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors',
              filter === f
                ? 'bg-white text-[var(--color-ink)] shadow-[var(--shadow-card)]'
                : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-soft)]',
            )}
          >
            {filterLabels[f]}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-faint)]">
          <Radio className="h-3 w-3 text-[var(--color-mint)]" /> 12 events / min
        </span>
      </div>

      {/* Stream */}
      <ActivityFeed
        limit={24}
        className="min-h-[60vh]"
        query={query}
        sinceMs={sinceMs}
        statusFilter={statusFilter}
      />
    </div>
  )
}
