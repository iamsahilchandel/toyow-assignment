import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { RunStatusBadge } from "./RunStatusBadge";
import type { StepExecution } from "../../../shared/types/run";
import { useRetryStepMutation } from "../runs.api";
import { useParams } from "react-router-dom";

interface StepsTableProps {
  steps: StepExecution[];
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
      <div className="text-center py-8 text-muted-foreground">No steps yet</div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Node ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Retries</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map((step) => (
            <TableRow key={step.id}>
              <TableCell className="font-mono text-sm">{step.nodeId}</TableCell>
              <TableCell>
                <RunStatusBadge status={step.status} />
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{step.retryCount}</Badge>
              </TableCell>
              <TableCell>
                {step.status === "FAILED" && (
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
