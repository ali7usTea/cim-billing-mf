"use client";

import React from "react";
import { DataPanel } from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_ONLINE_DUES_PAGE = 'app.main.Pages.ONLINE_DUES';

const OnlineDues: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const { checkGroupPermissionExists } = usePermissionChecker();
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
  // clientLogger.info(`${LOGGER_CMSACCOUNT_PAGE}:Rendering CMS Account Details`);

  return (
    <div className="cms-online-dues" data-testid="cms-online-dues">
      <DataPanel
        autoPublish={true}
        // titleAttribute="cms-online-dues"
        api={`${proxyURL}/GetOnlineDueSummary`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Unbilled Transactions"
        shouldRender={checkGroupPermissionExists("unbilled_trans")}
        viewLayout="grid"
        debugMode={!!isDebugMode}
      />
    </div>
  );
};

export default OnlineDues;
