import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

describe('Modal Component', () => {
	const mockOnClose = vi.fn();

	beforeEach(() => {
		mockOnClose.mockClear();
		// Reset body overflow style
		document.body.style.overflow = 'unset';
	});

	afterEach(() => {
		// Clean up body overflow style
		document.body.style.overflow = 'unset';
	});

	it('renders when isOpen is true', () => {
		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Test Modal')).toBeInTheDocument();
		expect(screen.getByText('Modal content')).toBeInTheDocument();
	});

	it('does not render when isOpen is false', () => {
		render(
			<Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
		expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
	});

	it('calls onClose when close button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		const closeButton = screen.getByLabelText('Close modal');
		await user.click(closeButton);

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when backdrop is clicked', async () => {
		const user = userEvent.setup();

		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		// Click on the backdrop (the outer div)
		const backdrop = screen.getByRole('dialog').firstChild as HTMLElement;
		await user.click(backdrop);

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it('does not call onClose when modal content is clicked', async () => {
		const user = userEvent.setup();

		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		const modalContent = screen.getByText('Modal content');
		await user.click(modalContent);

		expect(mockOnClose).not.toHaveBeenCalled();
	});

	it('calls onClose when Escape key is pressed', () => {
		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		fireEvent.keyDown(document, { key: 'Escape' });

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it('does not call onClose when other keys are pressed', () => {
		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		fireEvent.keyDown(document, { key: 'Enter' });
		fireEvent.keyDown(document, { key: 'Space' });

		expect(mockOnClose).not.toHaveBeenCalled();
	});

	it('prevents body scroll when open', () => {
		const { rerender } = render(
			<Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		expect(document.body.style.overflow).toBe('unset');

		rerender(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		expect(document.body.style.overflow).toBe('hidden');
	});

	it('restores body scroll when closed', () => {
		const { rerender } = render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		expect(document.body.style.overflow).toBe('hidden');

		rerender(
			<Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		expect(document.body.style.overflow).toBe('unset');
	});

	it('has proper ARIA attributes', () => {
		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		const dialog = screen.getByRole('dialog');
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

		const title = screen.getByText('Test Modal');
		expect(title).toHaveAttribute('id', 'modal-title');
	});

	it('focuses the modal when opened', () => {
		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		// The modal container should be focused
		const modalContainer = document.querySelector('[tabindex="-1"]');
		expect(modalContainer).toHaveFocus();
	});

	it('handles tab navigation within modal', async () => {
		const user = userEvent.setup();

		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<button>First Button</button>
				<button>Second Button</button>
				<input placeholder="Input field" />
			</Modal>,
		);

		const firstButton = screen.getByText('First Button');
		const secondButton = screen.getByText('Second Button');
		const input = screen.getByPlaceholderText('Input field');
		const closeButton = screen.getByLabelText('Close modal');

		// Focus first button
		firstButton.focus();
		expect(firstButton).toHaveFocus();

		// Tab to next element
		await user.tab();
		expect(secondButton).toHaveFocus();

		// Tab to next element
		await user.tab();
		expect(input).toHaveFocus();

		// Tab to close button
		await user.tab();
		expect(closeButton).toHaveFocus();
	});

	it('traps focus within modal with Shift+Tab', async () => {
		const user = userEvent.setup();

		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<button>First Button</button>
				<button>Second Button</button>
			</Modal>,
		);

		const firstButton = screen.getByText('First Button');
		const closeButton = screen.getByLabelText('Close modal');

		// Focus first button
		firstButton.focus();
		expect(firstButton).toHaveFocus();

		// Shift+Tab should go to the last focusable element (close button)
		await user.tab({ shift: true });
		expect(closeButton).toHaveFocus();
	});

	it('renders custom content correctly', () => {
		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Custom Modal">
				<div>
					<h4>Custom Header</h4>
					<p>Custom paragraph</p>
					<button>Custom Button</button>
				</div>
			</Modal>,
		);

		expect(screen.getByText('Custom Header')).toBeInTheDocument();
		expect(screen.getByText('Custom paragraph')).toBeInTheDocument();
		expect(screen.getByText('Custom Button')).toBeInTheDocument();
	});

	it('applies correct CSS classes for styling', () => {
		render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		const dialog = screen.getByRole('dialog');
		expect(dialog).toHaveClass('fixed', 'inset-0', 'z-50');

		const backdrop = dialog.querySelector('.bg-gray-500');
		expect(backdrop).toBeInTheDocument();
		expect(backdrop).toHaveClass('bg-opacity-75', 'transition-opacity');
	});

	it('handles multiple modals correctly', () => {
		const { rerender } = render(
			<Modal isOpen={true} onClose={mockOnClose} title="First Modal">
				<p>First modal content</p>
			</Modal>,
		);

		expect(screen.getByText('First Modal')).toBeInTheDocument();

		rerender(
			<>
				<Modal isOpen={true} onClose={mockOnClose} title="First Modal">
					<p>First modal content</p>
				</Modal>
				<Modal isOpen={true} onClose={vi.fn()} title="Second Modal">
					<p>Second modal content</p>
				</Modal>
			</>,
		);

		expect(screen.getByText('First Modal')).toBeInTheDocument();
		expect(screen.getByText('Second Modal')).toBeInTheDocument();
	});

	it('cleans up event listeners when unmounted', () => {
		const { unmount } = render(
			<Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
				<p>Modal content</p>
			</Modal>,
		);

		// Unmount the component
		unmount();

		// Try to trigger escape key after unmount
		fireEvent.keyDown(document, { key: 'Escape' });

		// Should not call onClose since component is unmounted
		expect(mockOnClose).not.toHaveBeenCalled();
	});
});
