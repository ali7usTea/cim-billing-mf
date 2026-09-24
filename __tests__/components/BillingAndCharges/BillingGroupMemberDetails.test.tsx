import { render, screen } from '@testing-library/react';
import BillingGroupMemberDetails from '../../../src/app/main/components/BillingAndCharges/BillingGroupMemberDetails';

// Mock cim-ui-components for isolation
jest.mock('cim-ui-components', () => ({
  DataPanel: ({ headerTitle, shouldRender }: any) =>
    shouldRender ? <div>{headerTitle}</div> : null,
}));

// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    Customers: {
      customer1: {
        debugReport: false,
      },
    },
  })),
}));

// Mock proxyURL
jest.mock('../../../src/utils/lib/proxyAPI.ts', () => ({
  proxyURL: 'http://mock-proxy-url',
}));

// Mock permission checker
jest.mock('../../../src/app/hooks/usePermissionChecker', () => ({
  usePermissionChecker: () => ({
    checkGroupPermissionExists: (key: string) =>
      key === 'billingGroupDetails_Tbl',
  }),
}));

describe('BillingGroupMemberDetails Component', () => {
  it('renders DataPanel when selectedMember is provided and permission exists', () => {
    const selectedMember = {
      "GetBillGroupMembersInquiry.GROUP_ID": "GROUP123",
    };
    render(<BillingGroupMemberDetails selectedMember={selectedMember} />);
    expect(screen.getByText('Billing Group Member Details')).toBeInTheDocument();
  });

  it('does not render DataPanel if selectedMember is undefined', () => {
    render(<BillingGroupMemberDetails selectedMember={undefined} />);
    expect(screen.queryByText('Billing Group Member Details')).not.toBeInTheDocument();
  });

  it('does not render DataPanel if permission is missing', () => {
    // Override permission checker to return false
    jest.mock('../../../hooks/usePermissionChecker', () => ({
      usePermissionChecker: () => ({
        checkGroupPermissionExists: () => false,
      }),
    }));
    const selectedMember = {
      "GetBillGroupMembersInquiry.GROUP_ID": "GROUP123",
    };
    render(<BillingGroupMemberDetails selectedMember={selectedMember} />);
    expect(screen.queryByText('Billing Group Member Details')).not.toBeInTheDocument();
  });
});