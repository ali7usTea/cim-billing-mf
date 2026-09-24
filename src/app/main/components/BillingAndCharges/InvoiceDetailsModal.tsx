import InvoideDetailsModalTabs from "./InvoiceDetails";
import { getMonthRange } from "../../../../utils/dateCalculation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FlatRow
} from "cim-ui-components";

const InvoiceDetailsModal = ({
  selectedInvoice,
  setSelectedInvoice
}: {
  selectedInvoice: FlatRow | null;
  setSelectedInvoice: (val: FlatRow | null) => void;
}) => {
  const visible = !!selectedInvoice;
  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => !open && setSelectedInvoice(null)}
    >
      {/* max-w-5xl is roughly equivalent to 70vw on standard screens */}
      <DialogContent className="sm:max-w-5xl w-[70vw]">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>

        <div className="m-0">
          {selectedInvoice?.["GetBillMonthlySummary.INVOICE_DATE"] && (
            <p className="px-2 py-1 mb-1 text-sm">
              {getMonthRange(
                `${
                  selectedInvoice?.["GetBillMonthlySummary.INVOICE_DATE"] || ""
                }`
              )}
            </p>
          )}
          <InvoideDetailsModalTabs selectedInvoice={selectedInvoice} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsModal;
