import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

type WalletState = {
  connected: boolean;
  address: string;
  balance: number;
  network: string;
  status: string;
};

type Campaign = {
  id: string;
  title: string;
  creator: string;
  description: string;
  raised: number;
  goal: number;
  backers: number;
  category: string;
  accent: string;
};

type CrowdfundingExperienceProps = {
  wallet: WalletState;
  onConnectWallet: () => void;
};

const initialCampaigns: Campaign[] = [
  {
    id: 'aurora-labs',
    title: 'Aurora Labs',
    creator: 'Nia Chen',
    description: 'A programmable climate sensor network for coastal communities.',
    raised: 184000,
    goal: 250000,
    backers: 921,
    category: 'Climate',
    accent: 'linear-gradient(135deg, #4d6a4d 0%, #7c8f5d 100%)',
  },
  {
    id: 'pixel-grove',
    title: 'Pixel Grove',
    creator: 'Marcus Reed',
    description: 'A co-op creator platform where fans own the next hit game.',
    raised: 128500,
    goal: 180000,
    backers: 688,
    category: 'Gaming',
    accent: 'linear-gradient(135deg, #8b5e3c 0%, #b98a5f 100%)',
  },
  {
    id: 'pulse-care',
    title: 'Pulse Care',
    creator: 'Dr. Lina Ortiz',
    description: 'Portable diagnostics that bring instant care to underserved regions.',
    raised: 96200,
    goal: 140000,
    backers: 512,
    category: 'Health',
    accent: 'linear-gradient(135deg, #7a5e45 0%, #c6a86b 100%)',
  },
];

const categories = ['All', 'Climate', 'Gaming', 'Health', 'Community'];

export const CrowdfundingExperience: React.FC<CrowdfundingExperienceProps> = ({ wallet, onConnectWallet }) => {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [form, setForm] = useState({
    title: '',
    creator: '',
    goal: '',
    description: '',
    category: 'Community',
  });
  const [supportMessage, setSupportMessage] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    if (selectedCategory === 'All') {
      return campaigns;
    }

    return campaigns.filter((campaign) => campaign.category === selectedCategory);
  }, [campaigns, selectedCategory]);

  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0);
  const totalBackers = campaigns.reduce((sum, campaign) => sum + campaign.backers, 0);
  const progress = Math.min((totalRaised / totalGoal) * 100, 100);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCreateCampaign = (event: React.FormEvent) => {
    event.preventDefault();

    if (!wallet.connected) {
      setSupportMessage('Connect your 1AM wallet to publish a campaign.');
      return;
    }

    if (!form.title || !form.creator || !form.goal || !form.description) {
      return;
    }

    const goalValue = Number(form.goal);
    if (Number.isNaN(goalValue) || goalValue <= 0) {
      setSupportMessage('Enter a valid funding goal.');
      return;
    }

    const nextCampaign: Campaign = {
      id: `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      title: form.title,
      creator: form.creator,
      description: form.description,
      raised: 0,
      goal: goalValue,
      backers: 0,
      category: form.category,
      accent: 'linear-gradient(135deg, #6b7f4f 0%, #a7b97e 100%)',
    };

    setCampaigns((current) => [nextCampaign, ...current]);
    setForm({ title: '', creator: '', goal: '', description: '', category: 'Community' });
    setSelectedCategory('All');
    setSupportMessage(`Campaign published with 1AM wallet from ${wallet.address}.`);
  };

  const handleBackCampaign = (campaignId: string) => {
    if (!wallet.connected) {
      setSupportMessage('Connect your 1AM wallet to back a campaign.');
      return;
    }

    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId
          ? { ...campaign, raised: campaign.raised + 2500, backers: campaign.backers + 1 }
          : campaign,
      ),
    );
    setSupportMessage(`Contribution sent from ${wallet.address}.`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(68,53,35,0.98) 0%, rgba(111,90,61,0.96) 100%)',
            border: '1px solid rgba(214,194,162,0.24)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at top right, rgba(255,248,235,0.22) 0%, transparent 40%)',
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, maxWidth: 660, position: 'relative', zIndex: 1 }}>
              <Chip label="1AM wallet ready • live crowdfunding" color="secondary" sx={{ mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.05, mb: 2, color: '#fff8eb' }}>
                Launch your next community-backed idea.
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, color: 'rgba(247,231,204,0.92)', maxWidth: 620, lineHeight: 1.6 }}>
                Turn bold launches into momentum with transparent goals, instant support, and a wallet-native experience built for modern founders.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Button variant="contained" size="large" sx={{ px: 3, py: 1.2 }} onClick={() => scrollToSection('campaigns')}>
                  Explore campaigns
                </Button>
                <Button variant="outlined" size="large" sx={{ px: 3, py: 1.2, color: '#fff8eb', borderColor: 'rgba(247,231,204,0.45)' }} onClick={() => scrollToSection('launch')}>
                  Launch a campaign
                </Button>
              </Stack>
              <Alert severity={wallet.connected ? 'success' : 'info'} sx={{ maxWidth: 560, bgcolor: 'rgba(255,248,235,0.92)', color: '#3e3122' }}>
                {wallet.connected ? `Connected to 1AM • ${wallet.address}` : 'Connect your 1AM wallet to unlock backing and publishing.'}
              </Alert>
              {supportMessage ? (
                <Typography sx={{ mt: 2, color: '#f7e7cc', fontWeight: 600 }}>
                  {supportMessage}
                </Typography>
              ) : null}
            </Box>
            <Paper
              elevation={0}
              sx={{
                flex: 0.82,
                minWidth: { xs: '100%', md: 320 },
                p: 3,
                borderRadius: 3,
                background: 'rgba(248,240,224,0.14)',
                border: '1px solid rgba(248,240,224,0.16)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Stack spacing={2}>
                <Typography variant="overline" sx={{ color: 'rgba(248,240,224,0.86)', letterSpacing: '0.24em' }}>
                  Community momentum
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff8eb' }}>
                  ${totalRaised.toLocaleString()}
                </Typography>
                <Typography sx={{ color: 'rgba(248,240,224,0.9)' }}>raised across {campaigns.length} live campaigns</Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 999, backgroundColor: 'rgba(248,240,224,0.16)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(248,240,224,0.92)', fontWeight: 600 }}>
                  <span>{Math.round(progress)}% funded</span>
                  <span>{totalBackers} backers</span>
                </Box>
                <Button variant="contained" sx={{ alignSelf: 'flex-start', px: 2.2 }} onClick={onConnectWallet}>
                  {wallet.connected ? 'Wallet active' : 'Connect 1AM'}
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
          {[
            { label: 'Funding goal', value: `$${totalGoal.toLocaleString()}` },
            { label: 'Active backers', value: `${totalBackers}` },
            { label: 'Avg. campaign velocity', value: '18%/week' },
          ].map((stat) => (
            <Paper key={stat.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, background: 'rgba(90,70,46,0.92)', border: '1px solid rgba(214,194,162,0.22)', boxShadow: '0 10px 24px rgba(67,49,29,0.22)' }}>
              <Typography variant="overline" sx={{ color: 'rgba(248,240,224,0.82)', letterSpacing: '0.2em' }}>
                {stat.label}
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700, color: '#fff8eb' }}>
                {stat.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box id="campaigns" sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1.7 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#3f3528' }}>
                Featured campaigns
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    clickable
                    color={selectedCategory === category ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory(category)}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {filteredCampaigns.map((campaign) => {
                const percentage = Math.min((campaign.raised / campaign.goal) * 100, 100);
                return (
                  <Card
                    key={campaign.id}
                    elevation={0}
                    sx={{ borderRadius: 3, overflow: 'hidden', background: 'rgba(255,250,242,0.98)', color: '#3f3528', border: '1px solid rgba(132,108,77,0.2)', boxShadow: '0 18px 40px rgba(72,55,34,0.12)' }}
                  >
                    <Box sx={{ height: 6, background: campaign.accent }} />
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between' }}>
                        <Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                            <Chip label={campaign.category} size="small" />
                            <Typography variant="body2" sx={{ color: '#6f5a3a', fontWeight: 600 }}>
                              by {campaign.creator}
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2f2419' }}>
                            {campaign.title}
                          </Typography>
                          <Typography sx={{ mt: 1, color: '#5d4b35', lineHeight: 1.6 }}>
                            {campaign.description}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: { sm: 220 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#5d4b35', fontWeight: 600 }}>Raised</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2f2419' }}>
                              ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={percentage} sx={{ height: 10, borderRadius: 999, backgroundColor: 'rgba(95,74,46,0.1)' }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, color: '#6f5a3a', fontWeight: 600 }}>
                            <span>{Math.round(percentage)}% funded</span>
                            <span>{campaign.backers} backers</span>
                          </Box>
                          <Button variant="contained" size="small" sx={{ mt: 1.5, borderRadius: 999, px: 1.6, bgcolor: '#6b7f4f' }} onClick={() => handleBackCampaign(campaign.id)} aria-label={`Back campaign ${campaign.title}`}>
                            Back campaign
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>

          <Paper id="launch" elevation={0} sx={{ flex: 0.9, p: 3, borderRadius: 3, background: 'rgba(248,240,224,0.14)', border: '1px solid rgba(214,194,162,0.16)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#3f3528' }}>
              Launch a campaign
            </Typography>
            <Typography sx={{ mb: 3, color: '#f6ebdb', lineHeight: 1.6 }}>
              Create a new fundraising experience with a polished story, transparent target, and community-powered momentum.
            </Typography>
            <Box component="form" onSubmit={handleCreateCampaign} sx={{ display: 'grid', gap: 2 }}>
              <TextField label="Campaign title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
              <TextField label="Creator" value={form.creator} onChange={(event) => setForm((current) => ({ ...current, creator: event.target.value }))} required />
              <TextField label="Funding goal" type="number" value={form.goal} onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value }))} required />
              <TextField label="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              <TextField label="Story" multiline minRows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required />
              <Button type="submit" variant="contained" size="large">
                Publish campaign
              </Button>
              {!wallet.connected ? (
                <Typography variant="body2" sx={{ color: '#fff8eb', fontWeight: 600 }}>
                  Connect 1AM to unlock publishing.
                </Typography>
              ) : null}
            </Box>
          </Paper>
        </Box>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(248,240,224,0.1)', border: '1px solid rgba(214,194,162,0.14)' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff8eb' }}>
                Why founders love CrowdRise
              </Typography>
              <Typography sx={{ mt: 1, color: 'rgba(248,240,224,0.9)', lineHeight: 1.6 }}>
                Built for fast-moving launches with trust, discoverability, and momentum at the center.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff8eb' }}>
                Built for launch day
              </Typography>
              <Typography sx={{ mt: 1, color: 'rgba(248,240,224,0.9)', lineHeight: 1.6 }}>
                Share milestones, reward backers, and keep every contribution visible from day one.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff8eb' }}>
                Ready for the next wave
              </Typography>
              <Typography sx={{ mt: 1, color: 'rgba(248,240,224,0.9)', lineHeight: 1.6 }}>
                Designed to scale beautifully from a single product launch to a global community campaign.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
