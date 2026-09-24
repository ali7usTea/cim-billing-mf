import { render, screen, fireEvent } from '@testing-library/react';
import BusinessSummaryBillDetail from '../../../src/app/main/components/BillingAndCharges/BusinessSummaryBillDetail';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DataPanel: ({ headerTitle, shouldRender }: any) =>
    shouldRender ? <div data-testid={`datapanel-${headerTitle}`}>{headerTitle}</div> : null,
  Select: ({ value, onValueChange, children }: any) => (
    <select
      value={value}
      onChange={e => onValueChange(e.target.value)}
      data-testid="select-month"
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <option>{placeholder}</option>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}));

// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: () => true,
  }),
}));

// Mock proxyURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'mock-proxy-url',
}));

describe('BusinessSummaryBillDetail', () => {
  beforeEach(() => {
    // Mock Customers data
    require('react-redux').useSelector.mockReturnValue({
      Customers: {
        customer1: {
          accountID: '12345',
          noOfRecords: 10,
          overrideFlag: false,
          debugReport: false,
        },
      },
    });
  });

  it('renders all DataPanels and buttons', () => {
    render(<BusinessSummaryBillDetail />);
    expect(screen.getByTestId('datapanel-Main Details')).toBeInTheDocument();
    expect(screen.getByTestId('datapanel-Invoice MainDetail')).toBeInTheDocument();
    expect(screen.getByTestId('datapanel-Bill Summary')).toBeInTheDocument();
    expect(screen.getByTestId('datapanel-Payment')).toBeInTheDocument();
    expect(screen.getByTestId('datapanel-Invoice Details')).toBeInTheDocument();
    expect(screen.getAllByText('Send eMail')[0]).toBeInTheDocument();
    expect(screen.getByText('Download Summary Bill')).toBeInTheDocument();
    expect(screen.getByText('Invoice Inquery')).toBeInTheDocument();
  });

  it('renders month select and allows changing month', () => {
    render(<BusinessSummaryBillDetail />);
    const select = screen.getByTestId('select-month');
    expect(select).toBeInTheDocument();
    // Simulate selecting a month
    fireEvent.change(select, { target: { value: 'January 2024' } });
    expect(select).toHaveValue('January 2024');
  });

  it('calls button handlers when buttons are clicked', () => {
    // Mock console.log to check handler calls
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<BusinessSummaryBillDetail />);
    fireEvent.click(screen.getAllByText('Send eMail')[0]);
    fireEvent.click(screen.getByText('Download Summary Bill'));
    expect(logSpy).toHaveBeenCalledWith('send email clicked.');
    expect(logSpy).toHaveBeenCalledWith('download bill clicked.');
    logSpy.mockRestore();
  });
});