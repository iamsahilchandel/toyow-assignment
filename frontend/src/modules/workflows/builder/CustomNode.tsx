/**
 * Custom ReactFlow node component for workflow builder.
 * Renders different node types with appropriate styling.
 */

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/shared/lib/utils";
import type { WorkflowNodeData } from "./builder.types";
import { getPluginInfo } from "./builder.types";
import {
  Type,
  Globe,
  Combine,
  Clock,
  GitBranch,
  AlertCircle,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  Globe,
  Combine,
  Clock,
  GitBranch,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || AlertCircle;
}

interface CustomNodeProps extends NodeProps {
  data: WorkflowNodeData;
}

function CustomNodeComponent({ data, selected }: CustomNodeProps) {
  const pluginInfo = getPluginInfo(data.pluginType);
  const Icon = pluginInfo ? getIcon(pluginInfo.icon) : AlertCircle;
  const isIfNode = data.pluginType === "IF";

  return (
    <div
      className={cn(
        "relative px-4 py-3 rounded-lg border-2 bg-card min-w-[160px] shadow-sm transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border",
        !data.isConfigured && "border-dashed border-warning",
      )}
      style={{
        borderColor: selected ? undefined : pluginInfo?.color,
      }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3! h-3! bg-muted-foreground! border-2! border-background!"
      />

      {/* Node content */}
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-md"
          style={{ backgroundColor: `${pluginInfo?.color}20` }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{data.label}</div>
          <div className="text-xs text-muted-foreground truncate">
            {pluginInfo?.label}
          </div>
        </div>
      </div>

      {/* Config status */}
      {!data.isConfigured && (
        <div className="mt-2 text-xs text-warning flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Not configured
        </div>
      )}

      {/* Output handles - IF node has two (true/false) */}
      {isIfNode ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="w-3! h-3! bg-green-500! border-2! border-background!"
            style={{ left: "30%" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="w-3! h-3! bg-red-500! border-2! border-background!"
            style={{ left: "70%" }}
          />
          <div className="absolute -bottom-5 left-[30%] -translate-x-1/2 text-[10px] text-green-600">
            true
          </div>
          <div className="absolute -bottom-5 left-[70%] -translate-x-1/2 text-[10px] text-red-600">
            false
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3! h-3! bg-muted-foreground! border-2! border-background!"
        />
      )}
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);

// Node types for ReactFlow
export const nodeTypes = {
  custom: CustomNode,
};
