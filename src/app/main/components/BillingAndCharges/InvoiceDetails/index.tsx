"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "cim-ui-components";
import React, { lazy, Suspense } from "react";
import { usePermissionChecker } from "../../../../hooks/usePermissionChecker";
import Loading from "../../Loading";
import BillSummary from "./BillSummary";

const TABS_CONFIG = [
  {
    label: "Bill Summary",
    key: "BillSummary" as const,
    permission: "billSummaryTab"
  },
  {
    label: "Bill Details",
    key: "BillDetails" as const,
    permission: "billDetailsTab"
  },
  {
    label: "Call Details",
    key: "CallDetails" as const,
    permission: "callDetailsTab"
  }
];
const COMPONENTS_MAP = {
  BillSummary: BillSummary,
  BillDetails: lazy(() => import("./BillDetails")),
  CallDetails: lazy(() => import("./CallDetails"))
};
export interface IInvoideDetailsModalTabsProps {
  selectedInvoice: any;
}

const InvoideDetailsModalTabs = ({
  selectedInvoice
}: IInvoideDetailsModalTabsProps) => {
  const [activeTab, setActiveTab] = React.useState(TABS_CONFIG[0].key);
  const { checkTabPermissionExists } = usePermissionChecker();

  // Filter tabs once to simplify the rendering logic
  const accessibleTabs = TABS_CONFIG.filter((tab) =>
    checkTabPermissionExists(tab.key)
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as keyof typeof COMPONENTS_MAP)}
      className="w-full"
    >
      <TabsList>
        {accessibleTabs.map((tab) => (
          <TabsTrigger variant="secondary" key={tab.key} value={tab.key}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {accessibleTabs.map((tab) => {
        const Component = COMPONENTS_MAP[tab.key];
        return (
          <TabsContent key={tab.key} value={tab.key}>
            <Suspense fallback={<Loading />}>
              <Component selectedInvoice={selectedInvoice} />
            </Suspense>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default InvoideDetailsModalTabs;
