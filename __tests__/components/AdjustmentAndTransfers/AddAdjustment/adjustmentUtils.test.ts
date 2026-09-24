import moment from 'moment';
import {
  validChargeCode,
  addAdjustmentRecord,
  getSortedAdjustmentRules,
  getConfiguredAdjustmentAmount,
  validateIfTotalAmountExceededLimit,
  isAmountValidLimit,
  AdjustmentRule,
  ADJUSTMENT_AMOUNT_LIMIT_KEY,
} from '../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/utils';

// Mock helpers
jest.mock('../../../../src/utils/helpers', () => ({
  checkCurrentOrFutureMonth: jest.fn((bill_period) => {
    // For test: treat June 2024 and later as current/future
    return moment(bill_period).isSameOrAfter(moment('2024-06-01'), 'month');
  }),
  containsIgnoreCase: jest.fn((str, search) => {
    if (!str || !search) return false;
    return String(str).toLowerCase().includes(String(search).toLowerCase());
  }),
  startsWithIgnoreCase: jest.fn((str, search) => {
    if (!str || !search) return false;
    return String(str).toLowerCase().startsWith(String(search).toLowerCase());
  }),
}));

describe('Adjustment Utilities', () => {
  describe('validChargeCode', () => {
    it('returns true for valid charge code and period type', () => {
      const chargeCode = {
        'GetChargeCodesLookup.ADJ_TYPE': { value: 'IMM' },
        'GetChargeCodesLookup.PERIOD_TYPE': { value: 'Current_Future:Past' },
      };
      const adjustmentRecordDto = {
        charge_code: chargeCode,
        bill_period: '2024-06-01',
      };
      expect(validChargeCode(adjustmentRecordDto, 'IMM', false)).toBe(true);
    });

    it('returns false for invalid charge code', () => {
      const chargeCode = {
        'GetChargeCodesLookup.ADJ_TYPE': { value: 'OTHER' },
        'GetChargeCodesLookup.PERIOD_TYPE': { value: 'Current_Future:Past' },
      };
      const adjustmentRecordDto = {
        charge_code: chargeCode,
        bill_period: '2024-05-01',
      };
      expect(validChargeCode(adjustmentRecordDto, 'IMM', false)).toBe(false);
    });

    it('returns true for prepaid', () => {
      const chargeCode = {
        'GetChargeCodesLookup.ADJ_TYPE': { value: 'IMM' },
        'GetChargeCodesLookup.PERIOD_TYPE': { value: 'Current_Future:Past' },
      };
      const adjustmentRecordDto = {
        charge_code: chargeCode,
        bill_period: '2024-05-01',
      };
      expect(validChargeCode(adjustmentRecordDto, 'IMM', true)).toBe(true);
    });
  });

  describe('addAdjustmentRecord', () => {
    it('returns error for invalid charge code', () => {
      const adjustmentRecordDto = {
        charge_code: {
          'GetChargeCodesLookup.ADJ_TYPE': { value: 'OTHER' },
          'GetChargeCodesLookup.PERIOD_TYPE': { value: 'Current_Future:Past' },
        },
        bill_period: '2024-06-01',
      };
      const result = addAdjustmentRecord(adjustmentRecordDto, '2024-01-01', false);
      expect(result.error).toBe('Invalid Charge Code');
    });

    it('returns error for bill period before activation date', () => {
      const adjustmentRecordDto = {
        charge_code: {
          'GetChargeCodesLookup.ADJ_TYPE': { value: 'IMM' },
          'GetChargeCodesLookup.PERIOD_TYPE': { value: 'Current_Future:Past' },
        },
        bill_period: '2023-01-01',
      };
      const result = addAdjustmentRecord(adjustmentRecordDto, '2024-01-01', false);
      expect(result.error).toBe('Invalid bill period, It is before the account activation date');
    });

    it('returns adjustmentRecordDto for valid input', () => {
      const adjustmentRecordDto = {
        charge_code: {
          'GetChargeCodesLookup.ADJ_TYPE': { value: 'IMM' },
          'GetChargeCodesLookup.PERIOD_TYPE': { value: 'Current_Future:Past' },
        },
        bill_period: '2024-06-01',
      };
      const result = addAdjustmentRecord(adjustmentRecordDto, '2024-01-01', false);
      expect(result).toEqual(adjustmentRecordDto);
    });
  });

  describe('getSortedAdjustmentRules', () => {
    it('sorts adjustment rules by priority', () => {
      const rules: AdjustmentRule[] = [
        { priority: 2, permissionName: 'A', permissionAmount: 100, maxByMonth: 5, maxByYear: 10, adjustmentTypes: [] },
        { priority: 1, permissionName: 'B', permissionAmount: 200, maxByMonth: 5, maxByYear: 10, adjustmentTypes: [] },
      ];
      const sorted = getSortedAdjustmentRules(rules);
      expect(sorted[0].priority).toBe(1);
      expect(sorted[1].priority).toBe(2);
    });
  });

  describe('getConfiguredAdjustmentAmount', () => {
    const rules: AdjustmentRule[] = [
      {
        priority: 1,
        permissionName: 'perm1',
        permissionAmount: 100,
        maxByMonth: 5,
        maxByYear: 10,
        adjustmentTypes: [
          { code: 'ACT1', amount: 500, attachmentDisplayFlag: false, attachmentRequired: false, complaintDisplaysFlag: false, complaintReferenceRequired: false },
        ],
      },
      {
        priority: 2,
        permissionName: 'perm2',
        permissionAmount: 200,
        maxByMonth: 5,
        maxByYear: 10,
        adjustmentTypes: [
          { code: 'ACT2', amount: 1000, attachmentDisplayFlag: false, attachmentRequired: false, complaintDisplaysFlag: false, complaintReferenceRequired: false },
        ],
      },
    ];

    it('returns amount for matching permission and activity code', () => {
      const checkPermission = (name: string) => name === 'perm1';
      const amount = getConfiguredAdjustmentAmount(rules, 'ACT1', checkPermission, 9999);
      expect(amount).toBe(500);
    });

    it('returns default limit if no permission matches', () => {
      const checkPermission = (name: string) => false;
      const amount = getConfiguredAdjustmentAmount(rules, 'ACT1', checkPermission, 9999);
      expect(amount).toBe(9999);
    });
  });

  describe('validateIfTotalAmountExceededLimit & isAmountValidLimit', () => {
    const rules: AdjustmentRule[] = [
      {
        priority: 1,
        permissionName: 'perm1',
        permissionAmount: 100,
        maxByMonth: 5,
        maxByYear: 10,
        adjustmentTypes: [
          { code: 'ACT1', amount: 500, attachmentDisplayFlag: false, attachmentRequired: false, complaintDisplaysFlag: false, complaintReferenceRequired: false },
        ],
      },
    ];
    const checkPermission = (name: string) => name === 'perm1';

    it('returns true when total amount exceeds limit', () => {
      const records = [{ amount: 300 }, { amount: 300 }];
      expect(validateIfTotalAmountExceededLimit(rules, records, 'ACT1', checkPermission, 9999)).toBe(true);
    });

    it('returns false when total amount is within limit', () => {
      const records = [{ amount: 200 }, { amount: 200 }];
      expect(validateIfTotalAmountExceededLimit(rules, records, 'ACT1', checkPermission, 9999)).toBe(false);
    });

    it('isAmountValidLimit returns true if within limit', () => {
      const records = [{ amount: 200 }, { amount: 200 }];
      expect(isAmountValidLimit(rules, records, 'ACT1', checkPermission, 9999)).toBe(true);
    });

    it('isAmountValidLimit returns false if exceeded limit', () => {
      const records = [{ amount: 300 }, { amount: 300 }];
      expect(isAmountValidLimit(rules, records, 'ACT1', checkPermission, 9999)).toBe(false);
    });

    it('isAmountValidLimit returns true for empty records', () => {
      expect(isAmountValidLimit(rules, [], 'ACT1', checkPermission, 9999)).toBe(true);
    });
  });

  it('ADJUSTMENT_AMOUNT_LIMIT_KEY is exported', () => {
    expect(ADJUSTMENT_AMOUNT_LIMIT_KEY).toBe('activity.system.adjustment.complaint.amount.limit');
  });
});