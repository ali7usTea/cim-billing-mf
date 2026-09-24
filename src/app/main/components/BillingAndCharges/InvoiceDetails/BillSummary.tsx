import { DataPanel } from "cim-ui-components";
import { proxyURL } from "../../../../../utils/lib/proxyAPI";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { usePermissionChecker } from "../../../../hooks/usePermissionChecker";
import { getMonthYearCode } from "../../../../../utils/dateCalculation";

export interface IBillSummaryProps {
  selectedInvoice?: any;
}

function BillSummary({ selectedInvoice }: IBillSummaryProps) {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
  const { checkGroupPermissionExists } = usePermissionChecker();
  const dataOrder = [
    {
      title: "",
      dataHeader: "GetBillSummary_MainTable",
      dataType: "table"
    },
    { title: "", dataHeader: "BILL_PERIOD_DETAILS", dataType: "table" },
    {
      title: "",
      dataHeader: "BILL_PERIOD_TOTAL_AMOUNTS_DETAILS",
      dataType: "grid"
    }
  ];
  return (
    <>
      {selectedInvoice ? (
        <DataPanel
          autoPublish={true}
          api={`${proxyURL}/custom/getBillSummary`}
          queryParams={{
            accountId: Object.keys(Customers)[0],
            ...(isDebugMode ? { isDebugMode } : {}),
            BILL_DATE: getMonthYearCode(
              selectedInvoice?.["GetBillMonthlySummary.INVOICE_DATE"]
            )
          }}
          shouldRender={checkGroupPermissionExists(
            "previousBillSummaryOverviewTbl"
          )}
          viewLayout="table,grid"
          debugMode={!!isDebugMode}
          defaultSortOrder={dataOrder}
        />
      ) : (
        ""
      )}
    </>
  );
}

export default BillSummary;
