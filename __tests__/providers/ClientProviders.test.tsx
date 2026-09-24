jest.mock('react-redux', () => ({
    Provider: jest.fn(({ children }: any) => <div data-testid="redux-provider">{children}</div>),
}));
jest.mock('../../src/redux/store', () => ({
    store: {},
}));
jest.mock('@tanstack/react-query', () => ({
    QueryClientProvider: jest.fn(({ children }: any) => <div data-testid="query-provider">{children}</div>),
    QueryClient: jest.fn(() => ({})),
}));
jest.mock('../../src/layout/context/layoutcontext', () => ({
    LayoutProvider: jest.fn(({ children }: any) => <div data-testid="layout-provider">{children}</div>),
}));
jest.mock('../../src/providers/AuthProvider', () => ({
    AuthProvider: jest.fn(() => <div data-testid="auth-provider">Auth</div>),
}));
jest.mock('react-router', () => ({
    BrowserRouter: jest.fn(({ children }: any) => <div>{children}</div>),
    useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
}));

import { render, screen } from '@testing-library/react';
import ClientProviders from '../../src/providers/ClientProviders';

describe('ClientProviders', () => {
    it('renders children', () => {
        render(
            <ClientProviders>
                <div data-testid="child">Child Content</div>
            </ClientProviders>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('wraps with LayoutProvider', () => {
        render(
            <ClientProviders>
                <div>Test</div>
            </ClientProviders>
        );
        expect(screen.getByTestId('layout-provider')).toBeInTheDocument();
    });

    it('renders AuthProvider', () => {
        render(
            <ClientProviders>
                <div>Test</div>
            </ClientProviders>
        );
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    });
});
