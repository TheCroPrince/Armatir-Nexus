import { WorkspaceHeader }   from '@/components/overview/workspace-header'
import { MetricRow }         from '@/components/overview/metric-row'
import { ActivityFeed }      from '@/components/overview/activity-feed'
import { AICommandCenter }   from '@/components/overview/ai-command-center'
import { ActiveWorkflows }   from '@/components/overview/active-workflows'

export function OverviewPage() {
  return (
    <div
      data-overview-page
      className="flex min-w-0 max-w-full flex-col gap-5 overflow-hidden px-5 py-6 md:px-7 md:py-7 lg:px-10 lg:py-8"
    >
      <WorkspaceHeader />

      <MetricRow />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <ActiveWorkflows />
          <ActivityFeed limit={7} />
        </div>
        <AICommandCenter />
      </div>
    </div>
  )
}
