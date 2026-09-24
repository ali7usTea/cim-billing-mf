"use client";

import React from "react";
import { DataPanel } from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_CallDetails_PAGE = 'app.main.Pages.CALL_DETAILS';

const CallDetails: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
  // clientLogger.info(`${LOGGER_CallDetails_PAGE}:Rendering CMS Account Details`);

  return (
    <div title="cms-account-details" className="flex flex-col gap-4">
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/custom/calldetails`}
        queryParams={{
          accountId: Customers[Object.keys(Customers)[0]]?.accountID,
          action: "GetCallDetails",
          actionCode: "GetCallDetails",
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Usage Details"
        shouldRender={true}
        viewLayout="table"
        debugMode={!!isDebugMode}
      />
    </div>
  );
};

export default CallDetails;
