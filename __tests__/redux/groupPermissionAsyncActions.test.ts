jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));

global.fetch = jest.fn();

import { configureStore } from '@reduxjs/toolkit';
import groupPermissionReducer, {
    fetchApiGroupPermssion,
    fetchAllGroupPermssion,
} from '../../src/redux/groupPermission/groupPermssionSlice';

describe('Group Permission Async Actions', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { GroupPermisionslice: groupPermissionReducer } });
        (global.fetch as jest.Mock).mockReset();
    });

    describe('fetchApiGroupPermssion', () => {
        it('populates groupPermissionMap on success', async () => {
            const mockResponse = {
                groupDtoMap: {
                    group1: { label: 'Group 1', uiId: 'group1' },
                    group2: { label: 'Group 2', uiId: 'group2' },
                },
            };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            });

            await store.dispatch(fetchApiGroupPermssion({ jwtToken: 'mock-token', ntLogin: 'user@test' }));
            const state = store.getState().GroupPermisionslice;
            expect(state.groupPermissionMap).toEqual(mockResponse.groupDtoMap);
        });

        it('handles API failure gracefully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            });

            await store.dispatch(fetchApiGroupPermssion({ jwtToken: 'mock-token', ntLogin: 'user@test' }));
            const state = store.getState().GroupPermisionslice;
            expect(state.groupPermissionMap).toEqual({});
        });
    });

    describe('fetchAllGroupPermssion', () => {
        it('populates AllGroupPermissionMap on success', async () => {
            const mockResponse = {
                groupDtoMap: {
                    allGroup1: { label: 'All Group 1', uiId: 'allGroup1' },
                },
            };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            });

            await store.dispatch(fetchAllGroupPermssion({ jwtToken: 'mock-token', ntLogin: 'user@test' }));
            const state = store.getState().GroupPermisionslice;
            expect(state.AllGroupPermissionMap).toEqual(mockResponse.groupDtoMap);
        });
    });
});
