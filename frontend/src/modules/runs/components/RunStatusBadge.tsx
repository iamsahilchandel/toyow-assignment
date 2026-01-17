import { Badge } from "@/shared/ui/badge";
import type { ExecutionStatus } from "../../../shared/types/workflow";

interface RunStatusBadgeProps {
  status: ExecutionStatus;
}

const statusColors: Record<ExecutionStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
  running: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
  succeeded: "bg-green-500/10 text-green-600 dark:text-green-500",
  failed: "bg-red-500/10 text-red-600 dark:text-red-500",
  retrying: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
  paused: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
  cancelled: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
  skipped: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
};

export function RunStatusBadge({ status }: RunStatusBadgeProps) {
  return (
    <Badge className={statusColors[status] || statusColors.pending}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
