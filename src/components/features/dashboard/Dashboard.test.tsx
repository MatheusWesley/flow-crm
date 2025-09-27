import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardService } from '../../../data/mockDashboardService';
import Dashboard from './Dashboard';

// Mock the dashboard service
vi.mock('../../../data/mockDashboardService', () => ({
	dashboardService: {
		getDashboardMetrics: vi.fn(),
		getSalesData: vi.fn(),
		getRecentActivities: vi.fn(),
		getInventoryAlerts: vi.fn(),
		constructor: {
			formatCurrency: vi.fn(
				(value: number) => `R$ ${value.toLocaleString('pt-BR')}`,
			),
			formatNumber: vi.fn((value: number) => value.toLocaleString('pt-BR')),
		},
	},
}));

const mockMetrics = {
	salesToday: { value: 12450, trend: { value: 12.5, isPositive: true } },
	totalProducts: { value: 1247, trend: { value: 3.2, isPositive: true } },
	activeCustomers: { value: 892, trend: { value: 8.1, isPositive: true } },
	lowStockProducts: { value: 23, trend: { value: 15.3, isPositive: false } },
	inventoryValue: { value: 145780, trend: { value: 5.7, isPositive: true } },
	monthlyRevenue: { value: 387650, trend: { value: 18.2, isPositive: true } },
};

const mockSalesData = [
	{ date: '2025-09-20', sales: 15, revenue: 3500 },
	{ date: '2025-09-21', sales: 12, revenue: 2800 },
	{ date: '2025-09-22', sales: 18, revenue: 4200 },
];

const mockActivities = [
	{
		id: '1',
		type: 'sale' as const,
		description: 'Nova venda realizada - Cliente: João Silva - R$ 450,00',
		timestamp: new Date(Date.now() - 5 * 60 * 1000),
	},
	{
		id: '2',
		type: 'product' as const,
		description: 'Produto "Notebook Dell" cadastrado no sistema',
		timestamp: new Date(Date.now() - 15 * 60 * 1000),
	},
];

const mockInventoryAlerts = [
	{
		id: '1',
		productName: 'Mouse Wireless',
		currentStock: 5,
		minimumStock: 10,
		severity: 'low' as const,
	},
	{
		id: '2',
		productName: 'Teclado USB',
		currentStock: 2,
		minimumStock: 8,
		severity: 'critical' as const,
	},
];

describe('Dashboard', () => {
	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks();

		// Set up default successful responses
		(dashboardService.getDashboardMetrics as any).mockResolvedValue(
			mockMetrics,
		);
		(dashboardService.getSalesData as any).mockResolvedValue(mockSalesData);
		(dashboardService.getRecentActivities as any).mockResolvedValue(
			mockActivities,
		);
		(dashboardService.getInventoryAlerts as any).mockResolvedValue(
			mockInventoryAlerts,
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders dashboard title and description', () => {
		render(<Dashboard />);

		expect(screen.getByText('Dashboard')).toBeInTheDocument();
		expect(
			screen.getByText('Visão geral do sistema de vendas'),
		).toBeInTheDocument();
	});

	it('displays loading states initially', () => {
		render(<Dashboard />);

		// Should show loading skeletons
		expect(screen.getAllByText('Atualizar')).toHaveLength(1);
	});

	it('loads and displays metrics after loading', async () => {
		render(<Dashboard />);

		// Wait for metrics to load
		await waitFor(() => {
			expect(screen.getByText('Vendas Hoje')).toBeInTheDocument();
		});

		expect(screen.getByText('Receita Mensal')).toBeInTheDocument();
		expect(screen.getByText('Produtos Cadastrados')).toBeInTheDocument();
		expect(screen.getByText('Clientes Ativos')).toBeInTheDocument();
		expect(screen.getByText('Valor do Estoque')).toBeInTheDocument();
		expect(screen.getByText('Produtos em Falta')).toBeInTheDocument();
	});

	it('displays sales chart after loading', async () => {
		render(<Dashboard />);

		await waitFor(() => {
			expect(screen.getByText('Vendas dos Últimos 7 Dias')).toBeInTheDocument();
		});
	});

	it('displays recent activities after loading', async () => {
		render(<Dashboard />);

		await waitFor(() => {
			expect(screen.getByText('Atividades Recentes')).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(
				screen.getByText(/Nova venda realizada - Cliente: João Silva/),
			).toBeInTheDocument();
		});
	});

	it('displays inventory alerts after loading', async () => {
		render(<Dashboard />);

		await waitFor(() => {
			expect(screen.getByText('Alertas de Estoque')).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText('Mouse Wireless')).toBeInTheDocument();
			expect(screen.getByText('Teclado USB')).toBeInTheDocument();
		});
	});

	it('renders quick actions section', () => {
		render(<Dashboard />);

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

	it('displays refresh button', () => {
		render(<Dashboard />);

		expect(
			screen.getByRole('button', { name: /Atualizar/ }),
		).toBeInTheDocument();
	});

	it('handles metrics loading error', async () => {
		(dashboardService.getDashboardMetrics as any).mockRejectedValue(
			new Error('Network error'),
		);

		render(<Dashboard />);

		await waitFor(() => {
			expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
		});
	});

	it('handles sales data loading error', async () => {
		(dashboardService.getSalesData as any).mockRejectedValue(
			new Error('Network error'),
		);

		render(<Dashboard />);

		await waitFor(() => {
			expect(screen.getByText('Erro ao carregar gráfico')).toBeInTheDocument();
		});
	});

	it('handles activities loading error', async () => {
		(dashboardService.getRecentActivities as any).mockRejectedValue(
			new Error('Network error'),
		);

		render(<Dashboard />);

		await waitFor(() => {
			expect(
				screen.getByText('Erro ao carregar atividades'),
			).toBeInTheDocument();
		});
	});

	it('handles inventory alerts loading error', async () => {
		(dashboardService.getInventoryAlerts as any).mockRejectedValue(
			new Error('Network error'),
		);

		render(<Dashboard />);

		await waitFor(() => {
			expect(screen.getByText('Erro ao carregar alertas')).toBeInTheDocument();
		});
	});

	it('applies custom className when provided', () => {
		const { container } = render(<Dashboard className="custom-class" />);

		expect(container.firstChild).toHaveClass('custom-class');
	});

	it('displays empty state for activities when no data', async () => {
		(dashboardService.getRecentActivities as any).mockResolvedValue([]);

		render(<Dashboard />);

		await waitFor(() => {
			expect(screen.getByText('Nenhuma atividade recente')).toBeInTheDocument();
		});
	});

	it('displays empty state for inventory when no alerts', async () => {
		(dashboardService.getInventoryAlerts as any).mockResolvedValue([]);

		render(<Dashboard />);

		await waitFor(() => {
			expect(screen.getByText('Estoque em dia!')).toBeInTheDocument();
		});
	});

	it('calls all service methods on mount', () => {
		render(<Dashboard />);

		expect(dashboardService.getDashboardMetrics).toHaveBeenCalledTimes(1);
		expect(dashboardService.getSalesData).toHaveBeenCalledTimes(1);
		expect(dashboardService.getRecentActivities).toHaveBeenCalledTimes(1);
		expect(dashboardService.getInventoryAlerts).toHaveBeenCalledTimes(1);
	});
});
