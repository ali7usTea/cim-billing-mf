jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
}));
jest.mock('react-router', () => ({
    useSearchParams: jest.fn(() => [new URLSearchParams('accountId=ACC001'), jest.fn()]),
}));

import React from 'react';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { usePermissionChecker } from '../../src/app/hooks/usePermissionChecker';

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('usePermissionChecker', () => {
    beforeEach(() => {
        mockUseSelector.mockImplementation((selector: any) =>
            selector({
                TabPermisionslice: {
                    tabPermissionMap: {
                        testTab: { label: 'Test Tab', uiId: 'testTab' },
                        exprTab: { label: 'Expr Tab', uiId: 'exprTab', tabExpression: 'productCode.includes("MOB")' },
                    },
                    AllTabPermissionMap: {
                        testTab: { label: 'Test Tab', uiId: 'testTab' },
                        exprTab: { label: 'Expr Tab', uiId: 'exprTab' },
                    },
                },
                GroupPermisionslice: {
                    groupPermissionMap: {
                        testGroup: { label: 'Test Group', uiId: 'testGroup' },
                        exprGroup: { label: 'Expr Group', uiId: 'exprGroup', groupExpression: 'regionCode.includes("DXB")' },
                    },
                    AllGroupPermissionMap: {
                        testGroup: { label: 'Test Group', uiId: 'testGroup' },
                        exprGroup: { label: 'Expr Group', uiId: 'exprGroup' },
                    },
                },
                customerslice: {
                    Customers: {
                        ACC001: {
                            accountID: 'ACC001',
                            productCode: 'MOB123',
                            regionCode: 'DXB001',
                        },
                    },
                },
            })
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('returns checkTabPermissionExists and checkGroupPermissionExists', () => {
        const { result } = renderHook(() => usePermissionChecker());
        expect(result.current.checkTabPermissionExists).toBeDefined();
        expect(result.current.checkGroupPermissionExists).toBeDefined();
    });

    it('checkTabPermissionExists returns true for permission without expression', () => {
        const { result } = renderHook(() => usePermissionChecker());
        expect(result.current.checkTabPermissionExists('testTab')).toBe(true);
    });

    it('checkTabPermissionExists returns true for permission not in AllTabPermissionMap', () => {
        const { result } = renderHook(() => usePermissionChecker());
        // Permission not in AllTabPermissionMap grants access
        expect(result.current.checkTabPermissionExists('nonExistent')).toBe(true);
    });

    it('checkTabPermissionExists evaluates expression', () => {
        const { result } = renderHook(() => usePermissionChecker());
        // productCode is 'MOB123' which includes 'MOB' => true
        expect(result.current.checkTabPermissionExists('exprTab')).toBe(true);
    });

    it('checkGroupPermissionExists returns true for permission without expression', () => {
        const { result } = renderHook(() => usePermissionChecker());
        expect(result.current.checkGroupPermissionExists('testGroup')).toBe(true);
    });

    it('checkGroupPermissionExists returns true for permission not in AllGroupPermissionMap', () => {
        const { result } = renderHook(() => usePermissionChecker());
        expect(result.current.checkGroupPermissionExists('nonExistent')).toBe(true);
    });

    it('checkGroupPermissionExists evaluates expression', () => {
        const { result } = renderHook(() => usePermissionChecker());
        // regionCode is 'DXB001' which includes 'DXB' => true
        expect(result.current.checkGroupPermissionExists('exprGroup')).toBe(true);
    });

    it('checkTabPermissionExists returns false when permission is in AllMap but not in permission map', () => {
        mockUseSelector.mockImplementation((selector: any) =>
            selector({
                TabPermisionslice: {
                    tabPermissionMap: {},
                    AllTabPermissionMap: {
                        restrictedTab: { label: 'Restricted', uiId: 'restrictedTab' },
                    },
                },
                GroupPermisionslice: {
                    groupPermissionMap: {},
                    AllGroupPermissionMap: {},
                },
                customerslice: {
                    Customers: { ACC001: { accountID: 'ACC001' } },
                },
            })
        );
        const { result } = renderHook(() => usePermissionChecker());
        expect(result.current.checkTabPermissionExists('restrictedTab')).toBe(false);
    });
});
