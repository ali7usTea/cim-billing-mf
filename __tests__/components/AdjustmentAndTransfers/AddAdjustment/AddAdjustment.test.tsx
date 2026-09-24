import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddAdjustment from '../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/AddAdjustment';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock UI components from cim-ui-components
jest.mock('cim-ui-components', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Combobox: ({ children, ...props }: any) => <div data-testid="combobox" {...props}>{children}</div>,
  ComboboxContent: ({ children }: any) => <div>{children}</div>,
  ComboboxEmpty: ({ children }: any) => <div>{children}</div>,
  ComboboxInput: ({ ...props }) => <input data-testid="combobox-input" {...props} />,
  ComboboxItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ComboboxList: ({ children }: any) => <div>{children}</div>,
  DataPanel: ({ headerTitle, children }: any) => (
    <div data-testid={headerTitle.replace(/\s/g, '-').toLowerCase()}>{headerTitle}{children}</div>
  ),
  Dialog: ({ open, children }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  FlatRow: () => null,
  PanelData: () => null,
  DataRow: () => null,
}));

// Mock child components
jest.mock('../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/AdjustmentRecord', () => ({
  __esModule: true,
  // eslint-disable-next-line react/display-name
  default: React.forwardRef(() => <div data-testid="adjustment-record-form">AdjustmentRecordForm</div>)
}));
jest.mock('../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/Attachments', () => ({
  __esModule: true,
  default: () => <div data-testid="attachments">Attachments</div>
}));
jest.mock('../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/InfoForm', () => ({
  __esModule: true,
  //eslint-disable-next-line react/display-name
  default: React.forwardRef(() => <div data-testid="info-form">InfoForm</div>)
}));
jest.mock('../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/const', () => ({
  ErrorMessage: ({ error }: any) => error ? <div data-testid="error-message">{error.message}</div> : null
}));

// Mock utils
jest.mock('../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/utils', () => ({
  ADJUSTMENT_AMOUNT_LIMIT_KEY: 'ADJUSTMENT_LIMIT',
  isAmountValidLimit: jest.fn(() => true)
}));

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isLoading: false }))
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { data: { GetChargeCodesLookup_MainTable: { rows: [] } } } }))
}));

// Mock axiosWithAuth
jest.mock('../../../../src/utils/axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { message: 'Success' } }))
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Mock permission checker
jest.mock('../../../../src/app/hooks/usePermissionChecker.tsx', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: () => true
  })
}));

// Mock proxyAPI
jest.mock('../../../../src/utils/lib/proxyAPI.ts', () => ({
  debugReportURL: 'http://mock-debug-report'
}));

// Mock Redux selectors
const mockStore = configureStore([]);
jest.mock('../../../../src/redux/customer/customerSlice', () => ({
  selectCustomer: (state: any) => state.customer
}));

describe('AddAdjustment Integration Test', () => {
  it('renders Add Adjustment button and dialog with child components', () => {
    // Mock initial Redux state
    const store = mockStore({
      customer: {
        Customers: {
          'customer1': {
            debugReport: true,
            accountID: 'ACC123',
            accountNumber: 'ACC456',
            agentName: 'AgentX',
            agentLocation: 'LocationY',
            userName: 'UserZ',
            customerName: 'CustomerA'
          }
        }
      },
      auth: { jwtToken: 'mock-token' },
      settingSlice: { settings: { ADJUSTMENT_LIMIT: '1000' } },
      UserPermissionSlice: { permissionDtoMap: { permission1: true } }
    });

    render(
      <Provider store={store}>
        <AddAdjustment />
      </Provider>
    );

    // Check Add Adjustment button
    const addButton = screen.getByText('Add Adjustment');
    expect(addButton).toBeInTheDocument();

    // Open dialog
    fireEvent.click(addButton);

    // Check dialog and child components
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Adjustment')).toBeInTheDocument();
    expect(screen.getByTestId('combobox')).toBeInTheDocument();
    expect(screen.getByTestId('info-form')).toBeInTheDocument();
    expect(screen.getByTestId('adjustment-record-form')).toBeInTheDocument();
    expect(screen.getByTestId('attachments')).toBeInTheDocument();
    expect(screen.getByTestId('non-closed-and-non-resloved-billing-complaints')).toBeInTheDocument(); 
    expect(screen.getByText('Pay')).toBeInTheDocument();
  });
});