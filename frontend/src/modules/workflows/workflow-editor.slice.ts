import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WorkflowNode, WorkflowEdge } from "../../shared/types/workflow";

interface WorkflowEditorState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  history: {
    past: Array<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }>;
    future: Array<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }>;
  };
  validationErrors: string[];
}

const initialState: WorkflowEditorState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  history: {
    past: [],
    future: [],
  },
  validationErrors: [],
};

const workflowEditorSlice = createSlice({
  name: "workflowEditor",
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<WorkflowNode[]>) => {
      // Save current state to history before updating
      if (state.nodes.length > 0 || state.edges.length > 0) {
        state.history.past.push({
          nodes: state.nodes,
          edges: state.edges,
        });
        // Limit history size
        if (state.history.past.length > 50) {
          state.history.past.shift();
        }
        state.history.future = [];
      }
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<WorkflowEdge[]>) => {
      if (state.nodes.length > 0 || state.edges.length > 0) {
        state.history.past.push({
          nodes: state.nodes,
          edges: state.edges,
        });
        if (state.history.past.length > 50) {
          state.history.past.shift();
        }
        state.history.future = [];
      }
      state.edges = action.payload;
    },
    addNode: (state, action: PayloadAction<WorkflowNode>) => {
      state.history.past.push({
        nodes: state.nodes,
        edges: state.edges,
      });
      state.history.future = [];
      state.nodes.push(action.payload);
    },
    updateNode: (
      state,
      action: PayloadAction<{ id: string; data: Partial<WorkflowNode["data"]> }>
    ) => {
      const node = state.nodes.find((n) => n.id === action.payload.id);
      if (node) {
        node.data = { ...node.data, ...action.payload.data };
      }
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      state.history.past.push({
        nodes: state.nodes,
        edges: state.edges,
      });
      state.history.future = [];
      state.nodes = state.nodes.filter((n) => n.id !== action.payload);
      state.edges = state.edges.filter(
        (e) => e.source !== action.payload && e.target !== action.payload
      );
    },
    setSelectedNodeId: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },
    undo: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past.pop()!;
        state.history.future.push({
          nodes: state.nodes,
          edges: state.edges,
        });
        state.nodes = previous.nodes;
        state.edges = previous.edges;
      }
    },
    redo: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future.pop()!;
        state.history.past.push({
          nodes: state.nodes,
          edges: state.edges,
        });
        state.nodes = next.nodes;
        state.edges = next.edges;
      }
    },
    setValidationErrors: (state, action: PayloadAction<string[]>) => {
      state.validationErrors = action.payload;
    },
    clearWorkflow: (state) => {
      state.nodes = [];
      state.edges = [];
      state.selectedNodeId = null;
      state.validationErrors = [];
      state.history = { past: [], future: [] };
    },
  },
});

export const {
  setNodes,
  setEdges,
  addNode,
  updateNode,
  deleteNode,
  setSelectedNodeId,
  undo,
  redo,
  setValidationErrors,
  clearWorkflow,
} = workflowEditorSlice.actions;

export default workflowEditorSlice.reducer;
