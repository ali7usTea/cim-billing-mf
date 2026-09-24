import { render, screen } from '@testing-library/react';
import BillDetails from '../../../../src/app/main/components/BillingAndCharges/InvoiceDetails/BillDetails';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, queryParams, shouldRender }: any) =>
    shouldRender ? (
      <div data-testid="datapanel">
        {headerTitle}
        <div data-testid="query-params">{JSON.stringify(queryParams)}</div>
      </div>
    ) : null,
}));

// Mock proxyURL
jest.mock('../../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'mock-proxy-url',
}));

// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock usePermissionChecker
jest.mock('../../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: () => true,
  }),
}));

// Mock getMonthYearCode utility : dateCalculation
jest.mock('../../../../src/utils/dateCalculation', () => ({
  getMonthYearCode: (date: string) => `code-${date}`,
}));

describe('BillDetails', () => {
  beforeEach(() => {
    require('react-redux').useSelector.mockReturnValue({
      Customers: {
        customer1: {
          debugReport: false,
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders DataPanel when selectedInvoice is provided', () => {
    render(
      <BillDetails
        selectedInvoice={{
          'GetBillMonthlySummary.INVOICE_DATE': '2024-06-01',
        }}
      />
    );
    expect(screen.getByTestId('datapanel')).toBeInTheDocument();
    expect(screen.getByTestId('query-params')).toHaveTextContent(
      expect.stringContaining('code-2024-06-01')
    );
  });

  it('does not render DataPanel when selectedInvoice is not provided', () => {
    render(<BillDetails />);
    expect(screen.queryByTestId('datapanel')).not.toBeInTheDocument();
  });

  it('passes correct queryParams to DataPanel', () => {
    render(
      <BillDetails
        selectedInvoice={{
          'GetBillMonthlySummary.INVOICE_DATE': '2024-05-01',
        }}
      />
    );
    const params = JSON.parse(screen.getByTestId('query-params').textContent || '{}');
    expect(params.accountId).toBe('customer1');
    expect(params.BILL_DATE).toBe('code-2024-05-01');
  });

  it('renders DataPanel only if permission exists', () => {
    // Override permission checker to return false
    jest.mock('../../../../src/app/hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));
    render(
      <BillDetails
        selectedInvoice={{
          'GetBillMonthlySummary.INVOICE_DATE': '2024-06-01',
        }}
      />
    );
    expect(screen.queryByTestId('datapanel')).not.toBeInTheDocument();
  });
});