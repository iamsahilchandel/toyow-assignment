import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { WorkflowNodeData } from "@/lib/types/workflow";
import { Card } from "@/components/ui/card";
import { GitBranch, Play, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const CustomNode = memo(
  ({ data, selected }: NodeProps<Node<WorkflowNodeData>>) => {
    const getIcon = () => {
      switch (data.type) {
        case "start":
          return <Play className="h-5 w-5 text-green-600" />;
        case "plugin":
          return <GitBranch className="h-5 w-5 text-blue-600" />;
        case "condition":
          return <GitBranch className="h-5 w-5 text-yellow-600" />;
        case "end":
          return <CheckCircle className="h-5 w-5 text-gray-600" />;
        default:
          return null;
      }
    };

    const getStatusColor = () => {
      if (!data.status) return "";
      switch (data.status) {
        case "running":
          return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
        case "succeeded":
          return "border-green-500 bg-green-50 dark:bg-green-900/20";
        case "failed":
          return "border-red-500 bg-red-50 dark:bg-red-900/20";
        case "retrying":
          return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
        default:
          return "";
      }
    };

    return (
      <Card
        className={cn(
          "min-w-[180px] p-4 transition-all",
          selected && "ring-2 ring-primary",
          getStatusColor()
        )}
      >
        {data.type !== "start" && (
          <Handle
            type="target"
            position={Position.Top}
            className="bg-gray-400!"
          />
        )}

        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{data.label}</div>
            {data.pluginName && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {data.pluginName}
              </div>
            )}
          </div>
          {data.status === "running" && (
            <div className="animate-pulse">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </div>
          )}
          {data.status === "succeeded" && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          {data.status === "failed" && (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>

        {data.type !== "end" && (
          <Handle
            type="source"
            position={Position.Bottom}
            className="bg-gray-400!"
          />
        )}
      </Card>
    );
  }
);

CustomNode.displayName = "CustomNode";
