import type { ExecutionStatus } from "@/lib/types/workflow";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ExecutionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<
    ExecutionStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      className: string;
    }
  > = {
    pending: {
      label: "Pending",
      variant: "secondary",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    running: {
      label: "Running",
      variant: "default",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 animate-pulse",
    },
    succeeded: {
      label: "Succeeded",
      variant: "outline",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    failed: {
      label: "Failed",
      variant: "destructive",
      className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
    retrying: {
      label: "Retrying",
      variant: "outline",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    },
    paused: {
      label: "Paused",
      variant: "secondary",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    },
    cancelled: {
      label: "Cancelled",
      variant: "outline",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
