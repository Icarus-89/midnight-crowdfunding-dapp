import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Card,
  CardContent,
} from '@mui/material';
import ShieldMoonIcon from '@mui/icons-material/ShieldMoonRounded';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import BoltIcon from '@mui/icons-material/BoltRounded';
import LockIcon from '@mui/icons-material/LockOutlined';

import { Board } from './Board';

type WalletState = {
  connected: boolean;
  address: string;
  balance: number;
  network: string;
  status: string;
};

type CrowdfundingExperienceProps = {
  wallet: WalletState;
  onConnectWallet: () => void;
};

type Campaign = {
  id: string;
  title: string;
  creator: string;
  goal: number;
  raised: number;
  backers: number;
  category: string;
  description: string;
  tags: string[];
};

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    title: 'Zero-Knowledge Privacy Core',
    creator: 'Midnight Lab',
    goal: 5000,
    raised: 3450,
    backers: 42,
    category: 'Infrastructure',
    description: 'Decentralized private state proving framework with client-side Zero-Knowledge proofs.',
    tags: ['ZK', 'Privacy', 'Smart Contracts'],
  },
  {
    id: '2',
    title: 'VeriTrust Micro-Grants',
    creator: 'VeriDAO',
    goal: 10000,
    raised: 8200,
    backers: 118,
    category: 'Grants',
    description: 'Shielded micro-funding protocol for open source privacy developers on Midnight.',
    tags: ['Grant', 'DAO', 'Shielded'],
  },
];

export const CrowdfundingExperience: React.FC<CrowdfundingExperienceProps> = ({ wallet }) => {
  const theme = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [pledgeOpen, setPledgeOpen] = useState(false);
  const [activePledgeCampaign, setActivePledgeCampaign] = useState<Campaign | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState('50');

  const [form, setForm] = useState({
    title: '',
    creator: '',
    goal: '1000',
    category: 'Infrastructure',
    description: '',
  });

  const handleOpenPledge = (campaign: Campaign) => {
    setActivePledgeCampaign(campaign);
    setPledgeOpen(true);
  };

  const handleConfirmPledge = () => {
    if (!activePledgeCampaign) return;
    const numericPledge = parseFloat(pledgeAmount) || 0;
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === activePledgeCampaign.id
          ? { ...c, raised: c.raised + numericPledge, backers: c.backers + 1 }
          : c,
      ),
    );
    setPledgeOpen(false);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.creator || !form.description) return;
    const newCamp: Campaign = {
      id: String(Date.now()),
      title: form.title,
      creator: form.creator,
      goal: parseFloat(form.goal) || 1000,
      raised: 0,
      backers: 0,
      category: form.category || 'General',
      description: form.description,
      tags: ['Midnight', 'ZK'],
    };
    setCampaigns([newCamp, ...campaigns]);
    setForm({ title: '', creator: '', goal: '1000', category: 'Infrastructure', description: '' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Hero Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: '24px',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip
              icon={<ShieldMoonIcon sx={{ fontSize: 16 }} />}
              label="Zero-Knowledge Powered"
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.light,
              }}
            />
            <Chip
              icon={<BoltIcon sx={{ fontSize: 16 }} />}
              label="Midnight 1AM Proving"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.025em' }}>
            Privacy-First On-Chain State Board
          </Typography>

          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontSize: '1.05rem', lineHeight: 1.6 }}>
            Publish encrypted zero-knowledge states, back community initiatives, and inspect verifiable on-chain ledger records seamlessly.
          </Typography>
        </Stack>
      </Paper>

      {/* Main Interactive Grid */}
      <Grid container spacing={4}>
        {/* Left Column: Midnight ZK Smart Contract State */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              Smart Contract State
            </Typography>
            <Chip label="Live Proofs" size="small" color="success" sx={{ fontWeight: 700 }} />
          </Box>

          <Board />
        </Grid>

        {/* Right Column: Launch Campaign Form */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '24px',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.65)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <RocketLaunchIcon sx={{ color: theme.palette.primary.main, fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  Launch Initiative
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                Publish a campaign onto Midnight Network backed by client-side zero-knowledge proofs.
              </Typography>

              <Box component="form" onSubmit={handleCreateCampaign} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Campaign Title"
                  value={form.title}
                  onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                  required
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                  label="Creator Name"
                  value={form.creator}
                  onChange={(e) => setForm((c) => ({ ...c, creator: e.target.value }))}
                  required
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                  label="Target Goal ($)"
                  type="number"
                  value={form.goal}
                  onChange={(e) => setForm((c) => ({ ...c, goal: e.target.value }))}
                  required
                  fullWidth
                  size="small"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                  label="Story / Details"
                  multiline
                  minRows={3}
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  required
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 1,
                    borderRadius: '12px',
                    py: 1.2,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  Publish Initiative
                </Button>
              </Box>
            </Box>

            {!wallet.connected && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textAlign: 'center', mt: 2, display: 'block' }}>
                <LockIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                Connect 1AM extension to verify contract actions.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Active Initiatives Showcase */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, color: theme.palette.text.primary }}>
          Featured ZK Campaigns
        </Typography>

        <Grid container spacing={3}>
          {campaigns.map((camp) => (
            <Grid key={camp.id} size={{ xs: 12, md: 6 }}>
              <Card elevation={0}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box>
                      <Chip label={camp.category} size="small" sx={{ fontWeight: 700, mb: 1, height: 22, fontSize: '0.7rem' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        {camp.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        by {camp.creator}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenPledge(camp)}
                      sx={{ borderRadius: '10px', fontWeight: 700, px: 2, whiteSpace: 'nowrap' }}
                    >
                      Pledge
                    </Button>
                  </Stack>

                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5, lineHeight: 1.6 }}>
                    {camp.description}
                  </Typography>

                  <Stack direction="row" spacing={3} sx={{ pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Raised
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                        ${camp.raised.toLocaleString()} / ${camp.goal.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Backers
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {camp.backers}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Back Campaign Modal Dialog */}
      <Dialog
        open={pledgeOpen}
        onClose={() => setPledgeOpen(false)}
        slotProps={{ paper: { style: { borderRadius: 20, padding: 8 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Pledge to {activePledgeCampaign?.title}
          <IconButton onClick={() => setPledgeOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Back this initiative securely via Midnight Network using Zero-Knowledge state proofs.
          </Typography>
          <TextField
            label="Contribution Amount"
            type="number"
            value={pledgeAmount}
            onChange={(e) => setPledgeAmount(e.target.value)}
            fullWidth
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setPledgeOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPledge}
            sx={{
              borderRadius: '10px',
              px: 3,
              fontWeight: 700,
            }}
          >
            Confirm Pledge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
