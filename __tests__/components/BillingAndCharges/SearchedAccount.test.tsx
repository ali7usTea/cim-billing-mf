import { render, screen, fireEvent } from '@testing-library/react';
import SearchedAccount from '../../../src/app/main/components/BillingAndCharges/SearchedAccount';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Button: ({ onClick, title, children, ...props }: any) => (
    <button data-testid={`button-${title}`} onClick={onClick} {...props}>
      {children}
    </button>
  ),
  DataPanel: ({
    headerTitle,
    shouldRender,
    leadingColumns,
    viewLayout,
    ...props
  }: any) =>
    shouldRender ? (
      <div data-testid={`datapanel-${headerTitle}`}>
        {headerTitle}
        {leadingColumns &&
          leadingColumns.map((col: any, idx: number) => (
            <div key={idx} data-testid={`leading-column-${col.title}`}>
              {col.component &&
                col.component({
                  row: {
                    getIsSelected: () => false,
                    toggleSelected: jest.fn(),
                    original: { id: 'member1' },
                  },
                  table: {
                    toggleAllRowsSelected: jest.fn(),
                  },
                })}
            </div>
          ))}
      </div>
    ) : null,
  cn: (...args: any[]) => args.join(' '),
  FlatRow: {},
  CellContext: {},
  RowValue: {},
}));

// Mock DesktopIcon
jest.mock('../../../src/app/icons/DesktopIcon', () => ({
  DesktopIcon: () => <span data-testid="desktop-icon">Icon</span>,
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

// Mock child components : ./BillingGroupMemberDetails
jest.mock('../../../src/app/main/components/BillingAndCharges/BillingGroupMemberDetails', () => {
    const component = ({ selectedMember }: any) => (
      <div data-testid="billing-group-member-details">{selectedMember ? 'Details for ' + selectedMember.id : 'No Details'}</div>
    );
    component.displayName = 'BillingGroupMemberDetails';
    return component;
});
//./BillMonthlySummary
jest.mock('../../../src/app/main/components/BillingAndCharges/BillMonthlySummary', () => <div data-testid="bill-monthly-summary">BillMonthlySummary</div>);
// InvoiceSettings
jest.mock('../../../src/app/main/components/BillingAndCharges/InvoiceSettings', () => <div data-testid="invoice-settings">InvoiceSettings</div>);

describe('SearchedAccount', () => {
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

  it('renders all panels and child components', () => {
    render(<SearchedAccount />);
    expect(screen.getByTestId('bill-monthly-summary')).toBeInTheDocument();
    expect(screen.getByTestId('datapanel-Account Financial Transaction Details History')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-settings')).toBeInTheDocument();
    expect(screen.getByTestId('datapanel-Billing Group Members')).toBeInTheDocument();
    expect(screen.getByTestId('billing-group-member-details')).toBeInTheDocument();
  });

  it('renders leading column button and handles selection', () => {
    render(<SearchedAccount />);
    const detailsButton = screen.getByTestId('button-View Desktop');
    expect(detailsButton).toBeInTheDocument();
    fireEvent.click(detailsButton);
    // After clicking, selectedMember should be set, so details should update
    expect(screen.getByTestId('billing-group-member-details')).toHaveTextContent('Details for member1');
  });

  it('renders panels based on permissions', () => {
    // Permission checker always returns true in mock
    render(<SearchedAccount />);
    expect(screen.getByTestId('datapanel-Account Financial Transaction Details History')).toBeInTheDocument();
    expect(screen.getByTestId('datapanel-Billing Group Members')).toBeInTheDocument();
  });
});