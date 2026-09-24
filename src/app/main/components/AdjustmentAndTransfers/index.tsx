"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "cim-ui-components";
import { lazy, Suspense, useState } from "react";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import Loading from "../Loading";
import AccountAdjustmentAndTransfer from "./Account";

const TABS_CONFIG = [
  {
    label: "Account",
    key: "Account" as const,
    permission: "accountBalanceAndAdjTab"
  },
  {
    label: "Party",
    key: "Party" as const,
    permission: "partyBalanceAndAdjTab"
  }
];

const COMPONENTS_MAP = {
  Account: AccountAdjustmentAndTransfer,
  Party: lazy(() => import("./Party"))
};

const BalanceAndAdjDetailsTab = () => {
  const [activeTab, setActiveTab] = useState(TABS_CONFIG[0].key);
  const { checkTabPermissionExists } = usePermissionChecker();

  // Filter tabs once to simplify the rendering logic
  const accessibleTabs = TABS_CONFIG.filter((tab) =>
    checkTabPermissionExists(tab.key)
  );

  return (
    <Tabs
    variant="secondary"
      defaultValue={activeTab}
      onValueChange={(v) => setActiveTab(v as keyof typeof COMPONENTS_MAP)}
      className="w-full"
    >
      <TabsList>
        {accessibleTabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key!}>
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

export default BalanceAndAdjDetailsTab;
