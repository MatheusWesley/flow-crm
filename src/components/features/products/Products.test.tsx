import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Product, ProductUnit } from '../../../types';
import { Products } from './Products';

const mockProducts: Product[] = [
	{
		id: '1',
		code: 'PRD001',
		name: 'Test Product 1',
		price: 10.99,
		unit: ProductUnit.PIECE,
		description: 'Test description 1',
		stock: 100,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '2',
		code: 'PRD002',
		name: 'Test Product 2',
		price: 25.5,
		unit: ProductUnit.KILOGRAM,
		description: 'Test description 2',
		stock: 50,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe('Products', () => {
	const mockOnSave = vi.fn();
	const mockOnUpdate = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders product list by default', () => {
		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		expect(screen.getByText('Products')).toBeInTheDocument();
		expect(screen.getByText('Test Product 1')).toBeInTheDocument();
		expect(screen.getByText('Test Product 2')).toBeInTheDocument();
	});

	it('opens add product modal when add button is clicked', async () => {
		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		const addButton = screen.getByRole('button', { name: /add product/i });
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(screen.getByText('Add New Product')).toBeInTheDocument();
			expect(screen.getByLabelText(/product code/i)).toBeInTheDocument();
		});
	});

	it('opens edit product modal when edit button is clicked', async () => {
		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		// Find and click the first edit button
		const editButtons = screen.getAllByRole('button');
		const editButton = editButtons.find(
			(button) =>
				button.querySelector('svg') &&
				button.getAttribute('class')?.includes('secondary'),
		);

		if (editButton) {
			fireEvent.click(editButton);

			await waitFor(() => {
				expect(screen.getByText('Edit Product')).toBeInTheDocument();
				expect(screen.getByDisplayValue('Test Product 1')).toBeInTheDocument();
			});
		}
	});

	it('calls onSave when creating a new product', async () => {
		mockOnSave.mockResolvedValue(undefined);

		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		// Open add modal
		const addButton = screen.getByRole('button', { name: /add product/i });
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(screen.getByText('Add New Product')).toBeInTheDocument();
		});

		// Fill in the form
		const nameInput = screen.getByLabelText(/product name/i);
		const priceInput = screen.getByLabelText(/price/i);

		fireEvent.change(nameInput, { target: { value: 'New Product' } });
		fireEvent.change(priceInput, { target: { value: '15.99' } });

		// Submit the form
		const submitButton = screen.getByRole('button', {
			name: /create product/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'New Product',
					price: 15.99,
				}),
			);
		});
	});

	it('calls onUpdate when editing an existing product', async () => {
		mockOnUpdate.mockResolvedValue(undefined);

		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		// Open edit modal
		const editButtons = screen.getAllByRole('button');
		const editButton = editButtons.find(
			(button) =>
				button.querySelector('svg') &&
				button.getAttribute('class')?.includes('secondary'),
		);

		if (editButton) {
			fireEvent.click(editButton);

			await waitFor(() => {
				expect(screen.getByText('Edit Product')).toBeInTheDocument();
			});

			// Modify the product name
			const nameInput = screen.getByLabelText(/product name/i);
			fireEvent.change(nameInput, { target: { value: 'Updated Product' } });

			// Submit the form
			const submitButton = screen.getByRole('button', {
				name: /update product/i,
			});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockOnUpdate).toHaveBeenCalledWith(
					'1',
					expect.objectContaining({
						name: 'Updated Product',
					}),
				);
			});
		}
	});

	it('calls onDelete when deleting a product', async () => {
		mockOnDelete.mockResolvedValue(undefined);

		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		// Find and click the first delete button
		const deleteButtons = screen.getAllByRole('button');
		const deleteButton = deleteButtons.find(
			(button) =>
				button.querySelector('svg') &&
				button.getAttribute('class')?.includes('danger'),
		);

		if (deleteButton) {
			fireEvent.click(deleteButton);

			await waitFor(() => {
				expect(screen.getByText('Delete Product')).toBeInTheDocument();
			});

			// Confirm deletion
			const confirmButton = screen.getByRole('button', {
				name: /delete product/i,
			});
			fireEvent.click(confirmButton);

			await waitFor(() => {
				expect(mockOnDelete).toHaveBeenCalledWith('1');
			});
		}
	});

	it('shows success notification when product is saved', async () => {
		mockOnSave.mockResolvedValue(undefined);

		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		// Open add modal and submit
		const addButton = screen.getByRole('button', { name: /add product/i });
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(screen.getByText('Add New Product')).toBeInTheDocument();
		});

		const nameInput = screen.getByLabelText(/product name/i);
		const priceInput = screen.getByLabelText(/price/i);

		fireEvent.change(nameInput, { target: { value: 'New Product' } });
		fireEvent.change(priceInput, { target: { value: '15.99' } });

		const submitButton = screen.getByRole('button', {
			name: /create product/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
		});
	});

	it('shows error notification when save fails', async () => {
		mockOnSave.mockRejectedValue(new Error('Save failed'));

		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		// Open add modal and submit
		const addButton = screen.getByRole('button', { name: /add product/i });
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(screen.getByText('Add New Product')).toBeInTheDocument();
		});

		const nameInput = screen.getByLabelText(/product name/i);
		const priceInput = screen.getByLabelText(/price/i);

		fireEvent.change(nameInput, { target: { value: 'New Product' } });
		fireEvent.change(priceInput, { target: { value: '15.99' } });

		const submitButton = screen.getByRole('button', {
			name: /create product/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/failed to save product/i)).toBeInTheDocument();
		});
	});

	it('closes modal when cancel is clicked', async () => {
		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		// Open add modal
		const addButton = screen.getByRole('button', { name: /add product/i });
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(screen.getByText('Add New Product')).toBeInTheDocument();
		});

		// Click cancel
		const cancelButton = screen.getByRole('button', { name: /cancel/i });
		fireEvent.click(cancelButton);

		await waitFor(() => {
			expect(screen.queryByText('Add New Product')).not.toBeInTheDocument();
		});
	});

	it('dismisses notification when close button is clicked', async () => {
		mockOnSave.mockResolvedValue(undefined);

		render(
			<Products
				products={mockProducts}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
				onDelete={mockOnDelete}
			/>,
		);

		// Trigger a success notification
		const addButton = screen.getByRole('button', { name: /add product/i });
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(screen.getByText('Add New Product')).toBeInTheDocument();
		});

		const nameInput = screen.getByLabelText(/product name/i);
		const priceInput = screen.getByLabelText(/price/i);

		fireEvent.change(nameInput, { target: { value: 'New Product' } });
		fireEvent.change(priceInput, { target: { value: '15.99' } });

		const submitButton = screen.getByRole('button', {
			name: /create product/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
		});

		// Find and click the dismiss button
		const dismissButton = screen.getByRole('button', { name: /dismiss/i });
		fireEvent.click(dismissButton);

		await waitFor(() => {
			expect(
				screen.queryByText(/created successfully/i),
			).not.toBeInTheDocument();
		});
	});
});
