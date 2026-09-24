"use client";

import React from "react";
import { DataPanel } from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_DEBT_COLLECTION_AGENCY_PAGE = 'app.main.Pages.DEBT_COLLECTION_AGENCY';

const DebtCollectionAgency: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const { checkGroupPermissionExists } = usePermissionChecker();
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  return (
    <div title="credit-debt-collection-agency">
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetDebtCollectionAgencyDetails`}
        queryParams={{
          accountId: Object.keys(Customers)[0],
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Debt Collection Agency"
        shouldRender={checkGroupPermissionExists(
          "debtCollectionAgencyDetailsPanelGroup"
        )}
        viewLayout="table"
        debugMode={!!isDebugMode}
      />
    </div>
  );
};

export default DebtCollectionAgency;
