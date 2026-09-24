import { Tabs, TabsContent, TabsList, TabsTrigger } from "cim-ui-components";
import React, { lazy, Suspense } from "react";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";
import Loading from "../Loading";
import VatStatementAgainstPartyLevel from "./VatStatementAgainstPartyLevel";

const TABS_CONFIG = [
  {
    label: "PostPaid VAT Statement",
    key: "PostPaid" as const,
    permission: "vatStatementAgainstPartyLevel"
  },
  {
    label: "PrePaid VAT Invoice",
    key: "PrePaid" as const,
    permission: "partyInvoiceDetailsTab"
  }
];
const COMPONENTS_MAP = {
  PostPaid: VatStatementAgainstPartyLevel,
  PrePaid: lazy(() => import("./PartyInvoiceDetailsTab"))
};
const BACPary = () => {
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
              <Component />
            </Suspense>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default BACPary;
