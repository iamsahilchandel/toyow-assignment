/**
 * Node Palette component for the workflow builder.
 * Displays available plugin types that can be dragged onto the canvas.
 */

import { PLUGIN_TYPES, type PluginTypeInfo } from "./builder.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Type,
  Globe,
  Combine,
  Clock,
  GitBranch,
  GripVertical,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  Globe,
  Combine,
  Clock,
  GitBranch,
};

interface NodePaletteProps {
  onDragStart?: (event: React.DragEvent, pluginType: PluginTypeInfo) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  const handleDragStart = (
    event: React.DragEvent,
    pluginType: PluginTypeInfo,
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(pluginType),
    );
    event.dataTransfer.effectAllowed = "move";
    onDragStart?.(event, pluginType);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Node Palette</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {PLUGIN_TYPES.map((plugin) => {
          const Icon = iconMap[plugin.icon] || Type;
          return (
            <div
              key={plugin.type}
              draggable
              onDragStart={(e) => handleDragStart(e, plugin)}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <div
                className="p-2 rounded-md shrink-0"
                style={{ backgroundColor: `${plugin.color}20` }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{plugin.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {plugin.description}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
