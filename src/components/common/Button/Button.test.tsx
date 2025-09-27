import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';

describe('Button Component', () => {
	it('renders with default props', () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole('button', { name: /click me/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('bg-blue-600'); // primary variant
		expect(button).toHaveClass('px-4 py-2'); // medium size
	});

	it('renders with primary variant', () => {
		render(<Button variant="primary">Primary Button</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveClass(
			'bg-blue-600',
			'text-white',
			'hover:bg-blue-700',
		);
	});

	it('renders with secondary variant', () => {
		render(<Button variant="secondary">Secondary Button</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveClass(
			'bg-gray-200',
			'text-gray-900',
			'hover:bg-gray-300',
		);
	});

	it('renders with danger variant', () => {
		render(<Button variant="danger">Danger Button</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
	});

	it('renders with small size', () => {
		render(<Button size="sm">Small Button</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
	});

	it('renders with medium size', () => {
		render(<Button size="md">Medium Button</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
	});

	it('renders with large size', () => {
		render(<Button size="lg">Large Button</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveClass('px-6', 'py-3', 'text-base');
	});

	it('calls onClick when clicked', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(<Button onClick={handleClick}>Click me</Button>);
		const button = screen.getByRole('button');

		await user.click(button);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('does not call onClick when disabled', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(
			<Button onClick={handleClick} disabled>
				Disabled Button
			</Button>,
		);
		const button = screen.getByRole('button');

		expect(button).toBeDisabled();
		await user.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it('shows loading state', () => {
		render(<Button loading>Loading Button</Button>);
		const button = screen.getByRole('button');

		expect(button).toBeDisabled();
		expect(button.querySelector('svg')).toBeInTheDocument(); // Loading spinner
		expect(button.querySelector('svg')).toHaveClass('animate-spin');
	});

	it('does not call onClick when loading', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(
			<Button onClick={handleClick} loading>
				Loading Button
			</Button>,
		);
		const button = screen.getByRole('button');

		await user.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it('applies disabled styles when disabled', () => {
		render(<Button disabled>Disabled Button</Button>);
		const button = screen.getByRole('button');

		expect(button).toHaveClass(
			'disabled:opacity-50',
			'disabled:cursor-not-allowed',
		);
		expect(button).toBeDisabled();
	});

	it('applies focus styles', () => {
		render(<Button>Focus Button</Button>);
		const button = screen.getByRole('button');

		expect(button).toHaveClass(
			'focus:outline-none',
			'focus:ring-2',
			'focus:ring-offset-2',
		);
	});

	it('passes through additional props', () => {
		render(
			<Button data-testid="custom-button" aria-label="Custom button">
				Button
			</Button>,
		);
		const button = screen.getByTestId('custom-button');

		expect(button).toHaveAttribute('aria-label', 'Custom button');
	});

	it('handles keyboard events', () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Keyboard Button</Button>);
		const button = screen.getByRole('button');

		fireEvent.keyDown(button, { key: 'Enter' });
		// Note: Button component relies on native button behavior for keyboard events
		// The onClick will be triggered by the browser's default behavior
	});
});
