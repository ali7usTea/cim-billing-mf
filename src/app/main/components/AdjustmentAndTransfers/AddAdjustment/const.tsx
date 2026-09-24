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

export const groupedItemTemplate = (option: any) => {
  return (
    <div className="flex align-items-center">
      <div>{option.label}</div>
    </div>
  );
};

export const IMMEDIATE_ADJ_CODE = "IMM";
export const ONE_OFF_CODE = "1OFF";
export const PAST_PERIOD_CODE = "Past";
export const CURRENT_FUTURE_PERIOD_CODE = "Current_Future";
export const INVALID_CHARGE_CODE_MESSAGE =
  "selected charge code is invalid in terms of the period/adj Type,please select valid one";
export const BILL_PERIOD_BEFORE_ACTIVATION_DATE_ERR_MESSAGE =
  "Invalid bill period, It is before the account activation date";

export const formattedGroupedServicesList = (
  rawData: Record<string, any>
): ServiceGroup[] =>
  Object.keys(rawData)
    .filter(
      (category) =>
        Array.isArray(rawData[category]) && rawData[category].length > 0
    )
    .map((category) => ({
      label: category,
      items: rawData[category].map(
        (item: { label: string; value: string }) => ({
          key: item.label,
          value: {
            value: item.value,
            desc: item.label
          }
        })
      )
    }));

export const selectedCountryTemplate = (option: any, props: any) => {
  if (option) {
    return (
      <div className="flex align-items-center">
        <div>{option.name}</div>
      </div>
    );
  }

  return <span>{props.placeholder}</span>;
};

export const countryOptionTemplate = (option: any) => {
  return (
    <div className="flex align-items-center">
      <div>{option.name}</div>
    </div>
  );
};

export const dateTemplate = (date: Date) => {
  let dateOptions: any = { day: "2-digit", year: "numeric" };
  return date.toLocaleDateString("en-US", dateOptions).replace(",", "");
};

export const ErrorMessage = ({ error }: { error: any }) => {
  return error && <p style={{ color: "red" }}>{error.message}</p>;
};

export const formatDate = (date: any) => {
  let day = date.getDate(); // Get the day of the month
  let year = date.getFullYear(); // Get the year

  // Ensure the day is two digits
  day = day < 10 ? "0" + day : day;

  // Return the formatted string
  return `${day}-${year}`;
};
