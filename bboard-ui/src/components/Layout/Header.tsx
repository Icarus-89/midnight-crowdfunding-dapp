import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

type WalletState = {
  connected: boolean;
  address: string;
  balance: number;
  network: string;
  status: string;
};

type HeaderProps = {
  wallet: WalletState;
  onConnectWallet: () => void;
  onToggleSidebar?: () => void;
  darkMode?: boolean;
  onToggleTheme?: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onConnectWallet,
  darkMode = true,
  onToggleTheme,
}) => {
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      data-testid="header"
      elevation={0}
      sx={{
        backgroundColor: alpha(theme.palette.background.default, 0.75),
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 5 }, py: 1 }}>
        {/* Brand Logo & Title */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          data-testid="header-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.1, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                Aura
              </Typography>
              <Chip
                label="ZK State"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.light,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.72rem' }}>
              Midnight Network • Preprod
            </Typography>
          </Box>
        </Box>

        {/* Right Section: Navigation Links & Actions */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {onToggleTheme && (
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={onToggleTheme}
                sx={{
                  color: theme.palette.text.primary,
                  backgroundColor: alpha(theme.palette.text.primary, 0.05),
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}

          <Chip
            icon={wallet.connected ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />}
            label={wallet.connected ? wallet.status : '1AM ready'}
            color={wallet.connected ? 'success' : 'default'}
            variant="outlined"
            sx={{
              fontWeight: 700,
              borderRadius: '999px',
              display: { xs: 'none', sm: 'inline-flex' },
              borderColor: theme.palette.divider,
            }}
          />

          <Button
            variant="contained"
            color="primary"
            sx={{
              textTransform: 'none',
              borderRadius: '999px',
              px: 3,
              py: 0.9,
              fontWeight: 700,
              fontSize: '0.88rem',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
              },
            }}
            onClick={onConnectWallet}
          >
            {wallet.connected ? '1AM Connected' : 'Connect 1AM'}
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
