import { render, screen } from '@testing-library/react';
import AccountAdjustmentAndTransfer from '../../../src/app/main/components/AdjustmentAndTransfers/Account';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock DataPanel component
jest.mock('cim-ui-components', () => ({
  DataPanel: ({
    headerTitle,
    children,
    ...props
  }: any) => (
    <div data-testid={headerTitle.replace(/\s/g, '-').toLowerCase()}>
      {headerTitle}
      {children}
    </div>
  ),
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
}));

// Mock DateSearch component
jest.mock('../../../src/app/components/DateSearch', () => ({
  __esModule: true,
  default: ({
    initialStartDate,
    initialEndDate,
    onSearch,
    ...props
  }: any) => (
    <div data-testid="date-search">
      DateSearch: {String(initialStartDate)}, {String(initialEndDate)}
    </div>
  ),
}));

// Mock AddAdjustment component
// AddAdjustment/AddAdjustment
jest.mock('../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/AddAdjustment', () => ({
  __esModule: true,
  default: () => <div data-testid="add-adjustment">AddAdjustment</div>
}));

// Mock proxyURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'http://mock-api'
}));

// Mock usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: () => true
  })
}));

// Mock helpers and dateCalculation
jest.mock('../../../src/utils/helpers', () => ({
  getDates: () => ({
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-04-01T00:00:00.000Z')
  }),
  getMaxStartDate: () => new Date('2024-12-31T00:00:00.000Z'),
  getMinStartDate: () => new Date('2024-01-01T00:00:00.000Z'),
  formatDateForParams: (date: string) => date,
}));
jest.mock('../../../src/utils/dateCalculation', () => ({
  add3Months: (date: Date) => new Date(date.setMonth(date.getMonth() + 3)),
  calculateLastDateOf6thMonth: (start: Date) => new Date(start.setMonth(start.getMonth() + 6))
}));

// Mock selectCustomer selector
const mockStore = configureStore([]);
jest.mock('../../../src/redux/customer/customerSlice', () => ({
  selectCustomer: (state: any) => state.customer
}));

describe('AccountAdjustmentAndTransfer Integration Test', () => {
  it('renders BillingDetails and all AccordionsDetails panels', () => {
    // Mock initial Redux state
    const store = mockStore({
      customer: {
        Customers: {
          'customer1': {
            debugReport: true,
            partyID: 'PARTY123',
            accountNumber: 'ACC456'
          }
        }
      }
    });

    render(
      <Provider store={store}>
        <AccountAdjustmentAndTransfer />
      </Provider>
    );

    // BillingDetails
    expect(screen.getByTestId('adjustment-detailed-history')).toBeInTheDocument();

    // AccordionsDetails panels
    expect(screen.getByTestId('use-evoucher-history')).toBeInTheDocument();
    expect(screen.getByTestId('ubt-details-history')).toBeInTheDocument();
    expect(screen.getByTestId('dbt-details-history')).toBeInTheDocument();
    expect(screen.getByTestId('ibt-details-history')).toBeInTheDocument();
    expect(screen.getByTestId('tranglo-ibt-details-history')).toBeInTheDocument();
    expect(screen.getByTestId('prepaid-refund-info')).toBeInTheDocument();

    // DateSearch and AddAdjustment in BillingDetails
    expect(screen.getByTestId('date-search')).toBeInTheDocument();
    expect(screen.getByTestId('add-adjustment')).toBeInTheDocument();
  });
});