"use client";

import React from "react";
import { DataPanel } from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_CREDIT_DETAILS_PAGE = 'app.main.Pages.BAD_DEBT_DETAILS';

const BadDebtDetails: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const { checkGroupPermissionExists } = usePermissionChecker();
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <div title="credit-bad-debt-details">
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetCreditBadDebtDetails`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Bad Debt Details"
        shouldRender={checkGroupPermissionExists(
          "creditBadDebtDetailsPanelGroup"
        )}
        viewLayout="grid"
        debugMode={!!isDebugMode}
      />
    </div>
  );
};

export default BadDebtDetails;
