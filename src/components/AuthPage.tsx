import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  Divider,
  CircularProgress,
  Paper,
  Container
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  Login,
  PersonAdd
} from '@mui/icons-material';
import { Database, Globe, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

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
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AuthPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });

  const { signIn, signUp, loading, error, clearError } = useAuthStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    clearError();
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: ''
    });
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    clearError();
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      return;
    }

    await signIn(formData.email, formData.password);
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.username) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    await signUp(formData.email, formData.password, formData.username);
  };

  return (
    <Box 
      className="min-h-screen flex items-center justify-center"
      sx={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #1E293B 75%, #0F172A 100%)',
        padding: '20px',
      }}
    >
      <Container maxWidth="lg">
        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <Box className="text-center lg:text-left">
            <Box 
              className="inline-flex p-6 rounded-full mb-6"
              sx={{
                background: 'linear-gradient(135deg, #00D4E6 0%, #00B8CC 100%)',
                boxShadow: '0 20px 40px 0 rgba(0, 212, 230, 0.4)',
              }}
            >
              <Zap size={48} color="white" />
            </Box>
            
            <Typography 
              variant="h2" 
              className="font-bold text-white mb-4"
              sx={{ fontWeight: 700, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
            >
              AWS Workflow Designer
            </Typography>
            
            <Typography 
              variant="h5" 
              sx={{ color: '#A0AEC0', mb: 6, lineHeight: 1.6 }}
            >
              Design, visualize, and deploy AWS infrastructure with an intuitive drag-and-drop interface
            </Typography>

            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Paper 
                className="p-6 text-center"
                sx={{
                  background: 'rgba(0, 212, 230, 0.1)',
                  border: '1px solid rgba(0, 212, 230, 0.3)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Zap size={40} color="#00D4E6" style={{ marginBottom: '16px' }} />
                <Typography variant="h6" className="text-white font-semibold mb-2">
                  Visual Design
                </Typography>
                <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                  Drag and drop AWS services to create your infrastructure
                </Typography>
              </Paper>
              
              <Paper 
                className="p-6 text-center"
                sx={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Database size={40} color="#FF6B35" style={{ marginBottom: '16px' }} />
                <Typography variant="h6" className="text-white font-semibold mb-2">
                  Auto-Generate
                </Typography>
                <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                  Export CloudFormation templates automatically
                </Typography>
              </Paper>
              
              <Paper 
                className="p-6 text-center"
                sx={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Globe size={40} color="#10B981" style={{ marginBottom: '16px' }} />
                <Typography variant="h6" className="text-white font-semibold mb-2">
                  Save & Share
                </Typography>
                <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                  Save workflows and collaborate with your team
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Right Side - Auth Form */}
          <Box className="w-full max-w-md mx-auto">
            <Paper
              sx={{
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 50%, #1A202C 100%)',
                border: '1px solid #00D4E6',
                boxShadow: '0 25px 50px 0 rgba(0, 212, 230, 0.3)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
              }}
            >
              <Box className="text-center pt-8 pb-4 px-6">
                <Box 
                  className="inline-flex p-4 rounded-full mb-4"
                  sx={{
                    background: 'linear-gradient(135deg, #00D4E6 0%, #00B8CC 100%)',
                    boxShadow: '0 10px 30px 0 rgba(0, 212, 230, 0.4)',
                  }}
                >
                  <Person sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography 
                  variant="h4" 
                  className="font-bold text-white mb-2"
                  sx={{ fontWeight: 700 }}
                >
                  Welcome
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ color: '#A0AEC0' }}
                >
                  Sign in to save and manage your workflows
                </Typography>
              </Box>

              <Box sx={{ borderBottom: 1, borderColor: 'rgba(0, 212, 230, 0.2)' }}>
                <Tabs 
                  value={currentTab} 
                  onChange={handleTabChange}
                  centered
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      color: '#A0AEC0',
                      fontSize: '1rem',
                      '&.Mui-selected': {
                        color: '#00D4E6',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#00D4E6',
                      height: 3,
                      borderRadius: '2px',
                    },
                  }}
                >
                  <Tab 
                    label="Sign In" 
                    icon={<Login />}
                    iconPosition="start"
                  />
                  <Tab 
                    label="Sign Up" 
                    icon={<PersonAdd />}
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {error && (
                <Box className="px-6 pt-4">
                  <Alert 
                    severity="error"
                    sx={{
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      color: '#FF6B6B',
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      borderRadius: '12px',
                      '& .MuiAlert-icon': {
                        color: '#FF6B6B',
                      },
                    }}
                  >
                    {error}
                  </Alert>
                </Box>
              )}

              <TabPanel value={currentTab} index={0}>
                <Box className="space-y-4">
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#00D4E6' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(0, 212, 230, 0.05)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 212, 230, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00D4E6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00D4E6',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#A0AEC0',
                        '&.Mui-focused': {
                          color: '#00D4E6',
                        },
                      },
                      '& input': {
                        color: 'white',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#00D4E6' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ color: '#00D4E6', minWidth: 'auto', p: 1 }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(0, 212, 230, 0.05)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 212, 230, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00D4E6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00D4E6',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#A0AEC0',
                        '&.Mui-focused': {
                          color: '#00D4E6',
                        },
                      },
                      '& input': {
                        color: 'white',
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSignIn}
                    disabled={loading || !formData.email || !formData.password}
                    startIcon={loading ? <CircularProgress size={20} /> : <Login />}
                    sx={{
                      borderRadius: '16px',
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #00D4E6 0%, #00B8CC 100%)',
                      boxShadow: '0 8px 25px 0 rgba(0, 212, 230, 0.4)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #00B8CC 0%, #009FB0 100%)',
                        boxShadow: '0 12px 35px 0 rgba(0, 212, 230, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(0, 212, 230, 0.3)',
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                <Box className="space-y-4">
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#00D4E6' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(0, 212, 230, 0.05)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 212, 230, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00D4E6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00D4E6',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#A0AEC0',
                        '&.Mui-focused': {
                          color: '#00D4E6',
                        },
                      },
                      '& input': {
                        color: 'white',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#00D4E6' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(0, 212, 230, 0.05)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 212, 230, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00D4E6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00D4E6',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#A0AEC0',
                        '&.Mui-focused': {
                          color: '#00D4E6',
                        },
                      },
                      '& input': {
                        color: 'white',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#00D4E6' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ color: '#00D4E6', minWidth: 'auto', p: 1 }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(0, 212, 230, 0.05)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 212, 230, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00D4E6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00D4E6',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#A0AEC0',
                        '&.Mui-focused': {
                          color: '#00D4E6',
                        },
                      },
                      '& input': {
                        color: 'white',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    variant="outlined"
                    error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                    helperText={
                      formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                        ? 'Passwords do not match'
                        : ''
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#00D4E6' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(0, 212, 230, 0.05)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 212, 230, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00D4E6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00D4E6',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#A0AEC0',
                        '&.Mui-focused': {
                          color: '#00D4E6',
                        },
                      },
                      '& input': {
                        color: 'white',
                      },
                      '& .MuiFormHelperText-root': {
                        color: '#FF6B6B',
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSignUp}
                    disabled={
                      loading || 
                      !formData.email || 
                      !formData.password || 
                      !formData.username ||
                      formData.password !== formData.confirmPassword
                    }
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                    sx={{
                      borderRadius: '16px',
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                      boxShadow: '0 8px 25px 0 rgba(255, 107, 53, 0.4)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #E55A2B 0%, #CC4A1F 100%)',
                        boxShadow: '0 12px 35px 0 rgba(255, 107, 53, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(255, 107, 53, 0.3)',
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Box>
              </TabPanel>

              <Box className="px-6 pb-6">
                <Divider sx={{ backgroundColor: 'rgba(0, 212, 230, 0.2)', my: 3 }} />
                <Typography 
                  variant="body2" 
                  className="text-center"
                  sx={{ color: '#A0AEC0' }}
                >
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthPage;