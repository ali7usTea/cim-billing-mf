jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));

import { configureStore } from '@reduxjs/toolkit';
import settingReducer, { fetchApiSettings } from '../../src/redux/settings/settingSlice';

describe('settingSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { settingSlice: settingReducer } });
    });

    it('has correct initial state', () => {
        const state = store.getState().settingSlice;
        expect(state.settings).toEqual({});
    });

    describe('fetchApiSettings', () => {
        it('handles fulfilled state', () => {
            const mockSettings = {
                CS_KEY: 'TEST_KEY',
                CS_VALUE: 'test_value',
                CS_CREATED_DATE: '2024-01-01',
                CS_UPDATED_DATE: '2024-01-02',
                CUSTOMER_SUMMARY_BCRM_SYS_URL: 'http://example.com',
            };
            store.dispatch({
                type: fetchApiSettings.fulfilled.type,
                payload: mockSettings,
            });
            const state = store.getState().settingSlice;
            expect(state.settings).toEqual(mockSettings);
        });
    });
});
