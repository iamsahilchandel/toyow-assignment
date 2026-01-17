import { Badge } from "@/shared/ui/badge";
import type { ExecutionStatus } from "../../../shared/types/workflow";

interface RunStatusBadgeProps {
  status: ExecutionStatus;
}

const statusColors: Record<ExecutionStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
  RUNNING: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
  COMPLETED: "bg-green-500/10 text-green-600 dark:text-green-500",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-500",
  RETRYING: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
  PAUSED: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
  CANCELLED: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
  SKIPPED: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
};

export function RunStatusBadge({ status }: RunStatusBadgeProps) {
  return (
    <Badge className={statusColors[status] || statusColors.PENDING}>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </Badge>
  );
}
