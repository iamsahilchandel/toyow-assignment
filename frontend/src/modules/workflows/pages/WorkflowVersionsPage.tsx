/**
 * Workflow Versions Page.
 * Lists all versions of a workflow with ability to view and run specific versions.
 */

import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { PageHeader } from "@/shared/components/PageHeader";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  useGetWorkflowQuery,
  useGetWorkflowVersionsQuery,
} from "../workflows.api";
import { useStartRunMutation } from "../../runs/runs.api";
import { ArrowLeft, Play, Eye, GitBranch } from "lucide-react";

export function WorkflowVersionsPage() {
  const { workflowId } = useParams<{ workflowId: string }>();

  const {
    data: workflow,
    isLoading: workflowLoading,
    error: workflowError,
    refetch: refetchWorkflow,
  } = useGetWorkflowQuery(workflowId!, {
    skip: !workflowId,
  });

  const {
    data: versions,
    isLoading: versionsLoading,
    error: versionsError,
    refetch: refetchVersions,
  } = useGetWorkflowVersionsQuery(workflowId!, {
    skip: !workflowId,
  });

  const [startRun, { isLoading: isStarting }] = useStartRunMutation();

  const handleRunVersion = async (_versionId: string) => {
    if (!workflowId) return;

    try {
      const result = await startRun({ workflowId }).unwrap();
      toast.success(`Run started: ${result.runId.slice(0, 8)}...`);
    } catch (err) {
      console.error("Failed to start run:", err);
      toast.error("Failed to start run");
    }
  };

  const isLoading = workflowLoading || versionsLoading;
  const error = workflowError || versionsError;

  if (isLoading) {
    return <LoadingState message="Loading versions..." />;
  }

  if (error || !workflow) {
    return (
      <ErrorState
        message="Failed to load workflow versions"
        onRetry={() => {
          refetchWorkflow();
          refetchVersions();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${workflow.name} - Versions`}
        description="View and manage workflow versions"
        actions={
          <div className="flex gap-2">
            <Link to={`/workflows/${workflowId}`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Workflow
              </Button>
            </Link>
            <Link to={`/workflows/${workflowId}/builder`}>
              <Button>
                <GitBranch className="mr-2 h-4 w-4" />
                Create New Version
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          {versions && versions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Nodes</TableHead>
                  <TableHead>Edges</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version, index) => (
                  <TableRow key={version.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          v{version.version}
                        </Badge>
                        {index === 0 && (
                          <span className="text-xs text-muted-foreground">
                            (latest)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(version.createdAt), "PPp")}
                    </TableCell>
                    <TableCell>
                      {version.definition?.nodes?.length || 0}
                    </TableCell>
                    <TableCell>
                      {version.definition?.edges?.length || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunVersion(version.id)}
                          disabled={isStarting}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Link
                          to={`/workflows/${workflowId}/versions/${version.id}`}
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No versions yet.</p>
              <p className="text-sm">
                Open the workflow builder to create your first version.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
