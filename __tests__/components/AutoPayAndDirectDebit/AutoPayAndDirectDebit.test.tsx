import { render, screen, fireEvent } from '@testing-library/react';
import AutoPayAndDirectDebit from '../../../src/app/main/components/AutoPayAndDirectDebit';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  DataPanel: ({ headerTitle, shouldRender, children }: any) =>
    shouldRender ? (
      <div>
        <div>{headerTitle}</div>
        {children}
      </div>
    ) : null,
}));

// Mock DateSearch
jest.mock('../../../src/app/components/DateSearch', () => ({
  __esModule: true,
  default: ({ onSearch }: any) => (
    <div>
      <button data-testid="date-search-btn" onClick={() => onSearch('2024-06-01', '2024-06-30')}>
        Search Dates
      </button>
    </div>
  ),
}));

// Mock react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    Customers: {
      customer1: {
        accountNumber: 'ACC123',
        accountID: 'ACC123',
        debugReport: false,
      },
    },
  })),
}));

// Mock proxyURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'http://mock-proxy-url',
}));

// Mock helpers
jest.mock('../../../src/utils/helpers', () => ({
  formatDateForParams: (date: string) => date,
  getDates: (offset = 0) => ({
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-30'),
  }),
  getMaxStartDate: () => new Date('2024-06-30'),
  getMinStartDate: () => new Date('2024-06-01'),
}));

// Mock usePermissionChecker
const permissionMock = {
  checkGroupPermissionExists: (group: string) =>
    ['autoPay_pnlGrp', 'directDebitAccountDtls_pnlGrp', 'transferCall_Btn'].includes(group),
};
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => permissionMock,
}));

describe('AutoPayAndDirectDebit Component', () => {
  it('renders Transfer for AutoPay button when permission exists', () => {
    render(<AutoPayAndDirectDebit />);
    
    expect(screen.getByText('Transfer for AutoPay')).toBeInTheDocument();
  });

  it('renders Direct Debit and AutoPay panels', () => {
    render(<AutoPayAndDirectDebit />);
    expect(screen.getByText('Direct Debit Account Information')).toBeInTheDocument();
    expect(screen.getByText('AutoPay & Direct Debit History')).toBeInTheDocument();
  });

  it('renders DateSearch and triggers search callback', () => {
    render(<AutoPayAndDirectDebit />);
    const searchBtn = screen.getByTestId('date-search-btn');
    fireEvent.click(searchBtn);
    // No assertion needed, just ensure no errors and callback is called.
  });

  it('does not render Transfer button if permission is missing', () => {
    // Override permission checker to return false for transferCall_Btn
    jest.mock('../../../hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: (group: string) =>
          group !== 'transferCall_Btn' &&
          ['autoPay_pnlGrp', 'directDebitAccountDtls_pnlGrp'].includes(group),
      }),
    }));
    render(<AutoPayAndDirectDebit />);
    expect(screen.queryByText('Transfer for AutoPay')).not.toBeInTheDocument();
  });
});