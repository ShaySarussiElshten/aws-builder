import { create } from 'zustand';
import { AWSNode, AWSEdge, Workflow } from '../types/workflow';
import { Node, Edge } from 'reactflow';

interface WorkflowStore {
  currentWorkflow: Workflow | null;
  nodes: Node[];
  edges: Edge[];
  selectedNode: AWSNode | null;
  isConfigPanelOpen: boolean;
  
  // Actions
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: AWSNode | null) => void;
  toggleConfigPanel: () => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isConfigPanelOpen: false,

  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  
  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node] 
  })),
  
  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    )
  })),
  
  deleteNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter(node => node.id !== nodeId),
    edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
  })),
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  toggleConfigPanel: () => set((state) => ({ 
    isConfigPanelOpen: !state.isConfigPanelOpen 
  })),
  
  clearWorkflow: () => set({
    nodes: [],
    edges: [],
    selectedNode: null,
    isConfigPanelOpen: false,
    currentWorkflow: null
  })
}));