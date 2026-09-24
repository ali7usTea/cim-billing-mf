import { lazy } from "react";
import CurrentMonthTab from "../app/main/components/CurrentMonth";

interface TabConfig {
  label: string;
  key: keyof typeof TABS_COMPONENTS;
  permission: string;
}

export const TABS_COMPONENTS = {
  CurrentMonth: CurrentMonthTab,
  AdjustmentAndTransfers: lazy(
    () => import("../app/main/components/AdjustmentAndTransfers")
  ),
  PaymentDetails: lazy(() => import("../app/main/components/PaymentDetails")),
  BillingCharging: lazy(
    () => import("../app/main/components/BillingAndCharges")
  ),
  AgreementDetails: lazy(
    () => import("../app/main/components/AgreementDetails")
  ),
  CreditDetails: lazy(() => import("../app/main/components/CreditDetails")),
  AutoPayAndDirectDebit: lazy(
    () => import("../app/main/components/AutoPayAndDirectDebit")
  ),
  OnlineDues: lazy(() => import("../app/main/components/OnlineDues"))
};

export const TABS_CONFIG: TabConfig[] = [
  {
    label: "Current Month",
    key: "CurrentMonth",
    permission: "currentMonthTab"
  },
  {
    label: "Adjustment and Transfers",
    key: "AdjustmentAndTransfers",
    permission: "BalanceAndAdjDetailsTab"
  },
  {
    label: "Payment Details",
    key: "PaymentDetails",
    permission: "paymentDetailsTab"
  },
  {
    label: "Billing & Charges",
    key: "BillingCharging",
    permission: "billingChargingTab"
  },
  {
    label: "Agreement Details",
    key: "AgreementDetails",
    permission: "agreementDetailsTab"
  },
  {
    label: "Credit Details",
    key: "CreditDetails",
    permission: "creditDetailsTab"
  },
  {
    label: "AutoPay & Direct Debit",
    key: "AutoPayAndDirectDebit",
    permission: "autopayTab"
  },
  {
    label: "Online Dues",
    key: "OnlineDues",
    permission: "onlineDuesAccStatusTab"
  }
];
