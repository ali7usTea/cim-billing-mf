import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VatStatementAgainstPartyLevel from '../../../src/app/main/components/BillingAndCharges/VatStatementAgainstPartyLevel';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Button: ({ onClick, children }: any) => (
    <button data-testid="search-btn" onClick={onClick}>{children}</button>
  ),
  Select: ({ value, onValueChange, children }: any) => (
    <select
      data-testid={`select-${value}`}
      value={value}
      onChange={e => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <span>{children}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
  DataPanel: ({ headerTitle }: any) => (
    <div data-testid="datapanel">{headerTitle}</div>
  ),
}));

// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock proxyURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'mock-proxy-url',
}));

// Mock usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: () => true,
  }),
}));

// Mock dateCalculation utilities
const mockMonths = [
  { monthName: 'Jan', lastDate: '2024-01-31' },
  { monthName: 'Feb', lastDate: '2024-02-29' },
  { monthName: 'Mar', lastDate: '2024-03-31' },
];
const mockYears = [2023, 2024];

jest.mock('../../../../utils/dateCalculation', () => ({
  generateMonths: () => mockMonths,
  generateYearList: () => mockYears,
  IMonths: {},
}));

describe('VatStatementAgainstPartyLevel', () => {
  beforeEach(() => {
    require('react-redux').useSelector.mockReturnValue({
      Customers: {
        customer1: {
          partyID: 'party123',
          debugReport: false,
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders month and year selects and search button', async () => {
    render(<VatStatementAgainstPartyLevel />);
    await waitFor(() => {
      expect(screen.getByTestId('select-Jan')).toBeInTheDocument();
      expect(screen.getByTestId('select-2024')).toBeInTheDocument();
      expect(screen.getByTestId('search-btn')).toBeInTheDocument();
    });
  });

  it('allows selecting month and year', async () => {
    render(<VatStatementAgainstPartyLevel />);
    await waitFor(() => {
      expect(screen.getByTestId('select-Jan')).toBeInTheDocument();
    });
    // Change month to Feb
    fireEvent.change(screen.getByTestId('select-Jan'), { target: { value: 'Feb' } });
    // Change year to 2023
    fireEvent.change(screen.getByTestId('select-2024'), { target: { value: '2023' } });
    // Click search
    fireEvent.click(screen.getByTestId('search-btn'));
    // DataPanel should render after search
    await waitFor(() => {
      expect(screen.getByTestId('datapanel')).toBeInTheDocument();
    });
  });

  it('shows DataPanel only after search', async () => {
    render(<VatStatementAgainstPartyLevel />);
    // DataPanel should not be visible initially
    expect(screen.queryByTestId('datapanel')).not.toBeInTheDocument();
    // Click search
    fireEvent.click(screen.getByTestId('search-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('datapanel')).toBeInTheDocument();
    });
  });

  it('calls global function getBCIMInvoiceVATDetailsLoadData on search', async () => {
    (window as any).getBCIMInvoiceVATDetailsLoadData = jest.fn();
    render(<VatStatementAgainstPartyLevel />);
    fireEvent.click(screen.getByTestId('search-btn'));
    await waitFor(() => {
      expect((window as any).getBCIMInvoiceVATDetailsLoadData).toHaveBeenCalled();
    });
  });
});