import {
	DollarSign,
	Package,
	RefreshCw,
	ShoppingCart,
	Users,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
	type DashboardMetrics,
	dashboardService,
	MockDashboardService,
	type SalesData,
} from '../../../data/mockDashboardService';
import toastService, { TOAST_MESSAGES } from '../../../services/ToastService';
import type { Customer, PreSale, Product } from '../../../types';
import { PresaleModal } from '../shared/presaleModal';

// Type for metrics cards
interface MetricCardData {
	title: string;
	value: string;
	icon: React.ReactNode;
	trend: {
		value: number;
		isPositive: boolean;
		period?: string;
	};
	color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

import MetricsCard from './MetricsCard';
import SalesChart from './SalesChart';

interface DashboardProps {
	className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className = '' }) => {
	const navigate = useNavigate();
	const { isAdmin, isEmployee, hasPermission, user } = useAuth();
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
	const [salesData, setSalesData] = useState<SalesData[]>([]);
	const [showPresaleModal, setShowPresaleModal] = useState(false);

	const [loadingStates, setLoadingStates] = useState({
		metrics: true,
		sales: true,
	});

	const [errors, setErrors] = useState({
		metrics: '',
		sales: '',
	});

	const [isRefreshing, setIsRefreshing] = useState(false);

	// Mock data for customers and products (in a real app, these would come from API)
	const [customers] = useState<Customer[]>([
		{
			id: '1',
			name: 'João Silva',
			email: 'joao@email.com',
			phone: '(11) 99999-9999',
			cpf: '123.456.789-01',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '2',
			name: 'Maria Santos',
			email: 'maria@email.com',
			phone: '(11) 88888-8888',
			cpf: '987.654.321-00',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	const [products] = useState<Product[]>([
		{
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
		{
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
	]);

	const loadDashboardData = useCallback(async () => {
		try {
			// Load metrics
			setLoadingStates((prev) => ({ ...prev, metrics: true }));
			setErrors((prev) => ({ ...prev, metrics: '' }));

			const metricsData = await dashboardService.getDashboardMetrics();
			setMetrics(metricsData);
			setLoadingStates((prev) => ({ ...prev, metrics: false }));
		} catch (error) {
			setErrors((prev) => ({
				...prev,
				metrics: error instanceof Error ? error.message : 'Erro desconhecido',
			}));
			setLoadingStates((prev) => ({ ...prev, metrics: false }));
		}

		try {
			// Load sales data
			setLoadingStates((prev) => ({ ...prev, sales: true }));
			setErrors((prev) => ({ ...prev, sales: '' }));

			const salesResponse = await dashboardService.getSalesData();
			setSalesData(salesResponse);
			setLoadingStates((prev) => ({ ...prev, sales: false }));
		} catch (error) {
			setErrors((prev) => ({
				...prev,
				sales: error instanceof Error ? error.message : 'Erro desconhecido',
			}));
			setLoadingStates((prev) => ({ ...prev, sales: false }));
		}
	}, []);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await loadDashboardData();
		setIsRefreshing(false);
	};

	useEffect(() => {
		loadDashboardData();
	}, [loadDashboardData]);

	const metricsCards = metrics
		? (() => {
				const baseCards: MetricCardData[] = [
					{
						title: 'Vendas Hoje',
						value: MockDashboardService.formatCurrency(
							metrics.salesToday.value,
						),
						icon: <ShoppingCart className="w-6 h-6" />,
						trend: metrics.salesToday.trend,
						color: 'green',
					},
				];

				// Administrators see all metrics
				if (isAdmin) {
					return [
						...baseCards,
						{
							title: 'Receita Mensal',
							value: MockDashboardService.formatCurrency(
								metrics.monthlyRevenue.value,
							),
							icon: <DollarSign className="w-6 h-6" />,
							trend: metrics.monthlyRevenue.trend,
							color: 'blue',
						},
						{
							title: 'Total de Produtos',
							value: MockDashboardService.formatNumber(
								metrics.totalProducts.value,
							),
							icon: <Package className="w-6 h-6" />,
							trend: metrics.totalProducts.trend,
							color: 'purple',
						},
						{
							title: 'Clientes Ativos',
							value: MockDashboardService.formatNumber(
								metrics.activeCustomers.value,
							),
							icon: <Users className="w-6 h-6" />,
							trend: metrics.activeCustomers.trend,
							color: 'indigo',
						},
					];
				}

				// Employees see limited metrics based on permissions
				const employeeCards = [...baseCards];

				if (hasPermission('modules.products')) {
					employeeCards.push({
						title: 'Total de Produtos',
						value: MockDashboardService.formatNumber(
							metrics.totalProducts.value,
						),
						icon: <Package className="w-6 h-6" />,
						trend: metrics.totalProducts.trend,
						color: 'purple',
					});
				}

				if (hasPermission('modules.customers')) {
					employeeCards.push({
						title: 'Clientes Ativos',
						value: MockDashboardService.formatNumber(
							metrics.activeCustomers.value,
						),
						icon: <Users className="w-6 h-6" />,
						trend: metrics.activeCustomers.trend,
						color: 'indigo',
					});
				}

				return employeeCards;
			})()
		: [];

	const handleNewSale = () => {
		setShowPresaleModal(true);
	};

	const handleRegisterProduct = () => {
		navigate('/products');
	};

	const handleRegisterCustomer = () => {
		navigate('/customers');
	};

	const handlePresaleSubmit = (
		presaleData: Omit<PreSale, 'id' | 'createdAt' | 'updatedAt'>,
	) => {
		// In a real app, this would save to the backend
		console.log('Nova pré-venda criada:', presaleData);
		toastService.success(TOAST_MESSAGES.presale.created);

		// Optionally redirect to presales page to see the created presale
		navigate('/presales');
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-gray-600 mt-1">
						{isAdmin
							? 'Visão geral completa do sistema de vendas'
							: `Painel de vendas - ${user?.name}`}
					</p>
					{isEmployee && (
						<p className="text-sm text-blue-600 mt-1">
							Funcionário • Acesso limitado baseado em permissões
						</p>
					)}
				</div>
				<div className="mt-4 sm:mt-0 flex items-center space-x-4">
					<button
						type="button"
						onClick={handleRefresh}
						disabled={isRefreshing}
						className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
						/>
						Atualizar
					</button>
					<p className="text-sm text-gray-500">
						Última atualização: {new Date().toLocaleString('pt-BR')}
					</p>
				</div>
			</div>

			{/* KPI Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{metricsCards.map((card) => (
					<MetricsCard
						key={card.title}
						title={card.title}
						value={card.value}
						icon={card.icon}
						trend={card.trend}
						color={
							card.color as
								| 'blue'
								| 'green'
								| 'yellow'
								| 'red'
								| 'purple'
								| 'indigo'
						}
						loading={loadingStates.metrics}
						error={errors.metrics}
					/>
				))}
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Sales Chart */}
				<div className="lg:col-span-3">
					<SalesChart
						data={salesData}
						loading={loadingStates.sales}
						error={errors.sales}
					/>
				</div>

				{/* Quick Actions */}
				<div>
					<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
						<div className="px-6 py-4 border-b border-gray-200">
							<h2 className="text-lg font-semibold text-gray-900">
								Ações Rápidas
							</h2>
							{isEmployee && (
								<p className="text-sm text-gray-500 mt-1">
									Ações disponíveis para {user?.name}
								</p>
							)}
						</div>
						<div className="p-6 space-y-3">
							{/* Nova Venda - Available for all authenticated users */}
							<button
								type="button"
								onClick={handleNewSale}
								className="w-full flex items-center justify-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								<ShoppingCart className="w-4 h-4 mr-2" />
								Nova Venda
							</button>

							{/* Cadastrar Produto - Only if user has products permission */}
							{(isAdmin || hasPermission('modules.products')) && (
								<button
									type="button"
									onClick={handleRegisterProduct}
									className="w-full flex items-center cursor-pointer justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
								>
									<Package className="w-4 h-4 mr-2" />
									Cadastrar Produto
								</button>
							)}

							{/* Cadastrar Cliente - Only if user has customers permission */}
							{(isAdmin || hasPermission('modules.customers')) && (
								<button
									type="button"
									onClick={handleRegisterCustomer}
									className="w-full flex items-center cursor-pointer justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
								>
									<Users className="w-4 h-4 mr-2" />
									Cadastrar Cliente
								</button>
							)}

							{/* Show message if employee has no additional permissions */}
							{isEmployee &&
								!hasPermission('modules.products') &&
								!hasPermission('modules.customers') && (
									<div className="text-center py-4">
										<p className="text-sm text-gray-500">
											Suas permissões atuais permitem apenas criar vendas.
										</p>
										<p className="text-xs text-gray-400 mt-1">
											Entre em contato com o administrador para solicitar acesso
											adicional.
										</p>
									</div>
								)}
						</div>
					</div>
				</div>
			</div>

			{/* Modal para Nova Pré-venda */}
			<PresaleModal
				isOpen={showPresaleModal}
				onClose={() => setShowPresaleModal(false)}
				onSubmit={handlePresaleSubmit}
				customers={customers}
				products={products}
				title="Nova Pré-venda"
			/>
		</div>
	);
};

export default Dashboard;
