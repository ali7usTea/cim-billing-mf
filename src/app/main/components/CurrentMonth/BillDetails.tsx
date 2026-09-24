"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataPanel } from "cim-ui-components";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { debugReportURL, proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
// import { clientLogger } from '../../../clientLogger';

// const LOGGER_BillDetails_PAGE = 'app.main.Pages.Current Month.Bill Details';

const BillDetails: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const firstCustomer = Customers[Object.keys(Customers)[0]];

  const accountId = firstCustomer?.accountID;
  const isDebugMode = firstCustomer?.debugReport;

  const { checkGroupPermissionExists } = usePermissionChecker();

  // 1. Define the fetcher function outside or inside the component
  const fetchBillingData = async (accountId: string, isDebugMode: boolean) => {
    const { data } = await axios.get(`${proxyURL}/custom/billdetails`, {
      params: { accountId, isDebugMode }
    });

    const billing = data?.data;

    // Process PLAN_MONTHLY_RENTAL_DETAILS
    const planRows = billing?.PLAN_MONTHLY_RENTAL_DETAILS?.rows || [];
    billing.TOTAL_PLAN_MONTHLY_RENTAL_DETAILS = planRows
      .reduce((total: number, row: any) => {
        return (
          total +
          parseFloat(row["GetBillingDetails.RENTAL_AMOUNT"]?.value || "0")
        );
      }, 0)
      .toFixed(2);

    // Process ADDONS_RENTAL_DETAILS
    const addonRows = billing?.ADDONS_RENTAL_DETAILS?.rows || [];
    billing.TOTAL_ADDONS_RENTAL_DETAILS = addonRows
      .reduce((total: number, row: any) => {
        return (
          total +
          parseFloat(row["GetBillingDetails.RENTAL_AMOUNT"]?.value || "0")
        );
      }, 0)
      .toFixed(2);

    return { billing, refId: data?.refId };
  };

  // 2. Inside your component
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [`${proxyURL}/custom/billdetails`, accountId, isDebugMode],
    queryFn: () => fetchBillingData(accountId, !!isDebugMode),
    enabled: !!accountId // Only run if accountId exists
  });

  // Destructure from the data object returned by useQuery
  const { billing: billingDetails, refId: refIdBillingDetails } = data || {};

  const {
    ADDONS_RENTAL_DETAILS,
    ADJ_AND_REFUND_DETAILS,
    FREE_USAGE,
    ONE_TIME_CHARGES_DETAILS,
    OUT_OF_BUNDLE_INFO,
    PAYMENT_DETAILS,
    PLAN_MONTHLY_RENTAL_DETAILS,
    TOTAL_PAYMENT_DETAILS,
    TOTAL_ADJ_REFUND_DETAILS,
    TOTAL_ONE_TIME_CHARGES_DETAILS,
    // TOTAL_DISCOUNT_AMOUNT,
    // TOTAL_USAGE_DETAILS,
    // TOTAL_RENTAL_DETAILS,
    TOTAL_PLAN_MONTHLY_RENTAL_DETAILS,
    TOTAL_ADDONS_RENTAL_DETAILS
  } = billingDetails || {};

  const [usageTotals, setUsageTotals] = React.useState({
    TOTAL_INTERNATIONAL_USAGE_DETAILS: "0",
    TOTAL_NATIONAL_USAGE_DETAILS: "0"
  });

  React.useEffect(() => {
    const targetDiv = document.querySelector('div[title="usage-details"]');
    if (!targetDiv) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const tables = targetDiv.querySelectorAll("table");
          if (tables.length >= 2) {
            const [internationalTable, nationalTable] = tables;

            const calculateTotal = (table: HTMLTableElement) => {
              const rows = table.querySelectorAll("tbody tr");
              return Array.from(rows).reduce((total, row) => {
                const amountCell = row.querySelector(
                  'td[data-header="Amount (Usage Charges Outside The Plan)"]'
                );
                const amount = parseFloat(amountCell?.textContent || "0");
                return total + amount;
              }, 0);
            };

            const internationalTotal = calculateTotal(internationalTable);
            const nationalTotal = calculateTotal(nationalTable);

            setUsageTotals({
              TOTAL_INTERNATIONAL_USAGE_DETAILS: internationalTotal.toFixed(2),
              TOTAL_NATIONAL_USAGE_DETAILS: nationalTotal.toFixed(2)
            });
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(targetDiv);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      title="cms-bill-details"
      className="cms-bill-details flex flex-col gap-4"
    >
      {/* <p className='flex font-semibold text-xs'>Payments And Adjustments (One Off)</p> */}
      <DataPanel
        autoPublish={true}
        // titleAttribute="payment-and-adjustments"
        // api={`${proxyURL}/GetBillingDetails`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Payment Details, Adjustment And Refund Details"
        shouldRender={checkGroupPermissionExists("Payment_detail_history")}
        panelData={{ PAYMENT_DETAILS, ADJ_AND_REFUND_DETAILS }}
        panelDataRefId={refIdBillingDetails!}
        viewLayout="table"
        debugMode={!!isDebugMode}
        multiLayoutHeaderText="Payments And Adjustments (One Off)"
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        footerLabels={[
          `Total = ${TOTAL_PAYMENT_DETAILS}`,
          `Total = ${TOTAL_ADJ_REFUND_DETAILS}`
        ]}
        debugRoute={`${debugReportURL}?query=custom/billdetails?accountId=${
          Customers[Object.keys(Customers)[0]]?.accountID
        }`}
      />

      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetBillingDetails`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Plan Monthly Rental, Add-ons Rental"
        shouldRender={checkGroupPermissionExists("billDetails_PnlGrp")}
        panelData={{
          PLAN_MONTHLY_RENTAL_DETAILS,
          ADDONS_RENTAL_DETAILS
        }}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        panelDataRefId={refIdBillingDetails}
        viewLayout="table"
        debugMode={!!isDebugMode}
        multiLayoutHeaderText="Recurring Charges"
        footerLabels={[
          `Total = ${TOTAL_PLAN_MONTHLY_RENTAL_DETAILS}`,
          `Total = ${TOTAL_ADDONS_RENTAL_DETAILS}`
        ]}
        debugRoute={`${debugReportURL}?query=custom/billdetails?accountId=${
          Customers[Object.keys(Customers)[0]]?.accountID
        }`}
      />

      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetBillingDetails`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="One Time Charges Details"
        shouldRender={checkGroupPermissionExists("billDetails_PnlGrp")}
        panelData={{ ONE_TIME_CHARGES_DETAILS }}
        panelDataRefId={refIdBillingDetails}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        viewLayout="table"
        debugMode={!!isDebugMode}
        multiLayoutHeaderText="One Time Charges"
        footerLabels={[`Total = ${TOTAL_ONE_TIME_CHARGES_DETAILS}`]}
        debugRoute={`${debugReportURL}?query=custom/billdetails?accountId=${
          Customers[Object.keys(Customers)[0]]?.accountID
        }`}
      />

      <DataPanel
        autoPublish={true}
        showRefreshButton={true}
        api={`${proxyURL}/custom/getUsageDetails`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="International Calls And Usages, National Calls And Usages"
        shouldRender={checkGroupPermissionExists("usageDetailsPnlGrp")}
        viewLayout="table"
        debugMode={!!isDebugMode}
        multiLayoutHeaderText="Usage Details"
        footerLabels={[
          `Total = ${usageTotals["TOTAL_INTERNATIONAL_USAGE_DETAILS"]}`,
          `Total = ${usageTotals["TOTAL_NATIONAL_USAGE_DETAILS"]}`
        ]}
      />

      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetBillingDetails`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Free Usage, Out Of Bundle Info"
        shouldRender={checkGroupPermissionExists("billDetails_PnlGrp")}
        panelData={{ FREE_USAGE, OUT_OF_BUNDLE_INFO }}
        panelDataRefId={refIdBillingDetails}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        viewLayout="table"
        debugMode={!!isDebugMode}
        multiLayoutHeaderText="Free Usage And Out Of Bundle Info"
        debugRoute={`${debugReportURL}?query=custom/billdetails?accountId=${
          Customers[Object.keys(Customers)[0]]?.accountID
        }`}
      />
    </div>
  );
};

export default BillDetails;
