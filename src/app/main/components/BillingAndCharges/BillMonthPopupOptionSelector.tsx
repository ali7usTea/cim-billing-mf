import { Input, RadioGroup, RadioGroupItem } from "cim-ui-components";

const OPTIONS = [
  {
    title: "Send Summary to eBill Email",
    value: "SendCurrentSummaryInvoiceToEBillEmail"
  },
  {
    title: "Send Detailed to eBill Email",
    value: "SendDetailedInvoiceToEBillEmail"
  },
  { title: "Update Account's eBill Email", value: "UpdateAccountSEBillEmail" },
  { title: "Send to different Email", value: "SendToDifferentEmail" }
];

export type BillMonthOption =
  | "SendCurrentSummaryInvoiceToEBillEmail"
  | "SendDetailedInvoiceToEBillEmail"
  | "UpdateAccountSEBillEmail"
  | "SendToDifferentEmail"
  | ""
  | string;

interface OptionSelectorProps {
  selectedOption: BillMonthOption;
  onOptionChange: (val: BillMonthOption) => void;
  emailValue: string;
  onEmailChange: (val: string) => void;
}
export default function BillMonthPopupOptionSelector({
  selectedOption,
  onOptionChange,
  emailValue,
  onEmailChange
}: OptionSelectorProps) {
  return (
    <RadioGroup
      value={selectedOption}
      onValueChange={onOptionChange}
      className="flex flex-col gap-3 mt-4"
    >
      {OPTIONS.map((opt) => (
        <div key={opt.value} className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value} id={opt.value} />
            <label htmlFor={opt.value} className="text-sm cursor-pointer">
              {opt.title}
            </label>
          </div>
        </div>
      ))}
      {selectedOption === "SendToDifferentEmail" && (
        <Input
          className="ml-6 max-w-sm"
          placeholder="Enter email"
          value={emailValue}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      )}
    </RadioGroup>
  );
}
