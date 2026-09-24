"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  DataPanel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import {
  generateMonths,
  generateYearList,
  IMonths
} from "../../../../utils/dateCalculation";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_VatStatementAgainstPartyLevel_PAGE = 'app.main.Pages.VatStatementAgainstPartyLevel';

const VatStatementAgainstPartyLevel: React.FC = () => {
  const monthList: IMonths[] = generateMonths();

  const yearList = generateYearList(2018);

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<IMonths | null>(null);
  const [monthYear, setMonthYear] = useState<string>("");

  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const { checkGroupPermissionExists } = usePermissionChecker();

  const customer = Customers[Object.keys(Customers)[0]];
  const isDebugMode = !!customer?.debugReport;

  // Initialize with current month and latest year
  useEffect(() => {
    const currentMonthName = new Date().toLocaleString("default", {
      month: "short"
    });
    const currentMonthData = monthList.find(
      (m) => m.monthName === currentMonthName
    );

    if (currentMonthData) setSelectedMonth(currentMonthData);
    if (yearList.length) setSelectedYear(`${yearList[yearList.length - 1]}`);
  }, []);

  const handleSearch = () => {
    if (selectedMonth && selectedYear) {
      // Logic: month number + year (e.g., "032024")
      const monthNum = selectedMonth.lastDate.split("-")[1];
      setMonthYear(`${monthNum}${selectedYear}`);

      // Safely call global function defined in declaration merging
      (window as any)?.getBCIMInvoiceVATDetailsLoadData?.();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2 ms-auto">
        <label className="text-xs">Month/Year</label>

        <Select
          value={selectedMonth?.monthName || ""}
          onValueChange={(name) => {
            const month = monthList.find((m) => m.monthName === name);
            setSelectedMonth(month || null);
          }}
        >
          <SelectTrigger>
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

        <Select
          value={selectedYear}
          onValueChange={(val) => setSelectedYear(`${val}`)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Year" />
          </SelectTrigger>
          <SelectContent>
            {yearList.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="max-w-25 w-full" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {monthYear && (
        <DataPanel
          autoPublish
          showRefreshButton={false}
          api={`${proxyURL}/custom/getBCIMInvoiceVATDetails`}
          queryParams={{
            partyId: customer?.partyID,
            BILL_MONTH: monthYear,
            actionCode: "GetVATPrepaidInvoice"
          }}
          headerTitle="-"
          shouldRender={checkGroupPermissionExists("vatDetails")}
          viewLayout="table"
          debugMode={isDebugMode}
          footerLabels={[`Total VAT Amount ( AED ) 0`, ``]}
        />
      )}
    </div>
  );
};

export default VatStatementAgainstPartyLevel;
