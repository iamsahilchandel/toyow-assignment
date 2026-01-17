/**
 * Live Run Viewer component.
 * Displays real-time DAG visualization with step statuses.
 */

import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useAppSelector, useAppDispatch } from "@/app/hooks";
import {
  subscribeToRun,
  unsubscribeFromRun,
  connectWs,
  initializeWsClient,
} from "@/modules/realtime/wsClient";
import type { ExecutionStatus } from "@/shared/types/workflow";
import { Badge } from "@/shared/ui/badge";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FastForward,
  RotateCcw,
  Circle,
  PauseCircle,
  Ban,
} from "lucide-react";

// Status colors and icons (using UPPERCASE ExecutionStatus values)
const statusConfig: Record<
  ExecutionStatus,
  {
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PENDING: { color: "#6b7280", bgColor: "#f3f4f6", icon: Clock },
  RUNNING: { color: "#3b82f6", bgColor: "#dbeafe", icon: Loader2 },
  COMPLETED: { color: "#10b981", bgColor: "#d1fae5", icon: CheckCircle },
  FAILED: { color: "#ef4444", bgColor: "#fee2e2", icon: XCircle },
  SKIPPED: { color: "#9ca3af", bgColor: "#f3f4f6", icon: FastForward },
  RETRYING: { color: "#f59e0b", bgColor: "#fef3c7", icon: RotateCcw },
  PAUSED: { color: "#8b5cf6", bgColor: "#ede9fe", icon: PauseCircle },
  CANCELLED: { color: "#6b7280", bgColor: "#f3f4f6", icon: Ban },
};

interface LiveRunViewerProps {
  runId: string;
  workflowNodes?: Array<{
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
  }>;
  workflowEdges?: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
  initialSteps?: Array<{
    nodeId: string;
    status: ExecutionStatus;
  }>;
}

function LiveRunViewerInner({
  runId,
  workflowNodes = [],
  workflowEdges = [],
  initialSteps = [],
}: LiveRunViewerProps) {
  const dispatch = useAppDispatch();
  const stepStatuses = useAppSelector(
    (state) => state.realtime.stepStatuses[runId] || {},
  );
  const connectionStatus = useAppSelector(
    (state) => state.realtime.connection.status,
  );

  // Initialize WebSocket and subscribe to run
  useEffect(() => {
    initializeWsClient(dispatch);
    connectWs();
    subscribeToRun(runId);

    return () => {
      unsubscribeFromRun(runId);
    };
  }, [dispatch, runId]);

  // Merge initial steps with real-time updates
  const mergedStatuses = useMemo(() => {
    const result: Record<string, ExecutionStatus> = {};
    for (const step of initialSteps) {
      result[step.nodeId] = step.status;
    }
    // Real-time updates override initial
    Object.assign(result, stepStatuses);
    return result;
  }, [initialSteps, stepStatuses]);

  // Build ReactFlow nodes with status styling
  const nodes: Node[] = useMemo(() => {
    return workflowNodes.map((node) => {
      const status = mergedStatuses[node.id] || "PENDING";
      const config = statusConfig[status];
      const StatusIcon = config.icon;

      return {
        id: node.id,
        position: node.position,
        type: "default",
        data: {
          label: (
            <div className="flex items-center gap-2">
              <StatusIcon
                className={`w-4 h-4 ${status === "RUNNING" ? "animate-spin" : ""}`}
              />
              <span>{node.label}</span>
            </div>
          ),
        },
        style: {
          backgroundColor: config.bgColor,
          borderColor: config.color,
          borderWidth: 2,
        },
      };
    });
  }, [workflowNodes, mergedStatuses]);

  // Build edges
  const edges: Edge[] = useMemo(() => {
    return workflowEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      animated: true,
    }));
  }, [workflowEdges]);

  return (
    <div className="h-[400px] border rounded-lg overflow-hidden relative">
      {/* Connection status indicator */}
      <div className="absolute top-2 right-2 z-10">
        <Badge
          variant={connectionStatus === "connected" ? "default" : "secondary"}
          className="flex items-center gap-1"
        >
          <Circle
            className={`w-2 h-2 ${
              connectionStatus === "connected"
                ? "fill-green-500 text-green-500"
                : "fill-gray-400 text-gray-400"
            }`}
          />
          {connectionStatus === "connected" ? "Live" : connectionStatus}
        </Badge>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        className="bg-muted/30"
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function LiveRunViewer(props: LiveRunViewerProps) {
  return (
    <ReactFlowProvider>
      <LiveRunViewerInner {...props} />
    </ReactFlowProvider>
  );
}
