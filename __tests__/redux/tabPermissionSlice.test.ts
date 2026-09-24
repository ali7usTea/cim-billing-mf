jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));

import { configureStore } from '@reduxjs/toolkit';
import tabPermissionReducer, {
    addTabPermssion,
    updateTabPermission,
    deleteTabPermssion,
    fetchApiTabPermssion,
    fetchAllTabPermssion,
} from '../../src/redux/tabPermission/tabPermssionSlice';

describe('tabPermissionSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { TabPermisionslice: tabPermissionReducer } });
    });

    it('has correct initial state', () => {
        const state = store.getState().TabPermisionslice;
        expect(state.tabPermissionMap).toEqual({});
        expect(state.AllTabPermissionMap).toEqual({});
    });

    describe('addTabPermssion', () => {
        it('adds a tab permission', () => {
            const permission = { label: 'Test Tab', uiId: 'tab1' };
            store.dispatch(addTabPermssion(permission));
            const state = store.getState().TabPermisionslice;
            expect(state.tabPermissionMap['tab1']).toEqual(permission);
        });
    });

    describe('updateTabPermission', () => {
        it('updates an existing tab permission label', () => {
            const permission = { label: 'Original', uiId: 'tab1' };
            store.dispatch(addTabPermssion(permission));
            store.dispatch(updateTabPermission({ label: 'Updated', uiId: 'tab1' }));
            const state = store.getState().TabPermisionslice;
            expect(state.tabPermissionMap['tab1'].label).toBe('Updated');
        });
    });

    describe('deleteTabPermssion', () => {
        it('deletes a tab permission', () => {
            const permission = { label: 'Test', uiId: 'tab1' };
            store.dispatch(addTabPermssion(permission));
            store.dispatch(deleteTabPermssion(permission));
            const state = store.getState().TabPermisionslice;
            expect(state.tabPermissionMap['tab1']).toBeUndefined();
        });
    });

    describe('fetchApiTabPermssion', () => {
        it('handles fulfilled state', () => {
            const mockPermissions = {
                tab1: { label: 'Tab 1', uiId: 'tab1' },
                tab2: { label: 'Tab 2', uiId: 'tab2' },
            };
            store.dispatch({
                type: fetchApiTabPermssion.fulfilled.type,
                payload: mockPermissions,
            });
            const state = store.getState().TabPermisionslice;
            expect(state.tabPermissionMap).toEqual(mockPermissions);
        });
    });

    describe('fetchAllTabPermssion', () => {
        it('handles fulfilled state', () => {
            const mockPermissions = {
                tab1: { label: 'All Tab 1', uiId: 'tab1' },
            };
            store.dispatch({
                type: fetchAllTabPermssion.fulfilled.type,
                payload: mockPermissions,
            });
            const state = store.getState().TabPermisionslice;
            expect(state.AllTabPermissionMap).toEqual(mockPermissions);
        });
    });
});
