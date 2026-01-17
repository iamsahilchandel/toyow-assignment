import { useGetWorkflowsQuery } from "../../workflows/workflows.api";
import { useGetRunsQuery } from "../../runs/runs.api";
import { PageHeader } from "../../../shared/components/PageHeader";
import { StatsCards } from "../components/StatsCards";
import { QuickActions } from "../components/QuickActions";
import { LoadingState } from "../../../shared/components/LoadingState";

export function DashboardHomePage() {
  const { data: workflows, isLoading: workflowsLoading } = useGetWorkflowsQuery();
  const { data: runs, isLoading: runsLoading } = useGetRunsQuery();

  const isLoading = workflowsLoading || runsLoading;

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const workflowCount = workflows?.length || 0;
  const runsCount = runs?.length || 0;
  const activeRuns = runs?.filter((run) => run.status === "running" || run.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your workflows and runs"
      />
      <StatsCards
        workflowCount={workflowCount}
        runsCount={runsCount}
        activeRuns={activeRuns}
      />
      <QuickActions />
    </div>
  );
}
