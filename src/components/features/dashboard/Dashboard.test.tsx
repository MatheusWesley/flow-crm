import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardService } from '../../../data/mockDashboardService';
import Dashboard from './Dashboard';

// Mock the dashboard service
vi.mock('../../../data/mockDashboardService', () => ({
	dashboardService: {
		getDashboardMetrics: vi.fn(),
		getSalesData: vi.fn(),
	},
	MockDashboardService: {
		formatCurrency: vi.fn(
			(value: number) => `R$ ${value.toLocaleString('pt-BR')}`,
		),
		formatNumber: vi.fn((value: number) => value.toLocaleString('pt-BR')),
	},
}));

const mockMetrics = {
	salesToday: { value: 12450, trend: { value: 12.5, isPositive: true } },
	monthlyRevenue: { value: 387650, trend: { value: 18.2, isPositive: true } },
};

const mockSalesData = [
	{ date: '2025-09-20', sales: 15, revenue: 3500 },
	{ date: '2025-09-21', sales: 12, revenue: 2800 },
	{ date: '2025-09-22', sales: 18, revenue: 4200 },
];

describe('Dashboard', () => {
	const renderWithRouter = (component: React.ReactElement) => {
		return render(<MemoryRouter>{component}</MemoryRouter>);
	};

	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks();

		// Set up default successful responses
		(dashboardService.getDashboardMetrics as any).mockResolvedValue(
			mockMetrics,
		);
		(dashboardService.getSalesData as any).mockResolvedValue(mockSalesData);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders dashboard title and description', () => {
		renderWithRouter(<Dashboard />);

		expect(screen.getByText('Dashboard')).toBeInTheDocument();
		expect(
			screen.getByText('Visão geral do sistema de vendas'),
		).toBeInTheDocument();
	});

	it('renders quick actions section with all buttons', () => {
		renderWithRouter(<Dashboard />);

		expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Nova Venda/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Cadastrar Produto/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Cadastrar Cliente/ }),
		).toBeInTheDocument();
	});

	it('displays only two metric cards (removed Produtos Cadastrados)', async () => {
		renderWithRouter(<Dashboard />);

		// Wait for metrics to load
		await waitFor(() => {
			expect(screen.getByText('Vendas Hoje')).toBeInTheDocument();
		});

		expect(screen.getByText('Receita Mensal')).toBeInTheDocument();

		// Ensure "Produtos Cadastrados" is not present
		expect(screen.queryByText('Produtos Cadastrados')).not.toBeInTheDocument();
	});

	it('opens presale modal when Nova Venda button is clicked', async () => {
		const user = userEvent.setup();
		renderWithRouter(<Dashboard />);

		const novaVendaButton = screen.getByRole('button', { name: /Nova Venda/ });
		await user.click(novaVendaButton);

		expect(screen.getByText('Nova Pré-venda')).toBeInTheDocument();
		expect(screen.getByText('Criar Nova Pré-venda')).toBeInTheDocument();
	});

	it('displays refresh button', () => {
		renderWithRouter(<Dashboard />);

		expect(
			screen.getByRole('button', { name: /Atualizar/ }),
		).toBeInTheDocument();
	});

	it('applies custom className when provided', () => {
		const { container } = renderWithRouter(
			<Dashboard className="custom-class" />,
		);

		expect(container.firstChild).toHaveClass('custom-class');
	});
});
