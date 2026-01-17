import { useGetWorkflowsQuery } from "../workflows.api";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { WorkflowCard } from "../components/WorkflowCard";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function WorkflowsListPage() {
  const { data: workflows, isLoading, error, refetch } = useGetWorkflowsQuery();

  if (isLoading) {
    return <LoadingState message="Loading workflows..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load workflows" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflows"
        description="Manage your workflow definitions"
        actions={
          <Link to="/workflows/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows && workflows.length > 0 ? (
          workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No workflows yet. Create your first workflow to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
