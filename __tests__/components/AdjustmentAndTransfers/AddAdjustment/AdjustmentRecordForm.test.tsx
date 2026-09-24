import { render, screen, fireEvent } from '@testing-library/react';
import AdjustmentRecordForm from '../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/AdjustmentRecord';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock UI components from cim-ui-components
jest.mock('cim-ui-components', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  CalendarButton: ({ value, onChange }: any) => (
    <input
      data-testid="calendar-button"
      type="date"
      value={value ? value.toISOString().substring(0, 10) : ''}
      onChange={e => onChange(new Date(e.target.value))}
    />
  ),
  DataPanel: ({ headerTitle, children }: any) => (
    <div data-testid={headerTitle.replace(/\s/g, '-').toLowerCase()}>{headerTitle}{children}</div>
  ),
  Input: (props: any) => <input data-testid="amount-input" {...props} />,
  Textarea: (props: any) => <textarea data-testid="remarks-input" {...props} />,
  PanelData: () => null,
}));

// Mock ErrorMessage component
jest.mock('./const', () => ({
  ErrorMessage: ({ error }: any) => error ? <div data-testid="error-message">{error.message}</div> : null
}));

// Mock addAdjustmentRecord utility
jest.mock('./utils', () => ({
  addAdjustmentRecord: jest.fn((dto, activationDate, isPrepaid) => ({ ...dto })),
}));

// Mock useSubscriber hook
jest.mock('../../../../src/app/hooks/useSubscriber', () => ({
  useSubscriber: () => ({ isPrepaid: false })
}));

// Mock XIcon
jest.mock('../../../../src/app/icons/XIcon', () => ({
  XIcon: () => <span data-testid="x-icon">X</span>
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Mock Redux selectors
const mockStore = configureStore([]);
jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useSelector: jest.fn(fn => fn({
      customerslice: {
        Customers: {
          'customer1': {
            debugReport: true,
            accountActivationDate: '2023-01-01'
          }
        }
      }
    }))
  };
});

describe('AdjustmentRecordForm Integration Test', () => {
  it('renders form fields and DataPanel, allows adding and removing records', async () => {
    // Mock isSelectedChargeCode prop
    const isSelectedChargeCode = {
      isValid: jest.fn(() => Promise.resolve(true)),
      value: {
        "GetChargeCodesLookup.ADJ_CHARGE_CODE": { value: "CODE123" },
        "GetChargeCodesLookup.SHORT_DESCRIPTION": { value: "Short Desc" }
      }
    };

    render(
      <Provider store={mockStore({})}>
        <AdjustmentRecordForm isSelectedChargeCode={isSelectedChargeCode} />
      </Provider>
    );

    // Check form fields
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bill Period/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Remarks/i)).toBeInTheDocument();

    // Fill form and add adjustment
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '100' } });
    fireEvent.change(screen.getByTestId('remarks-input'), { target: { value: 'Test remarks' } });

    // Simulate clicking Add Adjustment
    fireEvent.click(screen.getByText('Add Adjustment'));

    // DataPanel should show All Adjustment Records
    expect(screen.getByTestId('all-adjustment-records')).toBeInTheDocument();

    // Remove button should be rendered for the record
    expect(screen.getByText('Remove')).toBeInTheDocument();

    // Simulate clicking Remove
    fireEvent.click(screen.getByText('Remove'));
  });
});