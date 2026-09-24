import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InfoForm from '../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/InfoForm';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  Select: ({ children, ...props }: any) => <select {...props}>{children}</select>,
  SelectTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value, ...props }: any) => (
    <option value={value} {...props}>{children}</option>
  ),
  Input: (props: any) => <input {...props} data-testid={props.placeholder || 'input'} />,
  Combobox: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ComboboxInput: (props: any) => <input {...props} data-testid={props.placeholder || 'combobox-input'} />,
  ComboboxContent: ({ children }: any) => <div>{children}</div>,
  ComboboxEmpty: ({ children }: any) => <div>{children}</div>,
  ComboboxItem: ({ children, value, ...props }: any) => (
    <div data-testid={`combobox-item-${value}`} {...props}>{children}</div>
  ),
  ComboboxList: ({ children }: any) => <div>{children}</div>,
}));

// Mock ErrorMessage and formattedGroupedServicesList
jest.mock('../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/const', () => ({
  ErrorMessage: ({ error }: any) => error ? <div data-testid="error-message">{error.message}</div> : null,
  formattedGroupedServicesList: jest.fn(() => [
    {
      label: 'Mobile',
      items: [
        { value: { value: 'MOB_POST', desc: 'Postpaid' } },
        { value: { value: 'MOB_PRE', desc: 'Prepaid' } },
      ],
    },
  ]),
}));

// Mock react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    Customers: {
      'customer1': {
        regionCode: 'DXB',
        preferredLanguage: 'English',
        accountNumber: '0501234567',
        customerEmail: 'test@domain.com',
        ebillEmail: 'ebill@domain.com',
        productGroup: 'Mobile',
      },
    },
  })),
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn((url: string) => {
    if (url.includes('regions')) {
      return Promise.resolve({ data: [
        { regionCode: 'DXB', regionDesc: 'Dubai', regionStatus: 'Active', regionGroup: 'A', regionGroupDesc: 'Group A' },
        { regionCode: 'AUH', regionDesc: 'Abu Dhabi', regionStatus: 'Active', regionGroup: 'B', regionGroupDesc: 'Group B' },
      ]});
    }
    if (url.includes('settings')) {
      return Promise.resolve({ data: { 'cim.billing.tibco.email.sms.languages': 'English,Arabic' } });
    }
    if (url.includes('availableServices')) {
      return Promise.resolve({ data: { PRIMARY_SERVICE_ID: 'MOB_POST', Mobile: [
        { label: 'Postpaid', value: 'MOB_POST' },
        { label: 'Prepaid', value: 'MOB_PRE' },
      ]}});
    }
    if (url.includes('getLastContactDetailsByAccountId')) {
      return Promise.resolve({ data: [
        { displayName: 'contactNumber', value: '0501234567' },
        { displayName: 'contactEmail', value: 'test@domain.com' },
      ]});
    }
    return Promise.resolve({ data: [] });
  }),
}));

describe('InfoForm Component', () => {
  const dopData = {
    DOP: [
      {
        adjTypeCode: 'IMM',
        description: 'Immediate',
        dopSubTypes: [
          { code: 'SUB1', description: 'Subtype 1' },
          { code: 'SUB2', description: 'Subtype 2' },
        ],
        code: 'IMM',
      },
      {
        adjTypeCode: '1OFF',
        description: 'One Off',
        dopSubTypes: null,
        code: '1OFF',
      },
    ],
    DOP_ADJ_TYPE: [
      { code: 'IMM', typeId: 'T1', description: 'Immediate Refund' },
      { code: '1OFF', typeId: 'T2', description: 'One Off Refund' },
    ],
    AdjustmentPostingRules: [],
  };

  const isSelectedChargeCode = {
    isValid: jest.fn(() => Promise.resolve(true)),
    value: {},
  };

  it('renders all main fields and shows error messages', async () => {
    render(
      <InfoForm
        isSelectedChargeCode={isSelectedChargeCode}
        lastActivityData={null}
        dopData={dopData}
      />
    );

    // Region field
    expect(screen.getByText(/Region/i)).toBeInTheDocument();
    expect(screen.getByTestId('Search region...')).toBeInTheDocument();

    // Language field
    expect(screen.getByText(/Preferred Language/i)).toBeInTheDocument();
    expect(screen.getByTestId('Search language...')).toBeInTheDocument();

    // Mobile Number field
    expect(screen.getByText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByTestId('0000 0000 0000')).toBeInTheDocument();

    // Contact Email field
    expect(screen.getByText(/Contact Email/i)).toBeInTheDocument();
    expect(screen.getByTestId('email@domain.com')).toBeInTheDocument();

    // Service field
    expect(screen.getByText(/Service/i)).toBeInTheDocument();
    expect(screen.getByTestId('Search a service...')).toBeInTheDocument();

    // DOP Type field
    expect(screen.getByText(/DOP Type/i)).toBeInTheDocument();
    expect(screen.getByText('Select DOP Type')).toBeInTheDocument();

    // Cause of Refund field
    expect(screen.getByText(/Cause of Refund/i)).toBeInTheDocument();

    // Simulate selecting DOP Type with subtype
    await waitFor(() => {
      fireEvent.change(screen.getByText('Select DOP Type').parentElement?.parentElement?.querySelector('select')!, { target: { value: 'IMM' } });
    });

    // Subtype field should appear
    await waitFor(() => {
      expect(screen.getByText(/DOP Sub Type/i)).toBeInTheDocument();
      expect(screen.getByText('Select Subtype')).toBeInTheDocument();
    });
  });

  it('shows error message for invalid mobile number', async () => {
    render(
      <InfoForm
        isSelectedChargeCode={isSelectedChargeCode}
        lastActivityData={null}
        dopData={dopData}
      />
    );
    const mobileInput = screen.getByTestId('0000 0000 0000');
    fireEvent.change(mobileInput, { target: { value: 'invalid' } });

    // Blur to trigger validation
    fireEvent.blur(mobileInput);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid mobile format');
    });
  });

  it('shows error message for invalid email', async () => {
    render(
      <InfoForm
        isSelectedChargeCode={isSelectedChargeCode}
        lastActivityData={null}
        dopData={dopData}
      />
    );
    const emailInput = screen.getByTestId('email@domain.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email format');
    });
  });
});