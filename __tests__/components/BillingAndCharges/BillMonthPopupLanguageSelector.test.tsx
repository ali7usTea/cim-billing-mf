import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BillMonthPopupLanguageSelector from '../../../src/app/main/components/BillingAndCharges/BillMonthPopupLanguageSelector';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  RadioGroup: ({ value, onValueChange, children, className }: any) => (
    <div data-testid="radio-group" className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { checked: child.props.value === value, onChange: () => onValueChange(child.props.value) })
      )}
    </div>
  ),
  RadioGroupItem: ({ value, id, checked, onChange }: any) => (
    <input
      type="radio"
      value={value}
      id={id}
      checked={checked}
      onChange={onChange}
      data-testid={`radio-${value}`}
    />
  ),
}));

describe('BillMonthPopupLanguageSelector', () => {
  it('renders radio buttons for English and Arabic', () => {
    render(<BillMonthPopupLanguageSelector value="English" onChange={() => {}} />);
    expect(screen.getByTestId('radio-English')).toBeInTheDocument();
    expect(screen.getByTestId('radio-Arabic')).toBeInTheDocument();
    expect(screen.getByLabelText('English')).toBeInTheDocument();
    expect(screen.getByLabelText('Arabic')).toBeInTheDocument();
  });

  it('selects the correct radio button based on value', () => {
    render(<BillMonthPopupLanguageSelector value="Arabic" onChange={() => {}} />);
    expect(screen.getByTestId('radio-Arabic')).toBeChecked();
    expect(screen.getByTestId('radio-English')).not.toBeChecked();
  });

  it('calls onChange when a radio button is clicked', () => {
    const onChangeMock = jest.fn();
    render(<BillMonthPopupLanguageSelector value="English" onChange={onChangeMock} />);
    const arabicRadio = screen.getByTestId('radio-Arabic');
    fireEvent.click(arabicRadio);
    expect(onChangeMock).toHaveBeenCalledWith('Arabic');
  });
});