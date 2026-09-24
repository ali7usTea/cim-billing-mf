import { configureStore } from '@reduxjs/toolkit';
import notificationReducer, { setError } from '../../src/redux/notifications/index';

describe('notificationSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { notifications: notificationReducer } });
    });

    it('has correct initial state', () => {
        const state = store.getState().notifications;
        expect(state.notificationType).toBe('info');
        expect(state.infoText).toBeNull();
        expect(state.notificationHeader).toBeNull();
    });

    describe('setError', () => {
        it('sets error notification', () => {
            store.dispatch(setError({
                notificationType: 'error',
                infoText: 'Something went wrong',
                notificationHeader: 'Error',
            }));
            const state = store.getState().notifications;
            expect(state.notificationType).toBe('error');
            expect(state.infoText).toBe('Something went wrong');
            expect(state.notificationHeader).toBe('Error');
        });

        it('sets success notification', () => {
            store.dispatch(setError({
                notificationType: 'success',
                infoText: 'Operation completed',
                notificationHeader: 'Success',
            }));
            const state = store.getState().notifications;
            expect(state.notificationType).toBe('success');
            expect(state.infoText).toBe('Operation completed');
        });

        it('sets warning notification', () => {
            store.dispatch(setError({
                notificationType: 'warn',
                infoText: 'Be careful',
                notificationHeader: 'Warning',
            }));
            const state = store.getState().notifications;
            expect(state.notificationType).toBe('warn');
        });

        it('sets info notification', () => {
            store.dispatch(setError({
                notificationType: 'info',
                infoText: 'FYI',
                notificationHeader: 'Info',
            }));
            const state = store.getState().notifications;
            expect(state.notificationType).toBe('info');
            expect(state.infoText).toBe('FYI');
        });
    });
});
