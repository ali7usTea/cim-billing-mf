import { checkTabPermissionExists, checkGroupPermissionExists } from '../../src/utils/permissionUtils';

describe('permissionUtils', () => {
    describe('checkTabPermissionExists', () => {
        it('returns true when permission exists with no expression', () => {
            const map = {
                testTab: { label: 'Test', uiId: 'testTab' },
            };
            expect(checkTabPermissionExists(map, 'testTab')).toBe(true);
        });

        it('returns false when permission does not exist', () => {
            const map = {};
            expect(checkTabPermissionExists(map, 'nonExistent')).toBe(false);
        });

        it('returns true when expression is empty string', () => {
            const map = {
                testTab: { label: 'Test', uiId: 'testTab', tabExpression: '' },
            };
            expect(checkTabPermissionExists(map, 'testTab')).toBe(true);
        });

        it('evaluates expression with variables - returns false when not matching', () => {
            const map = {
                testTab: {
                    label: 'Test',
                    uiId: 'testTab',
                    tabExpression: 'productCode.includes("FIXED")',
                },
            };
            const variables = { productCode: 'MOBILE' };
            expect(checkTabPermissionExists(map, 'testTab', variables)).toBe(false);
        });

        it('evaluates expression returning true', () => {
            const map = {
                testTab: {
                    label: 'Test',
                    uiId: 'testTab',
                    tabExpression: 'productCode.includes("MOB")',
                },
            };
            const variables = { productCode: 'MOB123' };
            expect(checkTabPermissionExists(map, 'testTab', variables)).toBe(true);
        });
    });

    describe('checkGroupPermissionExists', () => {
        it('returns true when permission exists with no expression', () => {
            const map = {
                testGroup: { label: 'Test', uiId: 'testGroup' },
            };
            expect(checkGroupPermissionExists(map, 'testGroup')).toBe(true);
        });

        it('returns false when permission does not exist', () => {
            const map = {};
            expect(checkGroupPermissionExists(map, 'nonExistent')).toBe(false);
        });

        it('returns true when expression is empty', () => {
            const map = {
                testGroup: { label: 'Test', uiId: 'testGroup', groupExpression: '' },
            };
            expect(checkGroupPermissionExists(map, 'testGroup')).toBe(true);
        });

        it('evaluates expression with variables', () => {
            const map = {
                testGroup: {
                    label: 'Test',
                    uiId: 'testGroup',
                    groupExpression: 'regionCode.includes("DXB")',
                },
            };
            const variables = { regionCode: 'DXB001' };
            expect(checkGroupPermissionExists(map, 'testGroup', variables)).toBe(true);
        });
    });
});
