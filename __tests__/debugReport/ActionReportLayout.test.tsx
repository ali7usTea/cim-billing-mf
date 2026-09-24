import React from 'react';
import { render, screen } from '@testing-library/react';
import ActionReportLayout from '../../src/app/main/debugReport/layout';

// Mock Loading component
jest.mock('../../src/app/main/components/Loading', () => <div data-testid="loading">Loading...</div>);

describe('ActionReportLayout Integration Test', () => {
  it('renders children inside the layout', () => {
    render(
      <ActionReportLayout>
        <div data-testid="child">Child Content</div>
      </ActionReportLayout>
    );

    // Check if child content is rendered
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders Loading fallback during suspense', () => {
    // Simulate Suspense fallback by rendering a lazy component
    const LazyComponent = React.lazy(() => Promise.resolve({ default: () => <div data-testid="lazy">Lazy Content</div> }));

    render(
      <ActionReportLayout>
        <LazyComponent />
      </ActionReportLayout>
    );

    // Loading fallback should be rendered initially
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});