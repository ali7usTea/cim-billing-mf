"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "cim-ui-components";
import React, { lazy, Suspense } from "react";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import Loading from "../Loading";
import BillSummary from "./BillSummary";

const TABS_CONFIG = [
  {
    label: "Bill Summary",
    key: "BillSummaryCurrentMonth" as const,
    permission: "billSummaryTab"
  },
  {
    label: "Bill Details",
    key: "BillDetailsCurrentMonth" as const,
    permission: "billDetailsTab"
  },
  {
    label: "Call Details",
    key: "CallDetailsCurrentMonth" as const,
    permission: "callDetailsTab"
  }
];
const COMPONENTS_MAP = {
  BillSummaryCurrentMonth: BillSummary,
  BillDetailsCurrentMonth: lazy(() => import("./BillDetails")),
  CallDetailsCurrentMonth: lazy(() => import("./CallDetails"))
};
const CurrentMonthTab = () => {
  const [activeTab, setActiveTab] = React.useState(TABS_CONFIG[0].key);
  const { checkTabPermissionExists } = usePermissionChecker();

  // Filter tabs once to simplify the rendering logic
  const accessibleTabs = TABS_CONFIG.filter((tab) =>
    checkTabPermissionExists(tab.key)
  );

  return (
    <div className="px-1 dark:bg-gray-400 dark:text-gray-100">
      <Tabs
      variant="secondary"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as keyof typeof COMPONENTS_MAP)}
        className="w-full"
      >
        <TabsList className="mb-3">
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
    </div>
  );
};

export default CurrentMonthTab;
