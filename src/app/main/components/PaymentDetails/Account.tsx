"use client";

import React, { useState } from "react";
import {
  Button,
  DataPanel,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FlatRow,
  PanelData,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { debugReportURL, proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import ChannelPaymentTransactionHistory from "./ChannelPaymentTransactionHistory";
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
import SendEmailOrSMS, { SharingType } from "./SendEmailOrSMS";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ShareIcon } from "../../../icons/ShareIcon";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_PAGE = 'app.main.Pages.BillingChargesPaymnetDetails';

const initialStartDate = getDates().startDate;
const initialEndDate = getDates().endDate;
export const excludeColumns = [
  "GetBillingPaymentHistory.CARD_NUMBER",
  "GetBillingPaymentHistory.COMMENTS",
  "GetBillingPaymentHistory.PAID_THROUGH_ACCOUNT",
  "GetBillingPaymentHistory.ACCOUNT_NUMBER",
  "GetBillingPaymentHistory.INVOICE_ID",
  "GetBillingPaymentHistory.CREATED_USER_ID",
  "GetBillingPaymentHistory.AUTH_CODE",
  "GetBillingPaymentHistory.LOCATION",
  "GetBillingPaymentHistory.REGION_NAME",
  "GetBillingPaymentHistory.DUE_BEFORE_PAYMENT",
  "GetBillingPaymentHistory.PARTY_ID",
  "GetBillingPaymentHistory.DUE_AFTER_PAYMENT",
  "GetBillingPaymentHistory.REGION_CODE",
  "GetBillingPaymentHistory.CANCELLATION_REASON",
  "GetBillingPaymentHistory.PAYMENT_TRANSACTION_CODE",
  "GetBillingPaymentHistory.PAYMENT_UNIQUE_TRANS_CODE",
  "GetBillingPaymentHistory.BANK_CODE"
];
const BillingChargesPaymnetDetails: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const [sharingType, setSharingType] = useState<SharingType>(null);

  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  const dropdownTriggerRef = React.useRef<HTMLButtonElement>(null);

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
  // clientLogger.info(`${LOGGER_PAGE}:Rendering BillingChargesPaymnetDetails Details`);
  const {
    data: billingResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [
      `${proxyURL}/GetBillingPaymentHistory`,
      startDate,
      endDate,
      Customers,
      isDebugMode
    ],
    queryFn: async () => {
      const { data } = await axios.get<{ data: PanelData; refId: string }>(
        `${proxyURL}/GetBillingPaymentHistory`,
        {
          params: {
            TRANSACTION_DATE_END: formatDateForParams(endDate),
            TRANSACTION_DATE_START: formatDateForParams(startDate),
            KEY: "ACCOUNT_ID",
            VALUE: Customers[Object.keys(Customers)[0]]?.accountID,
            ...(isDebugMode ? { isDebugMode } : {})
          }
        }
      );
      return data;
    }
  });

  // Access values directly from the query object
  const billingPaymentDetails = billingResponse?.data;
  const refIdPaymentHistory = billingResponse?.refId;

  const handleSearch = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    refetch();
  };

  const handleShare = (type: Exclude<SharingType, null>) => {
    dropdownTriggerRef.current?.click();
    setSharingType(type);
    return;
  };

  const options = [
    {
      name: "Email",
      code: () => handleShare("Email")
    },
    {
      name: "SMS",
      code: () => handleShare("SMS")
    }
  ];

  const rowExpansionTemplate = (data: FlatRow) => {
    const subData = [
      {
        CARD_NUMBER: data["GetBillingPaymentHistory.CARD_NUMBER"],
        COMMENTS: data["GetBillingPaymentHistory.COMMENTS"],
        PAID_THROUGH_ACCOUNT:
          data["GetBillingPaymentHistory.PAID_THROUGH_ACCOUNT"],
        ACC_NUMBER: data["GetBillingPaymentHistory.ACCOUNT_NUMBER"],
        INVOICE_NUMBER: data["GetBillingPaymentHistory.INVOICE_ID"],
        CASHIER: data["GetBillingPaymentHistory.CREATED_USER_ID"],
        AUTH_CODE: data["GetBillingPaymentHistory.AUTH_CODE"],
        LOCATION: data["GetBillingPaymentHistory.LOCATION"],
        REGION_NAME: data["GetBillingPaymentHistory.REGION_NAME"],
        DUE_BEFORE_PAYMENT: data["GetBillingPaymentHistory.DUE_BEFORE_PAYMENT"],
        PARTY_ID: data["GetBillingPaymentHistory.PARTY_ID"],
        DUE_AFTER_PAYMENT: data["GetBillingPaymentHistory.DUE_AFTER_PAYMENT"],
        REGION_CODE: data["GetBillingPaymentHistory.REGION_CODE"],
        CANCELLATION_REASON:
          data["GetBillingPaymentHistory.CANCELLATION_REASON"],
        PAYMENT_TRANSACTION_CODE:
          data["GetBillingPaymentHistory.PAYMENT_TRANSACTION_CODE"],
        "Channel_Ref_#":
          data["GetBillingPaymentHistory.PAYMENT_UNIQUE_TRANS_CODE"],
        BANK_CODE: data["GetBillingPaymentHistory.BANK_CODE"]
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
    <div title="agreement-details" className="flex flex-col gap-4">
      <SendEmailOrSMS
        endDate={endDate}
        startDate={startDate}
        excludeColumns={excludeColumns}
        sharingType={sharingType}
        setSharingType={setSharingType}
      />
      <DataPanel
        autoPublish={true}
        headerTitle="Payment Detailed history"
        panelData={billingPaymentDetails ?? {}}
        isLoading={isLoading}
        error={error}
        panelDataRefId={refIdPaymentHistory}
        shouldRender={checkGroupPermissionExists("paymentDetailedHistoryPanel")}
        viewLayout="table"
        debugMode={!!isDebugMode}
        debugRoute={`${debugReportURL}?query=GetBillingPaymentHistory?TRANSACTION_DATE_END=${formatDateForParams(
          endDate
        )}?TRANSACTION_DATE_START=${formatDateForParams(
          startDate
        )}?KEY=ACCOUNT_ID?VALUE=${
          Customers[Object.keys(Customers)[0]]?.accountID
        }`}
        showRefreshButton={false}
        showXlsExport
        excludeColumns={excludeColumns}
        rowExpansionTemplate={rowExpansionTemplate}
        leadingColumns={[
          {
            title: "Options",
            component: () => (
              <DropdownMenu>
                <DropdownMenuTrigger
                  ref={dropdownTriggerRef}
                  render={<Button variant="ghost" />}
                >
                  <ShareIcon />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  {options.map((option) => (
                    <DropdownMenuItem key={option.name} onClick={option.code}>
                      {option.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        ]}
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

export default BillingChargesPaymnetDetails;
