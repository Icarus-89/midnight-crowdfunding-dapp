import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Avatar,
  Divider,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import CampaignIcon from '@mui/icons-material/RocketLaunchRounded';
import NoteIcon from '@mui/icons-material/StickyNote2Rounded';
import AddCircleIcon from '@mui/icons-material/AddCircleOutlineRounded';
import AssessmentIcon from '@mui/icons-material/InsightsRounded';
import SecurityIcon from '@mui/icons-material/SecurityRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeftRounded';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, activeSection, onSelectSection }) => {
  const theme = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: <DashboardIcon /> },
    { id: 'campaigns', label: 'Campaigns', icon: <CampaignIcon />, badge: 'Live' },
    { id: 'bulletin', label: 'Midnight ZK Board', icon: <NoteIcon />, badge: '1AM' },
    { id: 'launch', label: 'Launchpad', icon: <AddCircleIcon /> },
    { id: 'analytics', label: 'ZK Ledger', icon: <AssessmentIcon /> },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 270,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 270,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
        {/* Brand Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, px: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.4)',
                fontWeight: 900,
                fontSize: '1.1rem',
                color: '#ffffff',
              }}
            >
              MN
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                Midnight Pulse
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 800 }}>
                ZK DApp Suite v2.0
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ display: { lg: 'none' } }}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2.5, opacity: 0.5 }} />

        {/* Menu Navigation */}
        <List sx={{ flex: 1, px: 0 }}>
          <Typography
            variant="caption"
            sx={{
              px: 1.5,
              pb: 1.5,
              display: 'block',
              fontWeight: 800,
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.68rem',
            }}
          >
            Main Menu
          </Typography>

          {menuItems.map((item) => {
            const isSelected = activeSection === item.id;
            return (
              <ListItemButton
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                sx={{
                  borderRadius: '14px',
                  mb: 1,
                  py: 1.2,
                  px: 2,
                  transition: 'all 0.2s ease',
                  backgroundColor: isSelected
                    ? alpha(theme.palette.primary.main, 0.15)
                    : 'transparent',
                  color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                  border: isSelected
                    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: isSelected
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateX(3px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      style: {
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 800 : 600,
                      },
                    },
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color={isSelected ? 'primary' : 'default'}
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      borderRadius: '6px',
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>

        {/* Bottom Status Card */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '18px',
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)'
                : 'linear-gradient(135deg, #F3E8FF 0%, #E0F2FE 100%)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SecurityIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '0.88rem' }}>
              Midnight Privacy Guard
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>
            Zero-Knowledge proofs generated locally via 1AM extension.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};
