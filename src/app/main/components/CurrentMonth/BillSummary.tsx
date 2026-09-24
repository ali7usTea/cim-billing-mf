"use client";

import React from "react";
import { Button, ButtonGroup, DataPanel } from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_CMSACCOUNT_PAGE = 'app.main.Pages.SMS_ACCOUNT_DETAILS';

// eslint-disable-next-line react/display-name
const BillSummary: React.FunctionComponent = React.memo(() => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const [billMonth, setBillMonth] = React.useState<string | null>(null);
  const { checkGroupPermissionExists } = usePermissionChecker();
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
  // clientLogger.info(`${LOGGER_CMSACCOUNT_PAGE}:Rendering CMS Account Details`);

  function getLastMonth() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Months are 0-indexed (0 = January, 11 = December)
    const currentYear = currentDate.getFullYear();

    // Calculate last month
    const lastMonth = currentMonth === 0 ? 12 : currentMonth; // If January (0), set to December (12)
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear; // If January (0), decrement year

    // Format as MMYYYY
    const formattedLastMonth = `${lastMonth
      .toString()
      .padStart(2, "0")}${lastMonthYear}`;
    return formattedLastMonth;
  }
  const dataOrder = [
    { title: "", dataHeader: "GetBillSummary.Summary", dataType: "table" },
    {
      title: "Current Month Charges",
      dataHeader: "GetBillSummary.SummaryGrid",
      dataType: "grid"
    }
  ];
  return (
    <div className="flex flex-col gap-4">
      <DataPanel
        autoPublish={true}
        headerTitle="Unbilled Transactions" /* Fixit not showing on Billing app current month bill summary  */
        // titleAttribute="bill-summary-details"
        api={`${proxyURL}/custom/getBillSummary`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {}),
          ...(billMonth ? { BILL_DATE: billMonth } : {})
        }}
        shouldRender={checkGroupPermissionExists("unbilled_trans")}
        viewLayout="table"
        debugMode={!!isDebugMode}
        defaultSortOrder={dataOrder}
      />

      <ButtonGroup className="flex justify-end">
        <Button
          onClick={() => {
            setBillMonth(getLastMonth());
          }}
          size="sm"
        >
          View Last Bill Summary
        </Button>
        <Button size="sm"> Generate Current Invoice </Button>
        <Button size="sm"> Download Demanded Current Invoice </Button>
      </ButtonGroup>
    </div>
  );
});

export default BillSummary;
