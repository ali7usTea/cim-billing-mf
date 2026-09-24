"use client";

import React from "react";
import { DataPanel } from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import DateSearch from "../../../components/DateSearch";
import {
  getDates,
  getMaxStartDate,
  getMinStartDate
} from "../../../../utils/helpers";
import {
  add3Months,
  calculateLastDateOf6thMonth
} from "../../../../utils/dateCalculation";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_PARTY_ADJUSTMENT_AND_TRANSFER_PAGE = 'app.main.Pages.PartyAdjustmentAndTransfer';

const initialStartDate = getDates().startDate;
const initialEndDate = getDates().endDate;

const PartyAdjustmentAndTransfer: React.FunctionComponent = () => {
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
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const { checkGroupPermissionExists } = usePermissionChecker();
  // clientLogger.info(`${LOGGER_PARTY_ADJUSTMENT_AND_TRANSFER_PAGE}:Rendering PartyAdjustmentAndTransfer Page Details`);

  const handleSearch = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    const loadData = (globalThis as any)?.GetBillingAdjustmentsPartyLoadData;
    loadData?.();
  };

  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      autoPublish={true}
      headerTitle="Adjustment detailed History"
      // className="widgetWrapper"
      showRefreshButton={false}
      api={`${proxyURL}/GetBillingAdjustmentsParty`}
      queryParams={{
        partyId: Customers[Object.keys(Customers)[0]]?.partyID,
        TRANSACTION_DATE_END: endDate,
        TRANSACTION_DATE_START: startDate,
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      shouldRender={checkGroupPermissionExists("Adjust_detail_history")}
      viewLayout="table"
      debugMode={!!isDebugMode}
    >
      <div className="flex items-center justify-end">
        <DateSearch
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
      </div>
    </DataPanel>
  );
};

export default PartyAdjustmentAndTransfer;
