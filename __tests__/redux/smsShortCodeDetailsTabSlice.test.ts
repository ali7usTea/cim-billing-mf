jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));

import { configureStore } from '@reduxjs/toolkit';
import smsShortCodeReducer from '../../src/redux/TabsData/SMSShortCodeDetailsTabSlice';
import { fetchApiSMSShortCodeDetailsTabData } from '../../src/redux/TabsData/AsyncActions';

describe('SMSShortCodeDetailsTabSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { smsShortCode: smsShortCodeReducer } });
    });

    it('has correct initial state', () => {
        const state = store.getState().smsShortCode;
        expect(state.details).toEqual([]);
    });

    describe('fetchApiSMSShortCodeDetailsTabData', () => {
        it('handles fulfilled state', () => {
            const mockData = [
                { columns: [], rows: [], actioncode: 'test', header: 'Test', footer: '' },
            ];
            store.dispatch({
                type: fetchApiSMSShortCodeDetailsTabData.fulfilled.type,
                payload: mockData,
            });
            const state = store.getState().smsShortCode;
            expect(state.details).toEqual(mockData);
        });

        it('handles rejected state', () => {
            store.dispatch({
                type: fetchApiSMSShortCodeDetailsTabData.rejected.type,
                payload: 'Error message',
            });
            const state = store.getState().smsShortCode;
            // On rejection, state remains unchanged (details stays as [])
            expect(state.details).toEqual([]);
        });
    });
});
