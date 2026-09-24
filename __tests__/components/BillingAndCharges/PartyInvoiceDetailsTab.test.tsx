import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PartyInvoiceDetailsTab from '../../../src/app/main/components/BillingAndCharges/PartyInvoiceDetailsTab';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Button: ({ onClick, children }: any) => (
    <button data-testid="download-btn" onClick={onClick}>{children}</button>
  ),
  Select: ({ children, value, onValueChange }: any) => (
    <select
      data-testid="select"
      value={value}
      onChange={e => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <span>{children}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
}));

// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock proxyURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'mock-proxy-url',
}));

// Mock axios
const axiosMock = {
  get: jest.fn(),
};
jest.mock('axios', () => axiosMock);

describe('PartyInvoiceDetailsTab', () => {
  beforeEach(() => {
    // Mock Customers data
    require('react-redux').useSelector.mockReturnValue({
      Customers: {
        customer1: {
          partyID: 'party123',
        },
      },
    });
    // Mock API for billing months
    axiosMock.get.mockImplementation((url) => {
      if (url === 'mock-proxy-url/custom/prepaidInvoicesDates') {
        return Promise.resolve({
          data: [
            { code: '202406', description: 'June 2024' },
            { code: '202405', description: 'May 2024' },
          ],
        });
      }
      // Mock download API
      if (url.startsWith('mock-proxy-url/custom/downloadPrepaidVATStatement')) {
        return Promise.resolve({
          data: new Blob(['PDF content']),
        });
      }
      return Promise.resolve({ data: [] });
    });
    // Mock window.URL and document.createElement for download
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();
    document.createElement = jest.fn(() => {
      /* const a = document.createElementOrig ? document.createElementOrig('a') : document.createElement('a'); */
      const a = document.createElement('a');
      a.click = jest.fn();
      a.setAttribute = jest.fn();
      a.href = '';
      return a;
    });
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders and fetches billing months', async () => {
    render(<PartyInvoiceDetailsTab />);
    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeInTheDocument();
      expect(screen.getByTestId('download-btn')).toBeInTheDocument();
      // Check that options are rendered
      expect(screen.getByText('June 2024')).toBeInTheDocument();
      expect(screen.getByText('May 2024')).toBeInTheDocument();
    });
  });

  it('allows selecting a month and triggers download', async () => {
    render(<PartyInvoiceDetailsTab />);
    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });
    // Change selection to May 2024
    fireEvent.change(screen.getByTestId('select'), { target: { value: '202405' } });
    // Click download button
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringContaining('mock-proxy-url/custom/downloadPrepaidVATStatement?partyId=party123&BILL_MONTH=202405'),
        expect.objectContaining({ responseType: 'blob' })
      );
    });
  });

  it('does not trigger download if no month is selected', async () => {
    render(<PartyInvoiceDetailsTab />);
    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });
    // Deselect all months
    fireEvent.change(screen.getByTestId('select'), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      // Should not call download API
      expect(axiosMock.get).toHaveBeenCalledTimes(1); // Only for months fetch
    });
  });
});