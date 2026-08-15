import React, { useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { CardActions, CardContent, Button, Stack, Typography, Box, alpha, useTheme } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircleOutlineRounded';
import LinkIcon from '@mui/icons-material/LinkRounded';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboardRounded';
import { TextPromptDialog } from './TextPromptDialog';

export interface EmptyCardContentProps {
  onCreateBoardCallback: () => void;
  onJoinBoardCallback: (contractAddress: ContractAddress) => void;
}

export const EmptyCardContent: React.FC<Readonly<EmptyCardContentProps>> = ({
  onCreateBoardCallback,
  onJoinBoardCallback,
}) => {
  const [textPromptOpen, setTextPromptOpen] = useState(false);
  const theme = useTheme();

  return (
    <React.Fragment>
      <CardContent sx={{ py: 6, px: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.palette.primary.main,
            mb: 2.5,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <SpaceDashboardIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
          No Active Smart Contract Board
        </Typography>
        <Typography
          data-testid="board-posted-message"
          variant="body2"
          sx={{ color: theme.palette.text.secondary, maxWidth: 420, mb: 1, lineHeight: 1.6 }}
        >
          Deploy a new ZK Bulletin Board contract onto Midnight Preprod or connect to an existing contract address.
        </Typography>
      </CardContent>

      <CardActions disableSpacing sx={{ justifyContent: 'center', pb: 5, px: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
          <Button
            data-testid="board-deploy-btn"
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={onCreateBoardCallback}
            fullWidth
            sx={{
              borderRadius: '14px',
              py: 1.3,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
            }}
          >
            Deploy New Board
          </Button>

          <Button
            data-testid="board-join-btn"
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={() => setTextPromptOpen(true)}
            fullWidth
            sx={{
              borderRadius: '14px',
              py: 1.3,
              fontWeight: 700,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            Join Board
          </Button>
        </Stack>
      </CardActions>

      <TextPromptDialog
        prompt="Enter contract address"
        isOpen={textPromptOpen}
        onCancel={() => setTextPromptOpen(false)}
        onSubmit={(text) => {
          setTextPromptOpen(false);
          onJoinBoardCallback(text);
        }}
      />
    </React.Fragment>
  );
};
