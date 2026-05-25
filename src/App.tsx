import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { OverviewPage } from '@/pages/overview'
import { WorkflowsPage } from '@/pages/workflows'
import { InboxPage } from '@/pages/inbox'
import { IntegrationsPage } from '@/pages/integrations'
import { ActivityPage } from '@/pages/activity'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/"             element={<OverviewPage />}     />
        <Route path="/nexus"        element={<OverviewPage />}     />
        <Route path="/workflows"    element={<WorkflowsPage />}    />
        <Route path="/inbox"        element={<InboxPage />}        />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/activity"     element={<ActivityPage />}     />
      </Route>
    </Routes>
  )
}

export default App
