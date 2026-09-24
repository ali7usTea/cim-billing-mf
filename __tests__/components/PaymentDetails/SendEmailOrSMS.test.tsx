import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SendEmailOrSMS from '../../../src/app/main/components/PaymentDetails/SendEmailOrSMS';

// Mock cim-ui-components for isolation
jest.mock('cim-ui-components', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  DataPanel: ({
    shouldRender,
    setSelectedRows,
    selectedRows,
    excludeColumns,
  }: any) =>
    shouldRender ? (
      <div>
        <div>DataPanelMock</div>
        <button
          data-testid="select-invoice"
          onClick={() =>
            setSelectedRows({
              "GetBillingPaymentHistory.REF_NUMBER": "INV123",
            })
          }
        >
          SelectInvoiceMock
        </button>
      </div>
    ) : null,
  Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

// Mock HomeIcon
jest.mock('../../../src/app/icons/HomeIcon', () => ({
  HomeIcon: () => <span>HomeIconMock</span>,
}));

// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    Customers: {
      customer1: {
        customerEmail: 'test@email.com',
        contactNumber: '0501234567',
        accountID: 'ACC123',
        key: 'PARTY_ID',
        value: 'PARTY123',
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

// Mock helpers
jest.mock('../../../src/utils/helpers', () => ({
  formatDateForParams: (date: string) => date,
}));

// Mock axios and toast
const axiosPostMock = jest.fn(() => Promise.resolve({}));
jest.mock('axios', () => ({
  post: axiosPostMock,
}));
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

describe('SendEmailOrSMS Component', () => {
  const setSharingTypeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog and DataPanel when sharingType is set', () => {
    render(
      <SendEmailOrSMS
        sharingType="Email"
        setSharingType={setSharingTypeMock}
        startDate="2024-01-01"
        endDate="2024-01-31"
        excludeColumns={[]}
      />
    );
    expect(screen.getByText('Email Notification')).toBeInTheDocument();
    expect(screen.getByText('DataPanelMock')).toBeInTheDocument();
    expect(screen.getByText('Language:')).toBeInTheDocument();
    expect(screen.getByText('Send Email')).toBeInTheDocument();
  });

  it('renders language buttons and allows selection', () => {
    render(
      <SendEmailOrSMS
        sharingType="SMS"
        setSharingType={setSharingTypeMock}
        startDate="2024-01-01"
        endDate="2024-01-31"
        excludeColumns={[]}
      />
    );
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Arabic')).toBeInTheDocument();
    expect(screen.getByText('Urdu')).toBeInTheDocument();
    expect(screen.getByText('Hindi')).toBeInTheDocument();
    expect(screen.getByText('Malayalam')).toBeInTheDocument();

    const arabicBtn = screen.getByText('Arabic');
    fireEvent.click(arabicBtn);
    expect(arabicBtn).toBeEnabled();
  });

  it('disables Send button if no invoice is selected, enables after invoice selection', () => {
    render(
      <SendEmailOrSMS
        sharingType="SMS"
        setSharingType={setSharingTypeMock}
        startDate="2024-01-01"
        endDate="2024-01-31"
        excludeColumns={[]}
      />
    );
    const sendBtn = screen.getByText('Send SMS');
    expect(sendBtn).toBeDisabled();

    // Simulate invoice selection
    fireEvent.click(screen.getByTestId('select-invoice'));
    expect(sendBtn).toBeEnabled();
  });

  it('calls axios and toast on Send, closes dialog on success', async () => {
    render(
      <SendEmailOrSMS
        sharingType="Email"
        setSharingType={setSharingTypeMock}
        startDate="2024-01-01"
        endDate="2024-01-31"
        excludeColumns={[]}
      />
    );
    // Select invoice to enable Send button
    fireEvent.click(screen.getByTestId('select-invoice'));
    const sendBtn = screen.getByText('Send Email');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(axiosPostMock).toHaveBeenCalledWith(
        'http://mock-proxy-url/sendSMSEmailPaymentNotification',
        expect.objectContaining({
          notificationType: 'Email',
          emailAddress: 'test@email.com',
          contactNumber: '0501234567',
          accountID: 'ACC123',
          externalTransactionCode: 'INV123',
        })
      );
      expect(toastSuccessMock).toHaveBeenCalledWith('Success', {
        description: 'Notification sent successfully',
      });
      expect(setSharingTypeMock).toHaveBeenCalledWith(null);
    });
  });

  it('calls toast.error on send failure', async () => {
    axiosPostMock.mockRejectedValueOnce({
      response: { data: { message: 'Failed to send.' } },
    });

    render(
      <SendEmailOrSMS
        sharingType="SMS"
        setSharingType={setSharingTypeMock}
        startDate="2024-01-01"
        endDate="2024-01-31"
        excludeColumns={[]}
      />
    );
    fireEvent.click(screen.getByTestId('select-invoice'));
    const sendBtn = screen.getByText('Send SMS');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Error', {
        description: 'Failed to send.',
      });
    });
  });

  it('does not render dialog when sharingType is null', () => {
    render(
      <SendEmailOrSMS
        sharingType={null}
        setSharingType={setSharingTypeMock}
        startDate="2024-01-01"
        endDate="2024-01-31"
        excludeColumns={[]}
      />
    );
    expect(screen.queryByText('Email Notification')).not.toBeInTheDocument();
    expect(screen.queryByText('SMS Notification')).not.toBeInTheDocument();
  });
});