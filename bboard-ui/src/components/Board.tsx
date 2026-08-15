import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  TextField,
  Skeleton,
  Backdrop,
  CircularProgress,
  Tooltip,
  Box,
  Chip,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import LockIcon from '@mui/icons-material/LockRounded';
import LockOpenIcon from '@mui/icons-material/LockOpenRounded';
import CopyIcon from '@mui/icons-material/ContentCopyRounded';
import WriteIcon from '@mui/icons-material/EditNoteRounded';
import DeleteIcon from '@mui/icons-material/DeleteForeverRounded';
import WarningIcon from '@mui/icons-material/WarningAmberRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import TerminalIcon from '@mui/icons-material/TerminalRounded';
import KeyIcon from '@mui/icons-material/VpnKeyRounded';
import { type Observable } from 'rxjs';

import { DeployedBoardContext } from '../contexts';
import { State } from '../../../contract/src/index';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { BoardDeployment } from '../contexts/BrowserDeployedBoardManager';
import { EmptyCardContent } from './Board.EmptyCardContent';
import { type BBoardDerivedState, type DeployedBBoardAPI } from '../../../api/src/index';

export const Board: React.FC = () => {
  const theme = useTheme();
  const boardApiProvider = useContext(DeployedBoardContext);
  const [boardDeployment$, setBoardDeployment$] = useState<Observable<BoardDeployment>>();
  const [boardDeployment, setBoardDeployment] = useState<BoardDeployment>();
  const [deployedBoardAPI, setDeployedBoardAPI] = useState<DeployedBBoardAPI>();

  const [boardState, setBoardState] = useState<BBoardDerivedState>();
  const [messagePrompt, setMessagePrompt] = useState<string>();
  const [isWorking, setIsWorking] = useState(!!boardDeployment$);
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleRetry = useCallback(() => {
    setErrorMessage(undefined);
    setBoardDeployment$(undefined);
    setBoardDeployment(undefined);
    setDeployedBoardAPI(undefined);
    setBoardState(undefined);
    setIsWorking(false);
  }, []);

  const onCreateBoard = useCallback(() => {
    if (boardApiProvider) setBoardDeployment$(boardApiProvider.resolve());
  }, [boardApiProvider]);

  const onJoinBoard = useCallback(
    (contractAddress: ContractAddress) => {
      if (boardApiProvider) setBoardDeployment$(boardApiProvider.resolve(contractAddress));
    },
    [boardApiProvider],
  );

  const onPostMessage = useCallback(async () => {
    if (!messagePrompt) return;
    try {
      if (deployedBoardAPI) {
        setIsWorking(true);
        await deployedBoardAPI.post(messagePrompt);
        setMessagePrompt('');
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsWorking(false);
    }
  }, [deployedBoardAPI, setErrorMessage, setIsWorking, messagePrompt]);

  const onDeleteMessage = useCallback(async () => {
    try {
      if (deployedBoardAPI) {
        setIsWorking(true);
        await deployedBoardAPI.takeDown();
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsWorking(false);
    }
  }, [deployedBoardAPI, setErrorMessage, setIsWorking]);

  const onCopyContractAddress = useCallback(async () => {
    if (deployedBoardAPI?.deployedContractAddress) {
      await navigator.clipboard.writeText(deployedBoardAPI.deployedContractAddress);
    }
  }, [deployedBoardAPI]);

  useEffect(() => {
    if (!boardDeployment$) return;
    const subscription = boardDeployment$.subscribe(setBoardDeployment);
    return () => subscription.unsubscribe();
  }, [boardDeployment$]);

  useEffect(() => {
    if (!boardDeployment) return;
    if (boardDeployment.status === 'in-progress') return;

    setIsWorking(false);

    if (boardDeployment.status === 'failed') {
      setErrorMessage(
        boardDeployment.error.message.length ? boardDeployment.error.message : 'Encountered an unexpected error.',
      );
      return;
    }

    setDeployedBoardAPI(boardDeployment.api);
    const subscription = boardDeployment.api.state$.subscribe(setBoardState);
    return () => subscription.unsubscribe();
  }, [boardDeployment, setIsWorking, setErrorMessage, setDeployedBoardAPI]);

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 360,
        borderRadius: '24px',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.65)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 16px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 12px 32px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      {!boardDeployment$ && !errorMessage && (
        <EmptyCardContent onCreateBoardCallback={onCreateBoard} onJoinBoardCallback={onJoinBoard} />
      )}

      <Backdrop
        open={isWorking}
        sx={{
          color: theme.palette.primary.main,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: 'absolute',
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(12px)',
        }}
      >
        <CircularProgress data-testid="board-working-indicator" color="primary" size={52} thickness={4} />
      </Backdrop>

      {(boardDeployment$ || errorMessage) && (
        <React.Fragment>
          {errorMessage ? (
            <CardContent
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 5,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '20px',
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
                }}
              >
                <WarningIcon sx={{ fontSize: 32, color: theme.palette.warning.main }} />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 0.5 }}
                >
                  Contract Error
                </Typography>
                <Typography
                  component="div"
                  data-testid="board-error-message"
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, maxWidth: 380, lineHeight: 1.6 }}
                >
                  {errorMessage}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  mt: 1,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                Try Again
              </Button>
            </CardContent>
          ) : (
            <React.Fragment>
              <CardHeader
                avatar={
                  boardState ? (
                    boardState.state === State.VACANT ? (
                      <Tooltip title="Board is vacant & ready for posts">
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '12px',
                            backgroundColor: alpha(theme.palette.success.main, 0.12),
                            display: 'flex',
                          }}
                        >
                          <LockOpenIcon data-testid="post-unlocked-icon" sx={{ color: theme.palette.success.main, fontSize: 22 }} />
                        </Box>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Board is occupied">
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '12px',
                            backgroundColor: alpha(theme.palette.error.main, 0.12),
                            display: 'flex',
                          }}
                        >
                          <LockIcon data-testid="post-locked-icon" sx={{ color: theme.palette.error.main, fontSize: 22 }} />
                        </Box>
                      </Tooltip>
                    )
                  ) : (
                    <Skeleton variant="circular" width={38} height={38} />
                  )
                }
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '0.95rem' }}>
                      Contract Address
                    </Typography>
                    <Chip
                      label={toShortFormatContractAddress(deployedBoardAPI?.deployedContractAddress) ?? 'Deploying...'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        fontWeight: 700,
                        borderRadius: '8px',
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        borderColor: alpha(theme.palette.primary.main, 0.25),
                      }}
                    />
                  </Box>
                }
                action={
                  deployedBoardAPI?.deployedContractAddress ? (
                    <Tooltip title="Copy Contract Address">
                      <IconButton onClick={onCopyContractAddress} color="primary" sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Skeleton variant="circular" width={32} height={32} />
                  )
                }
                sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
              />

              <CardContent sx={{ flex: 1, p: 3 }}>
                {boardState ? (
                  boardState.state === State.OCCUPIED ? (
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        minHeight: 140,
                        position: 'relative',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <TerminalIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.primary.main, letterSpacing: '0.05em' }}>
                          CURRENT ON-CHAIN POST
                        </Typography>
                      </Box>
                      <Typography
                        data-testid="board-posted-message"
                        sx={{
                          color: theme.palette.text.primary,
                          fontSize: '1.05rem',
                          fontWeight: 600,
                          lineHeight: 1.6,
                        }}
                      >
                        {boardState.message}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <KeyIcon sx={{ color: theme.palette.secondary.main, fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.secondary }}>
                          WRITE ZERO-KNOWLEDGE POST
                        </Typography>
                      </Box>
                      <TextField
                        id="message-prompt"
                        data-testid="board-message-prompt"
                        variant="outlined"
                        focused
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={4}
                        placeholder="Type your encrypted post to publish onto Midnight smart contract ledger..."
                        size="small"
                        color="primary"
                        onChange={(e) => setMessagePrompt(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '14px',
                            backgroundColor: alpha(theme.palette.background.default, 0.5),
                            fontSize: '0.95rem',
                          },
                        }}
                      />
                    </Box>
                  )
                ) : (
                  <Skeleton variant="rectangular" width="100%" height={140} sx={{ borderRadius: '16px' }} />
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', p: 3, pt: 0, gap: 1.5 }}>
                {deployedBoardAPI ? (
                  <React.Fragment>
                    <Button
                      title="Post message"
                      data-testid="board-post-message-btn"
                      disabled={boardState?.state === State.OCCUPIED || !messagePrompt?.length}
                      onClick={onPostMessage}
                      variant="contained"
                      color="primary"
                      startIcon={<WriteIcon />}
                      sx={{
                        borderRadius: '12px',
                        px: 2.5,
                        py: 1,
                        fontWeight: 700,
                      }}
                    >
                      Publish State
                    </Button>
                    <Button
                      title="Take down message"
                      data-testid="board-take-down-message-btn"
                      disabled={
                        boardState?.state === State.VACANT || (boardState?.state === State.OCCUPIED && !boardState.isOwner)
                      }
                      onClick={onDeleteMessage}
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      sx={{
                        borderRadius: '12px',
                        px: 2.5,
                        py: 1,
                        fontWeight: 700,
                      }}
                    >
                      Clear Post
                    </Button>
                  </React.Fragment>
                ) : (
                  <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: '12px' }} />
                )}
              </CardActions>
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </Card>
  );
};

const toShortFormatContractAddress = (contractAddress: ContractAddress | undefined): React.ReactElement | undefined =>
  contractAddress ? (
    <span data-testid="board-address">
      0x{contractAddress?.replace(/^[A-Fa-f0-9]{6}([A-Fa-f0-9]{8}).*([A-Fa-f0-9]{8})$/g, '$1...$2')}
    </span>
  ) : undefined;
