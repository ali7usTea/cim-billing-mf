import { render, screen, fireEvent } from '@testing-library/react';
import BillingAndCharges from '../../../src/app/main/components/BillingAndCharges/index';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Tabs: ({ value, onValueChange, children }: any) => (
    <div data-testid="tabs">
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ value, children, ...props }: any) => (
    <button data-testid={`tab-trigger-${value}`} {...props}>{children}</button>
  ),
  TabsContent: ({ value, children }: any) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
}));

// Mock usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkTabPermissionExists: (key: string) => true, // All tabs accessible
  }),
}));

// Mock Loading component
jest.mock('../../../src/app/main/components/Loading', () => <div data-testid="loading">Loading...</div>);

// Mock SearchedAccount component
jest.mock('../../../src/app/main/components/BillingAndCharges/SearchedAccount', () => <div data-testid="searched-account">SearchedAccount</div>);

// Mock lazy-loaded components
jest.mock('../../../src/app/main/components/BillingAndCharges/BusinessSummaryBillDetail', () => <div data-testid="business-summary-bill-detail">BusinessSummaryBillDetail</div>);
jest.mock('../../../src/app/main/components/BillingAndCharges/Party', () => <div data-testid="party">Party</div>);

describe('BillingAndCharges', () => {
  it('renders all accessible tabs', () => {
    render(<BillingAndCharges />);
    expect(screen.getByTestId('tab-trigger-Account')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-Party')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-Bill Details')).toBeInTheDocument();
  });

  it('renders SearchedAccount component in Account tab by default', () => {
    render(<BillingAndCharges />);
    expect(screen.getByTestId('searched-account')).toBeInTheDocument();
  });

  it('switches to Party tab and renders Party component', () => {
    render(<BillingAndCharges />);
    fireEvent.click(screen.getByTestId('tab-trigger-Party'));
    expect(screen.getByTestId('party')).toBeInTheDocument();
  });

  it('switches to Bill Details tab and renders BusinessSummaryBillDetail component', () => {
    render(<BillingAndCharges />);
    fireEvent.click(screen.getByTestId('tab-trigger-Bill Details'));
    expect(screen.getByTestId('business-summary-bill-detail')).toBeInTheDocument();
  });

  it('filters tabs based on permissions', () => {
    // Only Account tab accessible
    jest.mock('../../../hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkTabPermissionExists: (key: string) => key === 'Account',
      }),
    }));
    render(<BillingAndCharges />);
    expect(screen.getByTestId('tab-trigger-Account')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-trigger-Party')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tab-trigger-Bill Details')).not.toBeInTheDocument();
  });
});