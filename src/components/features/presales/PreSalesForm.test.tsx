import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Product, ProductUnit } from '../../../types';
import PreSalesForm from './PreSalesForm';

const mockProduct: Product = {
	id: '1',
	code: 'PRD001',
	name: 'Wireless Headphones',
	price: 99.99,
	unit: ProductUnit.PIECE,
	description: 'High-quality wireless headphones',
	stock: 25,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockLowStockProduct: Product = {
	id: '2',
	code: 'PRD002',
	name: 'Coffee Beans',
	price: 12.5,
	unit: ProductUnit.KILOGRAM,
	description: 'Premium arabica coffee beans',
	stock: 2,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe('PreSalesForm', () => {
	const mockOnAddItem = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows empty state when no product is selected', () => {
		render(
			<PreSalesForm
				selectedProduct={null}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		expect(screen.getByText('No Product Selected')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Search and select a product above to add it to your pre-sale',
			),
		).toBeInTheDocument();
	});

	it('displays product information when product is selected', () => {
		render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		expect(
			screen.getByText('PRD001 - Wireless Headphones'),
		).toBeInTheDocument();
		expect(screen.getByText('Available: 25 pc')).toBeInTheDocument();
		// Check for the price in the product info section
		expect(screen.getByText(/per pc/)).toBeInTheDocument();
	});

	it('initializes form with default values', () => {
		render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // quantity
		expect(screen.getByDisplayValue('99.99')).toBeInTheDocument(); // price
		expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // discount
	});

	it('calculates subtotal and total correctly', () => {
		render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		const quantityInput = screen.getByDisplayValue('1');
		fireEvent.change(quantityInput, { target: { value: '2' } });

		// Check that subtotal and total are calculated
		const subtotalElements = screen.getAllByText('$199.98');
		expect(subtotalElements.length).toBeGreaterThan(0);
	});

	it('calculates discount correctly', () => {
		render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		const quantityInput = screen.getByDisplayValue('1');
		const discountInput = screen.getByDisplayValue('0');

		fireEvent.change(quantityInput, { target: { value: '2' } });
		fireEvent.change(discountInput, { target: { value: '10' } });

		// Check that discount is applied
		expect(screen.getByText(/Discount \(10%\):/)).toBeInTheDocument();
		expect(screen.getByText('$179.98')).toBeInTheDocument(); // final total
	});

	it('successfully adds item when form is valid', async () => {
		render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		const quantityInput = screen.getByDisplayValue('1');
		const discountInput = screen.getByDisplayValue('0');
		const submitButton = screen.getByText('Add to Pre-Sale');

		fireEvent.change(quantityInput, { target: { value: '2' } });
		fireEvent.change(discountInput, { target: { value: '10' } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockOnAddItem).toHaveBeenCalledWith(
				expect.objectContaining({
					productCode: 'PRD001',
					productName: 'Wireless Headphones',
					price: 99.99,
					quantity: 2,
					subtotal: 179.98, // 199.98 - 19.98 (10% discount)
				}),
			);
		});
	});

	it('resets form after successful submission', async () => {
		render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		const quantityInput = screen.getByDisplayValue('1');
		const discountInput = screen.getByDisplayValue('0');
		const submitButton = screen.getByText('Add to Pre-Sale');

		fireEvent.change(quantityInput, { target: { value: '3' } });
		fireEvent.change(discountInput, { target: { value: '15' } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockOnAddItem).toHaveBeenCalled();
		});

		// Form should reset to default values
		expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // quantity
		expect(screen.getByDisplayValue('99.99')).toBeInTheDocument(); // price (product price)
		expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // discount
	});

	it('updates price when product changes', () => {
		const { rerender } = render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		expect(screen.getByDisplayValue('99.99')).toBeInTheDocument();

		// Change product
		rerender(
			<PreSalesForm
				selectedProduct={mockLowStockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		expect(screen.getByDisplayValue('12.5')).toBeInTheDocument(); // Note: 12.5 not 12.50
	});

	it('prevents submission with invalid quantity', async () => {
		render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		const quantityInput = screen.getByDisplayValue('1');
		const submitButton = screen.getByText('Add to Pre-Sale');

		fireEvent.change(quantityInput, { target: { value: '0' } });
		fireEvent.click(submitButton);

		// Should not call onAddItem with invalid data
		expect(mockOnAddItem).not.toHaveBeenCalled();
	});

	it('prevents submission with invalid price', async () => {
		render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		const priceInput = screen.getByDisplayValue('99.99');
		const submitButton = screen.getByText('Add to Pre-Sale');

		fireEvent.change(priceInput, { target: { value: '0' } });
		fireEvent.click(submitButton);

		// Should not call onAddItem with invalid data
		expect(mockOnAddItem).not.toHaveBeenCalled();
	});

	it('prevents submission when quantity exceeds stock', async () => {
		render(
			<PreSalesForm
				selectedProduct={mockLowStockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		const quantityInput = screen.getByDisplayValue('1');
		const submitButton = screen.getByText('Add to Pre-Sale');

		fireEvent.change(quantityInput, { target: { value: '5' } });
		fireEvent.click(submitButton);

		// Should not call onAddItem when quantity exceeds stock
		expect(mockOnAddItem).not.toHaveBeenCalled();
	});

	it('shows item preview section', () => {
		render(
			<PreSalesForm
				selectedProduct={mockProduct}
				onAddItem={mockOnAddItem}
				existingItems={[]}
			/>,
		);

		expect(screen.getByText('Item Preview')).toBeInTheDocument();
		expect(screen.getByText('Subtotal:')).toBeInTheDocument();
		expect(screen.getByText('Total:')).toBeInTheDocument();
	});
});
