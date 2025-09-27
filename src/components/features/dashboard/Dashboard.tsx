import {
	DollarSign,
	Package,
	RefreshCw,
	ShoppingCart,
	Users,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
	type DashboardMetrics,
	dashboardService,
	MockDashboardService,
	type SalesData,
} from '../../../data/mockDashboardService';
import MetricsCard from './MetricsCard';
import SalesChart from './SalesChart';

interface DashboardProps {
	className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className = '' }) => {
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
	const [salesData, setSalesData] = useState<SalesData[]>([]);

	const [loadingStates, setLoadingStates] = useState({
		metrics: true,
		sales: true,
	});

	const [errors, setErrors] = useState({
		metrics: '',
		sales: '',
	});

	const [isRefreshing, setIsRefreshing] = useState(false);

	const loadDashboardData = async () => {
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
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await loadDashboardData();
		setIsRefreshing(false);
	};

	useEffect(() => {
		loadDashboardData();
	}, []);

	const metricsCards = metrics
		? [
				{
					title: 'Vendas Hoje',
					value: MockDashboardService.formatCurrency(metrics.salesToday.value),
					icon: <ShoppingCart className="w-6 h-6" />,
					trend: metrics.salesToday.trend,
					color: 'green' as const,
				},
				{
					title: 'Receita Mensal',
					value: MockDashboardService.formatCurrency(
						metrics.monthlyRevenue.value,
					),
					icon: <DollarSign className="w-6 h-6" />,
					trend: metrics.monthlyRevenue.trend,
					color: 'blue' as const,
				},
				{
					title: 'Produtos Cadastrados',
					value: MockDashboardService.formatNumber(metrics.totalProducts.value),
					icon: <Package className="w-6 h-6" />,
					trend: metrics.totalProducts.trend,
					color: 'blue' as const,
				},
			]
		: [];

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-gray-600 mt-1">Visão geral do sistema de vendas</p>
				</div>
				<div className="mt-4 sm:mt-0 flex items-center space-x-4">
					<button
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
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{metricsCards.map((card, index) => (
					<MetricsCard
						key={index}
						title={card.title}
						value={card.value}
						icon={card.icon}
						trend={card.trend}
						color={card.color}
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
						</div>
						<div className="p-6 space-y-3">
							<button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
								<ShoppingCart className="w-4 h-4 mr-2" />
								Nova Venda
							</button>
							<button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
								<Package className="w-4 h-4 mr-2" />
								Cadastrar Produto
							</button>
							<button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
								<Users className="w-4 h-4 mr-2" />
								Cadastrar Cliente
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
