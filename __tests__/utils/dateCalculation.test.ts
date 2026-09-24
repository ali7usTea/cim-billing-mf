import {
    getLastDateOfLastMonth,
    getFirstDateOfThreeMonthsAgo,
    addMonths,
    addMonthsWithProps,
    addDays,
    addDaysToDate,
    formatDate,
    generateYearList,
    generateMonths,
    getLastDateOfCurrentMonth,
    calculateLastDateOf6thMonth,
    getMonthRange,
    getMonthYearCode,
} from '../../src/utils/dateCalculation';

describe('dateCalculation', () => {
    describe('getLastDateOfLastMonth', () => {
        it('returns the last day of the previous month', () => {
            const result = getLastDateOfLastMonth();
            const now = new Date();
            const expected = new Date(now.getFullYear(), now.getMonth(), 0);
            expect(result.getDate()).toBe(expected.getDate());
            expect(result.getMonth()).toBe(expected.getMonth());
        });
    });

    describe('getFirstDateOfThreeMonthsAgo', () => {
        it('returns the first day of 3 months ago', () => {
            const result = getFirstDateOfThreeMonthsAgo();
            expect(result.getDate()).toBe(1);
            const now = new Date();
            const expectedMonth = new Date(now.getFullYear(), now.getMonth() - 3, 1).getMonth();
            expect(result.getMonth()).toBe(expectedMonth);
        });
    });

    describe('addMonths', () => {
        it('adds 3 months and returns last day of that month', () => {
            const date = new Date(2024, 0, 15); // Jan 15, 2024
            const result = addMonths(date);
            // 3 months from Jan => April, setDate(0) => last day of March
            expect(result.getMonth()).toBe(2); // March (0-indexed)
            expect(result.getDate()).toBe(31);
        });
    });

    describe('addMonthsWithProps', () => {
        it('adds specified months and returns last day of that month', () => {
            const date = new Date(2024, 0, 15); // Jan 15, 2024
            const result = addMonthsWithProps(date, 2);
            // 2 months from Jan => March, setDate(0) => last day of Feb
            expect(result.getMonth()).toBe(1); // February
            expect(result.getDate()).toBe(29); // 2024 is a leap year
        });
    });

    describe('addDays', () => {
        it('adds days to a date', () => {
            const date = new Date(2024, 0, 1); // Jan 1, 2024
            const result = addDays(date, 10);
            expect(result.getDate()).toBe(11);
            expect(result.getMonth()).toBe(0);
        });

        it('handles month overflow', () => {
            const date = new Date(2024, 0, 30); // Jan 30, 2024
            const result = addDays(date, 5);
            expect(result.getMonth()).toBe(1); // February
            expect(result.getDate()).toBe(4);
        });
    });

    describe('addDaysToDate', () => {
        it('adds days to a date', () => {
            const date = new Date(2024, 5, 1); // June 1, 2024
            const result = addDaysToDate(date, 15);
            expect(result.getDate()).toBe(16);
        });
    });

    describe('formatDate', () => {
        it('formats a date correctly', () => {
            const date = new Date(2024, 2, 5); // March 5, 2024
            const result = formatDate(date);
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(2);
            expect(result.getDate()).toBe(5);
        });
    });

    describe('generateYearList', () => {
        it('generates a list of years from start to current', () => {
            const currentYear = new Date().getFullYear();
            const result = generateYearList(2020);
            expect(result[0]).toBe(2020);
            expect(result[result.length - 1]).toBe(currentYear);
            expect(result.length).toBe(currentYear - 2020 + 1);
        });
    });

    describe('generateMonths', () => {
        it('returns 12 months', () => {
            const result = generateMonths();
            expect(result.length).toBe(12);
        });

        it('each month has monthName and lastDate', () => {
            const result = generateMonths();
            result.forEach((month) => {
                expect(month.monthName).toBeDefined();
                expect(month.lastDate).toBeDefined();
                expect(month.lastDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            });
        });
    });

    describe('getLastDateOfCurrentMonth', () => {
        it('returns the last day of the current month', () => {
            const result = getLastDateOfCurrentMonth();
            const now = new Date();
            const expected = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            expect(result.getDate()).toBe(expected.getDate());
        });
    });

    describe('calculateLastDateOf6thMonth', () => {
        it('calculates last date 6 months from start date', () => {
            const result = calculateLastDateOf6thMonth('2024-01-15');
            // Last day of current month (Jan) = 31, then +6 months => July 31
            expect(result.getMonth()).toBe(6); // July
            expect(result.getDate()).toBe(31);
        });
    });

    describe('getMonthRange', () => {
        it('returns formatted month range', () => {
            const result = getMonthRange('15-02-2024 10:00');
            expect(result).toContain('01 February 2024');
            expect(result).toContain('29 February 2024');
        });
    });

    describe('getMonthYearCode', () => {
        it('returns MMYYYY code from date string', () => {
            const result = getMonthYearCode('15-02-2024 10:00');
            expect(result).toBe('022024');
        });

        it('pads single-digit months', () => {
            const result = getMonthYearCode('01-01-2024 08:00');
            expect(result).toBe('012024');
        });
    });
});
