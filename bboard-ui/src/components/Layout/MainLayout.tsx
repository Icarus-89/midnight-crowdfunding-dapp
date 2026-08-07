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

import React from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';

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
  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Header wallet={wallet} onConnectWallet={onConnectWallet} />
      <Box sx={{ px: { xs: 2, md: 6, lg: 10 }, py: { xs: 2, md: 4 }, position: 'relative', height: '100%' }}>
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at top left, rgba(34,211,238,0.14) 0%, transparent 35%)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
};
