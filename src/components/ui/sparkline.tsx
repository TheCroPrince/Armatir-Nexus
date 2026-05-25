import { useId } from 'react'
import { cn } from '@/lib/cn'

interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  color?: string
  /** Fill gradient under the line. */
  fill?: boolean
  className?: string
  strokeWidth?: number
}

export function Sparkline({
  values,
  width = 120,
  height = 28,
  color = 'oklch(55% 0.20 280)',
  fill = true,
  className,
  strokeWidth = 1.5,
}: SparklineProps) {
  const id = useId().replace(/:/g, '')
  if (values.length === 0) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = width / Math.max(1, values.length - 1)

  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - 4 - ((v - min) / range) * (height - 8)
    return [x, y] as const
  })

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')

  const area = fill
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
          <stop offset="0%"  stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#spark-${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
      <circle cx={last[0]} cy={last[1]} r={5} fill={color} opacity={0.18} />
    </svg>
  )
}
