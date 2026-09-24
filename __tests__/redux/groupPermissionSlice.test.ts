jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));

import { configureStore } from '@reduxjs/toolkit';
import groupPermissionReducer, {
    getGrouppermission,
    fetchApiGroupPermssion,
    fetchAllGroupPermssion,
} from '../../src/redux/groupPermission/groupPermssionSlice';

describe('groupPermissionSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { GroupPermisionslice: groupPermissionReducer } });
    });

    it('has correct initial state', () => {
        const state = store.getState().GroupPermisionslice;
        expect(state.groupPermissionMap).toEqual({});
        expect(state.AllGroupPermissionMap).toEqual({});
    });

    describe('fetchApiGroupPermssion', () => {
        it('handles fulfilled state', () => {
            const mockPermissions = {
                group1: { label: 'Group 1', uiId: 'group1' },
                group2: { label: 'Group 2', uiId: 'group2' },
            };
            store.dispatch({
                type: fetchApiGroupPermssion.fulfilled.type,
                payload: mockPermissions,
            });
            const state = store.getState().GroupPermisionslice;
            expect(state.groupPermissionMap).toEqual(mockPermissions);
        });
    });

    describe('fetchAllGroupPermssion', () => {
        it('handles fulfilled state', () => {
            const mockPermissions = {
                group1: { label: 'All Group 1', uiId: 'group1' },
            };
            store.dispatch({
                type: fetchAllGroupPermssion.fulfilled.type,
                payload: mockPermissions,
            });
            const state = store.getState().GroupPermisionslice;
            expect(state.AllGroupPermissionMap).toEqual(mockPermissions);
        });
    });
});
