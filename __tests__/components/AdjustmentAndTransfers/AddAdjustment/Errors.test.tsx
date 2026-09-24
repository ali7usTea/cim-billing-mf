import { render, screen } from '@testing-library/react';
import Errors from '../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/Errors';

describe('Errors Component', () => {
  it('renders error messages when errors are provided', () => {
    const errors = {
      amount: 'Amount is required',
      remarks: 'Remarks is required',
    };
    render(<Errors errors={errors} />);
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
    expect(screen.getByText('Remarks is required')).toBeInTheDocument();
    // Check styling
    const errorDiv = screen.getByText('Amount is required').parentElement;
    expect(errorDiv).toHaveStyle({ backgroundColor: 'red', color: 'white' });
  });

  it('renders nothing when errors object is empty', () => {
    const { container } = render(<Errors errors={{}} />);
    // The div exists but contains no children
    expect(container.querySelector('div')).toBeInTheDocument();
    expect(container.querySelector('div')?.children.length).toBe(0);
  });

  it('renders error messages for array values', () => {
    const errors = {
      general: ['Error 1', 'Error 2'],
    };
    render(<Errors errors={errors} />);
    expect(screen.getByText('Error 1,Error 2')).toBeInTheDocument();
  });
});