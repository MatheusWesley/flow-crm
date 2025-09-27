import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customerService } from '../../../data/mockCustomerService';
import type { Customer } from '../../../types';
import { Customers } from './Customers';

// Mock the customer service
vi.mock('../../../data/mockCustomerService', () => ({
	customerService: {
		getCustomers: vi.fn(),
		createCustomer: vi.fn(),
		updateCustomer: vi.fn(),
		deleteCustomer: vi.fn(),
	},
}));

const mockCustomerService = customerService as any;

// Mock customer data
const mockCustomers: Customer[] = [
	{
		id: '1',
		name: 'John Doe',
		email: 'john.doe@example.com',
		phone: '11999999999',
		cpf: '12345678900',
		address: {
			street: 'Main Street',
			number: '123',
			complement: 'Apt 1',
			neighborhood: 'Downtown',
			city: 'São Paulo',
			state: 'SP',
			zipCode: '01234567',
		},
		createdAt: new Date('2024-01-15'),
		updatedAt: new Date('2024-01-15'),
	},
	{
		id: '2',
		name: 'Jane Smith',
		email: 'jane.smith@example.com',
		phone: '11888888888',
		cpf: '98765432100',
		createdAt: new Date('2024-01-10'),
		updatedAt: new Date('2024-01-10'),
	},
];

describe('Customers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCustomerService.getCustomers.mockResolvedValue(mockCustomers);
	});

	it('renders customers page correctly', async () => {
		render(<Customers />);

		// Check header
		expect(screen.getByText('Customers')).toBeInTheDocument();
		expect(
			screen.getByText('Manage your customer database'),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /add customer/i }),
		).toBeInTheDocument();

		// Wait for customers to load
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		});

		expect(mockCustomerService.getCustomers).toHaveBeenCalledTimes(1);
	});

	it('shows loading state initially', () => {
		mockCustomerService.getCustomers.mockImplementation(
			() =>
				new Promise((resolve) => setTimeout(() => resolve(mockCustomers), 100)),
		);

		render(<Customers />);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('switches to create form when add customer button is clicked', async () => {
		const user = userEvent.setup();

		render(<Customers />);

		// Wait for initial load
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const addButton = screen.getByRole('button', { name: /add customer/i });
		await user.click(addButton);

		// Should show form view
		expect(screen.getByText('New Customer')).toBeInTheDocument();
		expect(
			screen.getByText('Add a new customer to your database'),
		).toBeInTheDocument();
		expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /create customer/i }),
		).toBeInTheDocument();
	});

	it('switches to edit form when edit button is clicked', async () => {
		const user = userEvent.setup();

		render(<Customers />);

		// Wait for initial load
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const editButtons = screen.getAllByTitle('Edit customer');
		await user.click(editButtons[0]);

		// Should show edit form
		expect(screen.getByText('Edit Customer')).toBeInTheDocument();
		expect(screen.getByText('Update customer information')).toBeInTheDocument();
		expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /update customer/i }),
		).toBeInTheDocument();
	});

	it('creates new customer successfully', async () => {
		const user = userEvent.setup();
		const newCustomer: Customer = {
			id: '3',
			name: 'New Customer',
			email: 'new@example.com',
			phone: '11777777777',
			cpf: '11122233344',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockCustomerService.createCustomer.mockResolvedValue(newCustomer);

		render(<Customers />);

		// Wait for initial load and click add button
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const addButton = screen.getByRole('button', { name: /add customer/i });
		await user.click(addButton);

		// Fill form
		await user.type(screen.getByLabelText(/full name/i), 'New Customer');
		await user.type(screen.getByLabelText(/email/i), 'new@example.com');
		await user.type(screen.getByLabelText(/phone/i), '11777777777');
		await user.type(screen.getByLabelText(/cpf/i), '11122233344');

		// Submit form
		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		await user.click(submitButton);

		// Should call create service and show success notification
		await waitFor(() => {
			expect(mockCustomerService.createCustomer).toHaveBeenCalledWith({
				name: 'New Customer',
				email: 'new@example.com',
				phone: '(11) 77777-7777',
				cpf: '11122233344',
				address: undefined,
			});
		});

		// Should return to list view
		await waitFor(() => {
			expect(screen.getByText('Customers')).toBeInTheDocument();
			expect(
				screen.getByText('Customer created successfully'),
			).toBeInTheDocument();
		});
	});

	it('updates existing customer successfully', async () => {
		const user = userEvent.setup();
		const updatedCustomer: Customer = {
			...mockCustomers[0],
			name: 'Updated Name',
			updatedAt: new Date(),
		};

		mockCustomerService.updateCustomer.mockResolvedValue(updatedCustomer);

		render(<Customers />);

		// Wait for initial load and click edit button
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const editButtons = screen.getAllByTitle('Edit customer');
		await user.click(editButtons[0]);

		// Update name
		const nameInput = screen.getByDisplayValue('John Doe');
		await user.clear(nameInput);
		await user.type(nameInput, 'Updated Name');

		// Submit form
		const submitButton = screen.getByRole('button', {
			name: /update customer/i,
		});
		await user.click(submitButton);

		// Should call update service
		await waitFor(() => {
			expect(mockCustomerService.updateCustomer).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					name: 'Updated Name',
				}),
			);
		});

		// Should show success notification
		await waitFor(() => {
			expect(
				screen.getByText('Customer updated successfully'),
			).toBeInTheDocument();
		});
	});

	it('deletes customer successfully', async () => {
		const user = userEvent.setup();

		mockCustomerService.deleteCustomer.mockResolvedValue(undefined);

		render(<Customers />);

		// Wait for initial load
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		// Click delete button
		const deleteButtons = screen.getAllByTitle('Delete customer');
		await user.click(deleteButtons[0]);

		// Confirm deletion
		const confirmButton = screen.getByRole('button', {
			name: /delete customer/i,
		});
		await user.click(confirmButton);

		// Should call delete service
		await waitFor(() => {
			expect(mockCustomerService.deleteCustomer).toHaveBeenCalledWith('1');
		});

		// Should show success notification
		await waitFor(() => {
			expect(
				screen.getByText('Customer deleted successfully'),
			).toBeInTheDocument();
		});
	});

	it('handles create customer error', async () => {
		const user = userEvent.setup();

		mockCustomerService.createCustomer.mockRejectedValue(
			new Error('Create failed'),
		);

		render(<Customers />);

		// Wait for initial load and click add button
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const addButton = screen.getByRole('button', { name: /add customer/i });
		await user.click(addButton);

		// Fill and submit form
		await user.type(screen.getByLabelText(/full name/i), 'New Customer');
		await user.type(screen.getByLabelText(/email/i), 'new@example.com');
		await user.type(screen.getByLabelText(/phone/i), '11777777777');
		await user.type(screen.getByLabelText(/cpf/i), '11122233344');

		const submitButton = screen.getByRole('button', {
			name: /create customer/i,
		});
		await user.click(submitButton);

		// Should show error notification
		await waitFor(() => {
			expect(screen.getByText('Failed to save customer')).toBeInTheDocument();
		});
	});

	it('handles delete customer error', async () => {
		const user = userEvent.setup();

		mockCustomerService.deleteCustomer.mockRejectedValue(
			new Error('Delete failed'),
		);

		render(<Customers />);

		// Wait for initial load
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		// Click delete button and confirm
		const deleteButtons = screen.getAllByTitle('Delete customer');
		await user.click(deleteButtons[0]);

		const confirmButton = screen.getByRole('button', {
			name: /delete customer/i,
		});
		await user.click(confirmButton);

		// Should show error notification
		await waitFor(() => {
			expect(screen.getByText('Failed to delete customer')).toBeInTheDocument();
		});
	});

	it('cancels form and returns to list view', async () => {
		const user = userEvent.setup();

		render(<Customers />);

		// Wait for initial load and click add button
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const addButton = screen.getByRole('button', { name: /add customer/i });
		await user.click(addButton);

		// Should be in form view
		expect(screen.getByText('New Customer')).toBeInTheDocument();

		// Click cancel
		const cancelButton = screen.getByRole('button', { name: /cancel/i });
		await user.click(cancelButton);

		// Should return to list view
		expect(screen.getByText('Customers')).toBeInTheDocument();
		expect(
			screen.getByText('Manage your customer database'),
		).toBeInTheDocument();
	});

	it('dismisses notification when close button is clicked', async () => {
		const user = userEvent.setup();

		mockCustomerService.deleteCustomer.mockResolvedValue(undefined);

		render(<Customers />);

		// Wait for initial load and perform delete to show notification
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const deleteButtons = screen.getAllByTitle('Delete customer');
		await user.click(deleteButtons[0]);

		const confirmButton = screen.getByRole('button', {
			name: /delete customer/i,
		});
		await user.click(confirmButton);

		// Wait for notification to appear
		await waitFor(() => {
			expect(
				screen.getByText('Customer deleted successfully'),
			).toBeInTheDocument();
		});

		// Click close button on notification
		const closeButton = screen.getByRole('button', { name: /close/i });
		await user.click(closeButton);

		// Notification should be dismissed
		expect(
			screen.queryByText('Customer deleted successfully'),
		).not.toBeInTheDocument();
	});

	it('handles load customers error', async () => {
		mockCustomerService.getCustomers.mockRejectedValue(
			new Error('Load failed'),
		);

		render(<Customers />);

		// Should show error notification
		await waitFor(() => {
			expect(screen.getByText('Failed to load customers')).toBeInTheDocument();
		});
	});
});
