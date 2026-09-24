import { render, screen } from '@testing-library/react';
import BillDetails from '../../../src/app/main/components/CurrentMonth/BillDetails';

// Mock DataPanel for isolation
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, shouldRender }: any) =>
    shouldRender ? <div>{headerTitle}</div> : null,
}));

// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    Customers: {
      customer1: {
        accountID: 'ACC123',
        debugReport: false,
      },
    },
  })),
}));

// Mock proxyURL and debugReportURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'http://mock-proxy-url',
  debugReportURL: 'http://mock-debug-url',
}));

// Mock usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: (group: string) =>
      [
        'Payment_detail_history',
        'billDetails_PnlGrp',
        'usageDetailsPnlGrp'
      ].includes(group),
  }),
}));

// Mock react-query useQuery
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      billing: {
        PAYMENT_DETAILS: {},
        ADJ_AND_REFUND_DETAILS: {},
        PLAN_MONTHLY_RENTAL_DETAILS: { rows: [] },
        ADDONS_RENTAL_DETAILS: { rows: [] },
        ONE_TIME_CHARGES_DETAILS: {},
        FREE_USAGE: {},
        OUT_OF_BUNDLE_INFO: {},
        TOTAL_PAYMENT_DETAILS: '100.00',
        TOTAL_ADJ_REFUND_DETAILS: '10.00',
        TOTAL_PLAN_MONTHLY_RENTAL_DETAILS: '50.00',
        TOTAL_ADDONS_RENTAL_DETAILS: '20.00',
        TOTAL_ONE_TIME_CHARGES_DETAILS: '5.00',
      },
      refId: 'ref123'
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('BillDetails Component', () => {
  it('renders all DataPanel sections when permissions exist', () => {
    render(<BillDetails />);
    expect(screen.getByText('Payment Details, Adjustment And Refund Details')).toBeInTheDocument();
    expect(screen.getByText('Plan Monthly Rental, Add-ons Rental')).toBeInTheDocument();
    expect(screen.getByText('One Time Charges Details')).toBeInTheDocument();
    expect(screen.getByText('International Calls And Usages, National Calls And Usages')).toBeInTheDocument();
    expect(screen.getByText('Free Usage, Out Of Bundle Info')).toBeInTheDocument();
  });

  it('does not render DataPanel if permission is missing', () => {
    // Override permission checker to return false for all
    jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));

    render(<BillDetails />)
    expect(screen.queryByText('Payment Details, Adjustment And Refund Details')).not.toBeInTheDocument()    //@ts-ignore
    expect(screen.queryByText('Plan Monthly Rental, Add-ons Rental')).not.toBeInTheDocument();
    expect(screen.queryByText('One Time Charges Details')).not.toBeInTheDocument();
    expect(screen.queryByText('International Calls And Usages, National Calls And Usages')).not.toBeInTheDocument();
    expect(screen.queryByText('Free Usage, Out Of Bundle Info')).not.toBeInTheDocument();
  });
});