import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PreSaleItem } from '../../../types';
import PreSalesItemList from './PreSalesItemList';

const mockItems: PreSaleItem[] = [
	{
		id: 'item1',
		productCode: 'PRD001',
		productName: 'Wireless Headphones',
		price: 99.99,
		quantity: 2,
		subtotal: 199.98,
	},
	{
		id: 'item2',
		productCode: 'PRD002',
		productName: 'Coffee Beans',
		price: 12.5,
		quantity: 1,
		subtotal: 12.5,
	},
	{
		id: 'item3',
		productCode: 'PRD003',
		productName: 'Notebook',
		price: 3.99,
		quantity: 3,
		subtotal: 11.97,
	},
];

describe('PreSalesItemList', () => {
	const mockOnRemoveItem = vi.fn();
	const mockOnPrint = vi.fn();
	const mockOnFinalize = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows empty state when no items are provided', () => {
		render(<PreSalesItemList items={[]} onRemoveItem={mockOnRemoveItem} />);

		expect(screen.getByText('No Items Added')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Start by searching and adding products to your pre-sale',
			),
		).toBeInTheDocument();
		expect(
			screen.getByText('Use the product search above to find and add items'),
		).toBeInTheDocument();
	});

	it('displays items in a table when items are provided', () => {
		render(
			<PreSalesItemList items={mockItems} onRemoveItem={mockOnRemoveItem} />,
		);

		// Check header
		expect(screen.getByText('Pre-Sale Items (3)')).toBeInTheDocument();

		// Check table headers
		expect(screen.getByText('Code')).toBeInTheDocument();
		expect(screen.getByText('Product')).toBeInTheDocument();
		expect(screen.getByText('Unit Price')).toBeInTheDocument();
		expect(screen.getByText('Quantity')).toBeInTheDocument();
		expect(screen.getByText('Subtotal')).toBeInTheDocument();
		expect(screen.getByText('Actions')).toBeInTheDocument();

		// Check item data
		expect(screen.getByText('PRD001')).toBeInTheDocument();
		expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
		expect(screen.getByText('PRD002')).toBeInTheDocument();
		expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
		expect(screen.getByText('PRD003')).toBeInTheDocument();
		expect(screen.getByText('Notebook')).toBeInTheDocument();
	});

	it('calculates and displays correct totals', () => {
		render(
			<PreSalesItemList items={mockItems} onRemoveItem={mockOnRemoveItem} />,
		);

		// Check that subtotal section exists
		expect(screen.getByText('Subtotal:')).toBeInTheDocument();
		expect(screen.getByText('Total:')).toBeInTheDocument();

		// Subtotal: 199.98 + 12.50 + 11.97 = 224.45
		const subtotalElements = screen.getAllByText('$224.45');
		expect(subtotalElements.length).toBeGreaterThan(0);
	});

	it('calculates and displays discount correctly', () => {
		render(
			<PreSalesItemList
				items={mockItems}
				onRemoveItem={mockOnRemoveItem}
				discount={10}
			/>,
		);

		// Check discount display
		expect(screen.getByText('Discount (10%):')).toBeInTheDocument();
		expect(screen.getByText('-$22.45')).toBeInTheDocument();

		// Total after discount: 224.45 - 22.45 = 202.00
		expect(screen.getByText('$202.00')).toBeInTheDocument();
	});

	it('displays summary statistics correctly', () => {
		render(
			<PreSalesItemList items={mockItems} onRemoveItem={mockOnRemoveItem} />,
		);

		// Check that statistics are displayed
		expect(screen.getByText('3')).toBeInTheDocument(); // item count
		expect(screen.getByText('6')).toBeInTheDocument(); // total quantity (2+1+3)
		expect(screen.getByText('item')).toBeInTheDocument();
		expect(screen.getByText('total quantity')).toBeInTheDocument();
		expect(screen.getByText(/per item/)).toBeInTheDocument();
	});

	it('calls onRemoveItem when remove button is clicked', () => {
		render(
			<PreSalesItemList items={mockItems} onRemoveItem={mockOnRemoveItem} />,
		);

		// Get all remove buttons (trash icons)
		const removeButtons = screen.getAllByRole('button');
		const trashButtons = removeButtons.filter((button) =>
			button.querySelector('svg')?.classList.contains('lucide-trash-2'),
		);

		// Click the first remove button
		fireEvent.click(trashButtons[0]);

		expect(mockOnRemoveItem).toHaveBeenCalledWith('item1');
	});

	it('shows print button when onPrint is provided', () => {
		render(
			<PreSalesItemList
				items={mockItems}
				onRemoveItem={mockOnRemoveItem}
				onPrint={mockOnPrint}
			/>,
		);

		const printButton = screen.getByText('Print');
		expect(printButton).toBeInTheDocument();

		fireEvent.click(printButton);
		expect(mockOnPrint).toHaveBeenCalled();
	});

	it('shows finalize button when onFinalize is provided', () => {
		render(
			<PreSalesItemList
				items={mockItems}
				onRemoveItem={mockOnRemoveItem}
				onFinalize={mockOnFinalize}
			/>,
		);

		const finalizeButton = screen.getByText('Finalize Sale');
		expect(finalizeButton).toBeInTheDocument();

		fireEvent.click(finalizeButton);
		expect(mockOnFinalize).toHaveBeenCalled();
	});

	it('disables print and finalize buttons when no items', () => {
		render(
			<PreSalesItemList
				items={[]}
				onRemoveItem={mockOnRemoveItem}
				onPrint={mockOnPrint}
				onFinalize={mockOnFinalize}
			/>,
		);

		// Should show empty state, not buttons
		expect(screen.queryByText('Print')).not.toBeInTheDocument();
		expect(screen.queryByText('Finalize Sale')).not.toBeInTheDocument();
	});

	it('handles single item correctly', () => {
		const singleItem = [mockItems[0]];

		render(
			<PreSalesItemList items={singleItem} onRemoveItem={mockOnRemoveItem} />,
		);

		// Should show singular form
		expect(screen.getByText('Pre-Sale Items (1)')).toBeInTheDocument();
		expect(screen.getByText('1')).toBeInTheDocument(); // item count
		expect(screen.getByText('2')).toBeInTheDocument(); // total quantity
	});

	it('handles zero discount correctly', () => {
		render(
			<PreSalesItemList
				items={mockItems}
				onRemoveItem={mockOnRemoveItem}
				discount={0}
			/>,
		);

		// Should not show discount line when discount is 0
		expect(screen.queryByText(/Discount/)).not.toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(
			<PreSalesItemList
				items={mockItems}
				onRemoveItem={mockOnRemoveItem}
				className="custom-class"
			/>,
		);

		expect(container.firstChild).toHaveClass('custom-class');
	});

	it('shows correct item count in header', () => {
		render(
			<PreSalesItemList items={mockItems} onRemoveItem={mockOnRemoveItem} />,
		);

		expect(screen.getByText('Pre-Sale Items (3)')).toBeInTheDocument();
	});

	it('displays all required table columns', () => {
		render(
			<PreSalesItemList items={mockItems} onRemoveItem={mockOnRemoveItem} />,
		);

		const expectedColumns = [
			'Code',
			'Product',
			'Unit Price',
			'Quantity',
			'Subtotal',
			'Actions',
		];
		expectedColumns.forEach((column) => {
			expect(screen.getByText(column)).toBeInTheDocument();
		});
	});
});
