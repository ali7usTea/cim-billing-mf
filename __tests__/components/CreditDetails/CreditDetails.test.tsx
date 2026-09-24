import { render, screen } from '@testing-library/react';
import CreditDetails from '../../../src/app/main/components/CreditDetails/index';

// Mock child components for isolation
// ./BadDebtDetails
jest.mock('../../../src/app/main/components/CreditDetails/BadDebtDetails', () => <div>BadDebtDetailsMock</div>);
jest.mock('../../../src/app/main/components/CreditDetails/ActionDetails', () => <div>ActionDetailsMock</div>);
jest.mock('../../../src/app/main/components/CreditDetails/DebtCollectionAgency', () => <div>DebtCollectionAgencyMock</div>);

describe('CMSAccountDetails Component', () => {
  it('renders CMSAccountDetails container and child components', () => {
    render(<CreditDetails />);
    // Container
    expect(screen.getByTitle('cms-credit-details')).toBeInTheDocument();
    // Child components
    expect(screen.getByText('BadDebtDetailsMock')).toBeInTheDocument();
    expect(screen.getByText('ActionDetailsMock')).toBeInTheDocument();
    expect(screen.getByText('DebtCollectionAgencyMock')).toBeInTheDocument();
  });
});