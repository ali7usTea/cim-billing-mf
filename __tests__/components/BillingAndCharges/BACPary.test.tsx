import { render, screen, fireEvent } from '@testing-library/react';
import BACPary from '../../../src/app/main/components/BillingAndCharges/Party';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Tabs: ({ value, onValueChange, children }: any) => (
    <div data-testid="tabs">{children}</div>
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

// Mock VatStatementAgainstPartyLevel component
jest.mock('../../../src/app/main/components/BillingAndCharges/VatStatementAgainstPartyLevel', () =>  <div data-testid="vat-party-level">VatStatementAgainstPartyLevel</div>);

// Mock lazy-loaded PartyInvoiceDetailsTab component
jest.mock('../../../src/app/main/components/BillingAndCharges/PartyInvoiceDetailsTab', () => <div data-testid="party-invoice-details-tab">PartyInvoiceDetailsTab</div>);

describe('BACPary', () => {
  it('renders all accessible tabs', () => {
    render(<BACPary />);
    expect(screen.getByTestId('tab-trigger-PostPaid')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-PrePaid')).toBeInTheDocument();
  });

  it('renders VatStatementAgainstPartyLevel component in PostPaid tab by default', () => {
    render(<BACPary />);
    expect(screen.getByTestId('vat-party-level')).toBeInTheDocument();
  });

  it('switches to PrePaid tab and renders PartyInvoiceDetailsTab component', () => {
    render(<BACPary />);
    fireEvent.click(screen.getByTestId('tab-trigger-PrePaid'));
    expect(screen.getByTestId('party-invoice-details-tab')).toBeInTheDocument();
  });

  it('filters tabs based on permissions', () => {
    // Only PostPaid tab accessible
    jest.mock('../../../hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkTabPermissionExists: (key: string) => key === 'PostPaid',
      }),
    }));
    render(<BACPary />);
    expect(screen.getByTestId('tab-trigger-PostPaid')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-trigger-PrePaid')).not.toBeInTheDocument();
  });
});