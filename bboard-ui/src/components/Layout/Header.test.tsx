import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Header } from './Header';

const wallet = {
  connected: false,
  address: 'Not connected',
  balance: 0,
  network: 'Preprod',
  status: 'Wallet idle',
};

describe('Header', () => {
  it('shows a wallet connection state when the connect action is used', () => {
    render(<Header wallet={wallet} onConnectWallet={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: /connect 1am/i }));

    expect(screen.getByText(/1am wallet ready|connected to 1am/i)).toBeTruthy();
  });
});
