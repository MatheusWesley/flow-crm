import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../../context/AuthContext';
import Dashboard from './Dashboard';

// Mock the useAuth hook
vi.mock('../../../context/AuthContext', () => ({
	useAuth: vi.fn(),
}));

// Mock the MockDashboardService
vi.mock('../../../data/mockDashboardService', () => ({
	MockDashboardService: {
		formatCurrency: vi.fn(
			(value: number) => `R$ ${value.toLocaleString('pt-BR')}`,
		),
		formatNumber: vi.fn((value: number) => value.toLocaleString('pt-BR')),
	},
}));

const mockUseAuth = vi.mocked(useAuth);

const mockAuthUser = {
	id: '1',
	name: 'Test User',
	email: 'test@example.com',
	password: 'hashedPassword',
	userType: 'admin' as const,
	isActive: true,
	permissions: {
		modules: {
			products: true,
			customers: true,
			inventory: true,
			reports: true,
			paymentMethods: true,
			userManagement: true,
		},
		presales: {
			canCreate: true,
			canViewOwn: true,
			canViewAll: true,
		},
	},
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe('Dashboard', () => {
	const renderWithRouter = (component: React.ReactElement) => {
		return render(<MemoryRouter>{component}</MemoryRouter>);
	};

	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks();

		// Set up default auth mock
		mockUseAuth.mockReturnValue({
			user: mockAuthUser,
			isAuthenticated: true,
			isLoading: false,
			error: null,
			login: vi.fn(),
			logout: vi.fn(),
			clearError: vi.fn(),
			permissions: mockAuthUser.permissions,
			hasPermission: vi.fn().mockReturnValue(true),
			isAdmin: true,
			isEmployee: false,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders dashboard title and description', () => {
		renderWithRouter(<Dashboard />);

		expect(screen.getByText('Dashboard')).toBeInTheDocument();
		expect(
			screen.getByText('Visão geral completa do sistema de vendas'),
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

	it('displays only two metric cards (removed Total de Produtos and Clientes Ativos)', async () => {
		renderWithRouter(<Dashboard />);

		// Wait for metrics to load
		await waitFor(() => {
			expect(screen.getByText('Vendas Hoje')).toBeInTheDocument();
		});

		expect(screen.getByText('Receita Mensal')).toBeInTheDocument();

		// Ensure removed cards are not present
		expect(screen.queryByText('Total de Produtos')).not.toBeInTheDocument();
		expect(screen.queryByText('Clientes Ativos')).not.toBeInTheDocument();
	});

	it('opens presale modal when Nova Venda button is clicked', async () => {
		const user = userEvent.setup();
		renderWithRouter(<Dashboard />);

		const novaVendaButton = screen.getByRole('button', { name: /Nova Venda/ });
		await user.click(novaVendaButton);

		expect(screen.getByText('Nova Pré-venda')).toBeInTheDocument();
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
