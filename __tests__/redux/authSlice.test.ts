jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginSuccess, logout, setState, setJwtToken } from '../../src/redux/auth/authSlice';
import { jwtDecode } from 'jwt-decode';

const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe('authSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { auth: authReducer } });
        mockJwtDecode.mockReset();
    });

    it('has correct initial state', () => {
        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.state).toBe('unauthenticated');
        expect(state.user).toBeNull();
        expect(state.jwtToken).toBeNull();
        expect(state.refreshToken).toBeNull();
    });

    describe('setState', () => {
        it('sets state to authenticated', () => {
            store.dispatch(setState('authenticated'));
            const state = store.getState().auth;
            expect(state.state).toBe('authenticated');
            expect(state.isAuthenticated).toBe(true);
        });

        it('sets state to unauthenticated', () => {
            store.dispatch(setState('authenticated'));
            store.dispatch(setState('unauthenticated'));
            const state = store.getState().auth;
            expect(state.state).toBe('unauthenticated');
            expect(state.isAuthenticated).toBe(false);
        });
    });

    describe('setJwtToken', () => {
        it('sets the JWT token and decodes it', () => {
            const mockDecoded = { sub: 'user@test.com', exp: 9999999999 };
            mockJwtDecode.mockReturnValue(mockDecoded as any);

            store.dispatch(setJwtToken('mock.jwt.token'));
            const state = store.getState().auth;
            expect(state.jwtToken).toBe('mock.jwt.token');
            expect(state.decodedJwtToken).toEqual(mockDecoded);
        });
    });

    describe('loginSuccess', () => {
        it('sets authenticated state with user info', () => {
            const payload = {
                user: { id: '1', name: 'Test User', email: 'test@test.com' },
                jwtToken: 'jwt-token',
                refreshToken: 'refresh-token',
            };
            store.dispatch(loginSuccess(payload));
            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(payload.user);
            expect(state.jwtToken).toBe('jwt-token');
            expect(state.refreshToken).toBe('refresh-token');
        });
    });

    describe('logout', () => {
        it('clears authentication state', () => {
            const payload = {
                user: { id: '1', name: 'Test User', email: 'test@test.com' },
                jwtToken: 'jwt-token',
                refreshToken: 'refresh-token',
            };
            store.dispatch(loginSuccess(payload));
            store.dispatch(logout());
            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.jwtToken).toBeNull();
            expect(state.refreshToken).toBeNull();
        });
    });
});
