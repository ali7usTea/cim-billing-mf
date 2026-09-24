import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "cim-ui-components";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { TABS_COMPONENTS, TABS_CONFIG } from "../../constants/tabs";
import { addCustomers } from "../../redux/customer/customerSlice";
import {
  fetchAllGroupPermssion,
  fetchApiGroupPermssion
} from "../../redux/groupPermission/groupPermssionSlice";
import { fetchApiSettings } from "../../redux/settings/settingSlice";
import { AppDispatch, RootState } from "../../redux/store";
import {
  fetchAllTabPermssion,
  fetchApiTabPermssion
} from "../../redux/tabPermission/tabPermssionSlice";
import { fetchApiUserPermssion } from "../../redux/userPermission/userPermssionSlice";
import { tokenValidate } from "../../utils/tokenValidator";
import { usePermissionChecker } from "../hooks/usePermissionChecker";
import { useSubscriber } from "../hooks/useSubscriber";
import Loading from "./components/Loading";
import { Globe } from "lucide-react";

const BillingTab = () => {
  const [searchParams] = useSearchParams()!;
  const dispatch: AppDispatch = useDispatch();
  const { checkTabPermissionExists } = usePermissionChecker();
  const { jwtToken } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState(TABS_CONFIG[0].key);

  const { userName } = useSubscriber();
  useEffect(() => {
    if (jwtToken) {
      const tokenValid = tokenValidate(jwtToken);
      if (tokenValid) {
        const decoded = jwtDecode<JwtPayload>(jwtToken);
        dispatch(
          fetchApiTabPermssion({
            jwtToken,
            ntLogin: decoded.sub as string
          })
        );
        dispatch(
          fetchAllTabPermssion({
            jwtToken,
            ntLogin: decoded.sub as string
          })
        );
        dispatch(
          fetchApiGroupPermssion({
            jwtToken,
            ntLogin: decoded.sub as string
          })
        );
        dispatch(
          fetchAllGroupPermssion({
            jwtToken,
            ntLogin: decoded.sub as string
          })
        );
      }
    }
    dispatch(fetchApiSettings());
    if (jwtToken && userName) {
      dispatch(fetchApiUserPermssion({ jwtToken, ntLogin: userName }));
    }
  }, [dispatch, jwtToken, userName]);

  useEffect(() => {
    const actid =
      searchParams.get("accountId")! || searchParams.get("accountID")!;

    dispatch(
      addCustomers({
        key: actid,
        Customer: {
          accountID: actid,
          accountNumber:
            searchParams.get("accountNumber")! ||
            searchParams.get("accountnumber")!,
          partyID: searchParams.get("partyId")!,
          productCode: searchParams.get("productCode")!,
          productDescription: searchParams.get("productDescription")!,
          productGroup: searchParams.get("productGroup")!,
          productGroupCode: searchParams.get("productGroupCode")!,
          productGroupCodeDesc: searchParams.get("productGroupCodeDesc")!,
          customerSegment: searchParams.get("customerSegment")!,
          customerSegmentGroup: searchParams.get("customerSegmentGroup")!,
          customerCategory: searchParams.get("customerCategory")!,
          productType: searchParams.get("productType")!,
          regionCode: searchParams.get("regionCode")!,
          profileID: searchParams.get("profileID")!,
          isMaxSuffix: searchParams.get("isMaxSuffix")!,
          customerID: searchParams.get("customerID")!,
          isLandLine: searchParams.get("isLandLine")!,
          isMobile: searchParams.get("isMobile")!,
          customerName: searchParams.get("customerName")!,
          partyProfileId: searchParams.get("partyProfileId")!,
          accountStatus: searchParams.get("accountStatus")!,
          valueSegment: searchParams.get("valueSegment")!,
          preferredLanguage: searchParams.get("preferredLanguage")!,
          productDesc: searchParams.get("productDesc")!,
          businessSegmentValue: searchParams.get("businessSegmentValue")!,
          contactSearchId: searchParams.get("contactSearchId")!,
          domainName: searchParams.get("domainName")!,
          userName: searchParams.get("userName")!,
          subRequestProductCode: searchParams.get("subRequestProductCode")!,
          subRequestProductGroupDesc: searchParams.get(
            "subRequestProductGroupDesc"
          )!,
          subRequestProductGroup:
            searchParams.get("subRequestProductGroup") || "",
          subRequestTypeCode: searchParams.get("subRequestTypeCode")!,
          subRequestProductGroupCode: searchParams.get(
            "subRequestProductGroupCode"
          )!,
          key: searchParams.get("key")!,
          value: searchParams.get("value")!,
          customerEmail: searchParams.get("customerEmail")!,
          ebillEmail: searchParams.get("ebillEmail")!,
          contactNumber: searchParams.get("contactNumber")!,
          serialNumber: searchParams.get("serialNumber")!,
          noOfRecords: searchParams.get("noOfRecords")!,
          overrideFlag: searchParams.get("overrideFlag")!,
          isWasel: searchParams.get("isWasel")!,
          debugReport:
            searchParams.get("debugReport")! ||
            searchParams.get("debugreport")! ||
            searchParams.get("isDebugMode")! ||
            searchParams.get("isdebugmode")!,
          accountActivationDate: searchParams.get("accountActivationDate")!,
          agentName: searchParams.get("agentName")!,
          agentLocation: searchParams.get("agentLocation")!
        }
      })
    );
  }, [dispatch]);

  // Filter tabs once to simplify the rendering logic
  const accessibleTabs = TABS_CONFIG.filter((tab) =>
    checkTabPermissionExists(tab.key)
  );

  return (
    <div className="flex-1 flex flex-col bg-[#EEF1EF] pt-3.5 px-4.5 pb-12.5 min-h-screen">
      <Card className="flex-1 flex flex-col" title="Billing information" subtitle={`Invoices, charges, payments & autopay . ${searchParams.get("accountNumber") ?? "N/A"}`} icon={<Globe />}>
      
      <div className="px-4 pb-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as keyof typeof TABS_COMPONENTS)
        }
      >
        <TabsList>
          
          {accessibleTabs.map((tab) => {
            return (
              <TabsTrigger  key={tab.key} value={tab.key} >
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {accessibleTabs.map((tab) => {
          const Component = TABS_COMPONENTS[tab.key];

          return (
            <TabsContent key={tab.key} value={tab.key}>
              <Suspense fallback={<Loading className="my-50" />}>
                <Component />
              </Suspense>
            </TabsContent>
          );
        })}
      </Tabs>
      </div>
     </Card>
    </div>
  );
};

export default BillingTab;
