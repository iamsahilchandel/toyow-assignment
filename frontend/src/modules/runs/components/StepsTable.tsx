import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { RunStatusBadge } from "./RunStatusBadge";
import { format } from "date-fns";
import type { RunStep } from "../../../shared/types/run";
import { useRetryStepMutation } from "../runs.api";
import { useParams } from "react-router-dom";

interface StepsTableProps {
  steps: RunStep[];
}

export function StepsTable({ steps }: StepsTableProps) {
  const { id: runId } = useParams<{ id: string }>();
  const [retryStep] = useRetryStepMutation();

  const handleRetry = (nodeId: string) => {
    if (runId) {
      retryStep({ runId, nodeId });
    }
  };

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No steps yet
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Node ID</TableHead>
            <TableHead>Node Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Retries</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map((step) => (
            <TableRow key={step.id}>
              <TableCell className="font-mono text-sm">{step.nodeId}</TableCell>
              <TableCell>{step.nodeName}</TableCell>
              <TableCell>
                <RunStatusBadge status={step.status} />
              </TableCell>
              <TableCell>
                {step.startedAt ? format(new Date(step.startedAt), "PPpp") : "-"}
              </TableCell>
              <TableCell>
                {step.completedAt ? format(new Date(step.completedAt), "PPpp") : "-"}
              </TableCell>
              <TableCell>
                {step.duration ? `${(step.duration / 1000).toFixed(2)}s` : "-"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{step.retryCount}</Badge>
              </TableCell>
              <TableCell>
                {step.status === "failed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetry(step.nodeId)}
                  >
                    Retry
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
