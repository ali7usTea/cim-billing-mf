describe('Auth AsyncActions', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        (global.fetch as jest.Mock) = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('callAuthLogoutApiRouteHandler', () => {
        it('calls the logout API endpoint', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({ url: 'http://logout.url' }),
            });

            const { configureStore } = require('@reduxjs/toolkit');
            const { callAuthLogoutApiRouteHandler } = require('../../src/redux/auth/AsyncActions');
            const authReducer = require('../../src/redux/auth/authSlice').default;

            const store = configureStore({ reducer: { auth: authReducer } });

            // Mock window.location.href setter
            delete (window as any).location;
            (window as any).location = { href: '' };

            await store.dispatch(callAuthLogoutApiRouteHandler());

            expect(global.fetch).toHaveBeenCalledWith('/generic/logout/api/', { cache: 'no-store' });

            // Restore
            //@ts-ignore
            window.location = originalLocation;
        });
    });

    describe('callAuthLoginApiRouteHandler', () => {
        it('redirects to SSO URL', async () => {
            const { configureStore } = require('@reduxjs/toolkit');
            const { callAuthLoginApiRouteHandler } = require('../../src/redux/auth/AsyncActions');
            const authReducer = require('../../src/redux/auth/authSlice').default;

            const store = configureStore({ reducer: { auth: authReducer } });

            // Mock window.top.location.href
            const mockTop = { location: { href: '' } };
            Object.defineProperty(window, 'top', { value: mockTop, writable: true });

            await store.dispatch(callAuthLoginApiRouteHandler());

            expect(mockTop.location.href).toBe('http://localhost:3000/sso');
        });
    });
});
