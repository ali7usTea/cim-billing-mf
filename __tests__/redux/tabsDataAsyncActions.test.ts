jest.mock('../../src/utils/lib/proxyAPI', () => ({
    proxyURL: 'http://localhost:3000/api',
}));
jest.mock('axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));
jest.mock('../../src/redux/notifications', () => ({
    setError: jest.fn((payload) => ({ type: 'notifications/setError', payload })),
}));

import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import {
    fetchApiSMSShortCodeDetailsTabData,
    fetchApiGetActionReport,
    fetchApiGetSMSShortCodeName,
} from '../../src/redux/TabsData/AsyncActions';
import smsShortCodeReducer from '../../src/redux/TabsData/SMSShortCodeDetailsTabSlice';
import actionReportReducer from '../../src/redux/TabsData/ActionReportTabSlice';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('TabsData AsyncActions', () => {
    describe('fetchApiSMSShortCodeDetailsTabData', () => {
        let store: any;

        beforeEach(() => {
            store = configureStore({
                reducer: { smsShortCode: smsShortCodeReducer },
            });
            (mockAxios.get as jest.Mock).mockReset();
        });

        it('dispatches fulfilled on success', async () => {
            const mockData = [{ columns: [], rows: [], actioncode: 'SC', header: 'ShortCode', footer: '' }];
            (mockAxios.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

            await store.dispatch(fetchApiSMSShortCodeDetailsTabData());
            const state = store.getState().smsShortCode;
            expect(state.details).toEqual(mockData);
        });

        it('dispatches rejected on failure', async () => {
            (mockAxios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await store.dispatch(fetchApiSMSShortCodeDetailsTabData());
            expect(result.type).toContain('rejected');
        });
    });

    describe('fetchApiGetActionReport', () => {
        let store: any;

        beforeEach(() => {
            store = configureStore({
                reducer: { ActionReportTabSlice: actionReportReducer },
            });
            (mockAxios.get as jest.Mock).mockReset();
        });

        it('dispatches fulfilled on success', async () => {
            const mockData = [{ action: 'report1' }];
            (mockAxios.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

            await store.dispatch(fetchApiGetActionReport('ACC001'));
            const state = store.getState().ActionReportTabSlice;
            expect(state.details).toEqual(mockData);
        });
    });
});
