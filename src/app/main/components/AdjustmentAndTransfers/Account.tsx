"use client";

import {
  DataPanel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "cim-ui-components";
import React from "react";
import { useSelector } from "react-redux";
import { selectCustomer } from "../../../../redux/customer/customerSlice";
import {
  add3Months,
  calculateLastDateOf6thMonth
} from "../../../../utils/dateCalculation";
import {
  formatDateForParams,
  getDates,
  getMaxStartDate,
  getMinStartDate
} from "../../../../utils/helpers";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import DateSearch from "../../../components/DateSearch";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import AddAdjustment from "./AddAdjustment/AddAdjustment";

// import { clientLogger } from '../../../clientLogger';
// const LOGGER_PARTY_ADJUSTMENT_AND_TRANSFER_PAGE = 'app.main.Pages.PartyAdjustmentAndTransfer';

const initialStartDate = getDates().startDate;
const initialEndDate = getDates().endDate;

const BillingDetails = () => {
  const { Customers } = useSelector(selectCustomer);

  const excludeColumns: string[] = [
    "GetBillingAdjustments.REFERENCE_NUMBER",
    "GetBillingAdjustments.ADJ_CHARGE_CODE",
    "GetBillingAdjustments.CREATED_USER_ID",
    "GetBillingAdjustments.ADJ_REASON_CODE",
    "GetBillingAdjustments.ADJ_REASON_CODE",
    "GetBillingAdjustments.ORG_REGION_NAME",
    "GetBillingAdjustments.APPROVED_BY",
    "GetBillingAdjustments.ADJ_CODE",
    "GetBillingAdjustments.INVOICE_NO",
    "GetBillingAdjustments.ADJUSTMENT_PERIOD_FROM",
    "GetBillingAdjustments.ADJUSTMENT_PERIOD_TO",
    "GetBillingAdjustments.DOP_TYPE_OF_ACTIVITY",
    "GetBillingAdjustments.RATEPLAN_CODE",
    "GetBillingAdjustments.REFUND_USER",
    "GetBillingAdjustments.REFUND_DATE",
    "GetBillingAdjustments.REFUND_STORE"
  ];

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
  const { checkGroupPermissionExists } = usePermissionChecker();
  // clientLogger.info(`${LOGGER_PARTY_ADJUSTMENT_AND_TRANSFER_PAGE}:Rendering PartyAdjustmentAndTransfer Page Details`);

  const handleSearch = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    const loadData = (globalThis as any)?.GetBillingAdjustmentsLoadData;
    loadData?.();
  };

  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  const rowExpansionTemplate = (data: any) => {
    const subData = [
      {
        REF_NUMBER: data["GetBillingAdjustments.REFERENCE_NUMBER"],
        CHARGE_CODE: data["GetBillingAdjustments.ADJ_CHARGE_CODE"],
        ADJUSTMENT_BY: data["GetBillingAdjustments.CREATED_USER_ID"],
        REASON: data["GetBillingAdjustments.ADJ_REASON_CODE"],
        CHARGE_CODE_DESC: data["GetBillingAdjustments.ADJ_REASON_CODE"],
        ADJUSTMENT_REGION_NAME: data["GetBillingAdjustments.ORG_REGION_NAME"],
        APPROVED_BY: data["GetBillingAdjustments.APPROVED_BY"],
        CODE: data["GetBillingAdjustments.ADJ_CODE"],
        INVOICE_NUMBER: data["GetBillingAdjustments.INVOICE_NO"],
        ADJUSTMENT_PERIOD_FROM:
          data["GetBillingAdjustments.ADJUSTMENT_PERIOD_FROM"],
        ADJUSTMENT_PERIOD_TO:
          data["GetBillingAdjustments.ADJUSTMENT_PERIOD_TO"],
        DOP_TYPE_OF_ACTIVITY:
          data["GetBillingAdjustments.DOP_TYPE_OF_ACTIVITY"],
        RATEPLAN_CODE: data["GetBillingAdjustments.RATEPLAN_CODE"],
        REFUNDED_BY: data["GetBillingAdjustments.REFUND_USER"],
        REFUNDED_ON: data["GetBillingAdjustments.REFUND_DATE"],
        REFUNDING_STORE: data["GetBillingAdjustments.REFUND_STORE"]
      }
    ];
    const columns = (
      subData.length > 0 ? Object.keys(subData[0]) : []
    ) as (keyof (typeof subData)[number])[];

    return (
      <div className="p-3">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{col.replace(/_/g, " ")}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {subData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col) => (
                    <TableCell key={col}>{row[col]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };
  return (
    <DataPanel
      autoPublish={true}
      showRefreshButton={false}
      api={`${proxyURL}/GetBillingAdjustments`}
      rowExpansionTemplate={rowExpansionTemplate}
      excludeColumns={excludeColumns}
      queryParams={{
        accountId: Object.keys(Customers)[0],
        TRANSACTION_DATE_END: formatDateForParams(endDate),
        TRANSACTION_DATE_START: formatDateForParams(startDate),
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      headerTitle="Adjustment detailed History"
      // className="widgetWrapper gap-2 flex flex-col"
      shouldRender={checkGroupPermissionExists("Adjust_detail_history")}
      viewLayout="table"
      debugMode={!!isDebugMode}
      showXlsExport
    >
      <div className="flex items-center justify-end gap-2">
        <DateSearch
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
        <AddAdjustment />
      </div>
    </DataPanel>
  );
};
const IBTDetailsHistory = () => {
  const { Customers } = useSelector(selectCustomer);
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
    const loadData = (globalThis as any)?.GetIBTDetailsLoadData;
    loadData?.();
  };
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      headerTitle="IBT Details History"
      // className="widgetWrapper"
      autoPublish={true}
      showRefreshButton={false}
      api={`${proxyURL}/GetIBTDetails`}
      queryParams={{
        accountnumber: Customers[Object.keys(Customers)[0]]?.accountNumber,
        endDate: formatDateForParams(endDate),
        startDate: formatDateForParams(startDate),
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      shouldRender={checkGroupPermissionExists(
        "IBTDetailsHistoryGroupAccPanel"
      )}
      viewLayout="table"
      debugMode={!!isDebugMode}
    >
      <DateSearch
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
const TrangloIBTDetailsHistory = () => {
  const { Customers } = useSelector(selectCustomer);
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
    const loadData = (globalThis as any)?.GetTrangloIBTDetailsHistoryLoadData;
    loadData?.();
  };
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      headerTitle="Tranglo IBT Details History"
      autoPublish={true}
      // className="widgetWrapper"
      showRefreshButton={false}
      api={`${proxyURL}/GetTrangloIBTDetailsHistory`}
      queryParams={{
        accountnumber: Customers[Object.keys(Customers)[0]]?.accountNumber,
        endDate: formatDateForParams(endDate),
        startDate: formatDateForParams(startDate),
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      shouldRender={checkGroupPermissionExists(
        "TrangloIBTDetailsHistoryGroupAccPanel"
      )}
      viewLayout="table"
      debugMode={!!isDebugMode}
    >
      <DateSearch
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

const PrepaidRefundInfo = () => {
  const { Customers } = useSelector(selectCustomer);
  const { checkGroupPermissionExists } = usePermissionChecker();
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      showXlsExport
      headerTitle="Prepaid Refund Info"
      showRefreshButton={true}
      autoPublish={true}
      api={`${proxyURL}/GetPrepaidRefundInfoForBilling`}
      queryParams={{
        accountId: Object.keys(Customers)[0],
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      shouldRender={checkGroupPermissionExists("prepaidRefundInfoGpnl")}
      viewLayout="table"
      debugMode={!!isDebugMode}
    />
  );
};

const UsedEVoucher = () => {
  const { Customers } = useSelector(selectCustomer);
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
    const loadData = (globalThis as any)?.GetBillingUsedEVoucherHistoryLoadData;
    loadData?.();
  };
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      headerTitle="Use EVoucher History"
      // className="widgetWrapper"
      autoPublish={true}
      showRefreshButton={false}
      api={`${proxyURL}/GetBillingUsedEVoucherHistory`}
      queryParams={{
        accountnumber: Customers[Object.keys(Customers)[0]]?.accountNumber,
        endDate: formatDateForParams(endDate),
        startDate: formatDateForParams(startDate),
        actionCode: "GetBillingUsedEVoucherHistory",
        action: "GetBillingUsedEVoucherHistory",
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      shouldRender={checkGroupPermissionExists("Used_EVoucher_historyAccPanel")}
      viewLayout="table"
      debugMode={!!isDebugMode}
    >
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
    </DataPanel>
  );
};
const UBTDetailsHistory = () => {
  const { Customers } = useSelector(selectCustomer);
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
  const [page, _setPage] = React.useState<number>(0);

  const handleSearch = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    const loadData = (globalThis as any)?.GetUBTTransactionsLoadData;
    loadData?.();
    (globalThis as any).GetUBTTransactionsLoadData();
  };

  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      headerTitle="UBT Details History"
      autoPublish={true}
      showRefreshButton={false}
      api={`${proxyURL}/GetUBTTransactions`}
      queryParams={{
        accountnumber: Customers[Object.keys(Customers)[0]]?.accountNumber,
        TRANSACTION_DATE_END: formatDateForParams(endDate),
        TRANSACTION_DATE_START: formatDateForParams(startDate),
        actionCode: "GetUBTTransactions",
        PAGE: page,
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      shouldRender={checkGroupPermissionExists(
        "UBTDetailsHistoryGroupAccPanel"
      )}
      viewLayout="table"
      debugMode={!!isDebugMode}
    >
      <DateSearch
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
const DBTDetailsHistory = () => {
  const { Customers } = useSelector(selectCustomer);
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
  const [page, _setPage] = React.useState<number>(0);

  const handleSearch = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    const loadData = (globalThis as any)?.GetDBTTransactionsLoadData;
    loadData?.();
  };
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      headerTitle="DBT Details History"
      autoPublish={true}
      showRefreshButton={false}
      api={`${proxyURL}/GetDBTTransactions`}
      queryParams={{
        accountnumber: Customers[Object.keys(Customers)[0]]?.accountNumber,
        TRANSACTION_DATE_END: formatDateForParams(endDate),
        TRANSACTION_DATE_START: formatDateForParams(startDate),
        PAGE: page,
        actionCode: "GetDBTTransactions",
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      shouldRender={checkGroupPermissionExists(
        "DBTDetailsHistoryGroupAccPanel"
      )}
      viewLayout="table"
      debugMode={!!isDebugMode}
    >
      <div className="flex justify-end items-center">
        <DateSearch
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
      </div>
    </DataPanel>
  );
};

// const SplitBill = () => {
//   const adiaTypes = ["BENEFICIARY", "PAYEE"];
//   const { Customers } = useSelector(selectCustomer);
//   const { checkGroupPermissionExists } = usePermissionChecker();
//   const op = React.useRef<OverlayPanel>(null);
//   const [type, setType] = React.useState(adiaTypes[0]);
//   const switchType = () => {
//     setType((currentType) =>
//       currentType === adiaTypes[0] ? adiaTypes[1] : adiaTypes[0]
//     );
//   };
//   const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
//   const isAdiaType =
//     checkGroupPermissionExists("SplitBillGroup") &&
//     Customers[Object.keys(Customers)[0]]?.customerID &&
//     Customers[Object.keys(Customers)[0]]?.isMobile &&
//     !Customers[Object.keys(Customers)[0]]?.isWasel;
//   const ACCOUNT_NUMBER = (e: React.SyntheticEvent) => {
//     op.current?.toggle(e);
//     console.log("Record Clicked");
//   };
//   const cities = [
//     { name: "AUTO", code: "AUTO" },
//     { name: "ACCOUNT", code: "ACCOUNT" },
//     { name: "Record", code: ACCOUNT_NUMBER }
//   ];

//   const preColumn2 = (data: any) => (
//     <>
//       Check
//       <i
//         className="pi pi-eye flex justify-center text-yellow-600"
//         onClick={(e) => op.current?.toggle(e)}
//       ></i>
//       {/* <EyeIcon /> */}
//       <OverlayPanel
//         pt={{
//           content: { className: "p-0" }
//         }}
//         ref={op}
//         style={{ padding: "0px !important" }}
//         // display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center',
//       >
//         <ListBox
//           onChange={(e) => e.value.code(e, data)}
//           options={cities}
//           optionLabel="name"
//           className="w-full md:w-14rem"
//         />
//       </OverlayPanel>
//     </>
//   );
//   return null;
// };

const AccordionsDetails = () => {
  return (
    <>
      <UsedEVoucher />
      <UBTDetailsHistory />
      <DBTDetailsHistory />
      <IBTDetailsHistory />
      <TrangloIBTDetailsHistory />
      <PrepaidRefundInfo />
    </>
  );
};

const AccountAdjustmentAndTransfer: React.FunctionComponent = () => {
  return (
    <div title="cim-adjust-transfer" className=" flex flex-col gap-4 cim-adjust-transfer">
      <BillingDetails />
      <AccordionsDetails />
      {/* <SplitBill /> */}
    </div>
  );
};

export default AccountAdjustmentAndTransfer;
