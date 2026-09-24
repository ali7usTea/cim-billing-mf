import axios from "axios";
import {
  Button,
  DataPanel,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "cim-ui-components";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "../../../../redux/store";
import { formatDateForParams } from "../../../../utils/helpers";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import { HomeIcon } from "../../../icons/HomeIcon";

// Types
export type SharingType = "Email" | "SMS" | null;

interface SendEmailOrSMSProps {
  sharingType: SharingType;
  setSharingType: (value: SharingType | null) => void;
  startDate: string;
  endDate: string;
  excludeColumns: string[];
}

const LANGUAGE_OPTIONS = [
  { label: "English", disabled: false },
  { label: "Arabic", disabled: false },
  { label: "Urdu", disabled: true },
  { label: "Hindi", disabled: true },
  { label: "Malayalam", disabled: true }
];

export default function SendEmailOrSMS({
  sharingType,
  setSharingType,
  startDate,
  endDate,
  excludeColumns
}: SendEmailOrSMSProps) {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { checkGroupPermissionExists } = usePermissionChecker();
  const customer = Customers[Object.keys(Customers)[0]];

  const isDebugMode = customer?.debugReport;

  // Logic: API Call
  const handleSend = async () => {
    try {
      await axios.post(`${proxyURL}/sendSMSEmailPaymentNotification`, {
        notificationType: sharingType,
        emailAddress: customer?.customerEmail,
        contactNumber: customer?.contactNumber,
        accountID: customer?.accountID,
        externalTransactionCode:
          selectedInvoice?.["GetBillingPaymentHistory.REF_NUMBER"]
      });

      toast.success("Success", {
        description: "Notification sent successfully"
      });
      setSharingType(null); // Close on success
    } catch (error: any) {
      toast.error("Error", {
        description: error?.response?.data?.message || "Failed to send."
      });
    }
  };

  const isOpen = sharingType !== null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && setSharingType(null)}
    >
      <DialogContent className="sm:max-w-[70vw] w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex gap-3 items-center">
            <HomeIcon className="size-6" />
            <span>{sharingType} Notification</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Language Toggle */}
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium">Language:</span>
            <div className="flex -space-x-px">
              {LANGUAGE_OPTIONS.map((lang) => (
                <Button
                  key={lang.label}
                  variant={
                    selectedLanguage === lang.label ? "default" : "outline"
                  }
                  size="sm"
                  disabled={lang.disabled}
                  onClick={() => setSelectedLanguage(lang.label)}
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                >
                  {lang.label}
                </Button>
              ))}
            </div>
          </div>

          <DataPanel
            showXlsExport={true}
            autoPublish
            api={`${proxyURL}/GetBillingPaymentHistory`}
            queryParams={{
              TRANSACTION_DATE_END: formatDateForParams(endDate),
              TRANSACTION_DATE_START: formatDateForParams(startDate),
              KEY: customer?.key,
              VALUE: customer?.value,
              ...(customer?.debugReport ? { isDebugMode: true } : {})
            }}
            shouldRender={checkGroupPermissionExists(
              "paymentDetailedHistoryPanel"
            )}
            selectedRows={selectedInvoice}
            setSelectedRows={setSelectedInvoice}
            viewLayout="table"
            debugMode={!!isDebugMode}
            showRefreshButton={false}
            excludeColumns={excludeColumns}
          />

          <div className="flex justify-end pt-4">
            <Button onClick={handleSend} disabled={!selectedInvoice}>
              Send {sharingType}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
