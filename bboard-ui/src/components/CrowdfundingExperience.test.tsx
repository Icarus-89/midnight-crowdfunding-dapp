import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CrowdfundingExperience } from './CrowdfundingExperience';

const wallet = {
  connected: true,
  address: '0x1am-demo-abc123',
  balance: 2500,
  network: 'Preprod',
  status: 'Connected to 1AM',
};

describe('CrowdfundingExperience', () => {
  it('renders the fresh hero and campaign listing', () => {
    render(<CrowdfundingExperience wallet={wallet} onConnectWallet={() => undefined} />);

    expect(screen.getByText(/Launch your next community-backed idea/i)).toBeTruthy();
    expect(screen.getByText(/Featured campaigns/i)).toBeTruthy();
    expect(screen.getByText(/Aurora Labs/i)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Back campaign/i }).length).toBeGreaterThan(0);
  });

  it('publishes a new campaign when a connected wallet is active', () => {
    render(<CrowdfundingExperience wallet={wallet} onConnectWallet={() => undefined} />);

    fireEvent.change(screen.getByLabelText(/campaign title/i), { target: { value: 'Forest Futures' } });
    fireEvent.change(screen.getByLabelText(/creator/i), { target: { value: 'Mina Park' } });
    fireEvent.change(screen.getByLabelText(/funding goal/i), { target: { value: '120000' } });
    fireEvent.change(screen.getByLabelText(/story/i), { target: { value: 'A community-led reforestation network.' } });

    fireEvent.click(screen.getByRole('button', { name: /publish campaign/i }));

    expect(screen.getByText(/Forest Futures/i)).toBeTruthy();
    expect(screen.getByText(/Campaign published with 1AM wallet/i)).toBeTruthy();
  });
});
