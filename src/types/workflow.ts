export interface AWSNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    service: string;
    configuration: Record<string, any>;
    icon: string;
    color: string;
  };
}

export interface AWSEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data?: {
    label?: string;
    trigger?: string;
  };
}

export interface Workflow {
  id?: string;
  name: string;
  description?: string;
  nodes: AWSNode[];
  edges: AWSEdge[];
  metadata: {
    created_at?: string;
    updated_at?: string;
    version: string;
  };
}

export interface AWSService {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  category: string;
  description: string;
  defaultConfiguration: Record<string, any>;
  connectionRules: {
    canConnectTo: string[];
    canReceiveFrom: string[];
  };
}

export interface CloudFormationTemplate {
  AWSTemplateFormatVersion: string;
  Description: string;
  Resources: Record<string, any>;
  Outputs?: Record<string, any>;
}