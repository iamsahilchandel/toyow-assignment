/**
 * Workflow Builder Page.
 * Full-screen editor for creating and editing workflows.
 */

import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { WorkflowCanvas } from "../builder/WorkflowCanvas";
import { NodePalette } from "../builder/NodePalette";
import { NodeConfigDrawer } from "../builder/NodeConfigDrawer";
import {
  useGetWorkflowQuery,
  useCreateWorkflowVersionMutation,
} from "../workflows.api";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowDefinitionJSON,
} from "../builder/builder.types";
import {
  mapToBackendFormat,
  mapFromBackendFormat,
} from "../builder/workflowDefinition.mapper";
import {
  validateWorkflow,
  getValidationSummary,
} from "../builder/workflowDefinition.validator";
import { ArrowLeft, Save, Play, AlertTriangle } from "lucide-react";

export function WorkflowBuilderPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const isNewWorkflow = workflowId === "new";

  // Fetch existing workflow if editing
  const {
    data: workflow,
    isLoading,
    error,
    refetch,
  } = useGetWorkflowQuery(workflowId!, {
    skip: isNewWorkflow || !workflowId,
  });

  const [createVersion, { isLoading: isSaving }] =
    useCreateWorkflowVersionMutation();

  // Builder state
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize from existing workflow
  useEffect(() => {
    if (workflow && workflow.nodes && workflow.edges) {
      try {
        // Cast the entire object to the expected type
        const definition = {
          nodes: workflow.nodes as unknown as WorkflowDefinitionJSON["nodes"],
          edges: workflow.edges as unknown as WorkflowDefinitionJSON["edges"],
        };
        const { nodes: mappedNodes, edges: mappedEdges } =
          mapFromBackendFormat(definition);
        setNodes(mappedNodes);
        setEdges(mappedEdges);
      } catch (err) {
        console.error("Failed to load workflow definition:", err);
        toast.error("Failed to load workflow definition");
      }
    }
  }, [workflow]);

  // Handle node selection
  const handleNodeSelect = useCallback((node: WorkflowNode | null) => {
    setSelectedNode(node);
    setIsConfigOpen(!!node);
  }, []);

  // Handle node config save
  const handleConfigSave = useCallback(
    (nodeId: string, config: Record<string, unknown>) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  config,
                  isConfigured: true,
                },
              }
            : node,
        ),
      );
      setIsDirty(true);
      toast.success("Node configuration saved");
    },
    [],
  );

  // Handle nodes change from canvas
  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setNodes(newNodes);
    setIsDirty(true);
  }, []);

  // Handle edges change from canvas
  const handleEdgesChange = useCallback((newEdges: WorkflowEdge[]) => {
    setEdges(newEdges);
    setIsDirty(true);
  }, []);

  // Save workflow version
  const handleSave = async () => {
    // Validate first
    const validation = validateWorkflow(nodes, edges);
    if (!validation.isValid) {
      toast.error(getValidationSummary(validation));
      return;
    }

    if (validation.warnings.length > 0) {
      toast.warning(getValidationSummary(validation));
    }

    if (!workflowId || isNewWorkflow) {
      toast.error("Please create a workflow first");
      return;
    }

    try {
      const definition = mapToBackendFormat(nodes, edges, {
        name: workflow?.name,
        description: workflow?.description,
      });

      await createVersion({
        workflowId,
        definition:
          definition as unknown as import("@/shared/types/workflow").WorkflowDefinition,
      }).unwrap();

      toast.success("Workflow version saved");
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save workflow:", err);
      toast.error("Failed to save workflow version");
    }
  };

  // Loading state
  if (!isNewWorkflow && isLoading) {
    return <LoadingState message="Loading workflow..." />;
  }

  // Error state
  if (!isNewWorkflow && error) {
    return <ErrorState message="Failed to load workflow" onRetry={refetch} />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {isNewWorkflow
                ? "New Workflow"
                : workflow?.name || "Workflow Builder"}
            </h1>
            {isDirty && (
              <span className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Unsaved changes
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Version"}
          </Button>
          <Button disabled={isNewWorkflow}>
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node palette */}
        <div className="w-64 border-r overflow-y-auto p-4">
          <NodePalette />
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      </div>

      {/* Node config drawer */}
      <NodeConfigDrawer
        node={selectedNode}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={handleConfigSave}
      />
    </div>
  );
}
