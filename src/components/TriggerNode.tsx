import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { DivideIcon as LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

const TriggerNode: React.FC<NodeProps> = ({ data, selected }) => {
  const IconComponent = Icons[data.icon as keyof typeof Icons] as LucideIcon;

  return (
    <Card 
      className={`min-w-[140px] max-w-[160px] transition-all duration-300 hover:shadow-2xl ${
        selected ? 'ring-2 ring-cyan-300 shadow-2xl' : 'shadow-lg'
      }`}
      sx={{
        background: selected 
          ? 'linear-gradient(135deg, #00E6F7 0%, #00D4E6 50%, #00B8CC 100%)' 
          : 'linear-gradient(135deg, #00D4E6 0%, #00B8CC 50%, #009FB0 100%)',
        border: selected ? '2px solid #00E6F7' : '1px solid #00B8CC',
        color: 'white',
        borderRadius: '20px',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: selected 
          ? '0 20px 40px 0 rgba(0, 212, 230, 0.5)' 
          : '0 10px 30px 0 rgba(0, 212, 230, 0.4)',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 25px 50px 0 rgba(0, 212, 230, 0.6)',
          background: 'linear-gradient(135deg, #00E6F7 0%, #00D4E6 50%, #00B8CC 100%)',
        },
      }}
    >
      <CardContent className="p-3">
        <Box className="flex items-center gap-2 mb-2">
          <Box 
            className="p-2 rounded-xl"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            {IconComponent && (
              <IconComponent 
                size={18} 
                style={{ color: 'white' }}
              />
            )}
          </Box>
          <Box>
            <Typography 
              variant="subtitle2" 
              className="font-bold text-white"
              sx={{ 
                fontSize: '0.8rem',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {data.label}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.65rem',
                fontWeight: 600,
              }}
            >
              TRIGGER
            </Typography>
          </Box>
        </Box>
        
        {data.description && (
          <Typography 
            variant="caption" 
            className="block mt-1"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.3,
              fontSize: '0.65rem',
            }}
          >
            {data.description.length > 35 ? `${data.description.substring(0, 35)}...` : data.description}
          </Typography>
        )}
      </CardContent>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-cyan-400 transition-all duration-200"
        style={{ 
          background: '#00D4E6',
          boxShadow: '0 2px 8px 0 rgba(0, 212, 230, 0.5)',
          bottom: -6,
          zIndex: 10,
        }}
      />
    </Card>
  );
};

export default TriggerNode;