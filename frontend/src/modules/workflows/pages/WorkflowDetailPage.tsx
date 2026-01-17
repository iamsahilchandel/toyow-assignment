import { useParams, Link } from "react-router-dom";
import { useGetWorkflowQuery } from "../workflows.api";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Edit, GitBranch, Play } from "lucide-react";

export function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: workflow,
    isLoading,
    error,
    refetch,
  } = useGetWorkflowQuery(id!, {
    skip: !id,
  });

  if (isLoading) {
    return <LoadingState message="Loading workflow..." />;
  }

  if (error || !workflow) {
    return <ErrorState message="Failed to load workflow" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={workflow.name}
        description={workflow.description || "Workflow details"}
        actions={
          <div className="flex gap-2">
            <Link to={`/workflows/${workflow.id}/builder`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Link to={`/workflows/${workflow.id}/versions`}>
              <Button variant="outline">
                <GitBranch className="mr-2 h-4 w-4" />
                Versions
              </Button>
            </Link>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Run
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Version:</span>{" "}
              <Badge variant="secondary">v{workflow.version}</Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Nodes:</span>{" "}
              {workflow.nodes.length}
            </div>
            <div>
              <span className="text-sm font-medium">Edges:</span>{" "}
              {workflow.edges.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(workflow.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{" "}
              {new Date(workflow.updatedAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Created by:</span>{" "}
              {workflow.createdBy}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
