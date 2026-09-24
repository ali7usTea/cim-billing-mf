import {
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState
} from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList
} from "cim-ui-components";
import axios from "axios";
import { ErrorMessage, formattedGroupedServicesList } from "./const";
import { useSelector } from "react-redux";
import { selectCustomer } from "../../../../../redux/customer/customerSlice";
import { Controller, useForm } from "react-hook-form";

interface InfoFormProps {
  isSelectedChargeCode: {
    isValid: () => any;
    value: any;
  };
  lastActivityData?: any;
  dopData: DopData;
}

interface FormComponent {
  getValues: any;
}

interface Region {
  regionCode: string;
  regionDesc: string;
  regionStatus: string;
  regionGroup: string;
  regionGroupDesc: string;
}
interface Language {
  label: string;
  value: string;
}
type ServiceItem = {
  value: {
    value: string;
    desc: string;
  };
};
interface ServiceGroup {
  label: string;
  items: ServiceItem[];
}
interface DOPSubType {
  code: string;
  description: string;
}

interface DOP {
  adjTypeCode: string;
  description: string;
  dopSubTypes: DOPSubType[] | null; // Array of DOPSubType or null
  code: string;
}
interface DOP_ADJ_TYPE {
  code: string;
  typeId: string;
  description: string;
}

interface DopData {
  AdjustmentPostingRules: any[];
  DOP: DOP[];
  DOP_ADJ_TYPE: DOP_ADJ_TYPE[];
}
interface FormData {
  region: string; // assuming region is a string
  language: string; // assuming language is a string
  mobile_number: string; // assuming mobile_number is a string
  contact_email: string;
  serviceId: { value: string; desc: string } | string; // service object with value and desc
  dop_type: DOP | string; // dop_type is an object (code and description) or null
  cause_refund: string; // cause_refund is a string (description)
  cause_refund_type_id: string;
  subtype: string | null; // subtype is a string or null if no subtypes are available
}

const complaintProxy = "/v1/bff/complaint";

const InfoForm = forwardRef<FormComponent, InfoFormProps>(
  (
    { isSelectedChargeCode, lastActivityData, dopData },
    ref: Ref<FormComponent>
  ) => {
    const [languagesList, setLanguagesList] = useState<Language[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [services, setServices] = useState<ServiceGroup[]>([]);
    const { Customers } = useSelector(selectCustomer);

    const {
      register,
      setValue,
      control,
      watch,
      getValues,
      handleSubmit,
      formState: { errors }
    } = useForm<FormData>({
      // TODO: Prefill data when available
      defaultValues: {
        region: "",
        language: "",
        mobile_number: "",
        serviceId: "",
        contact_email: "",
        dop_type: "",
        cause_refund: "",
        cause_refund_type_id: "",
        subtype: ""
      },
      mode: "onChange"
    });

    const selectedDopType = watch("dop_type");

    const fetchRegions = () => {
      axios
        .get<Region[]>(`${complaintProxy}/custom/regions`)
        .then((res: any) => {
          setRegions(res?.data);
        })
        .catch((err) => {
          console.log(err, "err");
        });
    };

    const fetchLanguages = async () => {
      const res = await axios.get<{
        "cim.billing.tibco.email.sms.languages": string;
      }>(`${complaintProxy}/settings`);
      setLanguagesList(
        res?.data?.["cim.billing.tibco.email.sms.languages"]
          ?.split(",")
          .map((lang) => ({ label: lang, value: lang }))
      );
    };

    const fetchServices = useCallback(() => {
      const accountId = Object.keys(Customers)[0];
      axios
        .get(
          `${complaintProxy}/custom/availableServices?accountId=${accountId}`
        )
        .then((res) => {
          const primaryId = res?.data?.PRIMARY_SERVICE_ID;
          const formattedServices = formattedGroupedServicesList(res?.data);
          setServices(formattedServices);

          if (primaryId) {
            // Find the matching service object in the formatted data
            const matchingService = formattedServices
              .flatMap((group) => group.items)
              .find((item) => item.value.value === primaryId);

            if (matchingService) {
              setValue("serviceId", matchingService.value);
            }
          }
        })
        .catch((err) => {
          console.log(err, "err");
        });
    }, [Customers, setValue]);

    const fetchLastContactDetails = useCallback(async () => {
      const accountId = Object.keys(Customers)[0];
      if (!accountId) return;

      const customer = Customers[accountId];
      // Set region and language with priority: lastActivityData -> customer data
      if (lastActivityData?.region) {
        setValue("region", lastActivityData.region);
      } else if (customer?.regionCode) {
        setValue("region", customer.regionCode);
      }

      if (lastActivityData?.preferredLanguage) {
        setValue("language", lastActivityData.preferredLanguage);
      } else if (customer?.preferredLanguage) {
        setValue("language", customer.preferredLanguage);
      }

      try {
        const response = await axios.get(
          `${complaintProxy}/custom/getLastContactDetailsByAccountId?accountId=${accountId}`
        );
        const data = response.data;
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.displayName === "contactNumber") {
              setValue("mobile_number", item.value || "");
            }
            if (item.displayName === "contactEmail") {
              setValue("contact_email", item.value || "");
            }
          });
        } else {
          if (customer) {
            if (customer.productGroup === "Mobile") {
              setValue("mobile_number", customer.accountNumber || "");
            }
            setValue(
              "contact_email",
              customer.customerEmail || customer.ebillEmail || ""
            );
          }
        }
      } catch (err) {
        console.error("Error fetching contact details:", err);
      }
    }, [Customers, setValue, lastActivityData]);

    useEffect(() => {
      fetchServices();
      fetchRegions();
      fetchLanguages();
      fetchLastContactDetails();
    }, [fetchServices, fetchLastContactDetails]);

    const onSubmit = async () => {
      await isSelectedChargeCode.isValid();
    };
    useImperativeHandle(ref, () => ({
      getValues: () => getValues(),
      submitForm: () => handleSubmit(onSubmit)()
    }));

    const handleDopTypeChange = (
      dopValue: string | null,
      onChange: (value: DOP | undefined) => unknown
    ) => {
      // Set Cause of Refund based on selected Dop Type
      const matchedCause = dopData.DOP_ADJ_TYPE.find(
        (type) => type.code === dopValue
      );
      const matchedDOP = dopData?.DOP?.find((type) => type.adjTypeCode === dopValue);

      onChange(matchedDOP);
      setValue("cause_refund", matchedCause?.description || "");
      setValue("cause_refund_type_id", matchedCause?.typeId || "");
    };

    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <Controller
            name="region"
            control={control}
            rules={{ required: "Region is required" }}
            render={({ field, fieldState }) => (
              <div className="space-y-1" data-testid="error-message">
                <label htmlFor={field.name}>
                  Region <span className="text-primary">*</span>
                </label>
                <Combobox
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                  items={regions}
                >
                  <ComboboxInput
                    placeholder="Search region..."
                    className="max-w-full"
                    value={
                      regions.find((r) => r.regionCode === field.value)
                        ?.regionDesc || ""
                    }
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No region found.</ComboboxEmpty>
                    <ComboboxList>
                      {(region: Region) => (
                        <ComboboxItem
                          key={region.regionCode}
                          value={region.regionCode}
                        >
                          {region.regionDesc}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <ErrorMessage error={fieldState.error} />
              </div>
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Preferred Language *</label>
          <Controller
            name="language"
            control={control}
            rules={{ required: "Language is required" }}
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <Combobox
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                  items={languagesList}
                >
                  <ComboboxInput
                    placeholder="Search language..."
                    className="max-w-full"
                    value={
                      languagesList.find((lang) => lang.value === field.value)
                        ?.value || ""
                    }
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No language found.</ComboboxEmpty>
                    <ComboboxList>
                      {(lang: Language) => (
                        <ComboboxItem key={lang.value} value={lang.value}>
                          {lang.value}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <ErrorMessage error={fieldState.error} />
              </div>
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Mobile Number *</label>
          <Input
            // className="fullWidthInput"

            className="text-sm font-medium text-gray-700 max-w-full h-9.5"
            placeholder="0000 0000 0000"
            {...register("mobile_number", {
              required: {
                value: true,
                message: "Mobile Number is required"
              },
              pattern: {
                value: /^(?:\+971|00971|0|971)?(?:50|1|2|3|4|5|6|7|8|9)\d{8}$/,
                message: "Invalid mobile format"
              }
            })}
          />
          <ErrorMessage error={errors.mobile_number} />
        </div>
        <div className="flex flex-col gap-1">
          <label>Contact Email</label>
          <Input
            // className="fullWidthInput"
            className="text-sm font-medium text-gray-700 max-w-full h-9.5"
            placeholder="email@domain.com"
            {...register("contact_email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format"
              }
            })}
          />
          <ErrorMessage error={errors.contact_email} />
        </div>

        <div className="flex flex-col gap-1">
          <label>Service *</label>
          {/* REFERENCE FOR FUTURE optionLabel="value.desc" */}
          <Controller
            name="serviceId"
            control={control}
            rules={{ required: "Service is required" }}
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <Combobox
                  {...field}
                  value={
                    typeof field.value === "string"
                      ? field.value
                      : field.value?.value
                  }
                  onValueChange={(value) => {
                    field.onChange(value);
                    console.log(value, "event");
                  }}
                  items={services}
                >
                  <ComboboxInput
                    placeholder="Search a service..."
                    className="max-w-full"
                    value={
                      services
                        .flatMap((group) => group.items)
                        .find(
                          (item) =>
                            item.value.value ===
                            (typeof field.value === "string"
                              ? field.value
                              : field.value?.value)
                        )?.value.value || ""
                    }
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No service found.</ComboboxEmpty>
                    <ComboboxList>
                      {(group: ServiceGroup) => (
                        <div key={group.label}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                            {group.label}
                          </div>
                          {group.items.map(({ value: v }) => (
                            <ComboboxItem key={v.value} value={v.value}>
                              <div className="flex items-center">
                                <span>{v.value}</span>
                              </div>
                            </ComboboxItem>
                          ))}
                        </div>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <ErrorMessage error={fieldState.error} />
              </div>
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>DOP Type *</label>
          <Controller
            name="dop_type"
            control={control}
            rules={{ required: "DOP Type is required" }}
            render={({ field, fieldState }) => (
              <>
                <Select
                  onValueChange={(value) =>
                    //@ts-ignore
                    handleDopTypeChange(value, field.onChange)
                  }
                  value={
                    typeof field.value === "string"
                      ? field.value
                      : field.value.adjTypeCode
                  }
                >
                  <SelectTrigger className="text-sm font-medium text-gray-700 w-full h-9.5">
                    <SelectValue placeholder="Select DOP Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {dopData?.DOP?.map((option) => (
                      <SelectItem
                        key={option.adjTypeCode}
                        value={option.adjTypeCode}
                      >
                        {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorMessage error={fieldState.error} />
              </>
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Cause of Refund *</label>
          <Input
            // className="fullWidthInput"
            className="text-sm font-medium text-gray-700 max-w-full h-9.5"
            {...register("cause_refund", {
              required: {
                value: true,
                message: "Cause of refund is required"
              }
            })}
            readOnly
          />
        </div>

        {typeof selectedDopType !== "string" &&
          selectedDopType?.dopSubTypes && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>DOP Sub Type *</label>
              <Controller
                name="subtype"
                control={control}
                rules={{ required: "DOP SubType is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="text-sm font-medium text-gray-700 max-w-full w-full h-9.5">
                        <SelectValue placeholder="Select Subtype" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDopType?.dopSubTypes?.map((sub) => (
                          <SelectItem key={sub.code} value={sub.code}>
                            {sub.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMessage error={fieldState.error} />
                  </>
                )}
              />
            </div>
          )}
      </div>
    );
  }
);
InfoForm.displayName = "InfoForm";
export default InfoForm;
