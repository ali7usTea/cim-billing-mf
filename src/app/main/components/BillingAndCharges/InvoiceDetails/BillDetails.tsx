import { DataPanel } from "cim-ui-components";
import { proxyURL } from "../../../../../utils/lib/proxyAPI";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { usePermissionChecker } from "../../../../hooks/usePermissionChecker";
import { getMonthYearCode } from "../../../../../utils/dateCalculation";

export interface IBillDetailsProps {
  selectedInvoice?: any;
}

function BillDetails({ selectedInvoice }: IBillDetailsProps) {
  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
  const { checkGroupPermissionExists } = usePermissionChecker();

  return (
    <>
      {selectedInvoice ? (
        <DataPanel
          autoPublish={true}
          api={`${proxyURL}/GetBillingDetails`}
          queryParams={{
            accountId: Object.keys(Customers)[0],
            ...(isDebugMode ? { isDebugMode } : {}),
            BILL_DATE: getMonthYearCode(
              selectedInvoice?.["GetBillMonthlySummary.INVOICE_DATE"]
            )
          }}
          headerTitle="VAT Details,Payment Details, Adjustment Details, Plan Monthly Rental, Add-ons Rental, One Time Charges Details, Usage Details"
          shouldRender={checkGroupPermissionExists(
            "_previous_billDetails_PnlGrp"
          )}
          viewLayout="table"
          debugMode={!!isDebugMode}
        />
      ) : (
        ""
      )}
    </>
  );
}

export default BillDetails;
