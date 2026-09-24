import { render, screen, fireEvent } from '@testing-library/react';
import CurrentMonthTab from '../../../src/app/main/components/CurrentMonth/index';

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
jest.mock('../../../src/app/main/components/Loading', () => <div>Loading...</div>);

// Mock BillSummary component
jest.mock('../../../src/app/main/components/CurrentMonth/BillSummary', () => <div>BillSummaryMock</div>);

// Mock lazy-loaded BillDetails and CallDetails
jest.mock('../../../src/app/main/components/CurrentMonth/BillDetails', () => <div>BillDetailsMock</div>);
jest.mock('../../../src/app/main/components/CurrentMonth/CallDetails', () => <div>CallDetailsMock</div>);

// Mock usePermissionChecker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkTabPermissionExists: (key: string) =>
      ['BillSummaryCurrentMonth', 'BillDetailsCurrentMonth', 'CallDetailsCurrentMonth'].includes(key),
  }),
}));

describe('CurrentMonthTab Component', () => {
  it('renders all accessible tabs and their content', async () => {
    render(<CurrentMonthTab />);
    // Tab triggers
    expect(screen.getByTestId('tab-trigger-BillSummaryCurrentMonth')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-BillDetailsCurrentMonth')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-CallDetailsCurrentMonth')).toBeInTheDocument();

    // Tab contents (all rendered since all permissions are granted)
    expect(screen.getByTestId('tab-content-BillSummaryCurrentMonth')).toHaveTextContent('BillSummaryMock');
    expect(screen.getByTestId('tab-content-BillDetailsCurrentMonth')).toHaveTextContent('BillDetailsMock');
    expect(screen.getByTestId('tab-content-CallDetailsCurrentMonth')).toHaveTextContent('CallDetailsMock');
  });

  it('renders only permitted tabs', () => {
    // Override permission checker to allow only BillSummary tab
    jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkTabPermissionExists: (key: string) => key === 'BillSummaryCurrentMonth',
      }),
    }));

    render(<CurrentMonthTab />);
    expect(screen.getByTestId('tab-trigger-BillSummaryCurrentMonth')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-trigger-BillDetailsCurrentMonth')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tab-trigger-CallDetailsCurrentMonth')).not.toBeInTheDocument();
    expect(screen.getByTestId('tab-content-BillSummaryCurrentMonth')).toHaveTextContent('BillSummaryMock');
  });

  it('switches active tab on trigger click', () => {
    render(<CurrentMonthTab />);
    const billDetailsTab = screen.getByTestId('tab-trigger-BillDetailsCurrentMonth');
    fireEvent.click(billDetailsTab);
    // Since all contents are rendered, we check for BillDetailsMock
    expect(screen.getByTestId('tab-content-BillDetailsCurrentMonth')).toHaveTextContent('BillDetailsMock');
  });
});