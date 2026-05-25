import { useId } from 'react'
import { cn } from '@/lib/cn'

interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  color?: string
  tone?: 'violet' | 'mint' | 'rose' | 'blue' | 'neutral'
  trend?: 'up' | 'down' | 'steady'
  /** Fill gradient under the line. */
  fill?: boolean
  showFill?: boolean
  emphasis?: 'subtle' | 'normal' | 'strong'
  className?: string
  strokeWidth?: number
}

const toneColor = {
  violet: 'oklch(55% 0.20 280)',
  mint: 'oklch(52% 0.15 155)',
  rose: 'oklch(56% 0.20 25)',
  blue: 'oklch(56% 0.18 245)',
  neutral: 'oklch(46% 0.05 280)',
} as const

function curvedPath(points: Array<readonly [number, number]>) {
  if (points.length < 2) return ''

  return points.reduce((path, point, i) => {
    const [x, y] = point
    if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`

    const [x0, y0] = points[i - 2] ?? points[i - 1]!
    const [x1, y1] = points[i - 1]!
    const [x2, y2] = point
    const [x3, y3] = points[i + 1] ?? point
    const cp1x = x1 + (x2 - x0) / 6
    const cp1y = y1 + (y2 - y0) / 6
    const cp2x = x2 - (x3 - x1) / 6
    const cp2y = y2 - (y3 - y1) / 6

    return `${path} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`
  }, '')
}

export function Sparkline({
  values,
  width = 120,
  height = 28,
  color,
  tone = 'violet',
  trend,
  fill = true,
  showFill,
  emphasis = 'normal',
  className,
  strokeWidth = 1.5,
}: SparklineProps) {
  const id = useId().replace(/:/g, '')
  if (values.length === 0) return null
  const shouldFill = showFill ?? fill
  const resolvedTone = trend === 'down' ? 'rose' : trend === 'steady' ? 'blue' : tone
  const resolvedColor = color ?? toneColor[resolvedTone]
  const glowOpacity = emphasis === 'strong' ? 0.22 : emphasis === 'subtle' ? 0.08 : 0.14
  const fillOpacity = emphasis === 'strong' ? 0.26 : emphasis === 'subtle' ? 0.12 : 0.2

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padX = 2
  const padY = 4
  const stepX = (width - padX * 2) / Math.max(1, values.length - 1)

  const points = values.map((v, i) => {
    const x = padX + i * stepX
    const y = height - padY - ((v - min) / range) * (height - padY * 2)
    return [x, y] as const
  })

  const line = curvedPath(points)

  const area = shouldFill
    ? `${line} L ${width.toFixed(2)} ${height} L 0 ${height} Z`
    : ''

  const last = points[points.length - 1]!

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor={resolvedColor} stopOpacity={fillOpacity} />
          <stop offset="72%" stopColor={resolvedColor} stopOpacity={fillOpacity * 0.28} />
          <stop offset="100%" stopColor={resolvedColor} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${id}`} x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {shouldFill && <path d={area} fill={`url(#spark-${id})`} />}
      <path
        d={line}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={strokeWidth + 2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={glowOpacity}
        filter={`url(#glow-${id})`}
      />
      <path d={line} fill="none" stroke={resolvedColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={6} fill={resolvedColor} opacity={0.12} />
      <circle cx={last[0]} cy={last[1]} r={3.2} fill="white" opacity={0.95} />
      <circle cx={last[0]} cy={last[1]} r={2.1} fill={resolvedColor} />
    </svg>
  )
}
