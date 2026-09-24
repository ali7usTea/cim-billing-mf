"use client";

import React from "react";
import {
  Button,
  DataPanel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "cim-ui-components";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
// const LOGGER_BILL_BUSINESS_SUMMARY_PAGE = 'app.main.Pages.Bill Business Summary Page';

const BusinessSummaryBillDetail: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const [monthList, setMonthList] = React.useState<
    { monthName: string; monthValue: string }[]
  >([]);
  const [selectMonth, setSelectMonth] = React.useState<{
    monthName: string;
    monthValue: string;
  }>();
  const [invoiceMainDetailHeading, setInvoiceMainDetailHeading] =
    React.useState("");
  const [billSummaryHeading, setBillSummaryHeading] = React.useState("");
  const [paymentHeading, setPaymentHeading] = React.useState("");
  const [linkAccountHeading, setLinkAccountHeading] = React.useState("");
  const { checkGroupPermissionExists } = usePermissionChecker();

  const handleDateChange = (
    value:
      | {
          monthName: string;
          monthValue: string;
        }
      | undefined
  ) => {
    setSelectMonth(value);
    setInvoiceMainDetailHeading(`${value?.monthName} - Invoice Main Details`);
    setBillSummaryHeading(`${value?.monthName} - Bill Summary`);
    setPaymentHeading(`${value?.monthName} - Payments`);
    setLinkAccountHeading(`Linked Accounts as of ${value?.monthName}`);
  };
  const handleButtonClick = () => {};
  const handleSendEmail = () => {
    /* validate billing first grid data must not be null */
    console.log("send email clicked.");
  };
  const handleDownloadBill = () => {
    /* validate billing first grid data must not be null */
    console.log("download bill clicked.");
  };
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  React.useEffect(() => {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    // Loop for the last 24 months (2 years)
    for (let i = currentMonth; i >= 0; i--) {
      // Add the month and year to the months array
      months.push({
        monthName: `${monthNames[i]} ${currentYear}`,
        monthValue: `${i + 1}-${currentYear}` // Month value in "MM-YYYY" format
      });
    }

    // Set the months list
    setMonthList(months);
  }, [
    selectMonth,
    invoiceMainDetailHeading,
    billSummaryHeading,
    paymentHeading,
    linkAccountHeading
  ]);

  return (
    <div className="flex flex-col gap-4">
      <DataPanel
        autoPublish={true}
        showRefreshButton={true}
        api={`${proxyURL}/GetBSAAccountDetails`}
        queryParams={{
          accountId: Customers[Object.keys(Customers)[0]]?.accountID,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Main Details"
        // titleAttribute="Main-detail-tab"
        shouldRender={checkGroupPermissionExists(
          "billSummaryAccountMainDetailsPnlGrp"
        )}
        viewLayout="grid"
        debugMode={!!isDebugMode}
      />
      <div className="flex items-center justify-end  gap-2">
        <label htmlFor="monthLbl" className="text-xs whitespace-nowrap">Billing Month</label>
        <Select
         value={selectMonth?.monthName}
          onValueChange={(value) => {
            const month = monthList.find((m) => m.monthName === value);
            if (month) handleDateChange(month);
          }}
        >
          <SelectTrigger >
            <SelectValue placeholder="Select a Month" />
          </SelectTrigger>
          <SelectContent>
            {monthList.map((m) => (
              <SelectItem key={m.monthName} value={m.monthName}>
                {m.monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleButtonClick}>Invoice Inquery</Button>
      </div>

      {/* <h4>Invoice Inquery</h4> */}
      {/* Invoice Main Details */}
      <DataPanel
        autoPublish={true}
        showRefreshButton={true}
        api={`${proxyURL}/bsainvoiceinquiry`}
        queryParams={{
          accountId: Customers[Object.keys(Customers)[0]]?.accountID,
          noOfRecords: Customers[Object.keys(Customers)[0]]?.noOfRecords,
          OVERRIDE_FLAG: Customers[Object.keys(Customers)[0]]?.overrideFlag,
          BILLING_MONTH: selectMonth?.monthValue,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Invoice MainDetail"
        // titleAttribute="invoiceMainDetail"
        shouldRender={checkGroupPermissionExists(
          "bsaInvoiceInquiryPnlGrpUpdater"
        )}
        viewLayout="table"
        debugMode={!!isDebugMode}
      />
      {/* Bill Summary */}
      <>
        <DataPanel
          autoPublish={true}
          showRefreshButton={true}
          api={`${proxyURL}/`}
          queryParams={{
            accountId: Customers[Object.keys(Customers)[0]]?.accountID,
            ...(isDebugMode ? { isDebugMode } : {})
          }}
          headerTitle="Bill Summary"
          // titleAttribute="bill-summary"
          shouldRender={checkGroupPermissionExists(
            "bsaInvoiceInquiryPnlGrpUpdater"
          )}
          viewLayout="table"
          debugMode={!!isDebugMode}
        />
        <div className="flex gap-4">
          <Button onClick={handleSendEmail}>Send eMail</Button>
          <Button onClick={handleDownloadBill}>Download Summary Bill</Button>
        </div>
      </>

      {/* Payments */}
      <DataPanel
        autoPublish={true}
        showRefreshButton={true}
        api={`${proxyURL}/`}
        queryParams={{
          accountId: Customers[Object.keys(Customers)[0]]?.accountID,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Payment"
        // titleAttribute="Invoice_details"
        shouldRender={checkGroupPermissionExists(
          "bsaInvoiceInquiryPnlGrpUpdater"
        )}
        viewLayout="table"
        debugMode={!!isDebugMode}
      />

      {/* confirmDialog need to add line=1363 */}

      {/* Linked Accounts as of */}
      <>
        <DataPanel
          autoPublish={true}
          showRefreshButton={true}
          api={`${proxyURL}/`}
          queryParams={{
            accountId: Customers[Object.keys(Customers)[0]]?.accountID,
            // noOfRecords: Customers[Object.keys(Customers)[0]]?.noOfRecords,
            // OVERRIDE_FLAG: Customers[Object.keys(Customers)[0]]?.overrideFlag,
            // BILLING_MONTH: selectMonth,
            ...(isDebugMode ? { isDebugMode } : {})
          }}
          headerTitle="Invoice Details"
          // titleAttribute="Invoice_details"
          shouldRender={checkGroupPermissionExists(
            "bsaInvoiceInquiryPnlGrpUpdater"
          )}
          viewLayout="table"
          debugMode={!!isDebugMode}
        />
        <div className="flex gap-4">
          <Button onClick={handleSendEmail}>Send eMail</Button>
        </div>
      </>

      {/* <div className='widgetWrapper' title="invoice_inquery_bttn">
                {
                    <InvoiceInqueryBttn />
                }
            </div> */}
    </div>
  );
};

export default BusinessSummaryBillDetail;
