import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import AWS from 'aws-sdk';

// Load environment variables from .env file in server directory
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('📝 Please check your server/.env file');
  process.exit(1);
}

// Supabase client - use server environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// AWS Configuration (optional - only needed for CloudFormation deployment)
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  console.log('✅ AWS SDK configured for CloudFormation deployment');
} else {
  console.log('⚠️  AWS credentials not configured - CloudFormation deployment disabled');
}

const cloudFormation = new AWS.CloudFormation();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AWS Workflow Designer API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      supabase: !!process.env.SUPABASE_URL,
      aws: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    }
  });
});

// Workflow CRUD operations
app.post('/api/workflows', async (req, res) => {
  try {
    const { name, description, workflow_data, user_id } = req.body;
    
    if (!name || !workflow_data) {
      return res.status(400).json({
        success: false,
        error: 'Name and workflow_data are required'
      });
    }
    
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        name,
        description: description || '',
        workflow_data,
        user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to save workflow' 
    });
  }
});

app.get('/api/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch workflow' 
    });
  }
});

app.get('/api/workflows', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    let query = supabase.from('workflows').select('*');
    
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch workflows' 
    });
  }
});

app.put('/api/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, workflow_data } = req.body;
    
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (workflow_data !== undefined) updateData.workflow_data = workflow_data;
    
    const { data, error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update workflow' 
    });
  }
});

app.delete('/api/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete workflow' 
    });
  }
});

// CloudFormation deployment (requires AWS credentials)
app.post('/api/deploy', async (req, res) => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return res.status(503).json({
        success: false,
        error: 'AWS credentials not configured. CloudFormation deployment is not available.'
      });
    }

    const { templateBody, stackName } = req.body;

    if (!templateBody || !stackName) {
      return res.status(400).json({
        success: false,
        error: 'Template body and stack name are required'
      });
    }

    const params = {
      StackName: stackName,
      TemplateBody: JSON.stringify(templateBody),
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
      OnFailure: 'ROLLBACK'
    };

    const result = await cloudFormation.createStack(params).promise();

    res.json({
      success: true,
      data: {
        stackId: result.StackId,
        message: 'Stack deployment initiated successfully'
      }
    });
  } catch (error) {
    console.error('Error deploying stack:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to deploy CloudFormation stack'
    });
  }
});

// Get stack status
app.get('/api/deploy/:stackName/status', async (req, res) => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return res.status(503).json({
        success: false,
        error: 'AWS credentials not configured. Stack status check is not available.'
      });
    }

    const { stackName } = req.params;

    const params = {
      StackName: stackName
    };

    const result = await cloudFormation.describeStacks(params).promise();
    const stack = result.Stacks[0];

    res.json({
      success: true,
      data: {
        stackName: stack.StackName,
        stackStatus: stack.StackStatus,
        creationTime: stack.CreationTime,
        lastUpdatedTime: stack.LastUpdatedTime,
        outputs: stack.Outputs || []
      }
    });
  } catch (error) {
    console.error('Error fetching stack status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stack status'
    });
  }
});

// Validate CloudFormation template
app.post('/api/validate-template', async (req, res) => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return res.status(503).json({
        success: false,
        error: 'AWS credentials not configured. Template validation is not available.'
      });
    }

    const { templateBody } = req.body;

    if (!templateBody) {
      return res.status(400).json({
        success: false,
        error: 'Template body is required'
      });
    }

    const params = {
      TemplateBody: JSON.stringify(templateBody)
    };

    const result = await cloudFormation.validateTemplate(params).promise();

    res.json({
      success: true,
      data: {
        description: result.Description,
        parameters: result.Parameters || [],
        capabilities: result.Capabilities || [],
        capabilitiesReason: result.CapabilitiesReason
      }
    });
  } catch (error) {
    console.error('Error validating template:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Template validation failed'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AWS Workflow Designer API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.SUPABASE_URL) {
    console.log(`✅ Supabase connected: ${process.env.SUPABASE_URL}`);
  } else {
    console.log(`❌ Supabase not configured`);
  }
  
  if (process.env.AWS_ACCESS_KEY_ID) {
    console.log(`✅ AWS configured for region: ${process.env.AWS_REGION || 'us-east-1'}`);
  } else {
    console.log(`⚠️  AWS not configured - CloudFormation features disabled`);
  }
});