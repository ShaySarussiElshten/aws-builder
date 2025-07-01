import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { AWS_SERVICES } from '../config/awsServices';
import CustomNode from './CustomNode';
import TriggerNode from './TriggerNode';
import { validateConnection } from '../utils/connectionValidator';

const nodeTypes = {
  awsService: CustomNode,
  trigger: TriggerNode,
};

interface WorkflowCanvasProps {
  onNodeClick: (node: Node) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ onNodeClick }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);
  
  const { nodes, edges, setNodes, setEdges, addNode } = useWorkflowStore();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode && validateConnection(sourceNode, targetNode)) {
        setEdges(addEdge({ 
          ...params, 
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#00D4E6', 
            strokeWidth: 3,
            filter: 'drop-shadow(0 2px 4px rgba(0, 212, 230, 0.3))'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#00D4E6',
            width: 25,
            height: 25,
          }
        }, edges));
      }
    },
    [nodes, edges, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const serviceId = event.dataTransfer.getData('application/reactflow');
      
      if (!reactFlowInstance || !reactFlowBounds) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Ensure minimum distance from left edge
      const minX = 50; // Minimum distance from left edge
      const adjustedPosition = {
        x: Math.max(position.x, minX),
        y: position.y
      };

      // Check if it's a trigger
      if (serviceId === 'click-trigger') {
        const newNode: Node = {
          id: `trigger-${Date.now()}`,
          type: 'trigger',
          position: adjustedPosition,
          data: {
            label: 'Click Trigger',
            service: 'trigger',
            configuration: {
              triggerType: 'click',
              description: 'Manual activation by click'
            },
            icon: 'MousePointer',
            color: '#10B981',
            description: 'Manual trigger for workflow activation'
          },
        };
        addNode(newNode);
        return;
      }

      const service = AWS_SERVICES.find(s => s.id === serviceId);
      if (!service) return;

      const newNode: Node = {
        id: `${service.id}-${Date.now()}`,
        type: 'awsService',
        position: adjustedPosition,
        data: {
          label: service.name,
          service: service.id,
          configuration: { ...service.defaultConfiguration },
          icon: service.icon,
          color: service.color,
          description: service.description
        },
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    // Add context menu functionality here
  }, []);

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => onNodeClick(node)}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        connectionLineStyle={{ 
          stroke: '#00D4E6', 
          strokeWidth: 3,
          filter: 'drop-shadow(0 2px 4px rgba(0, 212, 230, 0.3))'
        }}
        defaultEdgeOptions={{ 
          type: 'smoothstep', 
          animated: true,
          style: { 
            stroke: '#00D4E6', 
            strokeWidth: 3,
            filter: 'drop-shadow(0 2px 4px rgba(0, 212, 230, 0.3))'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#00D4E6',
            width: 25,
            height: 25,
          }
        }}
        fitView
        fitViewOptions={{
          padding: 0.3, // Increased padding to 30%
          minZoom: 0.3,
          maxZoom: 1.2,
          includeHiddenNodes: false
        }}
        translateExtent={[[-200, -200], [2000, 2000]]} // Allow more space for movement
        nodeExtent={[[-100, -100], [1800, 1800]]} // Prevent nodes from going too far left/right
        style={{ 
          padding: '40px', // Increased internal padding
          minHeight: '100%',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #1E293B 75%, #0F172A 100%)',
        }}
      >
        <Controls 
          className="border border-slate-600 rounded-xl shadow-2xl backdrop-blur-sm"
          style={{ 
            left: '20px', 
            bottom: '20px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            color: '#00D4E6'
          }}
        />
        <MiniMap 
          className="border border-slate-600 rounded-xl shadow-2xl backdrop-blur-sm"
          nodeStrokeColor="#00D4E6"
          nodeColor="#334155"
          nodeBorderRadius={8}
          style={{ 
            right: '20px', 
            bottom: '20px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          }}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={25} 
          size={2} 
          color="#334155"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #1E293B 75%, #0F172A 100%)',
          }}
        />
      </ReactFlow>
    </div>
  );
};

const WorkflowCanvasWithProvider: React.FC<WorkflowCanvasProps> = (props) => (
  <ReactFlowProvider>
    <WorkflowCanvas {...props} />
  </ReactFlowProvider>
);

export default WorkflowCanvasWithProvider;