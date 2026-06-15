import { cn } from '@/lib/cn'

interface ArmatirMarkProps {
  className?: string
}

const logoSrc = '/armatir-logo(768%20x%20512%20px).png'

// Loads the Armatir mark as an inline <img> so it renders even before
// the JS bundle is parsed and respects the surrounding flex/grid sizing.
export function ArmatirMark({ className }: ArmatirMarkProps) {
  return (
    <img
      src={logoSrc}
      alt="Armatir"
      width={32}
      height={32}
      className={cn('select-none object-contain', className)}
      draggable={false}
    />
  )
}
