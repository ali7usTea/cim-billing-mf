"use client";

import { DataPanel, FlatRow } from "cim-ui-components";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_CMSACCOUNT_PAGE = 'app.main.Pages.SMS_ACCOUNT_DETAILS';

const BillingGroupMemberDetails = ({
  selectedMember
}: {
  selectedMember: FlatRow | undefined;
}) => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
  const { checkGroupPermissionExists } = usePermissionChecker();

  if (!selectedMember) return null;

  return (
    <div className="border rounded-md px-2 py-4 w-full h-full mb-2">
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetBillingGroupDetails`}
        queryParams={{
          GROUP_ID:
            selectedMember?.["GetBillGroupMembersInquiry.GROUP_ID"] ??
            undefined,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Billing Group Member Details"
        // titleAttribute="searched-accounts-billing-group-member-details"
        shouldRender={checkGroupPermissionExists(
          "billingGroupDetails_Tbl"
        )} /* Assuming permission check logic is handled elsewhere */
        viewLayout="table"
        debugMode={!!isDebugMode}
      />
    </div>
  );
};

export default BillingGroupMemberDetails;
