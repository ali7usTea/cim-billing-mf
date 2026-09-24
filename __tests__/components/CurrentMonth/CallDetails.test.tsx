import { render, screen } from '@testing-library/react';
import CallDetails from '../../../src/app/main/components/CurrentMonth/CallDetails';

// Mock DataPanel for isolation
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, shouldRender }: any) =>
    shouldRender ? <div>{headerTitle}</div> : null,
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

describe('CallDetails Component', () => {
  it('renders DataPanel with Usage Details header', () => {
    render(<CallDetails />);
    expect(screen.getByText('Usage Details')).toBeInTheDocument();
    expect(screen.getByTitle('cms-account-details')).toBeInTheDocument();
  });
});