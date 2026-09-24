import { render, screen } from '@testing-library/react';
import PaymentDetailsParty from '../../../src/app/main/components/PaymentDetails/PaymentDetailsParty';

// Mock cim-ui-components for isolation
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, shouldRender, children }: any) =>
    shouldRender ? (
      <div>
        <div>{headerTitle}</div>
        {children}
      </div>
    ) : null,
}));


// Mock DateSearch
jest.mock('../../../src/app/components/DateSearch', () => <div>DateSearchMock</div>);

// Mock ChannelPaymentTransactionHistory
jest.mock('../../../src/app/main/components/PaymentDetails/ChannelPaymentTransactionHistory', () => <div>ChannelPaymentTransactionHistoryMock</div>);

// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    Customers: {
      customer1: {
        partyID: 'PARTY123',
        debugReport: false,
      },
    },
  })),
}));

// Mock proxyURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'http://mock-proxy-url',
}));

// Mock permission checker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: (key: string) =>
      key === 'paymentDetailedHistoryPanel',
  }),
}));

// Mock helpers and dateCalculation
jest.mock('../../../src/utils/helpers', () => ({
  formatDateForParams: (date: string) => date,
  getDates: () => ({
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-04-01T00:00:00.000Z'),
  }),
  getMaxStartDate: () => new Date('2024-06-01T00:00:00.000Z'),
  getMinStartDate: () => new Date('2023-01-01T00:00:00.000Z'),
}));
jest.mock('../../../src/utils/dateCalculation', () => ({
  add3Months: (date: Date) => new Date(date.setMonth(date.getMonth() + 3)),
  calculateLastDateOf6thMonth: (start: Date) => new Date(start.setMonth(start.getMonth() + 6)),
}));

describe('PaymentDetailsParty Component', () => {
  it('renders DataPanel and DateSearch when permission exists', () => {
    render(<PaymentDetailsParty />);
    expect(screen.getByText('Payment Detailed history')).toBeInTheDocument();
    expect(screen.getByText('DateSearchMock')).toBeInTheDocument();
    expect(screen.getByText('ChannelPaymentTransactionHistoryMock')).toBeInTheDocument();
  });

  it('does not render DataPanel if permission is missing', () => {
    // Override permission checker to return false
    jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));

    render(<PaymentDetailsParty />);
    expect(screen.queryByText('Payment Detailed history')).not.toBeInTheDocument();
    expect(screen.getByText('ChannelPaymentTransactionHistoryMock')).toBeInTheDocument();
  });
});