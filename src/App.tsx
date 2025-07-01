import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Menu as MenuIcon,
  Save,
  Upload,
  Download,
  Settings,
  PlayArrow,
  Code
} from '@mui/icons-material';
import { Node } from 'reactflow';

import ServicesSidebar from './components/ServicesSidebar';
import WorkflowCanvas from './components/WorkflowCanvas';
import ConfigurationPanel from './components/ConfigurationPanel';
import UserMenu from './components/UserMenu';
import ProtectedRoute from './components/ProtectedRoute';
import { useWorkflowStore } from './store/workflowStore';
import { useAuthStore } from './store/authStore';
import { CloudFormationGenerator } from './services/cloudFormationGenerator';
import { WorkflowService } from './services/supabase';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00D4E6', // Vibrant cyan from yes.co.il
      dark: '#00B8CC',
      light: '#33DDEB',
    },
    secondary: {
      main: '#FF6B35', // Vibrant orange accent
      dark: '#E55A2B',
      light: '#FF8A5B',
    },
    background: {
      default: '#F8FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A5568',
    },
    grey: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          background: 'linear-gradient(135deg, #00D4E6 0%, #00B8CC 100%)',
          boxShadow: '0 4px 14px 0 rgba(0, 212, 230, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00B8CC 0%, #009FB0 100%)',
            boxShadow: '0 6px 20px 0 rgba(0, 212, 230, 0.4)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 50%, #1A202C 100%)',
          boxShadow: '0 4px 20px 0 rgba(26, 32, 44, 0.3)',
        },
      },
    },
  },
});

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml'>('json');
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  const {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    toggleConfigPanel,
    currentWorkflow,
    setCurrentWorkflow
  } = useWorkflowStore();

  const { isAuthenticated } = useAuthStore();

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node as any);
    toggleConfigPanel();
  };

  const handleExport = () => {
    if (nodes.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add some services to your workflow before exporting',
        severity: 'error'
      });
      return;
    }

    const workflow = {
      id: currentWorkflow?.id,
      name: workflowName || 'Untitled Workflow',
      description: workflowDescription,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type || 'awsService',
        position: node.position,
        data: node.data
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default'
      })),
      metadata: {
        version: '1.0.0',
        created_at: new Date().toISOString()
      }
    };

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === 'json') {
        content = CloudFormationGenerator.exportAsJSON(workflow);
        filename = `${workflowName || 'workflow'}-cloudformation.json`;
        mimeType = 'application/json';
      } else {
        content = CloudFormationGenerator.exportAsYAML(workflow);
        filename = `${workflowName || 'workflow'}-cloudformation.yaml`;
        mimeType = 'text/yaml';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportDialogOpen(false);
      setSnackbar({
        open: true,
        message: `CloudFormation template exported successfully as ${exportFormat.toUpperCase()}`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to export CloudFormation template',
        severity: 'error'
      });
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a workflow name',
        severity: 'error'
      });
      return;
    }

    if (nodes.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add some services to your workflow before saving',
        severity: 'error'
      });
      return;
    }

    try {
      const workflow = {
        id: currentWorkflow?.id,
        name: workflowName,
        description: workflowDescription,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'awsService',
          position: node.position,
          data: node.data
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'default'
        })),
        metadata: {
          version: '1.0.0'
        }
      };

      const savedWorkflow = await WorkflowService.saveWorkflow(workflow);
      setCurrentWorkflow(savedWorkflow);
      setSaveDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Workflow saved successfully to Supabase',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save workflow. Please check your Supabase configuration.',
        severity: 'error'
      });
    }
  };

  return (
    <Box className="flex h-screen" style={{ background: 'linear-gradient(135deg, #F8FAFB 0%, #EDF2F7 100%)' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            edge="start"
            className="mr-4"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 212, 230, 0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box className="flex items-center gap-2 flex-1">
            <Typography variant="h6" className="font-bold text-white">
              AWS Workflow Designer
            </Typography>
            {currentWorkflow && (
              <Typography variant="body2" sx={{ color: '#00D4E6' }}>
                • {currentWorkflow.name}
              </Typography>
            )}
          </Box>

          <Box className="flex gap-2 items-center">
            <Button
              color="inherit"
              startIcon={<Save />}
              onClick={() => setSaveDialogOpen(true)}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 230, 0.1)',
                }
              }}
            >
              Save
            </Button>
            
            <Button
              color="inherit"
              startIcon={<Download />}
              onClick={() => setExportDialogOpen(true)}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 230, 0.1)',
                }
              }}
            >
              Export
            </Button>
            
            <Button
              color="inherit"
              startIcon={<PlayArrow />}
              disabled={nodes.length === 0}
              onClick={() => {
                setSnackbar({
                  open: true,
                  message: 'Deploy feature coming soon!',
                  severity: 'success'
                });
              }}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 230, 0.1)',
                },
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Deploy
            </Button>

            <UserMenu />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box className="flex flex-1 mt-16">
        <ServicesSidebar open={sidebarOpen} />
        
        <Box 
          className="flex-1 flex"
          sx={{ 
            marginLeft: sidebarOpen ? '320px' : 0,
            transition: 'margin 0.3s ease'
          }}
        >
          <WorkflowCanvas onNodeClick={handleNodeClick} />
        </Box>
        
        <ConfigurationPanel />
      </Box>

      {/* Export Dialog */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFB 100%)',
          }
        }}
      >
        <DialogTitle className="flex items-center gap-2" sx={{ color: '#1A202C', fontWeight: 700 }}>
          <Code sx={{ color: '#00D4E6' }} />
          Export CloudFormation Template
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Workflow Name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              variant="outlined"
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
            
            <TextField
              fullWidth
              label="Description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              variant="outlined"
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
            
            <Box>
              <Typography variant="subtitle2" className="mb-2" sx={{ color: '#2D3748', fontWeight: 600 }}>
                Export Format:
              </Typography>
              <Box className="flex gap-2">
                <Button
                  variant={exportFormat === 'json' ? 'contained' : 'outlined'}
                  onClick={() => setExportFormat('json')}
                  sx={{
                    borderRadius: '12px',
                    ...(exportFormat !== 'json' && {
                      borderColor: '#00D4E6',
                      color: '#00D4E6',
                      '&:hover': {
                        borderColor: '#00B8CC',
                        backgroundColor: 'rgba(0, 212, 230, 0.05)',
                      },
                    }),
                  }}
                >
                  JSON
                </Button>
                <Button
                  variant={exportFormat === 'yaml' ? 'contained' : 'outlined'}
                  onClick={() => setExportFormat('yaml')}
                  sx={{
                    borderRadius: '12px',
                    ...(exportFormat !== 'yaml' && {
                      borderColor: '#00D4E6',
                      color: '#00D4E6',
                      '&:hover': {
                        borderColor: '#00B8CC',
                        backgroundColor: 'rgba(0, 212, 230, 0.05)',
                      },
                    }),
                  }}
                >
                  YAML
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            onClick={() => setExportDialogOpen(false)}
            sx={{
              color: '#4A5568',
              '&:hover': {
                backgroundColor: 'rgba(74, 85, 104, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={() => setSaveDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFB 100%)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#1A202C', fontWeight: 700 }}>
          Save Workflow
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Workflow Name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              variant="outlined"
              required
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
            
            <TextField
              fullWidth
              label="Description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              variant="outlined"
              multiline
              rows={3}
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            onClick={() => setSaveDialogOpen(false)}
            sx={{
              color: '#4A5568',
              '&:hover': {
                backgroundColor: 'rgba(74, 85, 104, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveWorkflow} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{
            borderRadius: '12px',
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#D4EDDA',
              color: '#155724',
            },
            '&.MuiAlert-standardError': {
              backgroundColor: '#F8D7DA',
              color: '#721C24',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProtectedRoute requireAuth={true}>
        <AppContent />
      </ProtectedRoute>
    </ThemeProvider>
  );
}

export default App;