import { DataPanel } from "cim-ui-components";
import { proxyURL } from "../../../../../utils/lib/proxyAPI";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { usePermissionChecker } from "../../../../hooks/usePermissionChecker";
import { getMonthYearCode } from "../../../../../utils/dateCalculation";

export interface ICallDetailsProps {
  selectedInvoice?: any;
}

function CallDetails({ selectedInvoice }: ICallDetailsProps) {
  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
  const { checkGroupPermissionExists } = usePermissionChecker();

  return (
    <>
      {selectedInvoice ? (
        <DataPanel
          autoPublish={true}
          api={`${proxyURL}/GetCallDetails`}
          queryParams={{
            accountId: Object.keys(Customers)[0],
            ...(isDebugMode ? { isDebugMode } : {}),
            BILL_DATE: getMonthYearCode(
              selectedInvoice?.["GetBillMonthlySummary.INVOICE_DATE"]
            )
          }}
          headerTitle=""
          shouldRender={checkGroupPermissionExists(
            "_previous_callDetails_PnlGrp"
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

export default CallDetails;
