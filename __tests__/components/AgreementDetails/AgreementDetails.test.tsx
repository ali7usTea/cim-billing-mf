import { render, screen, fireEvent } from '@testing-library/react';
import AgreementDetails from '../../../src/app/main/components/AgreementDetails';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  DataPanel: ({ headerTitle, shouldRender, leadingColumns, ...props }: any) =>
    shouldRender ? (
      <div>
        <div>{headerTitle}</div>
        {leadingColumns && leadingColumns.length > 0 && (
          <div data-testid="leading-column">
            {leadingColumns[0].component({ "GetAgreementDetails.AGREEMENT_CODE": "AG123" })}
          </div>
        )}
      </div>
    ) : null,
}));

// Mock react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    Customers: {
      customer1: {
        accountID: 'ACC123',
        debugReport: false,
      },
    },
  })),
}));

// Mock proxyURL
jest.mock('../../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'http://mock-proxy-url',
}));

// Mock usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: (group: string) => true,
  }),
}));

describe('AgreementDetails Component', () => {
  it('renders MainDetails panel', () => {
    render(<AgreementDetails />);
    expect(screen.getByText('Agreement Main Details')).toBeInTheDocument();
    expect(screen.getByTestId('leading-column')).toBeInTheDocument();
  });

  it('renders other panels after clicking Details button', () => {
    render(<AgreementDetails />);
    // Simulate clicking the Details button in leading column
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Panels should appear
    expect(screen.getByText('Agreement Causal Accounts')).toBeInTheDocument();
    expect(screen.getByText('Agreement Installments')).toBeInTheDocument();
    expect(screen.getByText('Agrement Affected Accounts')).toBeInTheDocument();
    expect(screen.getByText('Payment Agreement Workflow Details')).toBeInTheDocument();
  });

  it('does not render panels if shouldRender is false', () => {
    // Override permission checker to return false
    jest.mock('../../../hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));

    render(<AgreementDetails />);
    expect(screen.queryByText('Agreement Main Details')).not.toBeInTheDocument();
  });
});