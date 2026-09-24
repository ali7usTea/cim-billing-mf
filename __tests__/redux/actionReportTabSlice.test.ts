jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));

import { configureStore } from '@reduxjs/toolkit';
import actionReportReducer from '../../src/redux/TabsData/ActionReportTabSlice';
import { fetchApiGetActionReport } from '../../src/redux/TabsData/AsyncActions';

describe('ActionReportTabSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { ActionReportTabSlice: actionReportReducer } });
    });

    it('has correct initial state', () => {
        const state = store.getState().ActionReportTabSlice;
        expect(state.details).toEqual([]);
    });

    describe('fetchApiGetActionReport', () => {
        it('handles fulfilled state', () => {
            const mockData = [{ action: 'test', status: 'complete' }];
            store.dispatch({
                type: fetchApiGetActionReport.fulfilled.type,
                payload: mockData,
            });
            const state = store.getState().ActionReportTabSlice;
            expect(state.details).toEqual(mockData);
        });

        it('handles null payload gracefully', () => {
            store.dispatch({
                type: fetchApiGetActionReport.fulfilled.type,
                payload: null,
            });
            const state = store.getState().ActionReportTabSlice;
            expect(state.details).toEqual([]);
        });
    });
});
