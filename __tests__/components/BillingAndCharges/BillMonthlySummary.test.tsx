import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BillMonthlySummary from '../../../src/app/main/components/BillingAndCharges/BillMonthlySummary';

// Mock cim-ui-components for isolation
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, shouldRender, leadingColumns }: any) =>
    shouldRender ? (
      <div>
        <div>{headerTitle}</div>
        {/* Render ActionMenu for testing */}
        {leadingColumns && leadingColumns[0] && leadingColumns[0].component && (
          <div data-testid="action-menu">
            {leadingColumns[0].component({
              row: {
                original: {
                  "GetBillMonthlySummary.INVOICE_DATE": "2024-06-01 00:00:00",
                  "GetBillMonthlySummary.INVOICE_NUMBER": "INV123",
                },
              },
            })}
          </div>
        )}
      </div>
    ) : null,
  AlertDialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogCancel: ({ children, ...props }: any) => (
    <button {...props}>{children || 'Cancel'}</button>
  ),
  AlertDialogAction: ({ children, onClick, ...props }: any) => (
    <button {...props} onClick={onClick}>{children || 'Submit'}</button>
  ),
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ render }: any) => <div>{render}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div>
      <button onClick={onClick}>{children}</button>
    </div>
  ),
  FlatRow: {},
  RowValue: {},
  CellContext: {},
}));

// Mock InvoiceDetailsModal
jest.mock('../../../src/app/main/components/BillingAndCharges/InvoiceDetailsModal', () => { 
    const component = ({ selectedInvoice, setSelectedInvoice }: any) =>
        selectedInvoice ? <div>InvoiceDetailsModalMock</div> : null
        component.displayName = 'MockInvoiceDetailsModal';
        return component;
    }
);

// Mock BillMonthPopupOptionSelector
jest.mock('../../../src/app/main/components/BillingAndCharges/BillMonthPopupOptionSelector', () => {
    const compo = ({ onOptionChange, onEmailChange }: any) => (
        <div>
            <button data-testid="option-selector" onClick={() => onOptionChange('SendToDifferentEmail')}>OptionSelector</button>
            <input data-testid="email-input" onChange={e => onEmailChange(e.target.value)} />
        </div>
    );
    compo.displayName = 'BillMonthPopupOptionSelector';
    return compo;
});

//BillMonthPopupLanguageSelector
jest.mock('../../../src/app/main/components/BillingAndCharges/BillMonthPopupLanguageSelector', () => {
  const MockBillMonthPopupLanguageSelector = ({ onChange }: any) => (
    <div>
      <button data-testid="language-selector" onClick={() => onChange('Arabic')}>LanguageSelector</button>
    </div>
  );
  MockBillMonthPopupLanguageSelector.displayName = 'MockBillMonthPopupLanguageSelector';
  return MockBillMonthPopupLanguageSelector;
});


// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    Customers: {
      customer1: {
        ebillEmail: 'test@email.com',
        contactNumber: '0501234567',
        debugReport: false,
      },
    },
  })),
}));

// Mock proxyURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'http://mock-proxy-url',
}));

// Mock permission checker : usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: (key: string) =>
      key === 'monthlyBill',
  }),
}));

// Mock sendNotification
const sendNotificationMock = jest.fn();
// utils/NotificationUtils
jest.mock('../../../src/utils/NotificationUtils', () => ({
  sendNotification: sendNotificationMock,
}));

// Mock axios and toast
const axiosGetMock = jest.fn(() =>
  Promise.resolve({ data: { data: { BILL_PATH: 'billpath.pdf' } } })
);
jest.mock('axios', () => ({
  get: axiosGetMock,
}));
const toastErrorMock = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    error: toastErrorMock,
  },
}));

describe('BillMonthlySummary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders DataPanel when permission exists', () => {
    render(<BillMonthlySummary />);
    expect(screen.getByText('Monthly Bill / Invoice Summary')).toBeInTheDocument();
    expect(screen.getByTestId('action-menu')).toBeInTheDocument();
  });

  it('opens details modal when "View Details" is clicked', () => {
    render(<BillMonthlySummary />);
    const viewDetailsBtn = screen.getByText('View Details');
    fireEvent.click(viewDetailsBtn);
    expect(screen.getByText('InvoiceDetailsModalMock')).toBeInTheDocument();
  });

  it('opens download confirmation and calls handleDownload', async () => {
    // Mock window.open
    const windowOpenMock = jest.spyOn(window, 'open').mockImplementation(() => null);
    render(<BillMonthlySummary />);
    const downloadBtn = screen.getByText('Download eBill PDF');
    fireEvent.click(downloadBtn);
    expect(screen.getByText('Are you sure you want to download this invoice?')).toBeInTheDocument();

    // Submit action
    const submitBtn = screen.getByText('Submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axiosGetMock).toHaveBeenCalledWith(
        expect.stringContaining('/custom/billpath?INVOICE_DATE=01-06&INVOICE_NUMBER=INV123')
      );
      expect(windowOpenMock).toHaveBeenCalledWith(
        expect.stringContaining('billpath.pdf'),
        '_blank',
        'noreferrer'
      );
    });

    windowOpenMock.mockRestore();
  });

  it('shows error toast if download fails', async () => {
    axiosGetMock.mockRejectedValueOnce({});
    render(<BillMonthlySummary />);
    const downloadBtn = screen.getByText('Download eBill PDF');
    fireEvent.click(downloadBtn);
    const submitBtn = screen.getByText('Submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Download Failed', {
        description: 'Unable to retrieve invoice path.',
      });
    });
  });

  it('opens email modal and calls sendNotification with custom email', () => {
    render(<BillMonthlySummary />);
    const emailBtn = screen.getByText('Resend eBill Email');
    fireEvent.click(emailBtn);
    expect(screen.getByText('Resend to email: test@email.com')).toBeInTheDocument();

    // Simulate option selection and email input
    fireEvent.click(screen.getByTestId('option-selector'));
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'custom@email.com' } });

    // Submit action
    const submitBtn = screen.getByText('Submit');
    fireEvent.click(submitBtn);

    expect(sendNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customValue: 'custom@email.com',
        type: 'email',
      })
    );
  });

  it('opens SMS modal and calls sendNotification with language', () => {
    render(<BillMonthlySummary />);
    const smsBtn = screen.getByText('Resend Minibill SMS');
    fireEvent.click(smsBtn);
    expect(screen.getByText('Resend to: 0501234567')).toBeInTheDocument();

    // Simulate language selection
    fireEvent.click(screen.getByTestId('language-selector'));

    // Submit action
    const submitBtn = screen.getByText('Submit');
    fireEvent.click(submitBtn);

    expect(sendNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customValue: 'Arabic',
        type: 'sms',
      })
    );
  });

  it('closes modal on cancel', () => {
    render(<BillMonthlySummary />);
    const smsBtn = screen.getByText('Resend Minibill SMS');
    fireEvent.click(smsBtn);
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(screen.queryByText('Resend to: 0501234567')).not.toBeInTheDocument();
  });

  it('does not render DataPanel if permission is missing', () => {
    jest.mock('../../../hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));
    render(<BillMonthlySummary />);
    expect(screen.queryByText('Monthly Bill / Invoice Summary')).not.toBeInTheDocument();
  });
});