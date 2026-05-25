# Nexus — Armatir

An interactive product demo for an AI-powered workflow orchestration platform. Built to feel like a live operational dashboard — not a marketing page.

The experience begins *inside the product*: a full shell with sidebar navigation, a live activity feed, an AI command center, workflow management, an inbox, and an integrations ecosystem. Every interaction is functional.

---

## Features

- **Overview** — Metric grid with sparklines, live activity feed with real-time event prepending, AI command center with cycling recommendations, active workflow list
- **Workflows** — Selectable list with operational detail panel; run/pause toggles with local state
- **Inbox** — AI-triaged action items with inline edit (draft textarea), approve, and dismiss
- **Integrations** — Clustered ecosystem visualization with hover/select detail, sync health, linked workflow inspection
- **Activity** — Full timeline with search, status filter, and time-range filter wired through to the feed
- **Notifications** — Functional bell dropdown: unread badge, All/Unread filter pills, mark-as-read, deep-link navigation, click-outside + ESC dismiss
- **Command palette** — ⌘K fuzzy search across nav, workflows, integrations, and AI actions with keyboard navigation
- **Mobile nav** — Responsive bottom navigation bar for small screens

---

## Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@theme` block, oklch color space) |
| Animation | Framer Motion 12 |
| Routing | React Router DOM v7 |
| Icons | lucide-react |
| Utilities | clsx + tailwind-merge |

---

## Local dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle
npm run lint
```

---

## Project structure

```
src/
├── App.tsx                          # Route tree
├── main.tsx                         # BrowserRouter entry
├── index.css                        # Design tokens + utility classes
├── data/
│   └── nexus.ts                     # All mock data (integrations, workflows, activity, inbox, notifications)
├── types/
│   ├── nexus.ts                     # TypeScript interfaces
│   └── nexus-icons.ts               # Icon registry (brand-icon aliases for lucide v1)
├── lib/
│   ├── cn.ts                        # clsx + twMerge helper
│   └── time.ts                      # relativeTime() formatter
├── components/
│   ├── brand/armatir-mark.tsx       # Logo wrapper
│   ├── layout/
│   │   ├── app-shell.tsx            # Root shell — lifted notifications + palette state
│   │   ├── topbar.tsx               # Top bar: logo, breadcrumb, search, bell, avatar
│   │   ├── sidebar.tsx              # Left nav (desktop)
│   │   └── mobile-nav.tsx           # Bottom nav (mobile)
│   ├── shell/
│   │   ├── command-palette.tsx      # ⌘K overlay
│   │   └── notifications-panel.tsx  # Bell dropdown
│   ├── overview/
│   │   ├── workspace-header.tsx     # Welcome message + range toggle
│   │   ├── metric-row.tsx           # 4-up KPI tiles with sparklines
│   │   ├── activity-feed.tsx        # Live-updating event feed
│   │   ├── ai-command-center.tsx    # Cycling AI recommendations
│   │   └── active-workflows.tsx     # Workflow list with status pills
│   └── ui/
│       ├── integration-chip.tsx     # Circular accent chip
│       ├── sparkline.tsx            # SVG sparkline with gradient fill
│       └── status-pill.tsx          # Status badge
└── pages/
    ├── overview.tsx
    ├── workflows.tsx
    ├── inbox.tsx
    ├── integrations.tsx
    └── activity.tsx
```

---

## Design system

Light glassmorphism aesthetic built on oklch. All tokens live in `src/index.css` under the `@theme` block — no Tailwind config file.

| Token | Value |
|---|---|
| `--color-canvas` | `oklch(98% 0.015 290)` — lavender page base |
| `--color-violet` | `oklch(62% 0.20 285)` — primary brand accent |
| `--color-ink` | `oklch(22% 0.02 280)` — primary text |
| `--color-mint` | `oklch(72% 0.13 165)` — success / connected |
| `--color-amber` | `oklch(78% 0.14 70)` — warning / syncing |
| `--color-rose` | `oklch(65% 0.18 25)` — danger / attention |

`.glass` and `.glass-strong` provide the white-frosted surface style throughout.
