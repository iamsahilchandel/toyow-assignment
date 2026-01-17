/**
 * Workflow Canvas component using ReactFlow.
 * Main canvas for the drag-and-drop workflow builder.
 */

import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./CustomNode";
import type {
  WorkflowNode,
  WorkflowEdge,
  PluginTypeInfo,
  WorkflowNodeData,
} from "./builder.types";
import { generateNodeId, generateEdgeId } from "./workflowDefinition.mapper";

interface WorkflowCanvasProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
  onNodesChange?: (nodes: WorkflowNode[]) => void;
  onEdgesChange?: (edges: WorkflowEdge[]) => void;
  onNodeSelect?: (node: WorkflowNode | null) => void;
  readOnly?: boolean;
}

function WorkflowCanvasInner({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  onNodeSelect,
  readOnly = false,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<unknown>(null);

  // Handle node changes
  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      handleNodesChange(changes);
      // Callback with updated nodes after state update
      setTimeout(() => {
        onNodesChangeCallback?.(nodes as WorkflowNode[]);
      }, 0);
    },
    [handleNodesChange, nodes, onNodesChangeCallback],
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange<WorkflowEdge>[]) => {
      handleEdgesChange(changes);
      setTimeout(() => {
        onEdgesChangeCallback?.(edges as WorkflowEdge[]);
      }, 0);
    },
    [handleEdgesChange, edges, onEdgesChangeCallback],
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdge: WorkflowEdge = {
        ...connection,
        id: generateEdgeId(connection.source!, connection.target!),
        source: connection.source!,
        target: connection.target!,
        data: connection.sourceHandle
          ? { condition: connection.sourceHandle as "true" | "false" }
          : undefined,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: WorkflowNode) => {
      onNodeSelect?.(node);
    },
    [onNodeSelect],
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Handle drop from palette
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (readOnly) return;

      const data = event.dataTransfer.getData("application/reactflow");
      if (!data) return;

      const pluginInfo: PluginTypeInfo = JSON.parse(data);

      // Get the position in the canvas
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) return;

      const position = (
        reactFlowInstance as {
          screenToFlowPosition: (pos: { x: number; y: number }) => {
            x: number;
            y: number;
          };
        }
      ).screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: WorkflowNode = {
        id: generateNodeId(pluginInfo.type.toLowerCase()),
        type: "custom",
        position,
        data: {
          label: pluginInfo.label,
          pluginType: pluginInfo.type,
          config: pluginInfo.defaultConfig,
          isConfigured: false,
        } as WorkflowNodeData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [readOnly, reactFlowInstance, setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        className="bg-background"
      >
        <Background gap={15} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as WorkflowNodeData;
            return data.isConfigured ? "#10b981" : "#f59e0b";
          }}
          className="bg-card border border-border rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}

// Wrap with ReactFlowProvider
export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
