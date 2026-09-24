import { render, screen } from '@testing-library/react';
import {
  groupedItemTemplate,
  formattedGroupedServicesList,
  selectedCountryTemplate,
  countryOptionTemplate,
  dateTemplate,
  ErrorMessage,
  formatDate,
  IMMEDIATE_ADJ_CODE,
  ONE_OFF_CODE,
  PAST_PERIOD_CODE,
  CURRENT_FUTURE_PERIOD_CODE,
  INVALID_CHARGE_CODE_MESSAGE,
  BILL_PERIOD_BEFORE_ACTIVATION_DATE_ERR_MESSAGE,
} from '../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/const';

describe('const utilities and templates', () => {
  it('renders groupedItemTemplate', () => {
    render(groupedItemTemplate({ label: 'Test Group' }));
    expect(screen.getByText('Test Group')).toBeInTheDocument();
  });

  it('renders selectedCountryTemplate with option', () => {
    render(selectedCountryTemplate({ name: 'UAE' }, { placeholder: 'Select country' }));
    expect(screen.getByText('UAE')).toBeInTheDocument();
  });

  it('renders selectedCountryTemplate with no option', () => {
    render(selectedCountryTemplate(null, { placeholder: 'Select country' }));
    expect(screen.getByText('Select country')).toBeInTheDocument();
  });

  it('renders countryOptionTemplate', () => {
    render(countryOptionTemplate({ name: 'India' }));
    expect(screen.getByText('India')).toBeInTheDocument();
  });

  it('renders ErrorMessage when error exists', () => {
    render(<ErrorMessage error={{ message: 'Test error' }} />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('does not render ErrorMessage when error does not exist', () => {
    const { container } = render(<ErrorMessage error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('formats grouped services list', () => {
    const rawData = {
      Mobile: [
        { label: 'Postpaid', value: 'MOB_POST' },
        { label: 'Prepaid', value: 'MOB_PRE' },
      ],
      Fixed: [
        { label: 'Broadband', value: 'FIX_BB' },
      ],
      Empty: [],
    };
    const result = formattedGroupedServicesList(rawData);
    expect(result).toEqual([
      {
        label: 'Mobile',
        items: [
          { key: 'Postpaid', value: { value: 'MOB_POST', desc: 'Postpaid' } },
          { key: 'Prepaid', value: { value: 'MOB_PRE', desc: 'Prepaid' } },
        ],
      },
      {
        label: 'Fixed',
        items: [
          { key: 'Broadband', value: { value: 'FIX_BB', desc: 'Broadband' } },
        ],
      },
    ]);
  });

  it('formats dateTemplate', () => {
    const date = new Date('2024-06-01');
    const formatted = dateTemplate(date);
    expect(formatted).toMatch(/\d{2}\/\d{4}/); // e.g., "01/2024"
  });

  it('formats formatDate utility', () => {
    const date = new Date('2024-06-01');
    const formatted = formatDate(date);
    expect(formatted).toBe('01-2024');
  });

  it('exports constants correctly', () => {
    expect(IMMEDIATE_ADJ_CODE).toBe('IMM');
    expect(ONE_OFF_CODE).toBe('1OFF');
    expect(PAST_PERIOD_CODE).toBe('Past');
    expect(CURRENT_FUTURE_PERIOD_CODE).toBe('Current_Future');
    expect(INVALID_CHARGE_CODE_MESSAGE).toBe('selected charge code is invalid in terms of the period/adj Type,please select valid one');
    expect(BILL_PERIOD_BEFORE_ACTIVATION_DATE_ERR_MESSAGE).toBe('Invalid bill period, It is before the account activation date');
  });
});