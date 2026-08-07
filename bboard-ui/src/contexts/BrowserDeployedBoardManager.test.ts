import { describe, expect, it } from 'vitest';
import { buildWalletConnectionState } from './BrowserDeployedBoardManager';

describe('buildWalletConnectionState', () => {
  it('maps a connected wallet response into the UI wallet state', () => {
    const state = buildWalletConnectionState({
      connected: true,
      address: 'shielded-address-123',
      network: 'preprod',
      status: 'Connected to Midnight 1AM',
    });

    expect(state.connected).toBe(true);
    expect(state.address).toBe('shielded-address-123');
    expect(state.network).toBe('preprod');
    expect(state.status).toBe('Connected to Midnight 1AM');
  });
});
