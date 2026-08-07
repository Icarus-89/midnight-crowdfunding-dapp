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
import { AppBar, Box, Button, Chip, Stack, Typography } from '@mui/material';

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
};

export const Header: React.FC<HeaderProps> = ({ wallet, onConnectWallet }) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AppBar
      position="sticky"
      data-testid="header"
      sx={{
        background: 'rgba(58,45,31,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(214,194,162,0.16)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 6, lg: 10 },
        py: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }} data-testid="header-logo">
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6b7f4f 0%, #c59d67 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 8px 18px rgba(78,61,38,0.22)',
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: '2.4px solid #fff8eb',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#fff8eb',
                position: 'absolute',
                top: -1,
                left: 5,
              }}
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 7,
              right: 8,
              width: 12,
              height: 12,
              borderRadius: '2px',
              background: '#fff8eb',
              transform: 'rotate(45deg)',
            }}
          />
        </Box>
        <Stack spacing={0.2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            CrowdRise
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(247, 231, 204, 0.82)' }}>
            Funding the future together
          </Typography>
        </Stack>
      </Box>
      <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
        <Button color="inherit" sx={{ textTransform: 'none' }} onClick={() => scrollTo('campaigns')}>
          Discover
        </Button>
        <Button color="inherit" sx={{ textTransform: 'none' }} onClick={() => scrollTo('launch')}>
          Launch
        </Button>
        <Chip
          label={wallet.connected ? wallet.status : '1AM wallet ready'}
          color={wallet.connected ? 'success' : 'default'}
          variant="outlined"
          sx={{ borderColor: '#c4a987', color: '#fff8eb' }}
        />
        <Button variant="contained" sx={{ textTransform: 'none', borderRadius: 999 }} onClick={onConnectWallet}>
          {wallet.connected ? '1AM connected' : 'Connect 1AM'}
        </Button>
      </Stack>
    </AppBar>
  );
};
