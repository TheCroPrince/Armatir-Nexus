import { createElement } from 'react'
import { cn } from '@/lib/cn'
import { integrationsById } from '@/data/nexus'
import { getNexusIcon } from '@/types/nexus-icons'

interface IntegrationChipProps {
  id: string
  /** sm: 22px / md: 28px / lg: 36px */
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizes = {
  sm: { wrap: 'h-6 w-6',  icon: 'h-3 w-3'   },
  md: { wrap: 'h-7 w-7',  icon: 'h-3.5 w-3.5' },
  lg: { wrap: 'h-9 w-9',  icon: 'h-4 w-4'   },
}

export function IntegrationChip({ id, size = 'md', showLabel = false, className }: IntegrationChipProps) {
  const integration = integrationsById[id]
  if (!integration) return null
  const dims = sizes[size]
  const icon = createElement(getNexusIcon(integration.icon), {
    className: dims.icon,
  })

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2',
        showLabel ? 'rounded-full bg-white/70 pl-1 pr-3 shadow-[var(--shadow-card)]' : '',
        className,
      )}
    >
      <span
        className={cn(
          'relative inline-flex items-center justify-center rounded-full shrink-0 bg-white',
          dims.wrap,
        )}
        style={{
          boxShadow: `0 0 0 1px oklch(100% 0 0 / 0.9) inset, 0 0 0 1px ${integration.accent.replace(')', ' / 0.18)')}, 0 2px 6px ${integration.accent.replace(')', ' / 0.22)')}`,
        }}
        title={integration.name}
      >
        {icon}
      </span>
      {showLabel && (
        <span className="text-[12.5px] font-medium text-[var(--color-ink)]">{integration.name}</span>
      )}
    </span>
  )
}

/** Overlapping cluster — for showing 3-5 integrations in a single row. */
export function IntegrationCluster({
  ids,
  size = 'md',
  className,
}: {
  ids: string[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      {ids.map((id, i) => (
        <span
          key={id}
          className={cn(i > 0 && '-ml-1.5')}
          style={{ zIndex: ids.length - i }}
        >
          <IntegrationChip id={id} size={size} />
        </span>
      ))}
    </span>
  )
}
