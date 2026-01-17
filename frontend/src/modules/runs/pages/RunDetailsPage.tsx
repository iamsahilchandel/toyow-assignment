import { useParams, Link } from "react-router-dom";
import { useGetRunQuery, useGetRunStepsQuery, usePauseRunMutation, useResumeRunMutation, useCancelRunMutation } from "../runs.api";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { RunActions } from "../components/RunActions";
import { StepsTable } from "../components/StepsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { RunStatusBadge } from "../components/RunStatusBadge";
import { format } from "date-fns";
import { Button } from "@/shared/ui/button";
import { FileText } from "lucide-react";

export function RunDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: run, isLoading: runLoading, error: runError, refetch: refetchRun } = useGetRunQuery(id!, {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Run: ${run.id.slice(0, 8)}...`}
        description={run.workflowName}
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
              <span className="text-sm font-medium">Workflow:</span> {run.workflowName}
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
            {run.duration && (
              <div>
                <span className="text-sm font-medium">Duration:</span>{" "}
                {(run.duration / 1000).toFixed(2)}s
              </div>
            )}
            <div>
              <span className="text-sm font-medium">Triggered by:</span> {run.triggeredBy}
            </div>
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
