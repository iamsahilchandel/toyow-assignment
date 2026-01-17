import { useGetWorkflowsQuery } from "../../workflows/workflows.api";
import { useGetRunsQuery } from "../../runs/runs.api";
import { PageHeader } from "../../../shared/components/PageHeader";
import { StatsCards } from "../components/StatsCards";
import { QuickActions } from "../components/QuickActions";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ErrorState } from "../../../shared/components/ErrorState";

export function DashboardHomePage() {
  const {
    data: workflows,
    isLoading: workflowsLoading,
    error: workflowsError,
    refetch: refetchWorkflows,
  } = useGetWorkflowsQuery();
  const {
    data: runs,
    isLoading: runsLoading,
    error: runsError,
    refetch: refetchRuns,
  } = useGetRunsQuery();

  const isLoading = workflowsLoading || runsLoading;
  const hasError = workflowsError || runsError;

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (hasError) {
    return (
      <ErrorState
        message="Failed to load dashboard data. Please check your connection."
        onRetry={() => {
          refetchWorkflows();
          refetchRuns();
        }}
      />
    );
  }

  const workflowCount = workflows?.length || 0;
  const runsCount = runs?.length || 0;
  const activeRuns =
    runs?.filter((run) => run.status === "running" || run.status === "pending")
      .length || 0;

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
