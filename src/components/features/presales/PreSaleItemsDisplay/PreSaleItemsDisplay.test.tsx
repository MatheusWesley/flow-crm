import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PreSaleItemsDisplay from './PreSaleItemsDisplay';
import type { PreSaleItem } from '../../../../types';

const mockItems: PreSaleItem[] = [
	{
		id: '1',
		product: {
			id: '1',
			code: 'PRD001',
			name: 'Produto Exemplo 1',
			description: 'Descrição do produto exemplo 1',
			unit: 'pc',
			stock: 100,
			category: 'Categoria A',
			saleType: 'unit',
			purchasePrice: 20.0,
			salePrice: 29.99,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		quantity: 2,
		unitPrice: 29.99,
		totalPrice: 59.98,
	},
	{
		id: '2',
		product: {
			id: '2',
			code: 'PRD002',
			name: 'Produto Exemplo 2',
			description: 'Descrição do produto exemplo 2',
			unit: 'kg',
			stock: 50,
			category: 'Categoria B',
			saleType: 'fractional',
			purchasePrice: 30.0,
			salePrice: 45.5,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		quantity: 1.5,
		unitPrice: 45.5,
		totalPrice: 68.25,
	},
];

describe('PreSaleItemsDisplay', () => {
	it('renders empty state when no items provided', () => {
		render(<PreSaleItemsDisplay items={[]} />);
		
		expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument();
	});

	it('renders items in mobile card layout', () => {
		render(<PreSaleItemsDisplay items={mockItems} />);
		
		// Check mobile layout elements
		expect(screen.getByRole('list', { name: 'Itens da pré-venda' })).toBeInTheDocument();
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
		
		// Check first item content (elements appear in both mobile and desktop)
		expect(screen.getAllByText('Produto Exemplo 1')[0]).toBeInTheDocument();
		expect(screen.getByText('Código: PRD001')).toBeInTheDocument();
		expect(screen.getAllByText(/2.*pc/)[0]).toBeInTheDocument();
	});

	it('renders items in desktop table layout', () => {
		render(<PreSaleItemsDisplay items={mockItems} />);
		
		// Check table structure
		expect(screen.getByRole('table', { name: 'Itens da pré-venda' })).toBeInTheDocument();
		expect(screen.getAllByRole('columnheader')).toHaveLength(4);
		expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header + 2 data rows
		
		// Check column headers
		expect(screen.getByRole('columnheader', { name: 'Produto' })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: 'Quantidade' })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: 'Preço Unit.' })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: 'Total' })).toBeInTheDocument();
	});

	it('formats currency correctly using formatCurrency', () => {
		render(<PreSaleItemsDisplay items={mockItems} />);
		
		// Check if currency is formatted as Brazilian Real (appears in both layouts)
		expect(screen.getAllByText('R$ 59,98')[0]).toBeInTheDocument();
		expect(screen.getAllByText('R$ 68,25')[0]).toBeInTheDocument();
		expect(screen.getAllByText('R$ 29,99')[0]).toBeInTheDocument();
		expect(screen.getAllByText('R$ 45,50')[0]).toBeInTheDocument();
	});

	it('displays product information correctly', () => {
		render(<PreSaleItemsDisplay items={mockItems} />);
		
		// Product names (appear in both mobile and desktop)
		expect(screen.getAllByText('Produto Exemplo 1')[0]).toBeInTheDocument();
		expect(screen.getAllByText('Produto Exemplo 2')[0]).toBeInTheDocument();
		
		// Product codes
		expect(screen.getAllByText('PRD001')[0]).toBeInTheDocument();
		expect(screen.getAllByText('PRD002')[0]).toBeInTheDocument();
		
		// Quantities with units
		expect(screen.getAllByText(/2.*pc/)[0]).toBeInTheDocument();
		expect(screen.getAllByText(/1[.,]5.*kg/)[0]).toBeInTheDocument();
	});

	it('has proper accessibility attributes', () => {
		render(<PreSaleItemsDisplay items={mockItems} />);
		
		// Check ARIA labels for items (appear in both mobile and desktop)
		expect(screen.getAllByLabelText(/Item 1: Produto Exemplo 1/)[0]).toBeInTheDocument();
		expect(screen.getAllByLabelText(/Item 2: Produto Exemplo 2/)[0]).toBeInTheDocument();
		
		// Check table accessibility
		expect(screen.getByRole('table', { name: 'Itens da pré-venda' })).toBeInTheDocument();
		expect(screen.getAllByRole('rowgroup')).toHaveLength(2); // header and body
	});

	it('applies correct CSS classes for responsive design', () => {
		render(<PreSaleItemsDisplay items={mockItems} />);
		
		// Mobile layout should be visible on small screens
		const mobileContainer = screen.getByRole('list');
		expect(mobileContainer).toHaveClass('block', 'md:hidden');
		
		// Desktop table should be hidden on small screens
		const desktopContainer = screen.getByRole('table').parentElement;
		expect(desktopContainer).toHaveClass('hidden', 'md:block');
	});

	it('handles keyboard navigation with tabindex', () => {
		render(<PreSaleItemsDisplay items={mockItems} />);
		
		// Check that items are focusable
		const focusableItems = screen.getAllByRole('listitem');
		focusableItems.forEach(item => {
			expect(item).toHaveAttribute('tabIndex', '0');
		});
		
		const focusableRows = screen.getAllByRole('row').slice(1); // Skip header row
		focusableRows.forEach(row => {
			expect(row).toHaveAttribute('tabIndex', '0');
		});
	});
});