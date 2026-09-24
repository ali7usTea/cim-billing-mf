import {
    isEqual,
    getMinStartDate,
    getMaxStartDate,
    getMaxEndDate,
    formatDateForParams,
    getDates,
    containsIgnoreCase,
    startsWithIgnoreCase,
    getDefaultStartDateSUI,
    getDefaultEndDateSUI,
    getEndDateSUI,
} from '../../src/utils/helpers';

describe('helpers', () => {
    describe('isEqual', () => {
        it('compares primitives correctly', () => {
            expect(isEqual(1, 1)).toBe(true);
            expect(isEqual(1, 2)).toBe(false);
            expect(isEqual('a', 'a')).toBe(true);
            expect(isEqual('a', 'b')).toBe(false);
        });

        it('compares null values', () => {
            expect(isEqual(null, null)).toBe(true);
            expect(isEqual(null, undefined)).toBe(false);
        });

        it('compares arrays', () => {
            expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
            expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
            expect(isEqual([1, 2, 3], [1, 3, 2])).toBe(false);
        });

        it('compares objects', () => {
            expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
            expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
            expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
        });

        it('compares nested objects', () => {
            expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
            expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
        });

        it('handles mixed types', () => {
            expect(isEqual([1], { 0: 1 })).toBe(false);
        });
    });

    describe('getMinStartDate', () => {
        it('returns a date 2 years ago', () => {
            const result = getMinStartDate();
            const expected = new Date();
            expected.setFullYear(expected.getFullYear() - 2);
            expect(result.getFullYear()).toBe(expected.getFullYear());
        });
    });

    describe('getMaxStartDate', () => {
        it('returns the last day of the current month', () => {
            const result = getMaxStartDate();
            const now = new Date();
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            expect(result.getDate()).toBe(lastDay.getDate());
        });
    });

    describe('getMaxEndDate', () => {
        it('returns date maxPeriod months after startDate', () => {
            const result = getMaxEndDate('2024-01-01', 12);
            // 12 months - 1 = 11 months from Jan, then end of that month
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(11); // December
            expect(result.getDate()).toBe(31);
        });
    });

    describe('formatDateForParams', () => {
        it('formats date as YYYY-MM-DD', () => {
            //@ts-ignore
            const result = formatDateForParams(new Date(2024, 2, 5));
            expect(result).toBe('2024-03-05');
        });

        it('pads single-digit month and day', () => {
            //@ts-ignore
            const result = formatDateForParams(new Date(2024, 0, 1));
            expect(result).toBe('2024-01-01');
        });
    });

    describe('getDates', () => {
        it('returns startDate and endDate', () => {
            const result = getDates();
            expect(result.startDate).toBeInstanceOf(Date);
            expect(result.endDate).toBeInstanceOf(Date);
        });

        it('startDate is before endDate', () => {
            const result = getDates();
            expect(result.startDate.getTime()).toBeLessThan(result.endDate.getTime());
        });

        it('startDate is first day of 7 months ago', () => {
            const result = getDates();
            expect(result.startDate.getDate()).toBe(1);
        });
    });

    describe('containsIgnoreCase', () => {
        it('finds substring ignoring case', () => {
            expect(containsIgnoreCase('Hello World', 'hello')).toBe(true);
            expect(containsIgnoreCase('Hello World', 'WORLD')).toBe(true);
            expect(containsIgnoreCase('Hello World', 'xyz')).toBe(false);
        });
    });

    describe('startsWithIgnoreCase', () => {
        it('checks prefix ignoring case', () => {
            expect(startsWithIgnoreCase('Hello World', 'hello')).toBe(true);
            expect(startsWithIgnoreCase('Hello World', 'HELLO')).toBe(true);
            expect(startsWithIgnoreCase('Hello World', 'world')).toBe(false);
        });
    });

    describe('getDefaultStartDateSUI', () => {
        it('returns first day of month N months ago', () => {
            const result = getDefaultStartDateSUI(3);
            expect(result.getDate()).toBe(1);
            const now = new Date();
            const expectedMonth = new Date(now.getFullYear(), now.getMonth() - 3, 1).getMonth();
            expect(result.getMonth()).toBe(expectedMonth);
        });
    });

    describe('getDefaultEndDateSUI', () => {
        it('returns current date', () => {
            const result = getDefaultEndDateSUI();
            const now = new Date();
            expect(result.getDate()).toBe(now.getDate());
            expect(result.getMonth()).toBe(now.getMonth());
        });
    });

    describe('getEndDateSUI', () => {
        it('adds DEFAULT_INTERVAL_BETWEEN_DATES days to startDate', () => {
            const start = new Date(2024, 0, 1); // Jan 1, 2024
            const result = getEndDateSUI(start);
            expect(result.getDate()).toBe(31); // Jan 1 + 30 days = Jan 31
        });
    });
});
