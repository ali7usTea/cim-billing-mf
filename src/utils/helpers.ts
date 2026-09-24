import { DEFAULT_INTERVAL_BETWEEN_DATES } from "./const.ts";
import { addDaysToDate } from "./dateCalculation";
import moment from "moment";

export const isEqual = (value: any, other: any) => {
  if (typeof value !== "object" && typeof other !== "object") {
    return Object.is(value, other);
  }

  if (value === null && other === null) {
    return true;
  }

  if (typeof value !== typeof other) {
    return false;
  }

  if (value === other) {
    return true;
  }

  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) {
      return false;
    }

    for (let i = 0; i < value.length; i++) {
      if (!isEqual(value[i], other[i])) {
        return false;
      }
    }

    return true;
  }

  if (Array.isArray(value) || Array.isArray(other)) {
    return false;
  }

  if (Object.keys(value).length !== Object.keys(other).length) {
    return false;
  }

  for (const [k, v] of Object.entries(value)) {
    if (!(k in other)) {
      return false;
    }

    if (!isEqual(v, other[k])) {
      return false;
    }
  }

  return true;
};

export const getMinStartDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 2);
  return date;
};

export const getMaxStartDate = () => {
  const date = new Date();
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0); // 0 will get the last day of the current month
  return lastDayOfMonth;
};

export const getMaxEndDate = (startDate: string, maxPeriod = 12) => {
  const date = moment(startDate);
  
  // Add maxPeriod - 1 months and get the last day of that month
  const endDate = date.clone().add(maxPeriod - 1, "months").endOf("month");
  
  return endDate.toDate();
};

export const formatDateForParams = (date: string): string => {
  const d = new Date(date);
  
  // Validate that the date parsed correctly
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date format: ${date}`);
  }
  
  const year = d.getFullYear();
  const month = `0${d.getMonth() + 1}`.slice(-2); // getMonth() returns 0-11
  const day = `0${d.getDate()}`.slice(-2); // getDate() returns 1-31
  return `${year}${month}${day}`;
};

export const getDates = (gap?: number): { startDate: Date; endDate: Date } => {
  const currentDate = moment();
  
  // Get the last date of the current month
  const endDate = currentDate.clone().endOf("month");
  
  // Get the first date of `gap` months ago
  const gapMonths = gap || 6;
  const startDate = currentDate.clone().subtract(gapMonths, "months").startOf("month");

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate()
  };
};

export function containsIgnoreCase(str: string, searchStr: string) {
  return str.toLowerCase().includes(searchStr.toLowerCase());
}

export function startsWithIgnoreCase(value: string, prefix: string) {
  return value.toLowerCase().startsWith(prefix.toLowerCase());
}

export function checkCurrentOrFutureMonth(date: Date) {
  const inputDate = moment(date);
  const currentMonth = moment().startOf("month");
  return inputDate.isSameOrAfter(currentMonth, "month");
}

export const getDefaultStartDateSUI = (minusMonths: number) => {
  let date = new Date(); // equivalent to new LocalDate()
  date.setMonth(date.getMonth() - minusMonths); // minusMonths from current month
  date.setDate(1); // set to the first day of the month
  return date;
};

export const getDefaultEndDateSUI = () => {
  return new Date(); // directly returns the current date
};

export const getEndDateSUI = (startDateSUI: any) => {
  return addDaysToDate(startDateSUI, DEFAULT_INTERVAL_BETWEEN_DATES);
};

export const evaluateContactType = (contactNumber: string): string => {
  let targetType = "MOBILE";
  if (
    contactNumber &&
    !contactNumber.startsWith("05") &&
    !contactNumber.startsWith("009715") &&
    !contactNumber.startsWith("+9715")
  ) {
    targetType = "PHONE";
  }
  return targetType;
};
