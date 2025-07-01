import { Workflow, CloudFormationTemplate } from '../types/workflow';
import * as yaml from 'js-yaml';

export class CloudFormationGenerator {
  static generateTemplate(workflow: Workflow): CloudFormationTemplate {
    const template: CloudFormationTemplate = {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: `CloudFormation template for workflow: ${workflow.name}`,
      Resources: {}
    };

    // Generate resources for each node
    workflow.nodes.forEach(node => {
      const resourceName = this.sanitizeResourceName(node.data.label || node.id);
      
      switch (node.data.service) {
        case 'lambda':
          template.Resources[resourceName] = this.generateLambdaResource(node);
          break;
        case 's3':
          template.Resources[resourceName] = this.generateS3Resource(node);
          break;
        case 'dynamodb':
          template.Resources[resourceName] = this.generateDynamoDBResource(node);
          break;
        case 'apigateway':
          template.Resources[resourceName] = this.generateAPIGatewayResource(node);
          break;
        case 'sns':
          template.Resources[resourceName] = this.generateSNSResource(node);
          break;
        case 'sqs':
          template.Resources[resourceName] = this.generateSQSResource(node);
          break;
        case 'ec2':
          template.Resources[resourceName] = this.generateEC2Resource(node);
          break;
        case 'rds':
          template.Resources[resourceName] = this.generateRDSResource(node);
          break;
      }
    });

    // Add IAM roles and policies based on connections
    this.addIAMRoles(template, workflow);

    return template;
  }

  static exportAsJSON(workflow: Workflow): string {
    const template = this.generateTemplate(workflow);
    return JSON.stringify(template, null, 2);
  }

  static exportAsYAML(workflow: Workflow): string {
    const template = this.generateTemplate(workflow);
    return yaml.dump(template);
  }

  private static sanitizeResourceName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, 'R$&');
  }

  private static generateLambdaResource(node: any) {
    const config = node.data.configuration;
    return {
      Type: 'AWS::Lambda::Function',
      Properties: {
        FunctionName: config.functionName || node.data.label,
        Runtime: config.runtime || 'nodejs18.x',
        Handler: config.handler || 'index.handler',
        Code: {
          ZipFile: 'exports.handler = async (event) => { console.log(event); return { statusCode: 200 }; };'
        },
        Timeout: config.timeout || 30,
        MemorySize: config.memorySize || 128,
        Environment: {
          Variables: config.environment || {}
        }
      }
    };
  }

  private static generateS3Resource(node: any) {
    const config = node.data.configuration;
    return {
      Type: 'AWS::S3::Bucket',
      Properties: {
        BucketName: config.bucketName || `${node.data.label.toLowerCase()}-bucket`,
        VersioningConfiguration: {
          Status: config.versioning ? 'Enabled' : 'Suspended'
        },
        BucketEncryption: config.encryption ? {
          ServerSideEncryptionConfiguration: [{
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256'
            }
          }]
        } : undefined,
        PublicAccessBlockConfiguration: config.publicAccess ? undefined : {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true
        }
      }
    };
  }

  private static generateDynamoDBResource(node: any) {
    const config = node.data.configuration;
    return {
      Type: 'AWS::DynamoDB::Table',
      Properties: {
        TableName: config.tableName || node.data.label,
        BillingMode: config.billingMode || 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          {
            AttributeName: config.partitionKey || 'id',
            AttributeType: 'S'
          }
        ],
        KeySchema: [
          {
            AttributeName: config.partitionKey || 'id',
            KeyType: 'HASH'
          }
        ]
      }
    };
  }

  private static generateAPIGatewayResource(node: any) {
    const config = node.data.configuration;
    return {
      Type: 'AWS::ApiGateway::RestApi',
      Properties: {
        Name: config.name || node.data.label,
        Description: config.description || 'API Gateway created by AWS Workflow Designer',
        EndpointConfiguration: {
          Types: [config.endpointType || 'REGIONAL']
        }
      }
    };
  }

  private static generateSNSResource(node: any) {
    const config = node.data.configuration;
    return {
      Type: 'AWS::SNS::Topic',
      Properties: {
        TopicName: config.topicName || node.data.label,
        DisplayName: config.displayName || node.data.label,
        FifoTopic: config.fifo || false
      }
    };
  }

  private static generateSQSResource(node: any) {
    const config = node.data.configuration;
    return {
      Type: 'AWS::SQS::Queue',
      Properties: {
        QueueName: config.queueName || node.data.label,
        VisibilityTimeout: config.visibilityTimeout || 30,
        MessageRetentionPeriod: config.messageRetentionPeriod || 345600,
        FifoQueue: config.fifo || false
      }
    };
  }

  private static generateEC2Resource(node: any) {
    const config = node.data.configuration;
    return {
      Type: 'AWS::EC2::Instance',
      Properties: {
        InstanceType: config.instanceType || 't2.micro',
        ImageId: config.imageId || 'ami-0abcdef1234567890',
        KeyName: config.keyName,
        SecurityGroups: config.securityGroups || []
      }
    };
  }

  private static generateRDSResource(node: any) {
    const config = node.data.configuration;
    return {
      Type: 'AWS::RDS::DBInstance',
      Properties: {
        Engine: config.engine || 'mysql',
        DBInstanceClass: config.instanceClass || 'db.t3.micro',
        AllocatedStorage: config.allocatedStorage || 20,
        MasterUsername: config.masterUsername || 'admin',
        MasterUserPassword: '{{resolve:secretsmanager:rds-password:SecretString:password}}'
      }
    };
  }

  private static addIAMRoles(template: CloudFormationTemplate, workflow: Workflow) {
    // Add basic Lambda execution role
    const hasLambda = workflow.nodes.some(node => node.data.service === 'lambda');
    if (hasLambda) {
      template.Resources['LambdaExecutionRole'] = {
        Type: 'AWS::IAM::Role',
        Properties: {
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: {
                Service: 'lambda.amazonaws.com'
              },
              Action: 'sts:AssumeRole'
            }]
          },
          ManagedPolicyArns: [
            'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
          ]
        }
      };
    }
  }
}