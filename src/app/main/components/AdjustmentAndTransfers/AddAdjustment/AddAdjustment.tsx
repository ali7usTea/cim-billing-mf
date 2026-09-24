import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  DataPanel,
  DataRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FlatRow,
  PanelData
} from "cim-ui-components";
import moment from "moment";
import { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { selectCustomer } from "../../../../../redux/customer/customerSlice";
import { RootState } from "../../../../../redux/store";
import axiosWithAuth from "../../../../../utils/axios";
import { debugReportURL } from "../../../../../utils/lib/proxyAPI";
import { usePermissionChecker } from "../../../../hooks/usePermissionChecker";
import AdjustmentRecordForm from "./AdjustmentRecord";
import Attachments from "./Attachments";
import { ErrorMessage } from "./const";
import InfoForm from "./InfoForm";
import { ADJUSTMENT_AMOUNT_LIMIT_KEY, isAmountValidLimit } from "./utils";

interface infoFormComponent {
  getValues: any;
  submitForm: any;
}
interface adjustmentFormComponent {
  getAdjustmentRecords: any;
}

//TODO: Replace with .env value
const complaintProxy = "/v1/bff/complaint";

const AddAdjustment = () => {
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const infoFormRef = useRef<infoFormComponent>(null);
  const adjustmentFormRef = useRef<adjustmentFormComponent>(null);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<FlatRow[]>([]);

  const { checkGroupPermissionExists } = usePermissionChecker();
  const { Customers } = useSelector(selectCustomer);
  const { jwtToken } = useSelector((state: RootState) => state.auth);
  const settings = useSelector(
    (state: RootState) => state.settingSlice.settings
  );
  const permissionDtoMap = useSelector(
    (state: RootState) => state.UserPermissionSlice?.permissionDtoMap
  );

  const accountId = Object.keys(Customers)[0];

  const checkUserPermission = (permissionKey: string): boolean => {
    return permissionDtoMap ? !!permissionDtoMap[permissionKey] : false;
  };

  const {
    handleSubmit,
    control,
    trigger,
    watch,
    formState: { errors: formErrors }
  } = useForm({
    defaultValues: { chargeCode: "" },
    mode: "onChange"
  });

  const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

  const { data: chargeCodesList = [] } = useQuery({
    queryKey: [`${complaintProxy}/GetChargeCodesLookup`],
    queryFn: async () => {
      const { data } = await axios.get<{ data: PanelData }>(
        `${complaintProxy}/GetChargeCodesLookup?LK_NAME=CHARGE_CODES`
      );
      return data?.data?.GetChargeCodesLookup_MainTable.rows || [];
    }
  });

  const { data: lookupsData } = useQuery({
    queryKey: [`${complaintProxy}/lookups`],
    queryFn: async () => {
      const { data } = await axios.get(`${complaintProxy}/lookups`);
      return data;
    }
  });

  // Derived state from the query
  const adjustmentRules = lookupsData?.AdjustmentPostingRules || [];

  const { data: complaintsDataFull } = useQuery({
    // Include all dependencies in the key to trigger automatic refetching
    queryKey: [
      `${complaintProxy}/GetNonClosedAndNonResolvedComplaints`,
      accountId,
      isDebugMode
    ],
    queryFn: async () => {
      const { data } = await axios.get(
        `${complaintProxy}/GetNonClosedAndNonResolvedComplaints`,
        {
          params: {
            accountId,
            ...(isDebugMode ? { isDebugMode } : {})
          }
        }
      );
      return data;
    },
    // Only run if we have an accountId
    enabled: !!accountId
  });

  // Extracted values
  const complaintsData = complaintsDataFull?.data;
  const refIdComplaints = complaintsDataFull?.refId;

  const openModal = () => {
    setOpen(true);
  };

  const lastActivityId =
    complaintsData?.GetNonClosedAndNonResolvedComplaints_MainTable?.rows?.[0]?.[
      "GetNonClosedAndNonResolvedComplaints.ACTIVITY_ID"
    ]?.value;

  const { data: lastActivityData } = useQuery({
    queryKey: [`${complaintProxy}/custom/getActivityById`, lastActivityId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${complaintProxy}/custom/getActivityById?activityId=${lastActivityId}`
      );
      return data?.data;
    },
    // Replaces the "if (!lastActivityId) return" check
    enabled: !!lastActivityId
  });

  const onSubmit = (_d: unknown, event: any) => {
    event.preventDefault();
    event.stopPropagation();

    let files: File[] = [];
    let infoFormData: any = {};
    let adjustmentRecords = [];
    let matchingAdjustmentType: any = null;

    const findMatchingAdjustmentType = () => {
      if (!infoFormRef.current || !adjustmentRules.length) return;
      const infoFormData = infoFormRef.current.getValues();
      const selectedActivityTypeCode = infoFormData?.cause_refund_type_id;
      if (!selectedActivityTypeCode) return;
      for (const adjustmentRule of adjustmentRules) {
        if (checkUserPermission(adjustmentRule.permissionName)) {
          matchingAdjustmentType = adjustmentRule.adjustmentTypes.find(
            (type: { code: string }) => type.code === selectedActivityTypeCode
          );
        }
      }
    };
    findMatchingAdjustmentType();
    const isAttachmentRequired = matchingAdjustmentType?.attachmentRequired;
    const isComplaintReferenceRequired =
      matchingAdjustmentType?.complaintReferenceRequired;
    //TOOD: We need to hide/display attachments and non resolved complaints section based on
    //  our javascript code matchingAdjustmentType.complaintDisplaysFlag and matchingAdjustmentType.attachmentDisplayFlag
    //  but uat app doesnt behave so even though jsf code adds this condition on rendered.
    // <h:panelGroup id="adjustmentAttachmentsGrp" layout="block" class="Crs_rightOptins_inputs" rendered="#{billing.adjustmentType.attachmentDisplayFlag}"
    // <h:panelGroup layout="block" styleClass="divOptions_Row_Sup" id="nonClosedAndNonReslovedBillingComplaintsPanel" rendered="#{billing.adjustmentType.complaintDisplaysFlag}">
    if (attachmentFiles) {
      files = attachmentFiles;
    }
    if (infoFormRef.current) {
      infoFormRef.current.submitForm();
      infoFormData = infoFormRef.current.getValues();
    }

    if (adjustmentFormRef.current) {
      adjustmentRecords = adjustmentFormRef.current.getAdjustmentRecords();
    }
    if (isComplaintReferenceRequired && !selectedRow) {
      toast.error("Error", {
        description: "Complaint reference is required"
      });
    }
    if (isAttachmentRequired && !files.length) {
      toast.error("Error", {
        description: "Attachment is required"
      });
    }
    if (!adjustmentRecords.length) {
      toast.error("Error", {
        description: "Adjustment record is required"
      });
      return;
    }

    // Get default limit from settings
    const defaultLimit = settings?.[ADJUSTMENT_AMOUNT_LIMIT_KEY]
      ? parseFloat(settings[ADJUSTMENT_AMOUNT_LIMIT_KEY])
      : 0;

    // Get selected activity type code from form data
    // Validate amount with proper parameters
    const selectedActivityTypeCode = infoFormData.cause_refund_type_id;
    if (
      !isAmountValidLimit(
        adjustmentRules,
        adjustmentRecords,
        selectedActivityTypeCode,
        checkUserPermission,
        defaultLimit
      )
    ) {
      toast.error("Error", {
        description: "The total amount is exceeded the configured limit"
      });
      return;
    }

    const payApiCall = () => {
      const formData = new FormData();
      const agentName = Customers[Object.keys(Customers)[0]]?.agentName;
      const agentLocation = Customers[Object.keys(Customers)[0]]?.agentLocation;
      const userName = Customers[Object.keys(Customers)[0]]?.userName;
      // Append the data as JSON string
      formData.append(
        "data",
        JSON.stringify({
          accountNumber: Customers[Object.keys(Customers)[0]]?.accountNumber,
          adjustmentDetails: adjustmentRecords.map((record: any) => ({
            adjustmentRemarks: record.remarks,
            //TODO: Mapping i-e IMM = Immediate
            adjustmentType:
              record.charge_code_object["GetChargeCodesLookup.ADJ_TYPE"].value,
            billDate: moment(record.bill_period).format("MMYYYY"),
            chargeCode: record.charge_code,
            refundAmount: record.amount
          })),
          preferredLanguage: infoFormData.language,
          serviceId:
            typeof infoFormData.serviceId === "string"
              ? infoFormData.serviceId
              : infoFormData.serviceId.value,
          serviceDesc:
            typeof infoFormData.serviceId === "string"
              ? ""
              : infoFormData.serviceId.desc,
          dopTypeCode: infoFormData.dop_type.adjTypeCode,
          dopTypeDesc: infoFormData.dop_type.description,
          dopSubTypeCode: infoFormData.subtype.code || "",
          dopSubTypeDesc: infoFormData.subtype.description || "",
          selectedAdjustmentDOPType: {
            description: infoFormData.cause_refund,
            typeId: infoFormData.cause_refund_type_id
          },
          linkedActivityId: selectedRow?.find((key) =>
            Object.keys(key).includes(
              "GetNonClosedAndNonResolvedComplaints.ACTIVITY_ID"
            )
          ),
          accountId: Customers[Object.keys(Customers)[0]]?.accountID,
          contactDetails: [
            {
              contactName: Customers[Object.keys(Customers)[0]].customerName,
              contactEmail: infoFormData.contact_email,
              contactNumber: infoFormData.mobile_number
              // Evaluated already from backend. No need to add.
              // contactMode: evaluateContactType(infoFormData.mobile_number)
            }
          ],
          sourceChannel: "VA",
          createdUserId: Customers[Object.keys(Customers)[0]].userName,
          regionCode: infoFormData.region,
          staffName: agentName && agentName !== "null" ? agentName : userName,
          staffLocation:
            agentLocation && agentLocation !== "null"
              ? agentLocation
              : infoFormData.region
        })
      );

      // Append each file
      files.forEach((file) => {
        formData.append("files", file);
      });

      axiosWithAuth
        .post(`${complaintProxy}/custom/payAdjustment`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${jwtToken}`
          }
        })
        .then((response) => {
          toast.success("Success", {
            description: response?.data?.message
          });
        })
        .catch((error) => {
          toast.error("Failed", {
            description: error.response ? error.response.data : error.message
          });
        });
    };
    payApiCall();
  };

  const selectedChargeCodeValue = watch("chargeCode");

  const getChargeCodeLabel = (chargeCodeRow: DataRow): string => {
    const chargeCode =
      chargeCodeRow["GetChargeCodesLookup.ADJ_CHARGE_CODE"]?.value?.toString() ??
      "";
    const description =
      chargeCodeRow["GetChargeCodesLookup.SHORT_DESCRIPTION"]?.value?.toString() ??
      "";
    return `${chargeCode}-${description}`;
  };

  const selectedChargeCode = useMemo(
    () => {
      if (
        selectedChargeCodeValue === undefined ||
        selectedChargeCodeValue === null ||
        selectedChargeCodeValue === ""
      ) {
        return null;
      }

      return (
        chargeCodesList.find(
          (item: DataRow) =>
            getChargeCodeLabel(item) === selectedChargeCodeValue.toString()
        ) ?? null
      );
    },
    [chargeCodesList, selectedChargeCodeValue]
  );

  const isSelectedChargeCode = useMemo(
    () => ({
      isValid: async () => await trigger("chargeCode"),
      value: selectedChargeCode
    }),
    [selectedChargeCode, trigger]
  );

  return (
    <div className="adjustment">
      <div className="flex justify-end">
        <Button onClick={openModal}>Add Adjustment</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-bold">
              Add Adjustments
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[80vh] overflow-y-auto px-6 pb-6">
            <form
              id="dropdownRef"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="flex flex-col gap-2">
                  <Controller
                    name="chargeCode"
                    control={control}
                    rules={{ required: "Charge Code is required" }}
                    render={({ field }) => (
                      <div className="space-y-1">
                        <label htmlFor={field.name}>
                          Charge Code <span className="text-primary">*</span>
                        </label>
                        <Combobox
                          {...field}
                          id={field.name}
                          value={field.value ?? ""}
                          onValueChange={(val) => field.onChange(val ?? "")}
                          items={chargeCodesList}
                        >
                          <ComboboxInput
                            placeholder="Search charge code..."
                            className="max-w-full"
                          />
                          <ComboboxContent>
                            <ComboboxEmpty>No charge code found.</ComboboxEmpty>
                            <ComboboxList>
                              {(item: DataRow, index: number) => (
                                <ComboboxItem
                                  key={`charge-code-${index}`}
                                  value={getChargeCodeLabel(item)}
                                >
                                  {`${item["GetChargeCodesLookup.ADJ_CHARGE_CODE"]?.value}-${item["GetChargeCodesLookup.SHORT_DESCRIPTION"]?.value}`}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                        <ErrorMessage error={formErrors.chargeCode} />
                      </div>
                    )}
                  />
                  <ErrorMessage error={formErrors.chargeCode} />
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <InfoForm
                  ref={infoFormRef}
                  isSelectedChargeCode={isSelectedChargeCode}
                  lastActivityData={lastActivityData}
                  dopData={
                    lookupsData || {
                      AdjustmentPostingRules: [],
                      DOP: [],
                      DOP_ADJ_TYPE: []
                    }
                  }
                />

                <AdjustmentRecordForm
                  isSelectedChargeCode={isSelectedChargeCode}
                  ref={adjustmentFormRef}
                />

                <Attachments
                  files={attachmentFiles}
                  onFilesChange={(files) => setAttachmentFiles(files)}
                />

                <div className="mt-3">
                  <DataPanel
                    selectedRows={selectedRow}
                    setSelectedRows={setSelectedRow}
                    autoPublish={true}
                    showRefreshButton={false}
                    api={`${complaintProxy}/GetNonClosedAndNonResolvedComplaints`}
                    queryParams={{
                      accountId: Object.keys(Customers)[0],
                      ...(isDebugMode ? { isDebugMode } : {})
                    }}
                    panelData={complaintsData}
                    panelDataRefId={refIdComplaints!}
                    headerTitle="Non Closed And Non Resloved Billing Complaints"
                    shouldRender={checkGroupPermissionExists(
                      "nonClosedAndNonReslovedBillingComplaintsPnlGrp"
                    )}
                    viewLayout="table"
                    debugMode={!!isDebugMode}
                    debugRoute={`${debugReportURL}?query=GetNonClosedAndNonResolvedComplaints?accountId=${
                      Customers[Object.keys(Customers)[0]]?.accountID
                    }`}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="px-10">
                    Pay
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AddAdjustment;
