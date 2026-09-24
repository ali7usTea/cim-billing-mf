"use client";

import React from "react";
import { Button, DataPanel } from "cim-ui-components";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_AGREMENT_DETAILS_PAGE = 'app.main.Pages.AgreementDetails';

const AgreementDetails: React.FunctionComponent = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const { checkGroupPermissionExists } = usePermissionChecker();
  const [agrementId, setAgrementId] = React.useState(null);
  const [showOtherPanels, setShowOtherPanels] = React.useState(false);
  // clientLogger.info(`${LOGGER_AGREMENT_DETAILS_PAGE}:Rendering AgreementDetails`);

  const handleChange = (rows: any) => {
    const selectedRow = rows?.["row"]?.["original"] ?? rows;
    setAgrementId(selectedRow["GetAgreementDetails.AGREEMENT_CODE"]);
    setShowOtherPanels(!showOtherPanels);
  };
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  const PreColumnComp = (rows: any) => {
    return (
      <Button className="commandStyle" onClick={() => handleChange(rows)}>
        <img
          src="/images/btn-view.png?url"
          style={{
            width: "20px",
            height: "20px"
          }}
          alt="Click"
        />
      </Button>
    );
  };

  const MainDetails = () => {
    return (
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetAgreementDetails`}
        queryParams={{
          accountId: Customers[Object.keys(Customers)[0]]?.accountID,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Agreement Main Details"
        shouldRender={checkGroupPermissionExists("AgreementMainDetailsGroup")}
        viewLayout="table"
        debugMode={!!isDebugMode}
        leadingColumns={[
          {
            title: "Details",
            component: (rows: any) => PreColumnComp(rows)
          }
        ]}
      />
    );
  };
  const AgreementCausalAccount = () => {
    return (
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/custom/getAgreementCasualAccounts`}
        queryParams={{
          AGREEMENT_ID: agrementId!,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Agreement Causal Accounts"
        shouldRender={checkGroupPermissionExists("AgreementCausalDetailsGroup")}
        viewLayout="table"
        debugMode={!!isDebugMode}
      />
    );
  };
  const AgrementInstall = () => {
    return (
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/custom/getAgreementInstallments`}
        queryParams={{
          AGREEMENT_ID: agrementId!,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Agreement Installments"
        shouldRender={checkGroupPermissionExists(
          "AgreementInstallmentDetailsGroup"
        )}
        viewLayout="table"
        debugMode={!!isDebugMode}
      />
    );
  };
  const AgrementAffectAccount = () => {
    return (
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetAgreementAffectedAccounts`}
        queryParams={{
          AGREEMENT_NUMBER: agrementId!,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Agrement Affected Accounts"
        shouldRender={checkGroupPermissionExists(
          "AgreementAffectedAccDetailsGroup"
        )}
        viewLayout="table"
        debugMode={!!isDebugMode}
      />
    );
  };
  const AgrementWorkFlow = () => {
    return (
      <DataPanel
        autoPublish={true}
        api={`${proxyURL}/GetPaymentAgreementWorkflow`}
        queryParams={{
          AGREEMENT_ID: agrementId!,
          ...(isDebugMode ? { isDebugMode } : {})
        }}
        headerTitle="Payment Agreement Workflow Details"
        shouldRender={checkGroupPermissionExists(
          "paymentAgreementWorkflowGroup"
        )}
        viewLayout="table"
        debugMode={!!isDebugMode}
      />
    );
  };

  return (
    <>
      <MainDetails />
      {showOtherPanels && (
        <>
          <AgreementCausalAccount />
          <AgrementInstall />
          <AgrementAffectAccount />
          <AgrementWorkFlow />
        </>
      )}
    </>
  );
};

export default AgreementDetails;
