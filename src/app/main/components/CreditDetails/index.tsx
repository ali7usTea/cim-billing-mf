"use client";

import React from "react";
import BadDebtDetails from "./BadDebtDetails";
import ActionDetails from "./ActionDetails";
import DebtCollectionAgency from "./DebtCollectionAgency";
// import { clientLogger } from '../../../clientLogger';
// const LOGGER_PAGE = 'app.main.Pages.CMSAccountDetails';

const CreditDetails: React.FunctionComponent = () => {
  return (
    <div
      title="cms-credit-details"
      className="cms-credit-details flex flex-col gap-4"
    >
      <BadDebtDetails />
      <ActionDetails />
      <DebtCollectionAgency />
    </div>
  );
};

export default CreditDetails;
