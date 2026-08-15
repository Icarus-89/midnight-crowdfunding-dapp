import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { MainLayout, CrowdfundingExperience } from './components';
import { connectWalletToMidnight, type WalletConnectionState } from './contexts/BrowserDeployedBoardManager';

const initialWallet: WalletConnectionState = {
  connected: false,
  address: 'Not connected',
  balance: 0,
  network: 'Preprod',
  status: 'Wallet idle',
  isInitialized: false,
  isSynced: false,
};

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletConnectionState>(initialWallet);

  const handleConnectWallet = async () => {
    setWallet({ ...initialWallet, status: 'Connecting to Midnight 1AM…' });
    const nextState = await connectWalletToMidnight();
    setWallet(nextState);
  };

  const headerWallet = useMemo(() => wallet, [wallet]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <MainLayout wallet={headerWallet} onConnectWallet={handleConnectWallet}>
        <CrowdfundingExperience wallet={headerWallet} onConnectWallet={handleConnectWallet} />
      </MainLayout>
    </Box>
  );
};

export default App;
