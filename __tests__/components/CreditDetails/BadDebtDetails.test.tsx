import { render, screen } from '@testing-library/react';
import BadDebtDetails from '../../../src/app/main/components/CreditDetails/BadDebtDetails';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, shouldRender }: any) =>
    shouldRender ? <div>{headerTitle}</div> : null,
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
    checkGroupPermissionExists: (group: string) =>
      group === 'creditBadDebtDetailsPanelGroup',
  }),
}));

describe('BadDebtDetails Component', () => {
  it('renders Bad Debt Details panel when permission exists', () => {
    render(<BadDebtDetails />);
    expect(screen.getByText('Bad Debt Details')).toBeInTheDocument();
  });

  it('does not render panel if permission is missing', () => {
    // Override permission checker to return false
    jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));

    render(<BadDebtDetails />);
    expect(screen.queryByText('Bad Debt Details')).not.toBeInTheDocument();
  });
});