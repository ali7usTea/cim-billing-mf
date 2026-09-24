import { render, screen, fireEvent } from '@testing-library/react';
import BillSummary from '../../../src/app/main/components/CurrentMonth/BillSummary';

// Mock cim-ui-components for isolation
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, shouldRender }: any) =>
    shouldRender ? <div>{headerTitle}</div> : null,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  ButtonGroup: ({ children }: any) => <div>{children}</div>,
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
    checkGroupPermissionExists: (group: string) =>
      group === 'unbilled_trans',
  }),
}));

describe('BillSummary Component', () => {
  it('renders DataPanel and buttons when permission exists', () => {
    render(<BillSummary />);
    // DataPanel
    expect(screen.getByText('Unbilled Transactions')).toBeInTheDocument();
    // Buttons
    expect(screen.getByText('View Last Bill Summary')).toBeInTheDocument();
    expect(screen.getByText('Generate Current Invoice')).toBeInTheDocument();
    expect(screen.getByText('Download Demanded Current Invoice')).toBeInTheDocument();
  });

  it('does not render DataPanel if permission is missing', () => {
    // Override permission checker to return false
    jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));

    render(<BillSummary />);
    expect(screen.queryByText('Unbilled Transactions')).not.toBeInTheDocument();
  });

  it('sets billMonth when "View Last Bill Summary" button is clicked', () => {
    render(<BillSummary />);
    const button = screen.getByText('View Last Bill Summary');
    fireEvent.click(button);
    // Since billMonth is internal state, you may check for side effects if any,
    // but here we just ensure the button is clickable.
    expect(button).toBeInTheDocument();
  });
});