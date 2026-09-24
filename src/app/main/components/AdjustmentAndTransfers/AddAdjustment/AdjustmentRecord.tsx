import {
  Button,
  CalendarButton,
  DataPanel,
  Input,
  PanelData,
  Textarea
} from "cim-ui-components";
import moment from "moment";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "../../../../../redux/store";
import { useSubscriber } from "../../../../hooks/useSubscriber";
import { XIcon } from "../../../../icons/XIcon";
import { ErrorMessage } from "./const";
import { addAdjustmentRecord } from "./utils";

interface FormValues {
  amount: string;
  bill_period: Date | null;
  remarks: string;
}

interface AdjustmentRecord {
  id: string;
  amount: string;
  bill_period: Date | null;
  remarks: string;
  charge_code: string;
}

const AdjustmentRecordForm: React.FC<any> = forwardRef(
  ({ isSelectedChargeCode }, ref) => {
    const [adjustmentRecords, setAdjustmentRecords] = useState<
      AdjustmentRecord[]
    >([]);
    const { isPrepaid } = useSubscriber();
    const { Customers } = useSelector(
      (state: RootState) => state.customerslice
    );
    const isDebugMode = Customers[Object.keys(Customers)[0]]?.debugReport;

    // Get last day of previous month as default
    const getLastDayOfPreviousMonth = () => {
      const today = new Date();
      const lastDayPrevMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );
      return lastDayPrevMonth;
    };

    const {
      register,
      handleSubmit,
      reset,
      control,
      formState: { errors }
    } = useForm<FormValues>({
      defaultValues: {
        amount: "",
        bill_period: getLastDayOfPreviousMonth(),
        remarks: ""
      }
    });
    useImperativeHandle(
      ref,
      () => ({
        getAdjustmentRecords: () => adjustmentRecords
      }),
      [adjustmentRecords]
    );

    function generateUniqueId() {
      const timestamp = Date.now(); // Current timestamp in milliseconds
      const randomNum = Math.floor(Math.random() * 100000); // Random number between 0 and 99999
      return `id-${timestamp}-${randomNum}`;
    }

    const onSubmit: SubmitHandler<FormValues> = async (data, e) => {
      e?.preventDefault();
      e?.stopPropagation(); // Stops the outer form from triggering its own submit
      const isChargeCodeSelected = await isSelectedChargeCode.isValid();

      if (isChargeCodeSelected) {
        const adjustmentRecordDto = {
          ...data,
          charge_code: isSelectedChargeCode.value,
          charge_code_object: isSelectedChargeCode.value,
          id: generateUniqueId()
        };
        // Get the account activation date from the first customer in the Customers object
        const firstCustomer = Customers[Object.keys(Customers)[0]];
        const accountActivationDate =
          firstCustomer?.accountActivationDate || null;

        const adjustmentRecord = addAdjustmentRecord(
          adjustmentRecordDto,
          accountActivationDate,
          isPrepaid
        );

        if (adjustmentRecord.error) {
          toast.error("Error", {
            description: adjustmentRecord.error
          });
        } else {
          adjustmentRecordDto.charge_code = `${adjustmentRecordDto.charge_code["GetChargeCodesLookup.ADJ_CHARGE_CODE"]?.value}-${adjustmentRecordDto.charge_code["GetChargeCodesLookup.SHORT_DESCRIPTION"]?.value}`;
          setAdjustmentRecords([...adjustmentRecords, adjustmentRecordDto]);
          reset();
        }
      }
    };
    const handleRemove = (id: string) => {
      setAdjustmentRecords((prevRecords) =>
        prevRecords.filter((record) => record.id !== id)
      );
    };
    const panelDataRecords = useMemo(
      () =>
        adjustmentRecords.map((record) => ({
          id: { value: record.id },
          Amount: { value: record.amount },
          Bill_Period: {
            value: moment(record.bill_period).format("MM-YY")
          },
          Charge_Code: { value: record.charge_code },
          Remarks: { value: record.remarks }
        })),
      [adjustmentRecords]
    );

    const panelData = useMemo<PanelData>(
      () => ({
        AdjustmentRecords: {
          columns: [
            { field: "Amount", header: "Amount", render: true },
            {
              field: "Bill_Period",
              header: "Bill Period",
              render: true
            },
            {
              field: "Charge_Code",
              header: "Charge Code",
              render: true
            },
            { field: "Remarks", header: "Remarks", render: true }
          ],
          name: "AdjustmentRecords",
          rows: panelDataRecords || [],
          actionCode: "AdjustmentRecords"
        }
      }),
      [panelDataRecords]
    );

    return (
      <>
        <div>
          <p className="text-lg font-bold pt-4 pb-2">Adjustment Record Form</p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <div className="grid grid-cols-3 gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="amount">
                  Amount <span className="text-primary">*</span>
                </label>
                <div className="flex gap-1 flex-col">
                  <Input
                    {...register("amount", {
                      required: {
                        value: true,
                        message: "Amount is required"
                      },
                      validate: (value) =>
                        parseFloat(value) > 0 || "Amount is not valid"
                    })}
                    className="text-sm font-medium text-gray-700 max-w-full h-9.5"
                  />
                  <ErrorMessage error={errors.amount} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="bill_period">Bill Period</label>
                <div>
                  <Controller
                    name="bill_period"
                    control={control}
                    render={({ field }) => (
                      <CalendarButton
                        value={field.value ?? undefined}
                        onChange={(date) => field.onChange(date)}
                        dateFormat="dd/MM/yy"
                        triggerProps={{
                          className: "w-full"
                        }}
                      />
                    )}
                  />
                  <ErrorMessage error={errors.bill_period} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="remarks">
                  Remarks <span className="text-primary">*</span>
                </label>
                <div>
                  <Textarea
                    // className="remarksInput"
                    className="text-sm font-medium text-gray-700 max-w-full h-9.5 resize-none! py-2!"
                    {...register("remarks", {
                      required: {
                        value: true,
                        message: "Remarks is required"
                      },
                      maxLength: {
                        value: 250,
                        message: "Max length 250 characters"
                      }
                    })}
                    rows={5}
                    cols={30}
                  />
                  <ErrorMessage error={errors.remarks} />
                  {/* <div>{remainingChars > -1 ? remainingChars : 0} characters remaining</div> */}
                </div>
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <Button type="button" onClick={handleSubmit(onSubmit)}>
                Add Adjustment
              </Button>
            </div>
          </form>
        </div>
        <DataPanel
          panelData={panelData}
          autoPublish={true}
          isLoading={false}
          error={null}
          headerTitle="All Adjustment Records"
          shouldRender={true}
          showRefreshButton={false}
          viewLayout="table"
          debugMode={!!isDebugMode}
          trailingColumns={[
            {
              title: "Remove",
              component: ({ row }) => (
                <Button
                  className="my-2"
                  onClick={() => handleRemove(`${row.original.id ?? ""}`)}
                >
                  <XIcon />
                </Button>
              )
            }
          ]}
        />
      </>
    );
  }
);

AdjustmentRecordForm.displayName = "AdjustmentRecordForm";
export default AdjustmentRecordForm;
