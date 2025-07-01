import { Node } from 'reactflow';
import { AWS_SERVICES } from '../config/awsServices';

export const validateConnection = (sourceNode: Node, targetNode: Node): boolean => {
  // Allow triggers to connect to any AWS service
  if (sourceNode.data.service === 'trigger') {
    return targetNode.data.service !== 'trigger';
  }

  // Don't allow connections to triggers
  if (targetNode.data.service === 'trigger') {
    return false;
  }

  const sourceService = AWS_SERVICES.find(s => s.id === sourceNode.data.service);
  const targetService = AWS_SERVICES.find(s => s.id === targetNode.data.service);

  if (!sourceService || !targetService) {
    return false;
  }

  // Check if source can connect to target
  const canConnect = sourceService.connectionRules.canConnectTo.includes(targetService.id);
  
  // Check if target can receive from source
  const canReceive = targetService.connectionRules.canReceiveFrom.includes(sourceService.id);

  return canConnect && canReceive;
};

export const getValidTargets = (sourceNodeService: string): string[] => {
  if (sourceNodeService === 'trigger') {
    return AWS_SERVICES.map(s => s.id);
  }
  
  const service = AWS_SERVICES.find(s => s.id === sourceNodeService);
  return service ? service.connectionRules.canConnectTo : [];
};

export const getValidSources = (targetNodeService: string): string[] => {
  if (targetNodeService === 'trigger') {
    return [];
  }
  
  const service = AWS_SERVICES.find(s => s.id === targetNodeService);
  const sources = service ? service.connectionRules.canReceiveFrom : [];
  
  // Add trigger as a valid source for all AWS services
  return ['trigger', ...sources];
};

// Connection validation examples:
// ✅ Trigger → Lambda: Trigger can start any workflow
// ✅ Lambda → S3: Lambda can write to S3 buckets
// ✅ S3 → Lambda: S3 can trigger Lambda functions
// ✅ API Gateway → Lambda: API Gateway can invoke Lambda
// ✅ Lambda → DynamoDB: Lambda can read/write to DynamoDB
// ❌ EC2 → API Gateway: Direct connection not supported
// ❌ S3 → API Gateway: Direct connection not supported
// ❌ Any Service → Trigger: Triggers are entry points only

export const getConnectionValidationMessage = (
  sourceService: string, 
  targetService: string
): string => {
  const isValid = validateConnection(
    { data: { service: sourceService } } as Node,
    { data: { service: targetService } } as Node
  );

  if (isValid) {
    return getConnectionDescription(sourceService, targetService);
  }

  return `Connection between ${sourceService.toUpperCase()} and ${targetService.toUpperCase()} is not supported in AWS architecture.`;
};

const getConnectionDescription = (source: string, target: string): string => {
  if (source === 'trigger') {
    return `Click trigger will activate ${target.toUpperCase()}`;
  }

  const connectionMap: Record<string, Record<string, string>> = {
    lambda: {
      s3: 'Lambda function can read from and write to S3 bucket',
      dynamodb: 'Lambda function can perform CRUD operations on DynamoDB table',
      sns: 'Lambda function can publish messages to SNS topic',
      sqs: 'Lambda function can send messages to SQS queue'
    },
    s3: {
      lambda: 'S3 bucket events can trigger Lambda function execution'
    },
    apigateway: {
      lambda: 'API Gateway can invoke Lambda function for request processing',
      dynamodb: 'API Gateway can directly integrate with DynamoDB for data operations'
    }
  };

  return connectionMap[source]?.[target] || 'Valid AWS service connection';
};