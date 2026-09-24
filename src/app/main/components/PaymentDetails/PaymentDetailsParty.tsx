"use client";

import React from "react";
import { DataPanel } from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import {
  formatDateForParams,
  getDates,
  getMaxStartDate,
  getMinStartDate
} from "../../../../utils/helpers";
import {
  add3Months,
  calculateLastDateOf6thMonth
} from "../../../../utils/dateCalculation";
import DateSearch from "../../../components/DateSearch";
import ChannelPaymentTransactionHistory from "./ChannelPaymentTransactionHistory";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_PAGE = 'app.main.Pages.SMS_ACCOUNT_DETAILS';

const initialStartDate = getDates().startDate;
const initialEndDate = getDates().endDate;

const PaymentDetailsParty: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const { checkGroupPermissionExists } = usePermissionChecker();

  // Validate initial dates for display
  const validStartDate = initialStartDate && initialStartDate instanceof Date && !isNaN(initialStartDate.getTime())
    ? initialStartDate
    : new Date();
  const validEndDate = initialEndDate && initialEndDate instanceof Date && !isNaN(initialEndDate.getTime())
    ? initialEndDate
    : add3Months(new Date());

  // State stores ISO strings from DateSearch callback
  const [startDate, setStartDate] = React.useState<string>(validStartDate.toISOString());
  const [endDate, setEndDate] = React.useState<string>(validEndDate.toISOString());

  const handleSearch = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    (globalThis as any).GetBillingPaymentHistoryLoadData();
  };

  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
  // clientLogger.info(`${LOGGER_PAGE}:Rendering CMS Account Details`);

  return (
    <div title="cms-account-details" className="flex flex-col gap-4">
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetBillingPaymentHistory`}
        queryParams={{
          KEY: "PARTY_ID",
          VALUE: Customers[Object.keys(Customers)[0]]?.partyID,
          TRANSACTION_DATE_END: formatDateForParams(endDate),
          TRANSACTION_DATE_START: formatDateForParams(startDate),
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Payment Detailed history"
        // titleattribute="cms-account-details"
        shouldRender={checkGroupPermissionExists("paymentDetailedHistoryPanel")}
        viewLayout="table"
        debugMode={!!isDebugMode}
      >
        <DateSearch
          gap={2}
          startDateProps={{
            minDate: () => getMinStartDate(),
            maxDate: () => getMaxStartDate()
          }}
          endDateProps={{
            minDate: (start) => start,
            maxDate: (start) => calculateLastDateOf6thMonth(start)
          }}
          initialStartDate={initialStartDate}
          initialEndDate={initialEndDate}
          onSearch={handleSearch}
        />
      </DataPanel>
      <ChannelPaymentTransactionHistory />
    </div>
  );
};

export default PaymentDetailsParty;
