import { useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { setNodes, setEdges } from "@/store/slices/workflow-editor-slice";
import type { WorkflowNode } from "@/lib/types/workflow";
import { CustomNode } from "@/components/workflow/custom-node";
import { Button } from "@/components/ui/button";
import { Save, Play } from "lucide-react";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const initialNodes: WorkflowNode[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 250, y: 50 },
    data: { label: "Start", type: "start" },
  },
];

export function WorkflowEditorPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const reduxNodes = useAppSelector((state) => state.workflowEditor.nodes);
  const reduxEdges = useAppSelector((state) => state.workflowEditor.edges);

  const [nodes, , onNodesChange] = useNodesState(
    reduxNodes.length > 0 ? reduxNodes : initialNodes
  );
  const [edges, , onEdgesChange] = useEdgesState(reduxEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      dispatch(setEdges(newEdges));
    },
    [edges, dispatch]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      // Sync with Redux after React Flow internal state update
      setTimeout(() => {
        const updatedNodes = nodes;
        if (updatedNodes) {
          dispatch(setNodes(updatedNodes as WorkflowNode[]));
        }
      }, 0);
    },
    [nodes, dispatch, onNodesChange]
  );

  const handleSave = () => {
    console.log("Saving workflow...", { nodes, edges });
    // TODO: implement save to backend
  };

  const handleExecute = () => {
    console.log("Executing workflow...");
    // TODO: implement execute
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {id ? "Edit Workflow" : "New Workflow"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={handleExecute}>
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
