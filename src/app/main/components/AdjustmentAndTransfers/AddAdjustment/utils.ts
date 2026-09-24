import {
  checkCurrentOrFutureMonth,
  containsIgnoreCase,
  startsWithIgnoreCase
} from "../../../../../utils/helpers";
import moment from "moment";
import {
  BILL_PERIOD_BEFORE_ACTIVATION_DATE_ERR_MESSAGE,
  CURRENT_FUTURE_PERIOD_CODE,
  IMMEDIATE_ADJ_CODE,
  PAST_PERIOD_CODE
} from "./const";

function validPeriodType(
  chargeCodePeriodType: any,
  adjustmentRecordDto: any,
  isPrepaid: boolean
) {
  // adjustmentRecordDto contains details of adjustment record being added including charge code
  //  Customer info not availabel yet
  if (isPrepaid) {
    return true;
  }
  const isCurrentOrFutureMonth = checkCurrentOrFutureMonth(
    adjustmentRecordDto["bill_period"]
  );

  if (isCurrentOrFutureMonth) {
    if (containsIgnoreCase(chargeCodePeriodType, CURRENT_FUTURE_PERIOD_CODE)) {
      return true;
    }
  } else {
    if (containsIgnoreCase(chargeCodePeriodType, PAST_PERIOD_CODE)) {
      return true;
    }
  }

  return false;
}

/**
 * Helper function to calculate charge code period type based on adjustment type
 * @param chargeCode - The charge code object from API
 * @param adjType - The adjustment type (e.g., "IMM" for Immediate)
 * @returns The period type string or null
 */
function calcChargeCodePeriodType(
  chargeCode: any,
  adjType: string
): string | null {
  const splittedPeriodTypes =
    chargeCode["GetChargeCodesLookup.PERIOD_TYPE"].value.split(":") || [];
  if (
    startsWithIgnoreCase(
      chargeCode["GetChargeCodesLookup.ADJ_TYPE"].value,
      adjType
    )
  ) {
    return splittedPeriodTypes.length < 1 ? null : splittedPeriodTypes[0];
  } else {
    return splittedPeriodTypes.length < 2 ? null : splittedPeriodTypes[1];
  }
}

/**
 * Validates if a charge code is valid for the given adjustment record and type
 * Migrated from JSF validChargeCode method
 * @param chargeCodeList - List of all available charge codes from API
 * @param adjustmentRecordDto - The adjustment record data with charge code string (format: "CODE-Description")
 * @param adjType - The adjustment type to validate against (e.g., "IMM")
 * @returns true if charge code is valid, false otherwise
 */
export const validChargeCode = (
  adjustmentRecordDto: any,
  adjType: string,
  isPrepaid: boolean
): boolean => {
  // Extract charge code ID from the string (format: "CODE-Description")
  const chargeCode = adjustmentRecordDto?.charge_code || "";

  // Check if the charge code's adjustment type contains the specified adjType (case-insensitive)
  const adjTypeValue = chargeCode["GetChargeCodesLookup.ADJ_TYPE"]?.value || "";
  if (containsIgnoreCase(adjTypeValue, adjType)) {
    // Calculate and validate the period type
    const periodType = calcChargeCodePeriodType(chargeCode, adjType);
    if (validPeriodType(periodType, adjustmentRecordDto, isPrepaid)) {
      return true;
    }
  }

  return false;
};

function validateAdjustmentDateAfterAccountActivationDate(
  adjustmentDate: Date,
  accountActivationDate: string | Date | null
) {
  if (!adjustmentDate) return false;

  if (!accountActivationDate) return false;
  const accountActivationYearMonth = moment(accountActivationDate).startOf(
    "month"
  );
  const adjustmentYearMonth = moment(adjustmentDate).startOf("month");

  return adjustmentYearMonth.isSameOrAfter(accountActivationYearMonth);
}

export function addAdjustmentRecord(
  adjustmentRecordDto: any,
  accountActivationDate: string | Date | null,
  isPrepaid: boolean
) {
  // Validate charge code with IMMEDIATE adjustment type
  if (!validChargeCode(adjustmentRecordDto, IMMEDIATE_ADJ_CODE, isPrepaid)) {
    return {
      error: "Invalid Charge Code"
    };
  }

  // Validate bill period is after account activation date
  if (
    !validateAdjustmentDateAfterAccountActivationDate(
      adjustmentRecordDto["bill_period"],
      accountActivationDate
    )
  ) {
    return {
      error: BILL_PERIOD_BEFORE_ACTIVATION_DATE_ERR_MESSAGE
    };
  }

  return adjustmentRecordDto;
}

/**
 * Constant key for adjustment amount limit in settings
 */
export const ADJUSTMENT_AMOUNT_LIMIT_KEY =
  "activity.system.adjustment.complaint.amount.limit";

/**
 * Interface for adjustment type configuration from API response
 */
export interface AdjustmentType {
  code: string;
  amount: number;
  attachmentDisplayFlag: boolean;
  attachmentRequired: boolean;
  complaintDisplaysFlag: boolean;
  complaintReferenceRequired: boolean;
}

/**
 * Interface for adjustment rule from API response (AdjustmentPostingRules)
 */
export interface AdjustmentRule {
  priority: number;
  permissionName: string;
  permissionAmount: number;
  maxByMonth: number;
  maxByYear: number;
  adjustmentTypes: AdjustmentType[];
}

/**
 * Sorts adjustment rules by priority (ascending order)
 * Equivalent to Java's getSortedAdjustmentRule()
 * @param adjustmentRules - Array of adjustment rules from API
 * @returns Sorted array of adjustment rules by priority
 */
export const getSortedAdjustmentRules = (
  adjustmentRules: AdjustmentRule[]
): AdjustmentRule[] => {
  return [...adjustmentRules].sort((a, b) => a.priority - b.priority);
};

/**
 * Gets the configured adjustment amount limit based on user permissions and adjustment rules
 * Equivalent to Java's getConfiguredAdjustmentAmount()
 * @param adjustmentRules - Array of adjustment rules from API (will be sorted internally)
 * @param selectedActivityTypeCode - The code for the selected activity type (e.g., "CT01_CNA01_AUTO_PAY")
 * @param checkPermission - Function to check if user has permission (e.g., checkGroupPermissionExists)
 * @param defaultLimit - Default limit from settings[ADJUSTMENT_AMOUNT_LIMIT_KEY]
 * @returns The configured amount limit
 */
export const getConfiguredAdjustmentAmount = (
  adjustmentRules: AdjustmentRule[],
  selectedActivityTypeCode: string,
  checkPermission: (permissionName: string) => boolean,
  defaultLimit: number
): number => {
  let amountLimit: number | null = null;

  // Sort rules by priority first
  const sortedRules = getSortedAdjustmentRules(adjustmentRules);

  for (const adjustmentRule of sortedRules) {
    if (checkPermission(adjustmentRule.permissionName)) {
      const matchingType = adjustmentRule.adjustmentTypes.find(
        (type) => type.code === selectedActivityTypeCode
      );
      if (matchingType) {
        amountLimit = matchingType.amount;
        break;
      }
    }
  }
  // If no matching rule found, return default limit
  if (amountLimit === null) {
    amountLimit = defaultLimit;
  }

  return amountLimit;
};

/**
 * Validates if the total amount of adjustment records exceeds the configured limit
 * Equivalent to Java's validateIfTotalAmountExceededLimit()
 * @param adjustmentRules - Array of adjustment rules from API
 * @param adjustmentRecords - Array of adjustment records to validate
 * @param selectedActivityTypeCode - The code for the selected activity type
 * @param checkPermission - Function to check if user has permission
 * @param defaultLimit - Default limit from settings
 * @returns true if total amount EXCEEDS the limit, false otherwise
 */
export const validateIfTotalAmountExceededLimit = (
  adjustmentRules: AdjustmentRule[],
  adjustmentRecords: any[],
  selectedActivityTypeCode: string,
  checkPermission: (permissionName: string) => boolean,
  defaultLimit: number
): boolean => {
  const amountLimit = getConfiguredAdjustmentAmount(
    adjustmentRules,
    selectedActivityTypeCode,
    checkPermission,
    defaultLimit
  );

  const totalAmount = adjustmentRecords.reduce((sum, record) => {
    const amount = parseFloat(record.amount) || 0;
    return sum + amount;
  }, 0);
  return totalAmount > amountLimit;
};

/**
 * Validates if the total amount of adjustment records is within the configured limit
 * @param adjustmentRules - Array of adjustment rules from API
 * @param adjustmentRecords - Array of adjustment records to validate
 * @param selectedActivityTypeCode - The code for the selected activity type
 * @param checkPermission - Function to check if user has permission
 * @param defaultLimit - Default limit from settings
 * @returns true if amount is within limit, false otherwise
 */
/**
 * Validates if the total amount of adjustment records is within the configured limit
 * @param adjustmentRules - Array of adjustment rules from API
 * @param adjustmentRecords - Array of adjustment records to validate
 * @param selectedActivityTypeCode - The code for the selected activity type
 * @param checkPermission - Function to check if user has permission
 * @param defaultLimit - Default limit from settings
 * @returns true if amount is within limit, false otherwise
 */
export const isAmountValidLimit = (
  adjustmentRules: AdjustmentRule[],
  adjustmentRecords: any[],
  selectedActivityTypeCode: string,
  checkPermission: (permissionName: string) => boolean,
  defaultLimit: number
): boolean => {
  if (!adjustmentRecords || adjustmentRecords.length === 0) {
    return true;
  }

  // Use the opposite of validateIfTotalAmountExceededLimit
  return !validateIfTotalAmountExceededLimit(
    adjustmentRules,
    adjustmentRecords,
    selectedActivityTypeCode,
    checkPermission,
    defaultLimit
  );
};
