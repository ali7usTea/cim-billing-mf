import { RadioGroup, RadioGroupItem } from "cim-ui-components";

const LANGUAGES = ["English", "Arabic"];

export default function BillMonthPopupLanguageSelector({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="flex flex-col gap-3 mt-4"
    >
      {LANGUAGES.map((lang) => (
        <div key={lang} className="flex items-center space-x-2">
          <RadioGroupItem value={lang} id={lang} />
          <label htmlFor={lang} className="text-sm cursor-pointer">
            {lang}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}
