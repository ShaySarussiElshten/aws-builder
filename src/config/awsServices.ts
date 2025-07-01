import { AWSService } from '../types/workflow';

export const AWS_SERVICES: AWSService[] = [
  {
    id: 'lambda',
    name: 'Lambda',
    type: 'AWS::Lambda::Function',
    icon: 'Zap',
    color: '#FF6B35',
    category: 'Compute',
    description: 'Run code without thinking about servers',
    defaultConfiguration: {
      runtime: 'nodejs18.x',
      handler: 'index.handler',
      timeout: 30,
      memorySize: 128,
      environment: {},
      code: `exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Your Lambda function logic here
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Hello from Lambda!',
            timestamp: new Date().toISOString(),
            event: event
        })
    };
    
    return response;
};`
    },
    connectionRules: {
      canConnectTo: ['s3', 'dynamodb', 'apigateway', 'sns', 'sqs'],
      canReceiveFrom: ['s3', 'dynamodb', 'apigateway', 'sns', 'sqs', 'eventbridge']
    }
  },
  {
    id: 's3',
    name: 'S3',
    type: 'AWS::S3::Bucket',
    icon: 'Database',
    color: '#4ECDC4',
    category: 'Storage',
    description: 'Scalable storage in the cloud',
    defaultConfiguration: {
      bucketName: '',
      versioning: false,
      encryption: true,
      publicAccess: false
    },
    connectionRules: {
      canConnectTo: ['lambda', 'cloudfront'],
      canReceiveFrom: ['lambda', 'ec2']
    }
  },
  {
    id: 'dynamodb',
    name: 'DynamoDB',
    type: 'AWS::DynamoDB::Table',
    icon: 'Table',
    color: '#6C5CE7',
    category: 'Database',
    description: 'Fast and flexible NoSQL database',
    defaultConfiguration: {
      tableName: '',
      partitionKey: 'id',
      sortKey: '',
      billingMode: 'PAY_PER_REQUEST'
    },
    connectionRules: {
      canConnectTo: ['lambda'],
      canReceiveFrom: ['lambda', 'apigateway']
    }
  },
  {
    id: 'apigateway',
    name: 'API Gateway',
    type: 'AWS::ApiGateway::RestApi',
    icon: 'Globe',
    color: '#FF7675',
    category: 'Networking',
    description: 'Create, publish, and manage APIs',
    defaultConfiguration: {
      name: '',
      description: '',
      endpointType: 'REGIONAL',
      cors: true
    },
    connectionRules: {
      canConnectTo: ['lambda', 'dynamodb'],
      canReceiveFrom: []
    }
  },
  {
    id: 'sns',
    name: 'SNS',
    type: 'AWS::SNS::Topic',
    icon: 'Bell',
    color: '#FD79A8',
    category: 'Messaging',
    description: 'Pub/Sub messaging service',
    defaultConfiguration: {
      topicName: '',
      displayName: '',
      fifo: false
    },
    connectionRules: {
      canConnectTo: ['lambda', 'sqs'],
      canReceiveFrom: ['lambda', 's3']
    }
  },
  {
    id: 'sqs',
    name: 'SQS',
    type: 'AWS::SQS::Queue',
    icon: 'MessageSquare',
    color: '#FDCB6E',
    category: 'Messaging',
    description: 'Message queuing service',
    defaultConfiguration: {
      queueName: '',
      visibilityTimeout: 30,
      messageRetentionPeriod: 345600,
      fifo: false
    },
    connectionRules: {
      canConnectTo: ['lambda'],
      canReceiveFrom: ['sns', 'lambda']
    }
  },
  {
    id: 'ec2',
    name: 'EC2',
    type: 'AWS::EC2::Instance',
    icon: 'Server',
    color: '#A29BFE',
    category: 'Compute',
    description: 'Virtual servers in the cloud',
    defaultConfiguration: {
      instanceType: 't2.micro',
      imageId: 'ami-0abcdef1234567890',
      keyName: '',
      securityGroups: []
    },
    connectionRules: {
      canConnectTo: ['s3', 'rds'],
      canReceiveFrom: ['loadbalancer']
    }
  },
  {
    id: 'rds',
    name: 'RDS',
    type: 'AWS::RDS::DBInstance',
    icon: 'Database',
    color: '#74B9FF',
    category: 'Database',
    description: 'Managed relational database',
    defaultConfiguration: {
      engine: 'mysql',
      instanceClass: 'db.t3.micro',
      allocatedStorage: 20,
      masterUsername: 'admin'
    },
    connectionRules: {
      canConnectTo: [],
      canReceiveFrom: ['ec2', 'lambda']
    }
  }
];