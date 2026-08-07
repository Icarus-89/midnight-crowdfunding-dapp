// This file is part of midnightntwrk/example-bboard.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { MainLayout, CrowdfundingExperience } from './components';
import { connectWalletToMidnight, type WalletConnectionState } from './contexts/BrowserDeployedBoardManager';

const initialWallet: WalletConnectionState = {
  connected: false,
  address: 'Not connected',
  balance: 0,
  network: 'Preprod',
  status: 'Wallet idle',
};

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletConnectionState>(initialWallet);

  const handleConnectWallet = async () => {
    setWallet({ ...initialWallet, status: 'Connecting to Midnight 1AM…' });
    const nextState = await connectWalletToMidnight();
    setWallet(nextState);
  };

  useEffect(() => {
    void handleConnectWallet();
  }, []);

  const headerWallet = useMemo(() => wallet, [wallet]);

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f8f1e6 0%, #efe0c0 42%, #dfc69a 100%)', minHeight: '100vh' }}>
      <MainLayout wallet={headerWallet} onConnectWallet={handleConnectWallet}>
        <CrowdfundingExperience wallet={headerWallet} onConnectWallet={handleConnectWallet} />
      </MainLayout>
    </Box>
  );
};

export default App;
