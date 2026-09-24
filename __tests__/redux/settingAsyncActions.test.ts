jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));

global.fetch = jest.fn();

import { configureStore } from '@reduxjs/toolkit';
import settingReducer, { fetchApiSettings } from '../../src/redux/settings/settingSlice';

describe('Settings Async Actions', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { settingSlice: settingReducer } });
        (global.fetch as jest.Mock).mockReset();
    });

    describe('fetchApiSettings', () => {
        it('populates settings on success', async () => {
            const mockSettings = {
                CS_KEY: 'TEST_KEY',
                CS_VALUE: 'test_value',
            };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockSettings),
            });

            await store.dispatch(fetchApiSettings());
            const state = store.getState().settingSlice;
            expect(state.settings).toEqual(mockSettings);
        });

        it('handles API failure', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            });

            const result = await store.dispatch(fetchApiSettings());
            expect(result.type).toContain('rejected');
        });

        it('calls the correct endpoint', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({}),
            });

            await store.dispatch(fetchApiSettings());
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/settings');
        });
    });
});
