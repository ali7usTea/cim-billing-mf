import React from "react";
import { Button, CalendarInput, cn } from "cim-ui-components";
import {
  add3Months,
  calculateLastDateOfMonth
} from "../../../utils/dateCalculation";

interface DateSearchProps {
  onSearch: (startDate: string, endDate: string) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  startDateProps?: {
    maxDate?: (startDate: Date, endDate: Date) => Date;
    minDate?: (startDate: Date, endDate: Date) => Date;
  };
  endDateProps?: {
    maxDate?: (startDate: Date, endDate: Date) => Date;
    minDate?: (startDate: Date, endDate: Date) => Date;
  };
  className?: string;
  gap?: number;
  startChangesEndDate?: boolean;
}

const DateSearch = ({
  onSearch,
  initialStartDate,
  initialEndDate,
  startDateProps = {},
  endDateProps = {},
  className,
  gap = 6,
  startChangesEndDate = true
}: DateSearchProps) => {
  const isValidDate: (date: Date | undefined) => date is Date = (
    date: Date | undefined
  ): date is Date => !!date && date instanceof Date && !isNaN(date.getTime());

  // Validate and initialize dates
  const validStartDate = isValidDate(initialStartDate)
    ? initialStartDate
    : new Date();
  const validEndDate = isValidDate(initialEndDate)
    ? initialEndDate
    : add3Months(new Date());

  const [startDate, setStartDate] = React.useState<Date>(validStartDate);
  const [endDate, setEndDate] = React.useState<Date>(validEndDate);

  React.useEffect(() => {
    if (isValidDate(initialStartDate)) {
      setStartDate(initialStartDate);
    }

    if (isValidDate(initialEndDate)) {
      setEndDate(initialEndDate);
    }
  }, [initialStartDate, initialEndDate]);

  const handleStartDateChange = (date: Date | undefined) => {
    if (isValidDate(date)) {
      setStartDate(date);
      if (startChangesEndDate) setEndDate(calculateLastDateOfMonth(date, gap));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (isValidDate(date)) {
      setEndDate(date);
    }
  };

  const handleSearchClick = () => {
    onSearch(startDate.toISOString(), endDate.toISOString());
  };

  return (
    <div
      className={cn("flex justify-end gap-2 items-center cim-datesearch", className)}
      title="cim-datesearch"
    >
      <label>Start Date:</label>
      <CalendarInput
        maxDate={
          startDateProps.maxDate
            ? startDateProps.maxDate(startDate, endDate)
            : undefined
        }
        minDate={
          startDateProps.minDate
            ? startDateProps.minDate(startDate, endDate)
            : undefined
        }
        value={startDate}
        onChange={handleStartDateChange}
        dateFormat="yyyy-MM-dd"
        id="sdate"
        className="m-0 flex gap-4"
        placeholder="YYYY-MM-DD"
      />
      <label>End Date:</label>
      <CalendarInput
        maxDate={endDateProps?.maxDate?.(startDate, endDate)}
        minDate={endDateProps?.minDate?.(startDate, endDate)}
        value={endDate}
        onChange={handleEndDateChange}
        dateFormat="yyyy-MM-dd"
        id="edate"
        className="m-0 flex gap-4"
        placeholder="YYYY-MM-DD"
      />
      <Button onClick={handleSearchClick}>Search</Button>
    </div>
  );
};

export default DateSearch;
