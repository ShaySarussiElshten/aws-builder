import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import { Close, Save, Code, Edit } from '@mui/icons-material';
import { useWorkflowStore } from '../store/workflowStore';
import * as Icons from 'lucide-react';
import { DivideIcon as LucideIcon } from 'lucide-react';

const DRAWER_WIDTH = 400;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`code-tabpanel-${index}`}
      aria-labelledby={`code-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ConfigurationPanel: React.FC = () => {
  const { selectedNode, isConfigPanelOpen, toggleConfigPanel, updateNode } = useWorkflowStore();
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [lambdaCode, setLambdaCode] = useState('');
  const [testCode, setTestCode] = useState('');

  React.useEffect(() => {
    if (selectedNode?.data.service === 'lambda') {
      setLambdaCode(selectedNode.data.configuration.code || `exports.handler = async (event) => {
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
};`);
      
      setTestCode(selectedNode.data.configuration.testCode || `// Test your Lambda function
const testEvent = {
    "httpMethod": "GET",
    "path": "/test",
    "queryStringParameters": {
        "name": "World"
    },
    "headers": {
        "Content-Type": "application/json"
    },
    "body": null
};

// You can modify this test event to test different scenarios
console.log('Testing with event:', testEvent);`);
    }
  }, [selectedNode]);

  const handleConfigChange = (key: string, value: any) => {
    if (selectedNode) {
      updateNode(selectedNode.id, {
        configuration: {
          ...selectedNode.data.configuration,
          [key]: value
        }
      });
    }
  };

  const handleSave = () => {
    toggleConfigPanel();
  };

  const handleCodeSave = () => {
    if (selectedNode) {
      updateNode(selectedNode.id, {
        configuration: {
          ...selectedNode.data.configuration,
          code: lambdaCode,
          testCode: testCode
        }
      });
    }
    setCodeDialogOpen(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const renderConfigField = (key: string, value: any) => {
    // Skip rendering code field as regular text field since we have a special editor
    if (key === 'code' || key === 'testCode') {
      return null;
    }

    switch (typeof value) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value}
                onChange={(e) => handleConfigChange(key, e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#00D4E6',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#00D4E6',
                  },
                }}
              />
            }
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            sx={{ color: '#2D3748' }}
          />
        );
      
      case 'number':
        return (
          <TextField
            fullWidth
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(key, parseInt(e.target.value) || 0)}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: '#00D4E6',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#00D4E6',
              },
            }}
          />
        );
      
      case 'string':
        if (key.includes('Type') || key.includes('Mode') || key.includes('Runtime')) {
          const options = getSelectOptions(key, selectedNode?.data.service);
          return (
            <FormControl fullWidth size="small">
              <FormLabel 
                className="text-sm font-medium mb-1"
                sx={{ color: '#2D3748', fontWeight: 600 }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </FormLabel>
              <Select
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00D4E6',
                  },
                }}
              >
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }
        return (
          <TextField
            fullWidth
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            value={value}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            variant="outlined"
            size="small"
            multiline={key.includes('description')}
            rows={key.includes('description') ? 3 : 1}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: '#00D4E6',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#00D4E6',
              },
            }}
          />
        );
      
      default:
        return (
          <TextField
            fullWidth
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            value={JSON.stringify(value)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleConfigChange(key, parsed);
              } catch {
                // Invalid JSON, don't update
              }
            }}
            variant="outlined"
            size="small"
            multiline
            rows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: '#00D4E6',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#00D4E6',
              },
            }}
          />
        );
    }
  };

  const getSelectOptions = (key: string, service?: string): string[] => {
    switch (key) {
      case 'runtime':
        return ['nodejs18.x', 'nodejs16.x', 'python3.9', 'python3.8', 'java11', 'go1.x'];
      case 'billingMode':
        return ['PAY_PER_REQUEST', 'PROVISIONED'];
      case 'endpointType':
        return ['REGIONAL', 'EDGE', 'PRIVATE'];
      case 'instanceType':
        return ['t2.micro', 't2.small', 't2.medium', 't3.micro', 't3.small', 't3.medium'];
      case 'engine':
        return ['mysql', 'postgres', 'aurora-mysql', 'aurora-postgresql'];
      default:
        return [];
    }
  };

  if (!selectedNode || !isConfigPanelOpen) {
    return null;
  }

  const IconComponent = Icons[selectedNode.data.icon as keyof typeof Icons] as LucideIcon;
  const isLambda = selectedNode.data.service === 'lambda';

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="right"
        open={isConfigPanelOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFB 100%)',
            borderLeft: '1px solid #E2E8F0',
            boxShadow: '-4px 0 20px 0 rgba(0, 0, 0, 0.05)',
            marginTop: '64px', // Add margin to push content below header
            height: 'calc(100vh - 64px)', // Adjust height to account for header
          },
        }}
      >
        <Box className="p-6" sx={{ paddingTop: '24px' }}>
          <Box className="flex items-center justify-between mb-6">
            <Box className="flex items-center gap-3">
              <Box 
                className="p-3 rounded-xl"
                sx={{ 
                  backgroundColor: `${selectedNode.data.color}15`,
                  border: `2px solid ${selectedNode.data.color}30`,
                }}
              >
                {IconComponent && (
                  <IconComponent 
                    size={24} 
                    style={{ color: selectedNode.data.color }}
                  />
                )}
              </Box>
              <Box>
                <Typography variant="h6" className="font-bold" sx={{ color: '#1A202C', fontWeight: 700 }}>
                  {selectedNode.data.label}
                </Typography>
                <Chip 
                  label={selectedNode.data.service.toUpperCase()} 
                  size="small"
                  sx={{ 
                    backgroundColor: selectedNode.data.color, 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
            </Box>
            <IconButton 
              onClick={toggleConfigPanel} 
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 230, 0.1)',
                }
              }}
            >
              <Close sx={{ color: '#4A5568' }} />
            </IconButton>
          </Box>

          <Divider className="mb-6" sx={{ backgroundColor: '#E2E8F0' }} />

          <Paper 
            className="p-4 mb-6"
            sx={{ 
              background: 'linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 100%)',
              border: '1px solid #81E6D9',
              borderRadius: '16px',
            }}
          >
            <Typography variant="body2" sx={{ color: '#234E52' }}>
              <Code className="mr-2 inline" size={16} sx={{ color: '#00D4E6' }} />
              Configure the properties for your {selectedNode.data.service.toUpperCase()} service. 
              Changes will be reflected in the generated CloudFormation template.
            </Typography>
          </Paper>

          {/* Lambda Code Editor Button */}
          {isLambda && (
            <Box className="mb-6">
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setCodeDialogOpen(true)}
                fullWidth
                sx={{
                  borderRadius: '12px',
                  padding: '12px 24px',
                  borderColor: '#FF6B35',
                  color: '#FF6B35',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #FFF5F0 0%, #FFEBE0 100%)',
                  '&:hover': {
                    borderColor: '#E55A2B',
                    backgroundColor: '#FFEBE0',
                    boxShadow: '0 4px 12px 0 rgba(255, 107, 53, 0.2)',
                  },
                }}
              >
                Edit Lambda Code
              </Button>
            </Box>
          )}

          <Box className="space-y-4">
            <Typography variant="subtitle1" className="font-semibold mb-4" sx={{ color: '#1A202C', fontWeight: 700 }}>
              Configuration Properties
            </Typography>
            
            {Object.entries(selectedNode.data.configuration).map(([key, value]) => (
              <Box key={key} className="mb-4">
                {renderConfigField(key, value)}
              </Box>
            ))}
          </Box>

          <Divider className="my-6" sx={{ backgroundColor: '#E2E8F0' }} />

          <Box className="space-y-3">
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              fullWidth
              sx={{
                borderRadius: '12px',
                padding: '12px 24px',
                background: `linear-gradient(135deg, ${selectedNode.data.color} 0%, ${selectedNode.data.color}CC 100%)`,
                boxShadow: `0 4px 14px 0 ${selectedNode.data.color}40`,
                fontWeight: 600,
                '&:hover': {
                  background: `linear-gradient(135deg, ${selectedNode.data.color}DD 0%, ${selectedNode.data.color}AA 100%)`,
                  boxShadow: `0 6px 20px 0 ${selectedNode.data.color}50`,
                }
              }}
            >
              Save Configuration
            </Button>
            
            <Button
              variant="outlined"
              onClick={toggleConfigPanel}
              fullWidth
              sx={{
                borderRadius: '12px',
                padding: '12px 24px',
                borderColor: '#E2E8F0',
                color: '#4A5568',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#00D4E6',
                  backgroundColor: 'rgba(0, 212, 230, 0.05)',
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Lambda Code Editor Dialog */}
      <Dialog
        open={codeDialogOpen}
        onClose={() => setCodeDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFB 100%)',
            minHeight: '80vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#1A202C', 
          fontWeight: 700,
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
          color: 'white',
        }}>
          <Box className="flex items-center gap-2">
            <Code />
            Lambda Code Editor - {selectedNode.data.label}
          </Box>
        </DialogTitle>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#FF6B35',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FF6B35',
              },
            }}
          >
            <Tab label="Lambda Code" />
            <Tab label="Test Code" />
          </Tabs>
        </Box>

        <DialogContent sx={{ padding: 0 }}>
          <TabPanel value={currentTab} index={0}>
            <Box>
              <Typography variant="body2" sx={{ color: '#4A5568', mb: 2 }}>
                Write your Lambda function code here. The code will be saved in the configuration and exported in the CloudFormation template.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={lambdaCode}
                onChange={(e) => setLambdaCode(e.target.value)}
                variant="outlined"
                placeholder="// Write your Lambda code here..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                    fontSize: '14px',
                    backgroundColor: '#1A202C',
                    color: '#E2E8F0',
                    '& fieldset': {
                      borderColor: '#4A5568',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FF6B35',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B35',
                    },
                  },
                  '& textarea': {
                    color: '#E2E8F0 !important',
                  },
                }}
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={currentTab} index={1}>
            <Box>
              <Typography variant="body2" sx={{ color: '#4A5568', mb: 2 }}>
                Write test code for your Lambda function. This will help you verify that your function works correctly.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                variant="outlined"
                placeholder="// Write test code here..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                    fontSize: '14px',
                    backgroundColor: '#1A202C',
                    color: '#E2E8F0',
                    '& fieldset': {
                      borderColor: '#4A5568',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FF6B35',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B35',
                    },
                  },
                  '& textarea': {
                    color: '#E2E8F0 !important',
                  },
                }}
              />
            </Box>
          </TabPanel>
        </DialogContent>
        
        <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0' }}>
          <Button 
            onClick={() => setCodeDialogOpen(false)}
            sx={{
              color: '#4A5568',
              '&:hover': {
                backgroundColor: 'rgba(74, 85, 104, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCodeSave} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E55A2B 0%, #CC4A1F 100%)',
              },
            }}
          >
            Save Code
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfigurationPanel;