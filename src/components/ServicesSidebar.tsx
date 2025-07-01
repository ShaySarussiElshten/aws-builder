import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import { ExpandMore, Search } from '@mui/icons-material';
import { DivideIcon as LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { AWS_SERVICES } from '../config/awsServices';

const DRAWER_WIDTH = 320;

interface ServicesSidebarProps {
  open: boolean;
}

const ServicesSidebar: React.FC<ServicesSidebarProps> = ({ open }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string>('Triggers');

  // Add triggers to the categories
  const triggerItems = [
    {
      id: 'click-trigger',
      name: 'Click Trigger',
      description: 'Manual activation by click',
      icon: 'MousePointer',
      color: '#00D4E6',
      category: 'Triggers'
    }
  ];

  const categories = ['Triggers', ...Array.from(new Set(AWS_SERVICES.map(service => service.category)))];
  
  const filteredServices = AWS_SERVICES.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTriggers = triggerItems.filter(trigger =>
    trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trigger.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragStart = (event: React.DragEvent, serviceId: string) => {
    event.dataTransfer.setData('application/reactflow', serviceId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleCategoryChange = (category: string) => (
    _: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedCategory(isExpanded ? category : '');
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 50%, #1A202C 100%)',
          color: 'white',
          borderRight: '1px solid #4A5568',
          boxShadow: '4px 0 20px 0 rgba(26, 32, 44, 0.3)',
          marginTop: '64px', // Add margin to push content below header
          height: 'calc(100vh - 64px)', // Adjust height to account for header
        },
      }}
    >
      <Box className="p-4" sx={{ paddingTop: '24px' }}>
        <Typography variant="h6" className="text-white font-bold mb-4" sx={{ fontWeight: 700 }}>
          AWS Services
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#00D4E6' }} />
              </InputAdornment>
            ),
            style: { 
              backgroundColor: 'rgba(0, 212, 230, 0.1)', 
              color: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(0, 212, 230, 0.3)',
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(0, 212, 230, 0.3)',
                borderRadius: '12px',
              },
              '&:hover fieldset': {
                borderColor: '#00D4E6',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00D4E6',
                borderWidth: '2px',
              },
            },
            '& input': {
              color: 'white',
            },
            '& input::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)',
            }
          }}
        />
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(0, 212, 230, 0.2)' }} />

      <Box className="flex-1 overflow-y-auto">
        {categories.map((category) => {
          let categoryItems: any[] = [];
          
          if (category === 'Triggers') {
            categoryItems = filteredTriggers;
          } else {
            categoryItems = filteredServices.filter(service => service.category === category);
          }

          if (categoryItems.length === 0) return null;

          return (
            <Accordion
              key={category}
              expanded={expandedCategory === category}
              onChange={handleCategoryChange(category)}
              sx={{
                backgroundColor: 'transparent',
                color: 'white',
                boxShadow: 'none',
                '&:before': {
                  display: 'none',
                },
                '& .MuiAccordionSummary-root': {
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 230, 0.1)',
                  },
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: '#00D4E6' }} />}
                sx={{
                  minHeight: '48px',
                  borderRadius: '8px',
                  '&.Mui-expanded': {
                    minHeight: '48px',
                  },
                }}
              >
                <Typography variant="subtitle1" className="font-semibold" sx={{ fontWeight: 600 }}>
                  {category}
                </Typography>
                <Chip 
                  label={categoryItems.length} 
                  size="small" 
                  className="ml-2"
                  sx={{ 
                    backgroundColor: category === 'Triggers' ? '#00D4E6' : '#FF6B35', 
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                />
              </AccordionSummary>
              
              <AccordionDetails sx={{ padding: 0 }}>
                <List dense>
                  {categoryItems.map((item) => {
                    const IconComponent = Icons[item.icon as keyof typeof Icons] as LucideIcon;
                    
                    return (
                      <ListItem
                        key={item.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, item.id)}
                        className="cursor-grab transition-all duration-200 rounded-lg mx-2 mb-1"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0, 212, 230, 0.15)',
                            transform: 'translateX(4px)',
                          },
                          borderRadius: '12px',
                        }}
                      >
                        <ListItemIcon>
                          <Box 
                            className="p-2 rounded-lg"
                            sx={{ 
                              backgroundColor: `${item.color}20`,
                              border: `1px solid ${item.color}40`,
                            }}
                          >
                            {IconComponent && (
                              <IconComponent 
                                size={18} 
                                style={{ color: item.color }}
                              />
                            )}
                          </Box>
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Typography variant="body2" className="font-medium" sx={{ fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography 
                              variant="caption" 
                              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              {item.description}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Drawer>
  );
};

export default ServicesSidebar;