import { render, screen, fireEvent } from '@testing-library/react';
import InvoiceDetailsModal from '../../../src/app/main/components/BillingAndCharges/InvoiceDetailsModal';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Dialog: ({ open, onOpenChange, children }: any) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  FlatRow: {},
}));

// Mock InvoiceDetailsModalTabs : InvoiceDetails
jest.mock('../../../src/app/main/components/BillingAndCharges/InvoiceDetails', () => <div data-testid="invoice-details-tabs">TabsContent</div>);

// Mock getMonthRange utility : utils/dateCalculation
jest.mock('../../../src/utils/dateCalculation', () => ({
  getMonthRange: (date: string) => `MonthRange: ${date}`,
}));

describe('InvoiceDetailsModal', () => {
  const sampleInvoice = {
    "GetBillMonthlySummary.INVOICE_DATE": "2024-06-01",
    // other properties as needed
  };

  it('renders modal when selectedInvoice is provided', () => {
    render(
      <InvoiceDetailsModal
        selectedInvoice={sampleInvoice}
        setSelectedInvoice={() => {}}
      />
    );
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Invoice Details');
    expect(screen.getByTestId('invoice-details-tabs')).toBeInTheDocument();
    expect(screen.getByText('MonthRange: 2024-06-01')).toBeInTheDocument();
  });

  it('does not render modal when selectedInvoice is null', () => {
    render(
      <InvoiceDetailsModal
        selectedInvoice={null}
        setSelectedInvoice={() => {}}
      />
    );
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('calls setSelectedInvoice(null) when Dialog is closed', () => {
    const setSelectedInvoiceMock = jest.fn();
    // Simulate Dialog's onOpenChange
    const Dialog = require('cim-ui-components').Dialog;
    render(
      <InvoiceDetailsModal
        selectedInvoice={sampleInvoice}
        setSelectedInvoice={setSelectedInvoiceMock}
      />
    );
    // Simulate closing the dialog
    Dialog({ open: true, onOpenChange: (open: boolean) => !open && setSelectedInvoiceMock(null), children: null });
    expect(setSelectedInvoiceMock).toHaveBeenCalledWith(null);
  });
});