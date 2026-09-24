import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { sendNotification } from "../../../../utils/NotificationUtils";
import { toast } from "sonner";
import axios from "axios";
import InvoiceDetailsModal from "./InvoiceDetailsModal";
import BillMonthPopupOptionSelector, {
  BillMonthOption
} from "./BillMonthPopupOptionSelector";
import BillMonthPopupLanguageSelector from "./BillMonthPopupLanguageSelector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  CellContext,
  DataPanel,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FlatRow,
  RowValue
} from "cim-ui-components";
import { MoreHorizontalIcon } from "../../../icons/MoreHorizontalIcon";

type ModalMode = "DETAILS" | "EMAIL" | "SMS" | "DOWNLOAD" | null;

export default function BillMonthlySummary() {
  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const customer = Customers[Object.keys(Customers)[0]];
  const isDebugMode = customer?.debugReport;
  const { checkGroupPermissionExists } = usePermissionChecker();

  // --- State Management ---
  const [activeMode, setActiveMode] = useState<ModalMode>(null);
  const [currentRow, setCurrentRow] = useState<FlatRow | null>(null);

  const [selectedOption, setSelectedOption] = useState<BillMonthOption>(
    "SendCurrentSummaryInvoiceToEBillEmail"
  );
  const [customContactValue, setCustomContactValue] = useState<string>("");

  // --- Business Logic ---
  const handleDownload = async (data: any) => {
    const dateParts = data["GetBillMonthlySummary.INVOICE_DATE"]
      .split(" ")[0]
      .split("-");
    const formattedDate = `${dateParts[2]}-${dateParts[1]}`;
    try {
      const { data: res } = await axios.get(
        `${proxyURL}/custom/billpath?INVOICE_DATE=${formattedDate}&INVOICE_NUMBER=${data["GetBillMonthlySummary.INVOICE_NUMBER"]}`
      );
      if (res?.data?.BILL_PATH) {
        window.open(
          `${import.meta.env.CONTEXT_PATH}/${res.data.BILL_PATH}`,
          "_blank",
          "noreferrer"
        );
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Download Failed", {
        description: "Unable to retrieve invoice path."
      });
    }
  };

  const handleAction = () => {
    const url = `${proxyURL}/custom/sendBillingEmail?action=SendBillingEmail&actionCode=SendBillingEmail`;

    // Determine what value to send based on user selection
    // If 'SendToDifferentEmail' is picked, we send the customContactValue state
    const valueToSend =
      activeMode === "EMAIL" && selectedOption === "SendToDifferentEmail"
        ? customContactValue
        : activeMode === "SMS"
        ? selectedOption // This would be 'Arabic' or 'English'
        : "";

    if (activeMode === "EMAIL") {
      sendNotification({
        Customers,
        selectedRow: currentRow,
        customValue: valueToSend, // <--- DATA GOES HERE
        url,
        type: "email"
      });
    } else if (activeMode === "SMS") {
      sendNotification({
        Customers,
        selectedRow: currentRow,
        customValue: valueToSend, // <--- DATA GOES HERE
        url,
        type: "sms"
      });
    } else if (activeMode === "DOWNLOAD") {
      handleDownload(currentRow);
    }

    // RESET
    setActiveMode(null);
    setCustomContactValue("");
    setSelectedOption(
      activeMode === "SMS" ? "Arabic" : "SendCurrentSummaryInvoiceToEBillEmail"
    );
  };

  // --- Sub-components for Table ---
  const ActionMenu = ({ row }: CellContext<FlatRow, RowValue>) => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original);
            setActiveMode("DETAILS");
          }}
        >
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original);
            setActiveMode("DOWNLOAD");
          }}
        >
          Download eBill PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original);
            setActiveMode("EMAIL");
          }}
        >
          Resend eBill Email
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original);
            setActiveMode("SMS");
          }}
        >
          Resend Minibill SMS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <DataPanel
        showXlsExport
        autoPublish={true}
        api={`${proxyURL}/GetBillMonthlySummary`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Monthly Bill / Invoice Summary"
        shouldRender={checkGroupPermissionExists("monthlyBill")}
        viewLayout="table"
        debugMode={!!isDebugMode}
        leadingColumns={[
          {
            title: "Options",
            component: ActionMenu
          }
        ]}
      />

      {/* Unified Modal Handler (Shadcn Alert Dialog) */}
      <AlertDialog
        open={!!activeMode && activeMode !== "DETAILS"}
        onOpenChange={() => setActiveMode(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              {activeMode === "EMAIL" &&
                `Resend to email: ${customer?.ebillEmail}`}
              {activeMode === "SMS" && `Resend to: ${customer?.contactNumber}`}
              {activeMode === "DOWNLOAD" &&
                "Are you sure you want to download this invoice?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Conditional Content based on Mode */}
          {activeMode === "EMAIL" && (
            <BillMonthPopupOptionSelector
              selectedOption={selectedOption}
              onOptionChange={setSelectedOption}
              emailValue={customContactValue}
              onEmailChange={setCustomContactValue}
            />
          )}

          {activeMode === "SMS" && (
            <BillMonthPopupLanguageSelector
              value={selectedOption}
              onChange={setSelectedOption}
            />
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Standard Modal for Details */}
      <InvoiceDetailsModal
        selectedInvoice={activeMode === "DETAILS" ? currentRow : null}
        setSelectedInvoice={(val) => !val && setActiveMode(null)}
      />
    </>
  );
}
