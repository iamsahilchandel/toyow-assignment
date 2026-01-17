import { Button } from "@/shared/ui/button";
import { Pause, Play, X } from "lucide-react";
import type { ExecutionStatus } from "../../../shared/types/workflow";

interface RunActionsProps {
  status: ExecutionStatus;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export function RunActions({ status, onPause, onResume, onCancel }: RunActionsProps) {
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isActive = status === "running" || status === "paused";
  const isFinished = status === "succeeded" || status === "failed" || status === "cancelled";

  return (
    <div className="flex gap-2">
      {isRunning && (
        <Button variant="outline" onClick={onPause}>
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </Button>
      )}
      {isPaused && (
        <Button variant="outline" onClick={onResume}>
          <Play className="mr-2 h-4 w-4" />
          Resume
        </Button>
      )}
      {isActive && (
        <Button variant="destructive" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      )}
      {isFinished && (
        <span className="text-sm text-muted-foreground">Run finished</span>
      )}
    </div>
  );
}
