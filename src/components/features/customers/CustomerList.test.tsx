import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Customer } from '../../../types';
import { CustomerList } from './CustomerList';

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
		address: {
			street: 'Second Street',
			number: '456',
			neighborhood: 'Uptown',
			city: 'Rio de Janeiro',
			state: 'RJ',
			zipCode: '98765432',
		},
		createdAt: new Date('2024-01-10'),
		updatedAt: new Date('2024-01-10'),
	},
	{
		id: '3',
		name: 'Bob Johnson',
		email: 'bob.johnson@example.com',
		phone: '11777777777',
		cpf: '11122233344',
		createdAt: new Date('2024-01-20'),
		updatedAt: new Date('2024-01-20'),
	},
];

describe('CustomerList', () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders customer list correctly', () => {
		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		// Check if customers are displayed
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

		// Check if emails are displayed
		expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
		expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
		expect(screen.getByText('bob.johnson@example.com')).toBeInTheDocument();
	});

	it('displays formatted CPF and phone numbers', () => {
		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		// Check formatted CPF
		expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
		expect(screen.getByText('987.654.321-00')).toBeInTheDocument();

		// Check formatted phone numbers
		expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
		expect(screen.getByText('(11) 88888-8888')).toBeInTheDocument();
	});

	it('displays city information correctly', () => {
		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		expect(screen.getByText('São Paulo')).toBeInTheDocument();
		expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument();
		expect(screen.getByText('-')).toBeInTheDocument(); // For customer without address
	});

	it('displays formatted creation dates', () => {
		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		expect(screen.getByText('15/01/2024')).toBeInTheDocument();
		expect(screen.getByText('10/01/2024')).toBeInTheDocument();
		expect(screen.getByText('20/01/2024')).toBeInTheDocument();
	});

	it('filters customers by search query', async () => {
		const user = userEvent.setup();

		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		const searchInput = screen.getByPlaceholderText(/search customers/i);
		await user.type(searchInput, 'John');

		// Should show only John Doe
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
		expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();

		// Should show search results summary
		expect(screen.getByText(/found 1 customer/i)).toBeInTheDocument();
	});

	it('filters customers by email', async () => {
		const user = userEvent.setup();

		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		const searchInput = screen.getByPlaceholderText(/search customers/i);
		await user.type(searchInput, 'jane.smith');

		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
		expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
	});

	it('filters customers by city', async () => {
		const user = userEvent.setup();

		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnDelete}
				onDelete={mockOnDelete}
			/>,
		);

		const searchInput = screen.getByPlaceholderText(/search customers/i);
		await user.type(searchInput, 'Rio de Janeiro');

		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
		expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
	});

	it('shows no results message when search yields no matches', async () => {
		const user = userEvent.setup();

		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		const searchInput = screen.getByPlaceholderText(/search customers/i);
		await user.type(searchInput, 'nonexistent');

		expect(
			screen.getByText(/no customers found matching "nonexistent"/i),
		).toBeInTheDocument();
		expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
		expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
		expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
	});

	it('calls onEdit when edit button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		const editButtons = screen.getAllByTitle('Edit customer');
		await user.click(editButtons[0]);

		expect(mockOnEdit).toHaveBeenCalledWith(mockCustomers[0]);
	});

	it('shows delete confirmation modal when delete button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		const deleteButtons = screen.getAllByTitle('Delete customer');
		await user.click(deleteButtons[0]);

		// Should show confirmation modal
		expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
		expect(
			screen.getByText(
				/are you sure you want to delete the customer "John Doe"/i,
			),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /delete customer/i }),
		).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
	});

	it('calls onDelete when delete is confirmed', async () => {
		const user = userEvent.setup();

		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		const deleteButtons = screen.getAllByTitle('Delete customer');
		await user.click(deleteButtons[0]);

		// Confirm deletion
		const confirmButton = screen.getByRole('button', {
			name: /delete customer/i,
		});
		await user.click(confirmButton);

		expect(mockOnDelete).toHaveBeenCalledWith('1');
	});

	it('closes delete modal when cancel is clicked', async () => {
		const user = userEvent.setup();

		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		const deleteButtons = screen.getAllByTitle('Delete customer');
		await user.click(deleteButtons[0]);

		// Cancel deletion
		const cancelButton = screen.getByRole('button', { name: /cancel/i });
		await user.click(cancelButton);

		// Modal should be closed
		expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
		expect(mockOnDelete).not.toHaveBeenCalled();
	});

	it('displays loading state', () => {
		render(
			<CustomerList
				customers={[]}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				loading={true}
			/>,
		);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('displays empty state when no customers', () => {
		render(
			<CustomerList
				customers={[]}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				loading={false}
			/>,
		);

		expect(screen.getByText('No customers')).toBeInTheDocument();
		expect(
			screen.getByText('Get started by creating your first customer.'),
		).toBeInTheDocument();
	});

	it('clears search when input is cleared', async () => {
		const user = userEvent.setup();

		render(
			<CustomerList
				customers={mockCustomers}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		const searchInput = screen.getByPlaceholderText(/search customers/i);

		// Search for something
		await user.type(searchInput, 'John');
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();

		// Clear search
		await user.clear(searchInput);

		// All customers should be visible again
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
	});

	it('handles customers without address gracefully', () => {
		const customersWithoutAddress: Customer[] = [
			{
				id: '1',
				name: 'Test User',
				email: 'test@example.com',
				phone: '11999999999',
				cpf: '12345678900',
				createdAt: new Date('2024-01-15'),
				updatedAt: new Date('2024-01-15'),
			},
		];

		render(
			<CustomerList
				customers={customersWithoutAddress}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>,
		);

		expect(screen.getByText('Test User')).toBeInTheDocument();
		expect(screen.getByText('-')).toBeInTheDocument(); // For missing city
	});
});
