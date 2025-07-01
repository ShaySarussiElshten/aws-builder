import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { DivideIcon as LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const IconComponent = Icons[data.icon as keyof typeof Icons] as LucideIcon;

  return (
    <Card 
      className={`min-w-[140px] max-w-[160px] transition-all duration-300 hover:shadow-2xl ${
        selected ? 'ring-2 ring-cyan-400 shadow-2xl' : 'shadow-lg'
      }`}
      sx={{
        background: selected 
          ? `linear-gradient(135deg, ${data.color}20 0%, ${data.color}40 50%, ${data.color}20 100%)` 
          : `linear-gradient(135deg, #1A202C 0%, #2D3748 50%, #1A202C 100%)`,
        border: selected ? `2px solid ${data.color}` : `1px solid ${data.color}40`,
        borderRadius: '20px',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: `0 20px 40px 0 ${data.color}30`,
          background: `linear-gradient(135deg, ${data.color}15 0%, #2D3748 50%, ${data.color}15 100%)`,
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 border-2 border-white transition-all duration-200"
        style={{ 
          background: selected ? data.color : '#00D4E6',
          boxShadow: `0 2px 8px 0 ${data.color}40`,
        }}
      />
      
      <CardContent className="p-3">
        <Box className="flex items-center gap-2 mb-2">
          <Box 
            className="p-2 rounded-xl transition-all duration-200"
            sx={{ 
              backgroundColor: `${data.color}25`,
              border: `2px solid ${data.color}50`,
              boxShadow: `0 4px 12px 0 ${data.color}30`,
            }}
          >
            {IconComponent && (
              <IconComponent 
                size={18} 
                style={{ color: data.color }}
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
                color: `${data.color}CC`,
                fontSize: '0.65rem',
                fontWeight: 600,
              }}
            >
              {data.service.toUpperCase()}
            </Typography>
          </Box>
        </Box>
        
        {data.description && (
          <Typography 
            variant="caption" 
            className="block mt-1 mb-2"
            sx={{ 
              color: '#A0AEC0',
              lineHeight: 1.3,
              fontSize: '0.65rem',
            }}
          >
            {data.description.length > 40 ? `${data.description.substring(0, 40)}...` : data.description}
          </Typography>
        )}
        
        <Box className="flex flex-wrap gap-1">
          {Object.keys(data.configuration).slice(0, 1).map((key) => (
            <Chip
              key={key}
              label={`${key}: ${String(data.configuration[key]).substring(0, 8)}${String(data.configuration[key]).length > 8 ? '...' : ''}`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.6rem',
                height: '18px',
                borderColor: `${data.color}60`,
                color: data.color,
                backgroundColor: `${data.color}15`,
                '& .MuiChip-label': {
                  padding: '0 4px',
                },
              }}
            />
          ))}
        </Box>
      </CardContent>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 border-2 border-white transition-all duration-200"
        style={{ 
          background: data.color,
          boxShadow: `0 2px 8px 0 ${data.color}50`,
        }}
      />
    </Card>
  );
};

export default CustomNode;