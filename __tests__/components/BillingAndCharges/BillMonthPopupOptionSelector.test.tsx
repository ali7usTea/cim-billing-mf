import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BillMonthPopupOptionSelector from '../../../src/app/main/components/BillingAndCharges/BillMonthPopupOptionSelector';

// Mock cim-ui-components
jest.mock('cim-ui-components', () => ({
  RadioGroup: ({ value, onValueChange, children, className }: any) => (
    <div data-testid="radio-group" className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          checked: child.props.value === value,
          onChange: () => onValueChange(child.props.value)
        })
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
  Input: ({ className, placeholder, value, onChange }: any) => (
    <input
      type="text"
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid="email-input"
    />
  ),
}));

describe('BillMonthPopupOptionSelector', () => {
  it('renders all radio options', () => {
    render(
      <BillMonthPopupOptionSelector
        selectedOption=""
        onOptionChange={() => {}}
        emailValue=""
        onEmailChange={() => {}}
      />
    );
    expect(screen.getByTestId('radio-SendCurrentSummaryInvoiceToEBillEmail')).toBeInTheDocument();
    expect(screen.getByTestId('radio-SendDetailedInvoiceToEBillEmail')).toBeInTheDocument();
    expect(screen.getByTestId('radio-UpdateAccountSEBillEmail')).toBeInTheDocument();
    expect(screen.getByTestId('radio-SendToDifferentEmail')).toBeInTheDocument();
  });

  it('selects the correct radio button based on selectedOption', () => {
    render(
      <BillMonthPopupOptionSelector
        selectedOption="SendDetailedInvoiceToEBillEmail"
        onOptionChange={() => {}}
        emailValue=""
        onEmailChange={() => {}}
      />
    );
    expect(screen.getByTestId('radio-SendDetailedInvoiceToEBillEmail')).toBeChecked();
    expect(screen.getByTestId('radio-SendCurrentSummaryInvoiceToEBillEmail')).not.toBeChecked();
  });

  it('calls onOptionChange when a radio button is clicked', () => {
    const onOptionChangeMock = jest.fn();
    render(
      <BillMonthPopupOptionSelector
        selectedOption=""
        onOptionChange={onOptionChangeMock}
        emailValue=""
        onEmailChange={() => {}}
      />
    );
    fireEvent.click(screen.getByTestId('radio-SendToDifferentEmail'));
    expect(onOptionChangeMock).toHaveBeenCalledWith('SendToDifferentEmail');
  });

  it('renders email input when "SendToDifferentEmail" is selected', () => {
    render(
      <BillMonthPopupOptionSelector
        selectedOption="SendToDifferentEmail"
        onOptionChange={() => {}}
        emailValue="test@example.com"
        onEmailChange={() => {}}
      />
    );
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toHaveValue('test@example.com');
  });

  it('calls onEmailChange when email input is changed', () => {
    const onEmailChangeMock = jest.fn();
    render(
      <BillMonthPopupOptionSelector
        selectedOption="SendToDifferentEmail"
        onOptionChange={() => {}}
        emailValue=""
        onEmailChange={onEmailChangeMock}
      />
    );
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new@email.com' } });
    expect(onEmailChangeMock).toHaveBeenCalledWith('new@email.com');
  });
});