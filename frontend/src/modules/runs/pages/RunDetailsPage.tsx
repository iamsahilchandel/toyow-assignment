import { useParams, Link } from "react-router-dom";
import {
  useGetRunQuery,
  useGetRunStepsQuery,
  usePauseRunMutation,
  useResumeRunMutation,
  useCancelRunMutation,
} from "../runs.api";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { RunActions } from "../components/RunActions";
import { StepsTable } from "../components/StepsTable";
import { LiveRunViewer } from "../components/LiveRunViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { RunStatusBadge } from "../components/RunStatusBadge";
import { format } from "date-fns";
import { Button } from "@/shared/ui/button";
import { FileText } from "lucide-react";

export function RunDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: run,
    isLoading: runLoading,
    error: runError,
    refetch: refetchRun,
  } = useGetRunQuery(id!, {
    skip: !id,
  });
  const { data: steps, isLoading: stepsLoading } = useGetRunStepsQuery(id!, {
    skip: !id,
  });

  const [pauseRun] = usePauseRunMutation();
  const [resumeRun] = useResumeRunMutation();
  const [cancelRun] = useCancelRunMutation();

  if (runLoading) {
    return <LoadingState message="Loading run details..." />;
  }

  if (runError || !run) {
    return <ErrorState message="Failed to load run" onRetry={refetchRun} />;
  }

  const handlePause = () => {
    if (id) pauseRun(id);
  };

  const handleResume = () => {
    if (id) resumeRun(id);
  };

  const handleCancel = () => {
    if (id) cancelRun(id);
  };

  // Map steps to node statuses for the LiveRunViewer
  const workflowNodes =
    steps?.map((step, index) => ({
      id: step.nodeId,
      type: "plugin",
      label: step.nodeId, // Use nodeId as label since backend doesn't provide nodeName
      position: { x: 150, y: index * 80 + 50 },
    })) || [];

  // Create simple edges between sequential steps
  const workflowEdges =
    steps?.slice(0, -1).map((step, index) => ({
      id: `edge-${index}`,
      source: step.nodeId,
      target: steps[index + 1].nodeId,
    })) || [];

  // Map steps to initial statuses
  const initialSteps =
    steps?.map((step) => ({
      nodeId: step.nodeId,
      status: step.status,
    })) || [];

  const isRunning = run.status === "RUNNING" || run.status === "PENDING";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Run: ${run.id.slice(0, 8)}...`}
        description={`Version: ${run.workflowVersionId.slice(0, 8)}...`}
        actions={
          <div className="flex gap-2">
            <Link to={`/runs/${run.id}/logs`}>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Logs
              </Button>
            </Link>
            <RunActions
              status={run.status}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
            />
          </div>
        }
      />

      {/* Live Run Viewer - Show when run is active and has workflow data */}
      {isRunning && workflowNodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Live Execution
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveRunViewer
              runId={run.id}
              workflowNodes={workflowNodes}
              workflowEdges={workflowEdges}
              initialSteps={initialSteps}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Run Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Status:</span>{" "}
              <RunStatusBadge status={run.status} />
            </div>
            <div>
              <span className="text-sm font-medium">Workflow Version:</span>{" "}
              <code className="text-xs font-mono">
                {run.workflowVersionId.slice(0, 12)}...
              </code>
            </div>
            <div>
              <span className="text-sm font-medium">Started:</span>{" "}
              {format(new Date(run.startedAt), "PPpp")}
            </div>
            {run.completedAt && (
              <div>
                <span className="text-sm font-medium">Completed:</span>{" "}
                {format(new Date(run.completedAt), "PPpp")}
              </div>
            )}
            {run.input && Object.keys(run.input).length > 0 && (
              <div>
                <span className="text-sm font-medium">Input:</span>{" "}
                <code className="text-xs font-mono">
                  {JSON.stringify(run.input)}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Run ID</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm font-mono">{run.id}</code>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          {stepsLoading ? (
            <LoadingState message="Loading steps..." skeletonCount={3} />
          ) : (
            <StepsTable steps={steps || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
