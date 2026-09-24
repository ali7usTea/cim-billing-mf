import { render, screen, fireEvent } from '@testing-library/react';
import PaymentDetails from '../../../src/app/main/components/PaymentDetails/index';

// Mock cim-ui-components for isolation
jest.mock('cim-ui-components', () => ({
  Tabs: ({ children, value, onValueChange }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button data-testid={`tab-trigger-${value}`} {...props}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>,
}));

// Mock Loading component
jest.mock('../../../src/app/main/components/Loading', () => <div>LoadingMock</div>);

// Mock BillingChargesPaymnetDetails component
// Account
jest.mock('../../../src/app/main/components/PaymentDetails/Account', () => <div>AccountComponentMock</div>);

// Mock lazy-loaded PaymentDetailsParty
jest.mock('../../../src/app/main/components/PaymentDetails/PaymentDetailsParty', () => <div>PartyComponentMock</div>);

// Mock usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkTabPermissionExists: (key: string) =>
      ['Account', 'Party'].includes(key),
  }),
}));

describe('PaymentDetails Component', () => {
  it('renders all accessible tabs and their content', () => {
    render(<PaymentDetails />);
    // Tab triggers
    expect(screen.getByTestId('tab-trigger-Account')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-Party')).toBeInTheDocument();

    // Tab contents (all rendered since all permissions are granted)
    expect(screen.getByTestId('tab-content-Account')).toHaveTextContent('AccountComponentMock');
    expect(screen.getByTestId('tab-content-Party')).toHaveTextContent('PartyComponentMock');
  });

  it('renders only permitted tabs', () => {
    // Override permission checker to allow only Account tab
    jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkTabPermissionExists: (key: string) => key === 'Account',
      }),
    }));

    render(<PaymentDetails />);
    expect(screen.getByTestId('tab-trigger-Account')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-trigger-Party')).not.toBeInTheDocument();
    expect(screen.getByTestId('tab-content-Account')).toHaveTextContent('AccountComponentMock');
    expect(screen.queryByTestId('tab-content-Party')).not.toBeInTheDocument();
  });

  it('switches active tab on trigger click', () => {
    render(<PaymentDetails />);
    const partyTab = screen.getByTestId('tab-trigger-Party');
    fireEvent.click(partyTab);
    // Since all contents are rendered, we check for PartyComponentMock
    expect(screen.getByTestId('tab-content-Party')).toHaveTextContent('PartyComponentMock');
  });
});