import { render, screen } from '@testing-library/react';
import OnlineDues from '../../../src/app/main/components/OnlineDues';

// Mock DataPanel for isolation
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, shouldRender }: any) =>
    shouldRender ? <div>{headerTitle}</div> : null,
}));

// Mock react-redux useSelector
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
    checkGroupPermissionExists: (group: string) => group === 'unbilled_trans',
  }),
}));

describe('OnlineDues Component', () => {
  it('renders DataPanel with Unbilled Transactions header when permission exists', () => {
    render(<OnlineDues />);
    expect(screen.getByText('Unbilled Transactions')).toBeInTheDocument();
    expect(screen.getByTestId('cms-online-dues')).toBeTruthy();
  });

  it('does not render DataPanel if permission is missing', () => {
    // Override permission checker to return false
    jest.mock('../../../hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));

    render(<OnlineDues />);
    expect(screen.queryByText('Unbilled Transactions')).not.toBeInTheDocument();
  });
});