import React, { useState } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import { Header } from './Header';
import { getBerryTheme } from '../../config/theme';

type WalletState = {
  connected: boolean;
  address: string;
  balance: number;
  network: string;
  status: string;
};

type MainLayoutProps = React.PropsWithChildren<{
  wallet: WalletState;
  onConnectWallet: () => void;
}>;

export const MainLayout: React.FC<MainLayoutProps> = ({ children, wallet, onConnectWallet }) => {
  const [darkMode, setDarkMode] = useState(true);

  const currentTheme = getBerryTheme(darkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={currentTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: currentTheme.palette.background.default,
          color: currentTheme.palette.text.primary,
          transition: 'background-color 0.3s ease',
        }}
      >
        <Header
          wallet={wallet}
          onConnectWallet={onConnectWallet}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, sm: 4, md: 6 },
            py: { xs: 3, md: 5 },
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
