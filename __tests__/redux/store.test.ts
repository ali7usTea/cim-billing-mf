jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(),
}));
jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../src/redux/auth/authSlice';
import customerReducer from '../../src/redux/customer/customerSlice';
import tabPermissionReducer from '../../src/redux/tabPermission/tabPermssionSlice';
import groupPermissionReducer from '../../src/redux/groupPermission/groupPermssionSlice';
import actionReportReducer from '../../src/redux/TabsData/ActionReportTabSlice';
import settingReducer from '../../src/redux/settings/settingSlice';
import notificationReducer from '../../src/redux/notifications/index';

describe('Redux Store', () => {
    it('creates store with all reducers', () => {
        const store = configureStore({
            reducer: {
                auth: authReducer,
                customerslice: customerReducer,
                TabPermisionslice: tabPermissionReducer,
                GroupPermisionslice: groupPermissionReducer,
                ActionReportTabSlice: actionReportReducer,
                settingSlice: settingReducer,
                notifications: notificationReducer,
            },
        });

        const state = store.getState();
        expect(state.auth).toBeDefined();
        expect(state.customerslice).toBeDefined();
        expect(state.TabPermisionslice).toBeDefined();
        expect(state.GroupPermisionslice).toBeDefined();
        expect(state.ActionReportTabSlice).toBeDefined();
        expect(state.settingSlice).toBeDefined();
        expect(state.notifications).toBeDefined();
    });

    it('store has correct initial state structure', () => {
        const store = configureStore({
            reducer: {
                auth: authReducer,
                customerslice: customerReducer,
                TabPermisionslice: tabPermissionReducer,
                GroupPermisionslice: groupPermissionReducer,
                ActionReportTabSlice: actionReportReducer,
                settingSlice: settingReducer,
                notifications: notificationReducer,
            },
        });

        const state = store.getState();
        expect(state.auth.isAuthenticated).toBe(false);
        expect(state.customerslice.Customers).toEqual({});
        expect(state.TabPermisionslice.tabPermissionMap).toEqual({});
        expect(state.GroupPermisionslice.groupPermissionMap).toEqual({});
        expect(state.ActionReportTabSlice.details).toEqual([]);
        expect(state.settingSlice.settings).toEqual({});
        expect(state.notifications.infoText).toBeNull();
    });
});
