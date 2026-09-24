import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InvoideDetailsModalTabs from '../../../../src/app/main/components/BillingAndCharges/InvoiceDetails/index';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ value, children, ...props }: any) => (
    <button data-testid={`tab-trigger-${value}`} {...props}>{children}</button>
  ),
  TabsContent: ({ value, children }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}));

// Mock Loading
jest.mock('../../Loading', () => <div data-testid="loading">Loading...</div>);

// Mock usePermissionChecker
const mockPermissions = {
  BillSummary: true,
  BillDetails: true,
  CallDetails: true,
};
jest.mock('../../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    //@ts-ignore
    checkTabPermissionExists: (key: string) => mockPermissions[key],
  }),
}));

// Mock BillSummary (direct import) 
jest.mock('../../../../src/app/main/components/BillingAndCharges/InvoiceDetails/BillSummary', () => ({
  __esModule: true,
  default: ({ selectedInvoice }: any) => (
    <div data-testid="bill-summary">BillSummary {selectedInvoice?.id}</div>
  ),
}));

// Mock BillDetails (lazy import)
jest.mock('../../../../src/app/main/components/BillingAndCharges/InvoiceDetails/BillDetails', () => ({
  __esModule: true,
  default: ({ selectedInvoice }: any) => (
    <div data-testid="bill-details">BillDetails {selectedInvoice?.id}</div>
  ),
}));

// Mock CallDetails (lazy import)
jest.mock('../../../../src/app/main/components/BillingAndCharges/InvoiceDetails/CallDetails', () => ({
  __esModule: true,
  default: ({ selectedInvoice }: any) => (
    <div data-testid="call-details">CallDetails {selectedInvoice?.id}</div>
  ),
}));

describe('InvoideDetailsModalTabs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all accessible tabs and their content', async () => {
    render(<InvoideDetailsModalTabs selectedInvoice={{ id: 'inv123' }} />);
    // Tabs triggers
    expect(screen.getByTestId('tab-trigger-BillSummary')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-BillDetails')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-CallDetails')).toBeInTheDocument();
    // BillSummary content should be visible initially
    await waitFor(() => {
      expect(screen.getByTestId('bill-summary')).toHaveTextContent('inv123');
    });
  });

  it('switches tab and renders correct content', async () => {
    render(<InvoideDetailsModalTabs selectedInvoice={{ id: 'inv456' }} />);
    // Initially BillSummary
    await waitFor(() => {
      expect(screen.getByTestId('bill-summary')).toBeInTheDocument();
    });
    // Switch to BillDetails
    fireEvent.click(screen.getByTestId('tab-trigger-BillDetails'));
    await waitFor(() => {
      expect(screen.getByTestId('bill-details')).toHaveTextContent('inv456');
    });
    // Switch to CallDetails
    fireEvent.click(screen.getByTestId('tab-trigger-CallDetails'));
    await waitFor(() => {
      expect(screen.getByTestId('call-details')).toHaveTextContent('inv456');
    });
  });

  it('only renders tabs with permission', async () => {
    mockPermissions.BillSummary = false;
    mockPermissions.BillDetails = true;
    mockPermissions.CallDetails = false;
    render(<InvoideDetailsModalTabs selectedInvoice={{ id: 'inv789' }} />);
    expect(screen.queryByTestId('tab-trigger-BillSummary')).not.toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-BillDetails')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-trigger-CallDetails')).not.toBeInTheDocument();
    // Only BillDetails content should be rendered
    await waitFor(() => {
      expect(screen.getByTestId('bill-details')).toHaveTextContent('inv789');
    });
    // Reset permissions for other tests
    mockPermissions.BillSummary = true;
    mockPermissions.CallDetails = true;
  });

  it('shows loading fallback for lazy components', async () => {
    // Simulate lazy loading by temporarily removing the mock
    jest.resetModules();
    jest.mock('./BillDetails', () => ({
      __esModule: true,
      default: React.lazy(() => new Promise(resolve => {
          /* setTimeout(() => resolve({ default: () => <div data-testid="bill-details">BillDetails Lazy</div> }), 50) */
          const BillDetailsLazy = () => <div data-testid="bill-details">BillDetails Lazy</div>;
          new Promise(resolve => {
            setTimeout(() => resolve({ default: BillDetailsLazy }), 50);
          });
        }
      )),
    }));
    render(<InvoideDetailsModalTabs selectedInvoice={{ id: 'inv999' }} />);
    fireEvent.click(screen.getByTestId('tab-trigger-BillDetails'));
    // Loading should be visible while lazy component loads
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    // Wait for lazy component to load
    await waitFor(() => {
      expect(screen.getByTestId('bill-details')).toBeInTheDocument();
    });
  });
});