import { render, screen } from '@testing-library/react';
import PartyAdjustmentAndTransfer from '../../../src/app/main/components/AdjustmentAndTransfers/Party';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock DataPanel component
jest.mock('cim-ui-components', () => ({
  DataPanel: ({
    headerTitle,
    children,
    ...props
  }: any) => (
    <div data-testid="data-panel">
      {headerTitle}
      {children}
    </div>
  ),
}));

// Mock DateSearch component
jest.mock('../../../src/app/components/DateSearch', () => ({
  __esModule: true,
  default: ({
    initialStartDate,
    initialEndDate,
    onSearch,
  }: any) => (
    <div data-testid="date-search">
      DateSearch: {String(initialStartDate)}, {String(initialEndDate)}
    </div>
  ),
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

// Mock date helpers
jest.mock('../../../src/utils/helpers', () => ({
  getDates: () => ({
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-04-01T00:00:00.000Z')
  }),
  getMaxStartDate: () => new Date('2024-12-31T00:00:00.000Z'),
  getMinStartDate: () => new Date('2024-01-01T00:00:00.000Z')
}));

jest.mock('../../../src/utils/dateCalculation', () => ({
  add3Months: (date: Date) => new Date(date.setMonth(date.getMonth() + 3)),
  calculateLastDateOf6thMonth: (start: Date) => new Date(start.setMonth(start.getMonth() + 6))
}));

const mockStore = configureStore([]);

describe('PartyAdjustmentAndTransfer Integration Test', () => {
  it('renders DataPanel and DateSearch with correct props', () => {
    // Mock initial Redux state
    const store = mockStore({
      customerslice: {
        Customers: {
          'customer1': {
            debugReport: true,
            partyID: 'PARTY123'
          }
        }
      }
    });

    render(
      <Provider store={store}>
        <PartyAdjustmentAndTransfer />
      </Provider>
    );

    // Check DataPanel header
    expect(screen.getByTestId('data-panel')).toHaveTextContent('Adjustment detailed History');

    // Check DateSearch rendering
    expect(screen.getByTestId('date-search')).toBeInTheDocument();
    expect(screen.getByTestId('date-search')).toHaveTextContent('DateSearch');
  });
});