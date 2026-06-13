import { createElement } from 'react'
import { cn } from '@/lib/cn'
import { integrationsById } from '@/data/nexus'
import { getNexusIcon, isNexusBrandIcon } from '@/types/nexus-icons'
import type { NexusIntegration } from '@/types/nexus'

interface IntegrationChipProps {
  id: string
  /** sm: 22px / md: 28px / lg: 36px */
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  integrationIndex?: Record<string, NexusIntegration>
}

const sizes = {
  sm: { wrap: 'h-6 w-6',  icon: 'h-3 w-3',     brandIcon: 'h-4 w-4'   },
  md: { wrap: 'h-7 w-7',  icon: 'h-3.5 w-3.5', brandIcon: 'h-5 w-5'   },
  lg: { wrap: 'h-9 w-9',  icon: 'h-4 w-4',     brandIcon: 'h-6 w-6'   },
}

export function IntegrationChip({ id, size = 'md', showLabel = false, className, integrationIndex }: IntegrationChipProps) {
  const integration = integrationIndex?.[id] ?? integrationsById[id]
  if (!integration) return null
  const dims = sizes[size]
  const hasBrandIcon = isNexusBrandIcon(integration.icon)
  const icon = createElement(getNexusIcon(integration.icon), {
    className: cn(
      hasBrandIcon ? dims.brandIcon : dims.icon,
      hasBrandIcon ? 'drop-shadow-[0_1px_1px_oklch(100%_0_0_/_0.35)]' : 'text-white drop-shadow-[0_1px_1px_oklch(0%_0_0_/_0.25)]',
    ),
    strokeWidth: 2.2,
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
          'relative inline-flex items-center justify-center shrink-0',
          dims.wrap,
          hasBrandIcon ? 'rounded-[9px] bg-white' : 'rounded-full',
        )}
        style={{
          background: hasBrandIcon
            ? 'oklch(100% 0 0 / 0.94)'
            : `linear-gradient(135deg, ${integration.accent}, oklch(98% 0.01 280))`,
          boxShadow: hasBrandIcon
            ? `0 0 0 1px oklch(88% 0.015 285 / 0.9) inset, 0 3px 9px ${integration.accent.replace(')', ' / 0.22)')}`
            : `0 0 0 1px oklch(100% 0 0 / 0.6) inset, 0 2px 6px ${integration.accent.replace(')', ' / 0.25)')}`,
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
  integrationIndex,
}: {
  ids: string[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
  integrationIndex?: Record<string, NexusIntegration>
}) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      {ids.map((id, i) => (
        <span
          key={id}
          className={cn(i > 0 && '-ml-1.5')}
          style={{ zIndex: ids.length - i }}
        >
          <IntegrationChip id={id} size={size} integrationIndex={integrationIndex} />
        </span>
      ))}
    </span>
  )
}
