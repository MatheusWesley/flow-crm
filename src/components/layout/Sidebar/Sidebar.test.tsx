import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
	const defaultProps = {
		isCollapsed: false,
		onToggleCollapse: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders sidebar with menu items', () => {
		render(<Sidebar {...defaultProps} />);

		expect(screen.getByText('Sales Manager')).toBeInTheDocument();
		expect(screen.getByText('Dashboard')).toBeInTheDocument();
		expect(screen.getByText('Pré-vendas')).toBeInTheDocument();
		expect(screen.getByText('Produtos')).toBeInTheDocument();
		expect(screen.getByText('Clientes')).toBeInTheDocument();
		expect(screen.getByText('Estoque')).toBeInTheDocument();
		expect(screen.getByText('Relatórios')).toBeInTheDocument();
	});

	it('toggles collapse when button is clicked', () => {
		render(<Sidebar {...defaultProps} />);

		const toggleButton = screen.getByLabelText('Collapse sidebar');
		fireEvent.click(toggleButton);

		expect(defaultProps.onToggleCollapse).toHaveBeenCalledTimes(1);
	});

	it('shows collapsed state correctly', () => {
		render(<Sidebar {...defaultProps} isCollapsed={true} />);

		expect(screen.queryByText('Sales Manager')).not.toBeInTheDocument();
		expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
	});

	it('expands submenu when parent item is clicked', () => {
		render(<Sidebar {...defaultProps} />);

		const productMenuItem = screen.getByText('Produtos');
		fireEvent.click(productMenuItem);

		expect(screen.getByText('Lista de Produtos')).toBeInTheDocument();
		expect(screen.getByText('Cadastrar Produto')).toBeInTheDocument();
	});

	it('collapses submenu when parent item is clicked again', () => {
		render(<Sidebar {...defaultProps} />);

		const productMenuItem = screen.getByText('Produtos');

		// Expand
		fireEvent.click(productMenuItem);
		expect(screen.getByText('Lista de Produtos')).toBeInTheDocument();

		// Collapse
		fireEvent.click(productMenuItem);
		expect(screen.queryByText('Lista de Produtos')).not.toBeInTheDocument();
	});

	it('shows tooltip on hover when collapsed', async () => {
		render(<Sidebar {...defaultProps} isCollapsed={true} />);

		const dashboardItem = screen.getByLabelText('Dashboard');
		fireEvent.mouseEnter(dashboardItem);

		await waitFor(() => {
			expect(screen.getByText('Dashboard')).toBeInTheDocument();
		});
	});

	it('hides tooltip on mouse leave when collapsed', async () => {
		render(<Sidebar {...defaultProps} isCollapsed={true} />);

		const dashboardItem = screen.getByLabelText('Dashboard');
		fireEvent.mouseEnter(dashboardItem);

		await waitFor(() => {
			expect(screen.getByText('Dashboard')).toBeInTheDocument();
		});

		fireEvent.mouseLeave(dashboardItem);

		await waitFor(() => {
			expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
		});
	});

	it('applies custom className', () => {
		const { container } = render(
			<Sidebar {...defaultProps} className="custom-class" />,
		);

		expect(container.firstChild).toHaveClass('custom-class');
	});

	it('handles menu items without children correctly', () => {
		render(<Sidebar {...defaultProps} />);

		const dashboardItem = screen.getByText('Dashboard');
		fireEvent.click(dashboardItem);

		// Should not show any submenu items
		expect(screen.queryByText('Lista de Produtos')).not.toBeInTheDocument();
	});

	it('shows correct icons for menu items', () => {
		render(<Sidebar {...defaultProps} />);

		// Check if icons are rendered (we can't test the actual icon content easily,
		// but we can check if the icon containers exist)
		const menuItems = screen.getAllByRole('button');
		expect(menuItems.length).toBeGreaterThan(0);
	});

	it('handles keyboard navigation', () => {
		render(<Sidebar {...defaultProps} />);

		const toggleButton = screen.getByLabelText('Collapse sidebar');

		fireEvent.keyDown(toggleButton, { key: 'Enter' });
		expect(defaultProps.onToggleCollapse).toHaveBeenCalledTimes(1);
	});
});
