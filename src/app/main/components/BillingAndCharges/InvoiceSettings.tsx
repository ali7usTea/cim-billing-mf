import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataPanel, PanelData, SplitButton } from "cim-ui-components";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "../../../../redux/store";
import { debugReportURL, proxyURL } from "../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../hooks/usePermissionChecker";

interface InvoicePreferencesResponse {
  data: PanelData;
  refId: string;
}

export default function InvoiceSettings() {
  const { Customers } = useSelector((state: RootState) => state.customerslice);
  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;
  const { checkGroupPermissionExists } = usePermissionChecker();
  // clientLogger.info(`${LOGGER_CMSACCOUNT_PAGE}:Rendering CMS Account Details`);

  const { data, isLoading, error, refetch } = useQuery({
    // Use an array for the queryKey, starting with the URL as the base identity
    queryKey: [
      `${proxyURL}/GetInvoicePreferences`,
      Object.keys(Customers)[0],
      isDebugMode
    ],
    queryFn: async () => {
      const response = await axios.get<InvoicePreferencesResponse>(
        `${proxyURL}/GetInvoicePreferences`,
        {
          params: {
            accountId: Object.keys(Customers)[0],
            ...(isDebugMode ? { isDebugMode } : {})
          }
        }
      );
      // TanStack Query expects the actual data returned from the promise
      return response.data;
    },
    // Ensure the query only runs when Customers is available
    enabled: !!Object.keys(Customers).length
  });

  const getDynamicData = () => {
    return {
      accountID: Customers[Object.keys(Customers)[0]]?.accountID,
      accountnumber: Customers[Object.keys(Customers)[0]]?.accountNumber,
      userName: Customers[Object.keys(Customers)[0]]?.userName,
      invoice_media_code: "PRINT"
    };
  };

  // API call handler

  const handleSuccess = (description: string): void => {
    toast.success("Success", {
      description
    });
  };

  // Function to handle error
  const handleError = (error: unknown, description: string): void => {
    console.error("API Error:", error);
    toast.error("Error", {
      description
    });
  };

  const sendTemplateRequest = async (
    billing_ebill_type: string,
    onSuccessMsg: string,
    onErrorMsg: string
  ) => {
    const { accountnumber, accountID, userName, invoice_media_code } =
      getDynamicData();
    try {
      await axios.post(
        `${proxyURL}/FixInvoiceTemplate`,
        {
          accountID,
          accountnumber,
          userName,
          billing_email_template: "FIX",
          invoice_media_code,
          billing_ebill_type
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      handleSuccess(onSuccessMsg);
    } catch (error) {
      handleError(error, onErrorMsg);
    }
  };

  const TemplateItems = [
    {
      label: "Set Invoice Type Individual",
      onClick: () =>
        sendTemplateRequest(
          "I",
          "Update Template Request Submitted Successfully",
          "Failed to send Update Template Request"
        )
    },
    {
      label: "Set Invoice Type Convergent",
      onClick: () =>
        sendTemplateRequest(
          "C",
          "Update Template Request Submitted Successfully",
          "Failed to send Update Template Request"
        )
    },
    {
      label: "Fix Template",
      onClick: () =>
        sendTemplateRequest(
          "",
          "Update Template Request Submitted Successfully",
          "Failed to send Update Template Request"
        )
    }
  ];

  // EBillItems logic
  const handleEbillRequest = async ({
    url,
    params,
    successMsg,
    errorMsg
  }: {
    url: string;
    params: Record<string, any>;
    successMsg: string;
    errorMsg: string;
  }) => {
    try {
      await axios.get(url, { params });
      handleSuccess(successMsg);
    } catch (error) {
      handleError(error, errorMsg);
    }
  };

  const EBillItems = [
    {
      label: "Disable/Skip E-Bill",
      onClick: () => {
        const { accountnumber, accountID, userName, invoice_media_code } =
          getDynamicData();
        handleEbillRequest({
          url: `${proxyURL}/UpdateEbillFlag`,
          params: {
            accountnumber,
            accountID,
            userName,
            invoice_media_code,
            skip_ebill: "Y"
          },
          successMsg: "E-Bill Request Submitted Successfully.",
          errorMsg: "Failed to send e-Bill Request"
        });
      }
    },
    {
      label: "Send Detailed Invoice",
      onClick: () => {
        const { accountnumber, accountID, userName } = getDynamicData();
        handleEbillRequest({
          url: `${proxyURL}/UpdateInvoiceDetailedType`,
          params: {
            accountnumber,
            accountID,
            userName,
            invoiceDetailedFlag: "Y"
          },
          successMsg: "E-Bill Request Submitted Successfully.",
          errorMsg: "Failed to send e-Bill Request"
        });
      }
    }
  ];

  const billingAddressPreferencesData = data?.data ?? {};
  const refIdInvoicePreferences = data?.refId;
  return (
    <>
      <p className="extraTitle">Invoice Settings</p>

      <DataPanel
        autoPublish={true}
        panelData={billingAddressPreferencesData}
        panelDataRefId={refIdInvoicePreferences}
        headerTitle="Invoice Preferences"
        shouldRender={checkGroupPermissionExists(
          "invoicePreferencesPanelGroup"
        )}
        viewLayout="grid"
        debugMode={!!isDebugMode}
        debugRoute={`${debugReportURL}?query=GetInvoicePreferences?accountId=${
          Object.keys(Customers)[0]
        }`}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        showRefreshButton={true}
      />
      <div className="flex gap-3">
        <SplitButton options={TemplateItems}>Template Update</SplitButton>
        <SplitButton options={EBillItems}>E-Bill</SplitButton>
      </div>

      {billingAddressPreferencesData?.GetInvoicePreferences_MainTable?.rows
        ?.length ? (
        <DataPanel
          autoPublish={true}
          api={`${proxyURL}/GetInvoiceBillAddress`}
          queryParams={{
            ADDRESS_ID:
              billingAddressPreferencesData?.GetInvoicePreferences_MainTable
                ?.rows?.[0]?.["GetInvoicePreferences.BILLING_ADDRESS_ID"]
                ?.value ?? undefined,
            ...(isDebugMode ? { isDebugMode } : {})
          }}
          headerTitle="Invoice Billing Address"
          shouldRender={checkGroupPermissionExists(
            "invoiceBillingAddressPanelGroupUpdater"
          )}
          viewLayout="grid"
          debugMode={!!isDebugMode}
        />
      ) : null}
    </>
  );
}
