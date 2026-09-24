import { render, screen } from '@testing-library/react';
import ActionDetails from '../../../src/app/main/components/CreditDetails/ActionDetails';

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
      group === 'creditActionDetailsPanelGroup',
  }),
}));

describe('ActionDetails Component', () => {
  it('renders Action Details panel when permission exists', () => {
    render(<ActionDetails />);
    expect(screen.getByText('Action Details')).toBeInTheDocument();
  });

  it('does not render panel if permission is missing', () => {
    // Override permission checker to return false
    jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));

    render(<ActionDetails />);
    expect(screen.queryByText('Action Details')).not.toBeInTheDocument();
  });
});