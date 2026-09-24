"use client";

import React from "react";
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
  FlatRow,
  RowValue
} from "cim-ui-components";
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
import axios from "axios";
import { toast } from "sonner";
import { EyeIcon } from "../../../icons/EyeIcon";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_CMSACCOUNT_PAGE = 'app.main.Pages.SMS_ACCOUNT_DETAILS';

const initialStartDate = getDates().startDate;
const initialEndDate = getDates().endDate;

const ChannelPaymentTransactionHistory: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const customer = Customers[Object.keys(Customers)[0]];

  const { checkGroupPermissionExists } = usePermissionChecker();

  // Validate initial dates
  const validStartDate = initialStartDate && initialStartDate instanceof Date && !isNaN(initialStartDate.getTime())
    ? initialStartDate
    : new Date();
  const validEndDate = initialEndDate && initialEndDate instanceof Date && !isNaN(initialEndDate.getTime())
    ? initialEndDate
    : add3Months(new Date());

  const [startDate, setStartDate] = React.useState<string>(validStartDate.toISOString());
  const [endDate, setEndDate] = React.useState<string>(validEndDate.toISOString());
  const isDebugMode = customer?.debugReport;

  // EPG Transaction Details state
  const [epgParams, setEpgParams] = React.useState<{
    TransactionID: string;
    Channel: string;
  } | null>(null);

  // Hybrid Prepaid Balance dialog state
  const [hybridDialogOpen, setHybridDialogOpen] = React.useState(false);
  const [amountForBillAdjustment, setAmountForBillAdjustment] =
    React.useState<string | null>(null);
  const [hybridRow, setHybridRow] = React.useState<FlatRow | null>(null);

  const isHybridOrPostpaid =
    customer?.productType === "2" || customer?.productType === "3";
  const isNotBSA = customer?.productCode !== "BSA";

  const handleSearch = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    (globalThis as any).GetChannelPaymentTransactionHistoryLoadData();
  };

  React.useEffect(() => {
    const loadData = (globalThis as any)?.GetBillingAdjustmentsLoadData;
    loadData?.();
    return () => {
      if (loadData?.cancel) {
        loadData.cancel();
      }
    };
  }, [startDate, endDate]);

  // EPG Transaction Details handler
  const handleEpgDetails = (epgTransactionId: string, channel: string) => {
    setEpgParams({ TransactionID: epgTransactionId, Channel: channel });
  };

  // Deduct Virtual Prepaid Hybrid Balance handler
  const handleDeductVirtualBalance = async (row: FlatRow) => {
    try {
      const { data } = await axios.get(
        `${proxyURL}/GetRechargeDetails`,
        {
          params: {
            accountnumber:
              row["GetChannelPaymentTransactionHistory.ACCOUNT_NUMBER"],
            noOfRecords: 0,
            amount: row["GetChannelPaymentTransactionHistory.AMOUNT"],
            dateAndTime:
              row["GetChannelPaymentTransactionHistory.CREATION_DATE"],
            actionCode: "GetRechargeDetails",
            action: "GetRechargeDetails"
          }
        }
      );
      const rows =
        data?.data?.GetRechargeDetails_MainTable?.rows;
      const adjustmentAmount =
        rows?.[0]?.["GetRechargeDetails.AMOUNT_FOR_BILL_ADJUSTMENT"]?.value ??
        null;
      setAmountForBillAdjustment(adjustmentAmount);
      setHybridRow(row);
      setHybridDialogOpen(true);
    } catch {
      toast.error("Error", {
        description: "Failed to fetch recharge details."
      });
    }
  };

  const handleConfirmAdjustment = async () => {
    if (!hybridRow || !amountForBillAdjustment) return;
    try {
      const { data } = await axios.get(
        `${proxyURL}/custom/getAdjustOutstandingAmount`,
        {
          params: {
            subscriberNumber: Object.keys(Customers)[0],
            adjustmentAmountRelative:
              hybridRow["GetChannelPaymentTransactionHistory.AMOUNT"],
            amountForBillAdjustment,
            user: customer?.userName,
            region: customer?.regionCode,
            preferredLanguage: customer?.preferredLanguage,
            accountType: isHybridOrPostpaid ? "Postpaid" : "Prepaid",
            actionCode: "GetAdjustOutstandingAmount",
            action: "GetAdjustOutstandingAmount"
          }
        }
      );
      const status = data?.data?.GET_ADJUST_OUTSTANDING_AMOUNT_STATUS;
      if (status === "SUCCESS") {
        toast.success("Success", {
          description: "Adjustment submitted successfully."
        });
      } else {
        toast.error("Failed", {
          description: "Adjustment was not successful."
        });
      }
    } catch {
      toast.error("Error", {
        description: "Failed to submit adjustment."
      });
    } finally {
      setHybridDialogOpen(false);
      setHybridRow(null);
      setAmountForBillAdjustment(null);
    }
  };

  // Leading columns
  const leadingColumns = React.useMemo(() => {
    const columns: Array<{ title: string; component: any }> = [
      {
        title: "EPG transaction details",
        component: ({ row }: CellContext<FlatRow, RowValue>) => {
          const epgId =
            row.original[
              "GetChannelPaymentTransactionHistory.EPG_TRANSACTION_ID"
            ];
          if (!epgId) return null;
          return (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="View EPG transaction details"
              onClick={() =>
                handleEpgDetails(
                  epgId as string,
                  row.original[
                    "GetChannelPaymentTransactionHistory.CHANNEL"
                  ] as string
                )
              }
            >
              <EyeIcon className="size-4" />
            </Button>
          );
        }
      }
    ];

    if (isHybridOrPostpaid && isNotBSA) {
      columns.push({
        title: "Deduct the Virtual Prepaid Hybrid balance",
        component: ({ row }: CellContext<FlatRow, RowValue>) => {
          const accountNumber =
            row.original[
              "GetChannelPaymentTransactionHistory.ACCOUNT_NUMBER"
            ];
          if (!accountNumber) return null;
          if (
            !checkGroupPermissionExists(
              "actionColVirtualBalance"
            )
          )
            return null;
          return (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Deduct the Virtual Prepaid Hybrid balance"
              onClick={() => handleDeductVirtualBalance(row.original)}
            >
              <EyeIcon className="size-4" />
            </Button>
          );
        }
      });
    }

    return columns;
  }, [isHybridOrPostpaid, isNotBSA]);

  return (
    <>
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetChannelPaymentTransactionHistory`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          TRANSACTION_DATE_END: formatDateForParams(endDate),
          TRANSACTION_DATE_START: formatDateForParams(startDate),
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Channels Payment Transaction History"
        shouldRender={checkGroupPermissionExists(
          "channelsPaymentTransactionHistoryPanel"
        )}
        viewLayout="table"
        debugMode={!!isDebugMode}
        showXlsExport
        leadingColumns={leadingColumns}
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

      {/* EPG Transaction Details Panel */}
      {epgParams && (
        <DataPanel
          autoPublish={true}
          api={`${proxyURL}/custom/getEpgTransactionDetails`}
          queryParams={{
            ...epgParams,
            ...(isDebugMode ? { isDebugMode } : {})
          }}
          headerTitle="EPG Transaction Details"
          shouldRender={checkGroupPermissionExists("epgTransactionDetailsPanel")}
          viewLayout="grid"
        />
      )}

      {/* Hybrid Prepaid Balance Confirmation Dialog */}
      <AlertDialog open={hybridDialogOpen} onOpenChange={setHybridDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deduct the Virtual Prepaid Hybrid balance
            </AlertDialogTitle>
            <AlertDialogDescription>
              Customer is eligible of AED {amountForBillAdjustment} to Adjust to
              Outstanding Amount.
              <br />
              Please confirm to proceed, or cancel to abort.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAdjustment}
              disabled={!amountForBillAdjustment}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChannelPaymentTransactionHistory;
