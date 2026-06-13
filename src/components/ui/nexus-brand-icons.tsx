import type { SVGProps } from 'react'

type BrandIconProps = SVGProps<SVGSVGElement> & { title?: string }

export function GmailIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <path fill="#EA4335" d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Z" />
      <path fill="#FBBC04" d="M4 19h4v-8.2L2 6.6V17c0 1.1.9 2 2 2Z" />
      <path fill="#34A853" d="M16 19h4c1.1 0 2-.9 2-2V6.6l-6 4.2V19Z" />
      <path fill="#4285F4" d="M8 19h8v-8.2L12 13.6l-4-2.8V19Z" />
      <path fill="#C5221F" d="M12 13.6 2 6.6V7c0 .7.36 1.32.93 1.68L12 15l9.07-6.32C21.64 8.32 22 7.7 22 7v-.4l-10 7Z" />
      <path fill="#EA4335" d="M12 12 2.7 5.5A1.99 1.99 0 0 1 4 5h16c.49 0 .94.18 1.3.5L12 12Z" />
    </svg>
  )
}

export function SlackIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 54 54" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <path fill="#36C5F0" d="M19.7 9.1c0-2.7-2.2-4.9-4.9-4.9s-4.9 2.2-4.9 4.9v4.9h4.9c2.7 0 4.9-2.2 4.9-4.9Zm0 9.8v14.7c0 2.7-2.2 4.9-4.9 4.9s-4.9-2.2-4.9-4.9V18.9h9.8Z" />
      <path fill="#2EB67D" d="M44.9 19.7c2.7 0 4.9-2.2 4.9-4.9s-2.2-4.9-4.9-4.9-4.9 2.2-4.9 4.9v4.9h4.9Zm-9.8 0H20.4c-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9h14.7v-9.8Z" />
      <path fill="#ECB22E" d="M34.3 44.9c0 2.7 2.2 4.9 4.9 4.9s4.9-2.2 4.9-4.9v-4.9h-4.9c-2.7 0-4.9 2.2-4.9 4.9Zm0-9.8V20.4c0-2.7 2.2-4.9 4.9-4.9s4.9 2.2 4.9 4.9v14.7h-9.8Z" />
      <path fill="#E01E5A" d="M9.1 34.3c-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9 4.9-2.2 4.9-4.9v-4.9H9.1Zm9.8 0h14.7c2.7 0 4.9-2.2 4.9-4.9s-2.2-4.9-4.9-4.9H18.9v9.8Z" />
    </svg>
  )
}

export function GoogleCalendarIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <path fill="#fff" d="M5 3h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2Z" />
      <path fill="#1A73E8" d="M5 3h14c1.1 0 2 .9 2 2v4H3V5c0-1.1.9-2 2-2Z" />
      <path fill="#34A853" d="M3 9h4v12H5c-1.1 0-2-.9-2-2V9Z" />
      <path fill="#FBBC04" d="M17 9h4v10c0 1.1-.9 2-2 2h-2V9Z" />
      <path fill="#EA4335" d="M7 3h10v6H7V3Z" opacity=".9" />
      <path fill="#1A73E8" d="M8.6 17.2c.38.36.93.58 1.63.58.77 0 1.38-.27 1.83-.8.45-.53.68-1.28.68-2.25 0-.95-.22-1.7-.67-2.24a2.28 2.28 0 0 0-1.84-.82c-.71 0-1.26.2-1.65.6-.39.39-.6.89-.63 1.49h1.22c.03-.33.14-.6.32-.79.18-.2.43-.3.74-.3.39 0 .7.17.93.5.22.33.34.82.34 1.46v.1h-.03c-.28-.45-.75-.68-1.4-.68-.62 0-1.13.18-1.53.55-.4.36-.6.83-.6 1.42 0 .48.2.88.58 1.24Zm1.73-.44c-.34 0-.61-.1-.82-.31a1.02 1.02 0 0 1-.31-.76c0-.31.1-.56.31-.75.2-.2.48-.3.82-.3.32 0 .59.1.8.29.2.2.31.45.31.75 0 .31-.1.57-.31.77-.21.2-.48.31-.8.31Zm4.3.92h1.22v-5.9h-1.01l-1.69 1.2v1.22l1.45-1.04h.03v4.52Z" />
    </svg>
  )
}

export function HubSpotIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <path fill="#FF5C35" d="M18.1 7.2a2.38 2.38 0 0 0-1.77.8l-3.64-2.83c.04-.18.06-.36.06-.55a2.38 2.38 0 1 0-1.36 2.15l3.58 2.78a5.37 5.37 0 0 0-.32 1.84c0 .76.16 1.49.45 2.14l-2.15 2.15a3.1 3.1 0 1 0 1.36 1.46l2.07-2.08a5.38 5.38 0 1 0 1.72-10.47Zm0 7.64a2.26 2.26 0 1 1 0-4.52 2.26 2.26 0 0 1 0 4.52ZM6.35 20.05a1.36 1.36 0 1 1 0-2.72 1.36 1.36 0 0 1 0 2.72Z" />
    </svg>
  )
}

export function NotionIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <path fill="#fff" stroke="#111" strokeWidth="1.35" d="M5.04 3.3 17.9 2.35c1.28-.1 2.1.52 2.22 1.72l.9 13.48c.08 1.3-.6 2.04-1.84 2.13l-12.9.95c-1.2.09-2.05-.52-2.14-1.77L3.2 5.42c-.09-1.23.58-2.03 1.84-2.12Z" />
      <path fill="#111" d="m8.1 8.12.44.55v7.1l-.7.47v.52h3.05v-.52l-.8-.49v-5.8l4.76 6.86h1.04V7.92l.7-.45v-.52h-2.93v.52l.78.47v5.25L10.1 6.95H7.88v.52l.22.65Z" />
    </svg>
  )
}

export function StripeIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <rect width="24" height="24" rx="5.2" fill="#635BFF" />
      <path fill="#fff" d="M13.12 10.04c-1.35-.5-2.1-.88-2.1-1.5 0-.52.43-.82 1.24-.82 1.48 0 2.98.56 4.02 1.08V5.58a10.26 10.26 0 0 0-4.1-.78c-3.37 0-5.52 1.75-5.52 4.24 0 2.6 1.88 3.71 4.75 4.75 1.5.54 2 .92 2 1.52 0 .58-.5.9-1.44.9-1.29 0-3.31-.62-4.65-1.39v3.27c1.15.64 2.75 1.1 4.63 1.1 3.45 0 5.81-1.7 5.81-4.36 0-2.28-1.4-3.57-4.64-4.79Z" />
    </svg>
  )
}

export function LinearIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <rect width="24" height="24" rx="5.4" fill="#5E6AD2" />
      <path fill="#fff" d="M5.34 14.9c.29.73.74 1.4 1.31 1.98l10.23-10.23a6.52 6.52 0 0 0-1.97-1.31L5.34 14.9Zm-.57-2.74 7.39-7.39a6.63 6.63 0 0 0-2.96.74L5.5 9.2a6.64 6.64 0 0 0-.74 2.96Zm4.55 6.64a6.63 6.63 0 0 0 2.95-.74l5.8-5.8a6.63 6.63 0 0 0 .74-2.95L9.32 18.8Zm5.59-.14a6.66 6.66 0 0 0 3.76-3.76l-3.76 3.76ZM6.2 6.2a6.66 6.66 0 0 0-1.54 2.2L8.4 4.66A6.66 6.66 0 0 0 6.2 6.2Z" />
    </svg>
  )
}

export function GitHubIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <path fill="#181717" d="M12 2.25c-5.44 0-9.75 4.42-9.75 9.86 0 4.33 2.8 8.02 6.68 9.32.49.09.67-.21.67-.48v-1.7c-2.72.6-3.3-1.18-3.3-1.18-.44-1.15-1.08-1.45-1.08-1.45-.89-.62.07-.61.07-.61.98.07 1.5 1.02 1.5 1.02.87 1.52 2.29 1.08 2.85.83.09-.64.34-1.08.62-1.33-2.17-.25-4.45-1.1-4.45-4.87 0-1.08.38-1.96 1-2.65-.1-.25-.44-1.27.1-2.62 0 0 .83-.27 2.69 1.01A9.2 9.2 0 0 1 12 7.03c.83 0 1.66.11 2.44.33 1.86-1.28 2.68-1.01 2.68-1.01.54 1.35.2 2.37.1 2.62.63.69 1 1.57 1 2.65 0 3.78-2.29 4.62-4.47 4.87.35.3.67.91.67 1.84v2.72c0 .27.18.58.68.48a9.83 9.83 0 0 0 6.65-9.42c0-5.44-4.31-9.86-9.75-9.86Z" />
    </svg>
  )
}

export function OpenAIIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <path fill="#111827" d="M20.2 9.64a5.01 5.01 0 0 0-6.83-6.18 5 5 0 0 0-8.03 3.47 5 5 0 0 0-1.54 7.43 5.01 5.01 0 0 0 6.83 6.18 5 5 0 0 0 8.03-3.47 5 5 0 0 0 1.54-7.43Zm-8.18 9.56a3.42 3.42 0 0 1-2.2-.8l.11-.07 3.66-2.11a.82.82 0 0 0 .42-.72v-5.16l1.55.9v4.36a3.55 3.55 0 0 1-3.54 3.6Zm-6.84-5.63a3.43 3.43 0 0 1-.42-2.3l.1.07 3.66 2.12c.26.15.58.15.84 0l4.47-2.58v1.79l-3.78 2.18a3.55 3.55 0 0 1-4.87-1.28Zm1.7-6.44a3.42 3.42 0 0 1 1.78-1.5v4.31c0 .3.16.58.42.73l4.47 2.58-1.55.9-3.78-2.18a3.55 3.55 0 0 1-1.34-4.84Zm8.61 6.19-4.02-2.32V6.36l4.02 2.32v4.64Zm1.63 3.55a3.42 3.42 0 0 1-1.78 1.5v-4.31a.84.84 0 0 0-.42-.73l-4.47-2.58 1.55-.9 3.78 2.18a3.55 3.55 0 0 1 1.34 4.84Zm2.12-4.14-.1-.07-3.66-2.12a.84.84 0 0 0-.84 0l-4.47 2.58v-1.79l3.78-2.18a3.55 3.55 0 0 1 5.29 3.58ZM14.18 5.67l-3.66 2.11a.82.82 0 0 0-.42.72v5.16l-1.55-.9V8.4a3.55 3.55 0 0 1 5.74-2.8l-.11.07Z" />
    </svg>
  )
}

export function ClaudeIcon({ className, title, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <rect width="24" height="24" rx="5.4" fill="#D97757" />
      <path fill="#FEF7ED" d="M12 4.4 14.1 9l4.9-1.28-2.75 4.26L20 15.4l-5.07.7.28 5.06L12 17.22l-3.21 3.94.28-5.06-5.07-.7 3.75-3.42L5 7.72 9.9 9 12 4.4Z" />
      <path fill="#7C2D12" opacity=".18" d="m12 4.4 2.1 4.6 4.9-1.28-7 9.5-3.21 3.94.28-5.06-5.07-.7 3.75-3.42L5 7.72 9.9 9 12 4.4Z" />
    </svg>
  )
}
