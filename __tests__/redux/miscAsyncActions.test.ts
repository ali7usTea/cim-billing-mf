jest.mock('axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));

import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import { cancelAllParkedRequests } from '../../src/redux/misc/AsyncActions';
import miscReducer from '../../src/redux/misc/index';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Misc AsyncActions', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { misc: miscReducer } });
        (mockAxios.get as jest.Mock).mockReset();
    });

    describe('cancelAllParkedRequests', () => {
        it('dispatches fulfilled on success', async () => {
            const mockResponse = { responseMessage: 'Cancelled successfully' };
            (mockAxios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

            await store.dispatch(cancelAllParkedRequests({
                accountnumber: '12345',
                CancellationType: 'ALL',
            }));

            const state = store.getState().misc;
            expect(state.message).toBe('Cancelled successfully');
        });

        it('calls the correct API endpoint', async () => {
            (mockAxios.get as jest.Mock).mockResolvedValueOnce({ data: { responseMessage: 'ok' } });

            await store.dispatch(cancelAllParkedRequests({
                accountnumber: '12345',
                CancellationType: 'ALL',
            }));

            expect(mockAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/CancelParkingRequest?accountnumber=12345&CancellationType=ALL')
            );
        });

        it('handles API failure', async () => {
            (mockAxios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await store.dispatch(cancelAllParkedRequests({
                accountnumber: '12345',
                CancellationType: 'ALL',
            }));

            expect(result.type).toContain('rejected');
        });
    });
});
