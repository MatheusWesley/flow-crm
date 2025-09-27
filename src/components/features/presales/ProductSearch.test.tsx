import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockProductService } from '../../../data/mockProductService';
import { type Product, ProductUnit } from '../../../types';
import ProductSearch from './ProductSearch';

// Mock the product service
vi.mock('../../../data/mockProductService', () => ({
	mockProductService: {
		searchProducts: vi.fn(),
	},
}));

const mockProducts: Product[] = [
	{
		id: '1',
		code: 'PRD001',
		name: 'Wireless Headphones',
		price: 99.99,
		unit: ProductUnit.PIECE,
		description: 'High-quality wireless headphones',
		stock: 25,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '2',
		code: 'PRD002',
		name: 'Coffee Beans',
		price: 12.5,
		unit: ProductUnit.KILOGRAM,
		description: 'Premium arabica coffee beans',
		stock: 0, // Out of stock
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '3',
		code: 'PRD003',
		name: 'Notebook',
		price: 3.99,
		unit: ProductUnit.PIECE,
		description: 'A5 lined notebook',
		stock: 3, // Low stock
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe('ProductSearch', () => {
	const mockOnProductSelect = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockProductService.searchProducts = vi.fn();
	});

	it('renders search input correctly', () => {
		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		expect(
			screen.getByPlaceholderText('Search product by code or name...'),
		).toBeInTheDocument();
		expect(screen.getByRole('textbox')).toBeInTheDocument();
	});

	it('shows loading state while searching', async () => {
		mockProductService.searchProducts = vi
			.fn()
			.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(() => resolve(mockProducts), 100),
					),
			);

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		// Should show loading spinner
		await waitFor(() => {
			expect(document.querySelector('.animate-spin')).toBeInTheDocument();
		});
	});

	it('displays search suggestions when typing', async () => {
		mockProductService.searchProducts = vi.fn().mockResolvedValue(mockProducts);

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		await waitFor(() => {
			expect(screen.getByText('PRD001')).toBeInTheDocument();
			expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
			expect(screen.getByText('PRD002')).toBeInTheDocument();
			expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
		});
	});

	it('shows out of stock indicator for products with zero stock', async () => {
		mockProductService.searchProducts = vi.fn().mockResolvedValue(mockProducts);

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		await waitFor(() => {
			expect(screen.getByText('Out of Stock')).toBeInTheDocument();
		});
	});

	it('shows low stock indicator for products with low stock', async () => {
		mockProductService.searchProducts = vi.fn().mockResolvedValue(mockProducts);

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		await waitFor(() => {
			expect(screen.getByText('Low Stock')).toBeInTheDocument();
		});
	});

	it('calls onProductSelect when clicking on a product with stock', async () => {
		mockProductService.searchProducts = vi.fn().mockResolvedValue(mockProducts);

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		await waitFor(() => {
			expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Wireless Headphones'));

		expect(mockOnProductSelect).toHaveBeenCalledWith(mockProducts[0]);
	});

	it('shows error when trying to select out of stock product', async () => {
		mockProductService.searchProducts = vi.fn().mockResolvedValue(mockProducts);

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		await waitFor(() => {
			expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Coffee Beans'));

		await waitFor(() => {
			expect(
				screen.getByText('Product "Coffee Beans" is out of stock'),
			).toBeInTheDocument();
		});

		expect(mockOnProductSelect).not.toHaveBeenCalled();
	});

	it('handles keyboard navigation', async () => {
		mockProductService.searchProducts = vi.fn().mockResolvedValue(mockProducts);

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		await waitFor(() => {
			expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
		});

		// Navigate down
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		fireEvent.keyDown(input, { key: 'ArrowDown' });

		// Select with Enter
		fireEvent.keyDown(input, { key: 'Enter' });

		// Should select the second product (Coffee Beans) but show error due to no stock
		await waitFor(() => {
			expect(
				screen.getByText('Product "Coffee Beans" is out of stock'),
			).toBeInTheDocument();
		});
	});

	it('clears search when clear button is clicked', async () => {
		mockProductService.searchProducts = vi.fn().mockResolvedValue(mockProducts);

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		await waitFor(() => {
			expect(screen.getByText('×')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('×'));

		expect(input).toHaveValue('');
	});

	it('displays selected product information', () => {
		const selectedProduct = mockProducts[0];

		render(
			<ProductSearch
				onProductSelect={mockOnProductSelect}
				selectedProduct={selectedProduct}
			/>,
		);

		expect(
			screen.getByText('PRD001 - Wireless Headphones'),
		).toBeInTheDocument();
		expect(
			screen.getByText('High-quality wireless headphones'),
		).toBeInTheDocument();
		expect(screen.getByText('$99.99')).toBeInTheDocument();
		expect(screen.getByText('25 pc')).toBeInTheDocument();
	});

	it('shows no results message when no products found', async () => {
		mockProductService.searchProducts = vi.fn().mockResolvedValue([]);

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'NONEXISTENT' } });

		await waitFor(() => {
			expect(
				screen.getByText('No products found for "NONEXISTENT"'),
			).toBeInTheDocument();
		});
	});

	it('handles search errors gracefully', async () => {
		mockProductService.searchProducts = vi
			.fn()
			.mockRejectedValue(new Error('Search failed'));

		render(<ProductSearch onProductSelect={mockOnProductSelect} />);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		await waitFor(() => {
			expect(screen.getByText('Failed to search products')).toBeInTheDocument();
		});
	});

	it('closes suggestions when clicking outside', async () => {
		mockProductService.searchProducts = vi.fn().mockResolvedValue(mockProducts);

		render(
			<div>
				<ProductSearch onProductSelect={mockOnProductSelect} />
				<div data-testid="outside">Outside element</div>
			</div>,
		);

		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'PRD' } });

		await waitFor(() => {
			expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
		});

		fireEvent.mouseDown(screen.getByTestId('outside'));

		await waitFor(() => {
			expect(screen.queryByText('Wireless Headphones')).not.toBeInTheDocument();
		});
	});
});
