import { useGetRunsQuery } from "../runs.api";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { RunStatusBadge } from "../components/RunStatusBadge";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export function RunsListPage() {
  const { data: runs, isLoading, error, refetch } = useGetRunsQuery();

  if (isLoading) {
    return <LoadingState message="Loading runs..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load runs" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Runs"
        description="View and manage workflow executions"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Version ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs && runs.length > 0 ? (
              runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-mono text-sm">
                    {run.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {run.workflowVersionId.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <RunStatusBadge status={run.status} />
                  </TableCell>
                  <TableCell>
                    {format(new Date(run.startedAt), "PPpp")}
                  </TableCell>
                  <TableCell>
                    {run.completedAt
                      ? format(new Date(run.completedAt), "PPpp")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Link to={`/runs/${run.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No runs yet. Start a workflow to see runs here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
