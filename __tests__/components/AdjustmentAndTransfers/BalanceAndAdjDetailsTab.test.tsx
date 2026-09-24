import { render, screen } from '@testing-library/react';
import BalanceAndAdjDetailsTab from '../../../src/app/main/components/AdjustmentAndTransfers/index';

// Mock AccountAdjustmentAndTransfer component
jest.mock('../../../src/app/main/components/AdjustmentAndTransfers/Account', () => ({
  __esModule: true,
  default: () => <div data-testid="account-component">Account Component</div>
}));

// Mock Party component (lazy loaded)
jest.mock('../../../src/app/main/components/AdjustmentAndTransfers/Party', () => ({
  __esModule: true,
  default: () => <div data-testid="party-component">Party Component</div>
}));

// Mock Loading component
jest.mock('../../../src/app/main/components/Loading', () => <div data-testid="loading">Loading...</div>);

// Mock usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkTabPermissionExists: (tabKey: string) => {
      // Allow both tabs for testing
      return tabKey === 'Account' || tabKey === 'Party';
    }
  })
}));

describe('BalanceAndAdjDetailsTab Integration Test', () => {
  it('renders Account and Party tabs and their components', async () => {
    render(<BalanceAndAdjDetailsTab />);

    // Check tab triggers    
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Party')).toBeInTheDocument();

    // Check Account tab content
    expect(screen.getByTestId('account-component')).toBeInTheDocument();

    // Check Party tab content (lazy loaded)
    expect(screen.getByTestId('party-component')).toBeInTheDocument();
  });
});