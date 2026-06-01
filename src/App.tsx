import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'

const OverviewPage = lazy(() => import('@/pages/overview').then((module) => ({ default: module.OverviewPage })))
const WorkflowsPage = lazy(() => import('@/pages/workflows').then((module) => ({ default: module.WorkflowsPage })))
const InboxPage = lazy(() => import('@/pages/inbox').then((module) => ({ default: module.InboxPage })))
const IntegrationsPage = lazy(() => import('@/pages/integrations').then((module) => ({ default: module.IntegrationsPage })))
const ActivityPage = lazy(() => import('@/pages/activity').then((module) => ({ default: module.ActivityPage })))

function PageFallback() {
  return (
    <div className="flex min-h-[calc(100dvh-56px)] items-center justify-center px-6">
      <div className="pill" role="status" aria-live="polite">
        Loading workspace
      </div>
    </div>
  )
}

function page(element: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/"             element={page(<OverviewPage />)}     />
        <Route path="/nexus"        element={page(<OverviewPage />)}     />
        <Route path="/workflows"    element={page(<WorkflowsPage />)}    />
        <Route path="/inbox"        element={page(<InboxPage />)}        />
        <Route path="/integrations" element={page(<IntegrationsPage />)} />
        <Route path="/activity"     element={page(<ActivityPage />)}     />
      </Route>
    </Routes>
  )
}

export default App
