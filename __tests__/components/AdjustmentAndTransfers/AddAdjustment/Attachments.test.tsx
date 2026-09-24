import { render, screen, fireEvent } from '@testing-library/react';
import Attachments from '../../../../src/app/main/components/AdjustmentAndTransfers/AddAdjustment/Attachments';

// Mock UI components from cim-ui-components
jest.mock('cim-ui-components', () => ({
  Accordion: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AccordionItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AccordionTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AccordionContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, render, ...props }: any) => (
    <button {...props}>
      {render}
      {children}
    </button>
  ),
  Input: (props: any) => <input {...props} data-testid="file-input" />,
}));

// Mock icons
jest.mock('../../../../src/app/icons/PaperClipIcon', () => ({
  PaperclipIcon: () => <span data-testid="paperclip-icon">PaperclipIcon</span>
}));
jest.mock('../../../../src/app/icons/TrashIcon', () => ({
  TrashIcon: () => <span data-testid="trash-icon">TrashIcon</span>
}));

describe('Attachments Integration Test', () => {
  it('renders Attachments accordion and allows attaching and deleting files', () => {
    const mockOnFilesChange = jest.fn();
    render(<Attachments files={[]} onFilesChange={mockOnFilesChange} />);

    // Accordion and trigger
    expect(screen.getByText(/Attachments \(0\)/)).toBeInTheDocument();
    expect(screen.getByTestId('paperclip-icon')).toBeInTheDocument();

    // Choose File button and Attach button
    const chooseFileButton = screen.getByText('Choose File');
    const attachButton = screen.getByText('Attach');
    expect(chooseFileButton).toBeInTheDocument();
    expect(attachButton).toBeInTheDocument();

    // Simulate file selection
    const file = new File(['dummy content'], 'testfile.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Attach file
    fireEvent.click(attachButton);
    expect(mockOnFilesChange).toHaveBeenCalledWith([file]);
  });

  it('renders attached files and allows deleting', () => {
    const file = new File(['dummy content'], 'testfile.txt', { type: 'text/plain' });
    const mockOnFilesChange = jest.fn();
    render(<Attachments files={[file]} onFilesChange={mockOnFilesChange} />);

    // File name should be shown
    expect(screen.getByText('testfile.txt')).toBeInTheDocument();
    // Trash icon and delete button
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    const deleteButton = screen.getByRole('button', { name: /TrashIcon/i });
    fireEvent.click(deleteButton);
    expect(mockOnFilesChange).toHaveBeenCalledWith([]);
  });
});