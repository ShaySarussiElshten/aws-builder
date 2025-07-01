import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import {
  Person,
  Settings,
  Logout,
  Dashboard,
  AccountCircle
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

interface UserMenuProps {
  onOpenAuth?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onOpenAuth }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, profile, signOut, isAuthenticated } = useAuthStore();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose();
  };

  // Since we're using AuthGuard, this component will only render when authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        sx={{
          padding: 0,
          '&:hover': {
            transform: 'scale(1.05)',
          },
          transition: 'transform 0.2s ease',
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #00D4E6 0%, #00B8CC 100%)',
            color: 'white',
            fontWeight: 700,
            border: '2px solid rgba(0, 212, 230, 0.3)',
            boxShadow: '0 4px 12px 0 rgba(0, 212, 230, 0.3)',
          }}
        >
          {profile?.username ? getInitials(profile.username) : <Person />}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
            border: '1px solid rgba(0, 212, 230, 0.3)',
            boxShadow: '0 20px 40px 0 rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            minWidth: 220,
            mt: 1,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box className="px-4 py-3">
          <Typography 
            variant="subtitle1" 
            className="font-bold text-white"
            sx={{ fontWeight: 700 }}
          >
            {profile?.username || 'User'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: '#A0AEC0' }}
          >
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ backgroundColor: 'rgba(0, 212, 230, 0.2)' }} />

        <MenuItem 
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 212, 230, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Dashboard sx={{ color: '#00D4E6' }} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </MenuItem>

        <MenuItem 
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 212, 230, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Person sx={{ color: '#00D4E6' }} />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>

        <MenuItem 
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 212, 230, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Settings sx={{ color: '#00D4E6' }} />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        <Divider sx={{ backgroundColor: 'rgba(0, 212, 230, 0.2)' }} />

        <MenuItem 
          onClick={handleSignOut}
          sx={{
            color: '#FF6B6B',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Logout sx={{ color: '#FF6B6B' }} />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;