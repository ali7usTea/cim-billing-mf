import axios from "axios";
import { FlatRow } from "cim-ui-components";
import { toast } from "sonner";

const getPrimaryCustomer = (Customers: any) =>
  Customers[Object.keys(Customers)[0]] || {};

interface NotificationParams {
  Customers: any;
  selectedRow: FlatRow | null;
  customValue?: string; // This is the email OR mobile from your shadcn input
  url: string;
  type: "email" | "sms";
}

export const sendNotification = async ({
  Customers,
  selectedRow,
  customValue,
  url,
  type
}: NotificationParams) => {
  const customer = getPrimaryCustomer(Customers);
  if (!selectedRow) return;

  // Formatting date from "31-10-2018 08:00:00 PM" -> "10-31" (or similar based on reverse)
  const dateStr = String(selectedRow["GetBillMonthlySummary.INVOICE_DATE"]);
  const formattedDate = dateStr
    .split(" ")[0]
    .split("-")
    .slice(0, 2)
    .reverse()
    .join("-");

  const commonData = {
    accountNumber: customer.accountNumber,
    invoiceDate: formattedDate,
    invoiceNumber: selectedRow["GetBillMonthlySummary.INVOICE_NUMBER"],
    NAME: `Bill Invoice # ${selectedRow["GetBillMonthlySummary.INVOICE_NUMBER"]}`,
    fileType: "pdf"
  };

  const notificationMap = {
    email: {
      actionCode: "SendBillingEmail",
      email: customValue?.trim().length ? customValue : customer.ebillEmail,
      notificationId: "cim.invoice.cns.email.notification.id",
      templateId: "cim.invoice.cns.email.template.id",
      notificationCode: "cim.invoice.cns.email.notification.code"
    },
    sms: {
      actionCode: "SendBillingSMS",
      action: "SendSMS",
      mobile: customValue?.trim().length ? customValue : customer.contactNumber,
      notificationId: "cim.invoice.cns.sms.notification.id",
      templateId: "cim.invoice.cns.sms.template.id",
      notificationCode: "cim.invoice.cns.sms.notification.code"
    }
  };

  const payload = { ...commonData, ...notificationMap[type] };

  try {
    await axios.post(url, payload);
    toast.success("Confirmed", {
      description: `Sent ${type} successfully.`
    });
  } catch (error) {
    console.error(`Error sending ${type}:`, error);
    toast.error("Error", { description: `Unable to send the ${type}.` });
  }
};
