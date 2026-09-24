"use client";

import React from "react";
import { DataPanel } from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_ACTION_DETAILS_PAGE = 'app.main.Pages.ACTION_DETAILS';

const ActionDetails: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const { checkGroupPermissionExists } = usePermissionChecker();
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <DataPanel
      autoPublish={true}
      api={`${proxyURL}/GetCreditActionDetails`}
      queryParams={{
        accountId: Object.keys(Customers)[0],
        ...(isDebugMode ? { isDebugMode } : {})
      }}
      headerTitle="Action Details"
      // titleAttribute="credit-action-details"
      shouldRender={checkGroupPermissionExists("creditActionDetailsPanelGroup")}
      viewLayout="table"
      debugMode={!!isDebugMode}
    />
  );
};

export default ActionDetails;
