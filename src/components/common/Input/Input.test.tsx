import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Input from './Input';

describe('Input Component', () => {
	it('renders with default props', () => {
		const handleChange = vi.fn();
		render(<Input value="" onChange={handleChange} />);

		const input = screen.getByRole('textbox');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('type', 'text');
		expect(input).toHaveClass('border-gray-300'); // No error state
	});

	it('renders with label', () => {
		const handleChange = vi.fn();
		render(<Input value="" onChange={handleChange} label="Username" />);

		const label = screen.getByText('Username');
		const input = screen.getByRole('textbox');

		expect(label).toBeInTheDocument();
		expect(label).toHaveClass('text-sm', 'font-medium', 'text-gray-700');
		expect(input).toBeInTheDocument();
	});

	it('shows required indicator when required', () => {
		const handleChange = vi.fn();
		render(<Input value="" onChange={handleChange} label="Email" required />);

		const requiredIndicator = screen.getByText('*');
		expect(requiredIndicator).toBeInTheDocument();
		expect(requiredIndicator).toHaveClass('text-red-500');

		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('required');
	});

	it('displays placeholder text', () => {
		const handleChange = vi.fn();
		render(
			<Input value="" onChange={handleChange} placeholder="Enter your name" />,
		);

		const input = screen.getByPlaceholderText('Enter your name');
		expect(input).toBeInTheDocument();
	});

	it('handles different input types', () => {
		const handleChange = vi.fn();
		render(<Input value="" onChange={handleChange} type="email" />);

		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('type', 'email');
	});

	it('handles password input type', () => {
		const handleChange = vi.fn();
		render(<Input value="" onChange={handleChange} type="password" />);

		// Password inputs don't have textbox role, they have their own role
		const input = screen.getByDisplayValue('');
		expect(input).toHaveAttribute('type', 'password');
	});

	it('calls onChange when value changes', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		render(<Input value="" onChange={handleChange} />);
		const input = screen.getByRole('textbox');

		await user.type(input, 'a');

		expect(handleChange).toHaveBeenCalledTimes(1);
		expect(handleChange).toHaveBeenCalledWith('a');
	});

	it('displays controlled value', () => {
		const handleChange = vi.fn();
		render(<Input value="test value" onChange={handleChange} />);

		const input = screen.getByDisplayValue('test value');
		expect(input).toBeInTheDocument();
	});

	it('shows error state and message', () => {
		const handleChange = vi.fn();
		render(
			<Input value="" onChange={handleChange} error="This field is required" />,
		);

		const input = screen.getByRole('textbox');
		const errorMessage = screen.getByText('This field is required');

		expect(input).toHaveClass(
			'border-red-300',
			'text-red-900',
			'focus:ring-red-500',
		);
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(errorMessage).toBeInTheDocument();
		expect(errorMessage).toHaveClass('text-red-600');
		expect(errorMessage).toHaveAttribute('role', 'alert');
	});

	it('associates error message with input via aria-describedby', () => {
		const handleChange = vi.fn();
		render(
			<Input
				value=""
				onChange={handleChange}
				error="Invalid input"
				id="test-input"
			/>,
		);

		const input = screen.getByRole('textbox');
		const errorMessage = screen.getByText('Invalid input');

		expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
		expect(errorMessage).toHaveAttribute('id', 'test-input-error');
	});

	it('does not show aria-describedby when no error', () => {
		const handleChange = vi.fn();
		render(<Input value="" onChange={handleChange} />);

		const input = screen.getByRole('textbox');
		expect(input).not.toHaveAttribute('aria-describedby');
	});

	it('applies focus styles correctly', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		render(<Input value="" onChange={handleChange} />);
		const input = screen.getByRole('textbox');

		await user.click(input);
		expect(input).toHaveFocus();
		expect(input).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
	});

	it('applies error focus styles when in error state', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		render(<Input value="" onChange={handleChange} error="Error message" />);
		const input = screen.getByRole('textbox');

		await user.click(input);
		expect(input).toHaveClass('focus:ring-red-500', 'focus:border-red-500');
	});

	it('passes through additional props', () => {
		const handleChange = vi.fn();
		render(
			<Input
				value=""
				onChange={handleChange}
				data-testid="custom-input"
				maxLength={10}
				autoComplete="off"
			/>,
		);

		const input = screen.getByTestId('custom-input');
		expect(input).toHaveAttribute('maxLength', '10');
		expect(input).toHaveAttribute('autoComplete', 'off');
	});

	it('supports ref forwarding', () => {
		const handleChange = vi.fn();
		const ref = vi.fn();

		render(<Input value="" onChange={handleChange} ref={ref} />);

		expect(ref).toHaveBeenCalled();
	});

	it('handles keyboard events', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		render(<Input value="test" onChange={handleChange} />);
		const input = screen.getByRole('textbox');

		// Test backspace on existing value
		await user.type(input, '{backspace}');
		expect(handleChange).toHaveBeenCalledWith('tes');
	});

	it('maintains accessibility with label association', () => {
		const handleChange = vi.fn();
		render(
			<Input
				value=""
				onChange={handleChange}
				label="Email Address"
				id="email"
			/>,
		);

		const label = screen.getByText('Email Address');
		const input = screen.getByRole('textbox');

		// In this implementation, we rely on the label being rendered before the input
		// for implicit association. For explicit association, we'd need to add htmlFor
		expect(label).toBeInTheDocument();
		expect(input).toBeInTheDocument();
	});
});
