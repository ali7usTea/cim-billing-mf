"use client";

import React from "react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "cim-ui-components";
import axios from "axios";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
// const API_ENDPOINT = `${proxyURL}/custom/getVATPrepaidInvoice`;

interface MonthData {
  code: string;
  description: string;
}

const PartyInvoiceDetailsTab: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const [billingMonths, setBillingMonths] = React.useState<MonthData[]>([]);
  const [selectedMonth, setSelectedMonth] = React.useState<MonthData | null>(
    null
  ); /* State for selected value */
  /* Fetch data from the API when the component mounts */
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${proxyURL}/custom/prepaidInvoicesDates`
        );
        setBillingMonths(
          response.data
        ); /* Assume response.data is an array of options */
        setSelectedMonth(response.data?.[0]);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const generatePrepaidInvoice = async () => {
    const partyId = Customers[Object.keys(Customers)[0]]?.partyID;

    if (!selectedMonth) return;

    const code = selectedMonth.code;

    if (!code) return;

    try {
      const response = await axios.get(
        `${proxyURL}/custom/downloadPrepaidVATStatement?partyId=${partyId}&BILL_MONTH=${code}`,
        {
          responseType: "blob"
        }
      );

      // create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // create a tempory <a> tag to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PartyInvoice-${partyId}-${code}.pdf`);
      document.body.appendChild(link);
      link.click();

      // clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF: ", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 widgetWrapper">
      <div className="flex justify-between items-center">
      <p className="extraTitle text-xs">
        Click below button to download prepaid VAT invoice.
      </p>
      <div className="general_action_area flex items-center justify-end gap-2">
        <label className="mr-1 text-xs" htmlFor="billingMonth">
          Billing Month
        </label>
        <Select
          id="billingMonth"
          value={selectedMonth?.code ?? ""} // Assumes 'id' is your unique key
          onValueChange={(val) =>
            setSelectedMonth(billingMonths.find(({ code }) => code === val) ?? null)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Month">
              {selectedMonth?.description}
              </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-fit">
            {billingMonths.map((month) => (
              <SelectItem key={month.code} value={month.code}>
                {month.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={generatePrepaidInvoice}>
          Download Prepaid VAT Invoice
        </Button>
      </div>
      </div>
    </div>
  );
};

export default PartyInvoiceDetailsTab;
