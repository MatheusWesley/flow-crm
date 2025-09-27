import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Customer } from '../../../types';
import { CustomerForm } from './CustomerForm';

// Mock customer data
const mockCustomer: Customer = {
	id: '1',
	name: 'John Doe',
	email: 'john.doe@example.com',
	phone: '(11) 99999-9999',
	cpf: '123.456.789-00',
	address: {
		street: 'Main Street',
		number: '123',
		complement: 'Apt 1',
		neighborhood: 'Downtown',
		city: 'São Paulo',
		state: 'SP',
		zipCode: '01234-567',
	},
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe('CustomerForm', () => {
	const mockOnSave = vi.fn();
	const mockOnCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders form fields correctly', () => {
		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Check basic information fields
		expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();

		// Check address fields
		expect(screen.getByLabelText(/street/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/number/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/complement/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/neighborhood/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();

		// Check buttons
		expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /create customer/i }),
		).toBeInTheDocument();
	});

	it('populates form when editing existing customer', () => {
		render(
			<CustomerForm
				customer={mockCustomer}
				onSave={mockOnSave}
				onCancel={mockOnCancel}
			/>,
		);

		expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
		expect(
			screen.getByDisplayValue('john.doe@example.com'),
		).toBeInTheDocument();
		expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
		expect(screen.getByDisplayValue('123.456.789-00')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Main Street')).toBeInTheDocument();
		expect(screen.getByDisplayValue('123')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Apt 1')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Downtown')).toBeInTheDocument();
		expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
		expect(screen.getByDisplayValue('SP')).toBeInTheDocument();
		expect(screen.getByDisplayValue('01234-567')).toBeInTheDocument();

		expect(
			screen.getByRole('button', { name: /update customer/i }),
		).toBeInTheDocument();
	});

	it('validates required fields', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText('Customer name is required')).toBeInTheDocument();
			expect(screen.getByText('Email is required')).toBeInTheDocument();
			expect(screen.getByText('Phone number is required')).toBeInTheDocument();
			expect(screen.getByText('CPF is required')).toBeInTheDocument();
		});

		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it('validates email format', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Fill other required fields first
		await user.type(screen.getByLabelText(/full name/i), 'John Doe');
		await user.type(screen.getByLabelText(/phone/i), '11999999999');
		await user.type(screen.getByLabelText(/cpf/i), '12345678900');

		const emailInput = screen.getByLabelText(/email/i);
		await user.type(emailInput, 'invalid-email');

		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText('Please enter a valid email address'),
			).toBeInTheDocument();
		});

		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it('validates CPF format', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Fill other required fields first
		await user.type(screen.getByLabelText(/full name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.type(screen.getByLabelText(/phone/i), '11999999999');

		const cpfInput = screen.getByLabelText(/cpf/i);
		await user.type(cpfInput, '123.456.789-99'); // Invalid CPF

		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText('Please enter a valid CPF')).toBeInTheDocument();
		});

		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it('formats CPF input correctly', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const cpfInput = screen.getByLabelText(/cpf/i);
		await user.type(cpfInput, '12345678900');

		expect(cpfInput).toHaveValue('123.456.789-00');
	});

	it('formats phone input correctly', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const phoneInput = screen.getByLabelText(/phone/i);
		await user.type(phoneInput, '11999999999');

		expect(phoneInput).toHaveValue('(11) 99999-9999');
	});

	it('formats ZIP code input correctly', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const zipInput = screen.getByLabelText(/zip code/i);
		await user.type(zipInput, '01234567');

		expect(zipInput).toHaveValue('01234-567');
	});

	it('validates address fields when any address field is provided', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Fill required fields
		await user.type(screen.getByLabelText(/full name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.type(screen.getByLabelText(/phone/i), '11999999999');
		await user.type(screen.getByLabelText(/cpf/i), '12345678900');

		// Fill only street to trigger address validation
		await user.type(screen.getByLabelText(/street/i), 'Main Street');

		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/number is required when address is provided/i),
			).toBeInTheDocument();
			expect(
				screen.getByText(/neighborhood is required when address is provided/i),
			).toBeInTheDocument();
			expect(
				screen.getByText(/city is required when address is provided/i),
			).toBeInTheDocument();
			expect(
				screen.getByText(/state is required when address is provided/i),
			).toBeInTheDocument();
			expect(
				screen.getByText(/zip code is required when address is provided/i),
			).toBeInTheDocument();
		});

		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it('submits form with valid data', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Fill required fields
		await user.type(screen.getByLabelText(/full name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.type(screen.getByLabelText(/phone/i), '11999999999');
		await user.type(screen.getByLabelText(/cpf/i), '12345678900');

		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith({
				name: 'John Doe',
				email: 'john@example.com',
				phone: '(11) 99999-9999',
				cpf: '12345678900', // Stored without formatting
				address: undefined,
			});
		});
	});

	it('submits form with complete address data', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Fill all fields
		await user.type(screen.getByLabelText(/full name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.type(screen.getByLabelText(/phone/i), '11999999999');
		await user.type(screen.getByLabelText(/cpf/i), '12345678900');
		await user.type(screen.getByLabelText(/street/i), 'Main Street');
		await user.type(screen.getByLabelText(/number/i), '123');
		await user.type(screen.getByLabelText(/complement/i), 'Apt 1');
		await user.type(screen.getByLabelText(/neighborhood/i), 'Downtown');
		await user.type(screen.getByLabelText(/city/i), 'São Paulo');
		await user.type(screen.getByLabelText(/state/i), 'SP');
		await user.type(screen.getByLabelText(/zip code/i), '01234567');

		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith({
				name: 'John Doe',
				email: 'john@example.com',
				phone: '(11) 99999-9999',
				cpf: '12345678900',
				address: {
					street: 'Main Street',
					number: '123',
					complement: 'Apt 1',
					neighborhood: 'Downtown',
					city: 'São Paulo',
					state: 'SP',
					zipCode: '01234567', // Stored without formatting
				},
			});
		});
	});

	it('calls onCancel when cancel button is clicked', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const cancelButton = screen.getByRole('button', { name: /cancel/i });
		await user.click(cancelButton);

		expect(mockOnCancel).toHaveBeenCalled();
	});

	it('clears field errors when user starts typing', async () => {
		const user = userEvent.setup();

		render(<CustomerForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Trigger validation error
		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText('Customer name is required')).toBeInTheDocument();
		});

		// Start typing to clear error
		const nameInput = screen.getByLabelText(/full name/i);
		await user.type(nameInput, 'J');

		expect(
			screen.queryByText('Customer name is required'),
		).not.toBeInTheDocument();
	});

	it('disables form during submission', async () => {
		const user = userEvent.setup();

		// Mock a slow onSave function
		const slowOnSave = vi.fn(
			() => new Promise((resolve) => setTimeout(resolve, 100)),
		);

		render(<CustomerForm onSave={slowOnSave} onCancel={mockOnCancel} />);

		// Fill required fields
		await user.type(screen.getByLabelText(/full name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.type(screen.getByLabelText(/phone/i), '11999999999');
		await user.type(screen.getByLabelText(/cpf/i), '12345678900');

		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		const cancelButton = screen.getByRole('button', { name: /cancel/i });

		await user.click(submitButton);

		// Buttons should be disabled during submission
		expect(submitButton).toBeDisabled();
		expect(cancelButton).toBeDisabled();

		await waitFor(() => {
			expect(slowOnSave).toHaveBeenCalled();
		});
	});
});
