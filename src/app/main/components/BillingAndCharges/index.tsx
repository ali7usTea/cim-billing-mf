"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "cim-ui-components";
import React, { lazy, Suspense } from "react";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import Loading from "../Loading";
import SearchedAccount from "./SearchedAccount";

const TABS_CONFIG = [
  {
    label: "Searched Account",
    key: "Account" as const,
    permission: "billingSearchedAccountTab"
  },
  {
    label: "Party",
    key: "Party" as const,
    permission: "partyBillingAndCharges"
  },
  {
    label: "Summary Bill Details",
    key: "Bill Details" as const,
    permission: "billSummaryAccountTab"
  }
];

const COMPONENTS_MAP = {
  Account: SearchedAccount,
  Party: lazy(() => import("./BusinessSummaryBillDetail")),
  ["Bill Details"]: lazy(() => import("./Party"))
};

const BillingAndCharges = () => {
  const [activeTab, setActiveTab] = React.useState(TABS_CONFIG[0].key);
  const { checkTabPermissionExists } = usePermissionChecker();

  // Filter tabs once to simplify the rendering logic
  const accessibleTabs = TABS_CONFIG.filter((tab) =>
    checkTabPermissionExists(tab.key)
  );

  return (
    <Tabs
      variant="secondary"
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as keyof typeof COMPONENTS_MAP)}
      className="w-full"
    >
      <TabsList>
        {accessibleTabs.map((tab) => (
          <TabsTrigger  key={tab.key} value={tab.key}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {accessibleTabs.map((tab) => {
        const Component = COMPONENTS_MAP[tab.key];
        return (
          <TabsContent key={tab.key} value={tab.key}>
            <Suspense fallback={<Loading />}>
              <Component />
            </Suspense>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default BillingAndCharges;
