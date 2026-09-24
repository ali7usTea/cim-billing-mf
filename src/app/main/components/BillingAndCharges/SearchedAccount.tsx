"use client";

import {
  Button,
  CellContext,
  cn,
  DataPanel,
  FlatRow,
  RowValue
} from "cim-ui-components";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import { DesktopIcon } from "../../../icons/DesktopIcon";
import BillingGroupMemberDetails from "./BillingGroupMemberDetails";
import BillMonthlySummary from "./BillMonthlySummary";
import InvoiceSettings from "./InvoiceSettings";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_CMSACCOUNT_PAGE = 'app.main.Pages.SMS_ACCOUNT_DETAILS';

const SearchedAccount: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const { checkGroupPermissionExists } = usePermissionChecker();

  const [selectedMember, setSelectedMember] = useState<FlatRow>();

  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  const preColumn = (cellContext: CellContext<FlatRow, RowValue>) => {
    const handleRowSelect = ({
      row,
      table
    }: CellContext<FlatRow, RowValue>) => {
      // 1. Check if the row is already selected
      const isAlreadySelected = row.getIsSelected();

      // 2. Clear all previous selections across the table
      table.toggleAllRowsSelected(false);

      // 3. If it wasn't selected before, select it now (and update state)
      if (!isAlreadySelected) {
        row.toggleSelected(true);
        setSelectedMember(row.original);
      } else {
        // Optional: Clear state if the user is deselecting the active row
        setSelectedMember(undefined);
      }
    };
    return (
      <Button
        variant="ghost"
        size="icon"
        title="View Desktop"
        className={cn(
          "h-8 w-8 hover:bg-orange-50",
          cellContext.row.getIsSelected()
            ? "text-black hover:text-black"
            : "text-orange-500 hover:text-orange-600"
        )}
        onClick={() => handleRowSelect(cellContext)}
      >
        <DesktopIcon className="size-5" />
      </Button>
    );
  };
  return (
    <div title="searched-accounts" className="flex flex-col gap-4">
      <BillMonthlySummary />

      <DataPanel
        showXlsExport
        autoPublish={true}
        api={`${proxyURL}/GetFinancialTransactions`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Account Financial Transaction Details History"
        shouldRender={checkGroupPermissionExists("finance_history_details")}
        viewLayout="table"
        debugMode={!!isDebugMode}
      />

      <InvoiceSettings />

      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetBillGroupMembersInquiry`}
        queryParams={{
          partyId: Customers[Object.keys(Customers)[0]]?.partyID,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Billing Group Members"
        shouldRender={checkGroupPermissionExists("billingGroupDetails_Pnl")}
        viewLayout="table"
        debugMode={!!isDebugMode}
        leadingColumns={[
          {
            title: "Details",
            component: preColumn
          }
        ]}
      />

      <BillingGroupMemberDetails selectedMember={selectedMember} />
    </div>
  );
};

export default React.memo(() => <SearchedAccount />);
