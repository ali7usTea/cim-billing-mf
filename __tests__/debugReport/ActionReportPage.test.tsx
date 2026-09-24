import { render, screen } from '@testing-library/react';
import ActionReportPage from '../../src/app/main/debugReport/page';

// Mock useSearchParams from react-router
jest.mock('react-router', () => ({
  useSearchParams: () => [
    {
      get: (key: string) => {
        if (key === 'query') return 'testQuery';
        if (key === 'refId') return 'REF123';
        if (key === 'layout') return 'grid';
        return null;
      }
    }
  ]
}));

// Mock proxyURL
jest.mock('../../src/utils/lib/proxyAPI', () => ({
  proxyURL: 'http://mock-api'
}));

// Mock ActionReport component
jest.mock('cim-action-report', () => ({
  ActionReport: ({ refId, proxyURL, actionCode }: any) => (
    <div data-testid="action-report">
      ActionReport: {refId}, {proxyURL}, {actionCode}
    </div>
  )
}));

// Mock DataPanel component
jest.mock('cim-ui-components', () => ({
  DataPanel: ({
    headerTitle,
    api,
    viewLayout,
    ...props
  }: any) => (
    <div data-testid="data-panel">
      {headerTitle} | {api} | {viewLayout}
    </div>
  ),
}));

describe('ActionReportPage Integration Test', () => {
  it('renders ActionReport and DataPanel with correct props', () => {
    render(<ActionReportPage />);

    // Check ActionReport rendering
    expect(screen.getByTestId('action-report')).toHaveTextContent(
      'ActionReport: REF123, http://mock-api, testQuery'
    );

    // Check DataPanel rendering
    expect(screen.getByTestId('data-panel')).toHaveTextContent(
      'Output Result | http://mock-api/testQuery | grid'
    );
  });
});