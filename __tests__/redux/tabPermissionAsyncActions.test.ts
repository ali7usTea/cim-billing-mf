jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));

global.fetch = jest.fn();

import { configureStore } from '@reduxjs/toolkit';
import tabPermissionReducer, {
    fetchApiTabPermssion,
    fetchAllTabPermssion,
} from '../../src/redux/tabPermission/tabPermssionSlice';

describe('Tab Permission Async Actions', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { TabPermisionslice: tabPermissionReducer } });
        (global.fetch as jest.Mock).mockReset();
    });

    describe('fetchApiTabPermssion', () => {
        it('populates tabPermissionMap on success', async () => {
            const mockResponse = {
                tabDtoMap: {
                    tab1: { label: 'Tab 1', uiId: 'tab1' },
                    tab2: { label: 'Tab 2', uiId: 'tab2' },
                },
            };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            });

            await store.dispatch(fetchApiTabPermssion({ jwtToken: 'mock-token', ntLogin: 'user@test' }));
            const state = store.getState().TabPermisionslice;
            expect(state.tabPermissionMap).toEqual(mockResponse.tabDtoMap);
        });

        it('handles API failure gracefully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            });

            await store.dispatch(fetchApiTabPermssion({ jwtToken: 'mock-token', ntLogin: 'user@test' }));
            const state = store.getState().TabPermisionslice;
            // On failure, returns empty object
            expect(state.tabPermissionMap).toEqual({});
        });
    });

    describe('fetchAllTabPermssion', () => {
        it('populates AllTabPermissionMap on success', async () => {
            const mockResponse = {
                tabDtoMap: {
                    allTab1: { label: 'All Tab 1', uiId: 'allTab1' },
                },
            };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            });

            await store.dispatch(fetchAllTabPermssion({ jwtToken: 'mock-token', ntLogin: 'user@test' }));
            const state = store.getState().TabPermisionslice;
            expect(state.AllTabPermissionMap).toEqual(mockResponse.tabDtoMap);
        });
    });
});
