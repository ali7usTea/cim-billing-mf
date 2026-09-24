import { configureStore } from '@reduxjs/toolkit';
import miscReducer, { clearStateMessages } from '../../src/redux/misc/index';

describe('miscSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { misc: miscReducer } });
    });

    it('has correct initial state', () => {
        const state = store.getState().misc;
        expect(state.message).toBe('');
    });

    describe('clearStateMessages', () => {
        it('sets message to null', () => {
            store.dispatch(clearStateMessages());
            const state = store.getState().misc;
            expect(state.message).toBeNull();
        });
    });
});
