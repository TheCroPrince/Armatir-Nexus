import { cn } from '@/lib/cn'

interface ArmatirMarkProps {
  className?: string
}

// Loads the Armatir wordmark as an inline <img> so it renders even before
// the JS bundle is parsed and respects the surrounding flex/grid sizing.
// The source asset is shipped from /public/armatir-logo.svg.
export function ArmatirMark({ className }: ArmatirMarkProps) {
  return (
    <img
      src="/armatir-logo.svg"
      alt="Armatir"
      width={32}
      height={32}
      className={cn('select-none', className)}
      draggable={false}
    />
  )
}
