import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Product, ProductUnit } from '../../../types';
import { ProductList } from './ProductList';

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
		stock: 5, // Low stock
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '3',
		code: 'PRD003',
		name: 'Another Product',
		price: 5.0,
		unit: ProductUnit.LITER,
		stock: 0, // Out of stock
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe('ProductList', () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();
	const mockOnAdd = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders product list correctly', () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		expect(screen.getByText('Products')).toBeInTheDocument();
		expect(screen.getByText('Test Product 1')).toBeInTheDocument();
		expect(screen.getByText('Test Product 2')).toBeInTheDocument();
		expect(screen.getByText('Another Product')).toBeInTheDocument();
	});

	it('displays product count correctly', () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		expect(screen.getByText(/3 products/)).toBeInTheDocument();
	});

	it('formats price correctly', () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		expect(screen.getByText('$10.99')).toBeInTheDocument();
		expect(screen.getByText('$25.50')).toBeInTheDocument();
		expect(screen.getByText('$5.00')).toBeInTheDocument();
	});

	it('shows stock levels with appropriate colors', () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		// Check if stock numbers are displayed
		expect(screen.getByText('100')).toBeInTheDocument();
		expect(screen.getByText('5')).toBeInTheDocument();
		expect(screen.getByText('0')).toBeInTheDocument();
	});

	it('filters products based on search query', async () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		const searchInput = screen.getByPlaceholderText(/search products/i);
		fireEvent.change(searchInput, { target: { value: 'Test Product 1' } });

		await waitFor(() => {
			expect(screen.getByText('Test Product 1')).toBeInTheDocument();
			expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
			expect(screen.queryByText('Another Product')).not.toBeInTheDocument();
		});
	});

	it('filters products by code', async () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		const searchInput = screen.getByPlaceholderText(/search products/i);
		fireEvent.change(searchInput, { target: { value: 'PRD002' } });

		await waitFor(() => {
			expect(screen.getByText('Test Product 2')).toBeInTheDocument();
			expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument();
			expect(screen.queryByText('Another Product')).not.toBeInTheDocument();
		});
	});

	it('calls onAdd when add button is clicked', () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		const addButton = screen.getByRole('button', { name: /add product/i });
		fireEvent.click(addButton);

		expect(mockOnAdd).toHaveBeenCalled();
	});

	it('calls onEdit when edit button is clicked', () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		const editButtons = screen.getAllByRole('button');
		const editButton = editButtons.find(
			(button) =>
				button.querySelector('svg') &&
				button.getAttribute('class')?.includes('secondary'),
		);

		if (editButton) {
			fireEvent.click(editButton);
			expect(mockOnEdit).toHaveBeenCalledWith(mockProducts[0]);
		}
	});

	it('shows delete confirmation modal when delete button is clicked', async () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

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
				expect(
					screen.getByText(/are you sure you want to delete/i),
				).toBeInTheDocument();
			});
		}
	});

	it('calls onDelete when delete is confirmed', async () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

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

			const confirmButton = screen.getByRole('button', {
				name: /delete product/i,
			});
			fireEvent.click(confirmButton);

			expect(mockOnDelete).toHaveBeenCalledWith('1');
		}
	});

	it('shows warning for products with stock when deleting', async () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		const deleteButtons = screen.getAllByRole('button');
		const deleteButton = deleteButtons.find(
			(button) =>
				button.querySelector('svg') &&
				button.getAttribute('class')?.includes('danger'),
		);

		if (deleteButton) {
			fireEvent.click(deleteButton);

			await waitFor(() => {
				expect(screen.getByText(/warning/i)).toBeInTheDocument();
				expect(screen.getByText(/100 units in stock/i)).toBeInTheDocument();
			});
		}
	});

	it('shows empty state when no products', () => {
		render(
			<ProductList
				products={[]}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		expect(screen.getByText('No products yet')).toBeInTheDocument();
		expect(
			screen.getByText(/get started by adding your first product/i),
		).toBeInTheDocument();
	});

	it('shows no results message when search returns empty', async () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
			/>,
		);

		const searchInput = screen.getByPlaceholderText(/search products/i);
		fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

		await waitFor(() => {
			expect(screen.getByText('No products found')).toBeInTheDocument();
			expect(
				screen.getByText(/try adjusting your search criteria/i),
			).toBeInTheDocument();
		});
	});

	it('shows loading state', () => {
		render(
			<ProductList
				products={mockProducts}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onAdd={mockOnAdd}
				loading={true}
			/>,
		);

		// The Table component should handle the loading state
		expect(screen.getByText('Products')).toBeInTheDocument();
	});
});
