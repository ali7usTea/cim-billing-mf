"use client";

import React from "react";
import { useSelector } from "react-redux";
import { Button, DataPanel } from "cim-ui-components";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import { selectCustomer } from "../../../../redux/customer/customerSlice";
import {
  formatDateForParams,
  getDates,
  getMaxStartDate,
  getMinStartDate
} from "../../../../utils/helpers";
import DateSearch from "../../../components/DateSearch";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_CMSACCOUNT_PAGE = 'app.main.Pages.SMS_ACCOUNT_DETAILS';

const initialStartDate = getDates(3).startDate;
const initialEndDate = getDates().endDate;

const DirectDebit = () => {
  const { Customers } = useSelector(selectCustomer);

  const { checkGroupPermissionExists } = usePermissionChecker();
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      headerTitle="Direct Debit Account Information"
      // titleAttribute="cim-debit-direct"
      showRefreshButton={false}
      autoPublish={true}
      api={`${proxyURL}/GetDirectDebitAutoPayInfo`}
      queryParams={{
        accountnumber: Customers[Object.keys(Customers)[0]]?.accountNumber,
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      shouldRender={checkGroupPermissionExists("directDebitAccountDtls_pnlGrp")}
      viewLayout="table"
      debugMode={!!isDebugMode}
    />
  );
};

const AutoPay = () => {
  const { Customers } = useSelector(selectCustomer);

  // Validate initial dates for display
  const validStartDate = initialStartDate && initialStartDate instanceof Date && !isNaN(initialStartDate.getTime())
    ? initialStartDate
    : new Date();
  const validEndDate = initialEndDate && initialEndDate instanceof Date && !isNaN(initialEndDate.getTime())
    ? initialEndDate
    : new Date();

  // State stores ISO strings from DateSearch callback
  const [startDate, setStartDate] = React.useState<string>(validStartDate.toISOString());
  const [endDate, setEndDate] = React.useState<string>(validEndDate.toISOString());
  const { checkGroupPermissionExists } = usePermissionChecker();

  const handleSearch = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    const loadData = (globalThis as any)?.GetAutopayAndDirectDebitLoadData;
    loadData?.();
  };
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      headerTitle="AutoPay & Direct Debit History"
      // titleAttribute="cim-autopay"
      showRefreshButton={false}
      autoPublish={false}
      api={`${proxyURL}/GetAutopayAndDirectDebit`}
      queryParams={{
        accountId: Object.keys(Customers)[0],
        endDate: formatDateForParams(endDate),
        startDate: formatDateForParams(startDate),
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      shouldRender={checkGroupPermissionExists("autoPay_pnlGrp")}
      viewLayout="table"
      debugMode={!!isDebugMode}
    >
      <DateSearch
        gap={3}
        startDateProps={{
          minDate: () => getMinStartDate(),
          maxDate: () => getMaxStartDate()
        }}
        endDateProps={{
          minDate: (start) => start,
          maxDate: () => getDates().endDate
        }}
        initialStartDate={initialStartDate}
        initialEndDate={initialEndDate}
        onSearch={handleSearch}
      />
    </DataPanel>
  );
};

const AutoPayAndDirectDebit: React.FunctionComponent = () => {
  const { checkGroupPermissionExists } = usePermissionChecker();

  return (
    <div className="flex flex-col gap-4" title="cim-directdebit-autopay">
      {checkGroupPermissionExists("transferCall_Btn") && (
        <div className="flex justify-end">
          <Button data-testid>Transfer for AutoPay</Button>
        </div>
      )}

      <DirectDebit />

      <AutoPay />
    </div>
  );
};

export default AutoPayAndDirectDebit;
