import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InvoiceSettings from '../../../src/app/main/components/BillingAndCharges/InvoiceSettings';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, shouldRender }: any) =>
    shouldRender ? <div data-testid={`datapanel-${headerTitle}`}>{headerTitle}</div> : null,
  SplitButton: ({ options, children }: any) => (
    <div>
      <button data-testid={`splitbutton-${children}`}>{children}</button>
      {/* Simulate option buttons for testing */}
      {options.map((opt: any, idx: number) => (
        <button key={idx} data-testid={`splitbutton-option-${opt.label}`} onClick={opt.onClick}>
          {opt.label}
        </button>
      ))}
    </div>
  ),
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

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock axios
const axiosMock = {
  get: jest.fn(),
  post: jest.fn(),
};
jest.mock('axios', () => axiosMock);

// Mock proxyURL and debugReportURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'mock-proxy-url',
  debugReportURL: 'mock-debug-url',
}));

describe('InvoiceSettings', () => {
  beforeEach(() => {
    // Mock Customers data
    require('react-redux').useSelector.mockReturnValue({
      Customers: {
        customer1: {
          accountID: '12345',
          accountNumber: 'ACC123',
          userName: 'testuser',
          debugReport: false,
        },
      },
    });
    // Mock axios responses
    axiosMock.get.mockResolvedValue({ data: { data: {}, refId: 'ref123' } });
    axiosMock.post.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Invoice Preferences DataPanel and SplitButtons', async () => {
    render(<InvoiceSettings />);
    await waitFor(() => {
      expect(screen.getByTestId('datapanel-Invoice Preferences')).toBeInTheDocument();
      expect(screen.getByTestId('splitbutton-Template Update')).toBeInTheDocument();
      expect(screen.getByTestId('splitbutton-E-Bill')).toBeInTheDocument();
    });
  });

  it('calls sendTemplateRequest when Template Update option is clicked', async () => {
    render(<InvoiceSettings />);
    fireEvent.click(screen.getByTestId('splitbutton-option-Set Invoice Type Individual'));
    await waitFor(() => {
      expect(axiosMock.post).toHaveBeenCalledWith(
        'mock-proxy-url/FixInvoiceTemplate',
        expect.objectContaining({
          accountID: '12345',
          accountnumber: 'ACC123',
          userName: 'testuser',
          billing_email_template: 'FIX',
          invoice_media_code: 'PRINT',
          billing_ebill_type: 'I',
        }),
        expect.any(Object)
      );
    });
  });

  it('calls handleEbillRequest when E-Bill option is clicked', async () => {
    render(<InvoiceSettings />);
    fireEvent.click(screen.getByTestId('splitbutton-option-Disable/Skip E-Bill'));
    await waitFor(() => {
      expect(axiosMock.get).toHaveBeenCalledWith(
        'mock-proxy-url/UpdateEbillFlag',
        expect.objectContaining({
          params: expect.objectContaining({
            accountnumber: 'ACC123',
            accountID: '12345',
            userName: 'testuser',
            invoice_media_code: 'PRINT',
            skip_ebill: 'Y',
          }),
        })
      );
    });
  });

  it('renders Invoice Billing Address DataPanel when rows exist', async () => {
    // Mock data with rows
    axiosMock.get.mockResolvedValue({
      data: {
        data: {
          GetInvoicePreferences_MainTable: {
            rows: [
              {
                "GetInvoicePreferences.BILLING_ADDRESS_ID": { value: 'ADDR123' },
              },
            ],
          },
        },
        refId: 'ref123',
      },
    });
    render(<InvoiceSettings />);
    await waitFor(() => {
      expect(screen.getByTestId('datapanel-Invoice Billing Address')).toBeInTheDocument();
    });
  });
});