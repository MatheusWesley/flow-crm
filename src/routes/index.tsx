import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Customers } from '../components/features/customers';
import Dashboard from '../components/features/dashboard';
import { Presales } from '../components/features/presales';
import ProductsPage from '../components/features/products/ProductsPage';
import Layout from '../components/layout/Layout';
import { handleSearch, mockUser } from '../data/mockUser';

// Layout wrapper component
const LayoutWrapper = ({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}) => (
	<Layout title={title} user={mockUser} onSearch={handleSearch}>
		{children}
	</Layout>
);

export const router = createBrowserRouter([
	{
		path: '/',
		element: <Navigate to="/dashboard" replace />,
	},
	{
		path: '/dashboard',
		element: (
			<LayoutWrapper title="Dashboard">
				<Dashboard />
			</LayoutWrapper>
		),
	},
	{
		path: '/presales',
		element: (
			<LayoutWrapper title="Pré-vendas">
				<Presales />
			</LayoutWrapper>
		),
	},
	{
		path: '/products',
		element: (
			<LayoutWrapper title="Produtos">
				<ProductsPage />
			</LayoutWrapper>
		),
	},
	{
		path: '/products/add',
		element: (
			<LayoutWrapper title="Cadastrar Produto">
				<ProductsPage />
			</LayoutWrapper>
		),
	},
	{
		path: '/customers',
		element: (
			<LayoutWrapper title="Clientes">
				<Customers />
			</LayoutWrapper>
		),
	},
	{
		path: '/customers/add',
		element: (
			<LayoutWrapper title="Cadastrar Cliente">
				<Customers />
			</LayoutWrapper>
		),
	},
	{
		path: '/inventory',
		element: (
			<LayoutWrapper title="Estoque">
				<div className="p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">Estoque</h1>
					<div className="bg-white rounded-lg shadow p-6">
						<p className="text-gray-600">
							Página de estoque em desenvolvimento...
						</p>
					</div>
				</div>
			</LayoutWrapper>
		),
	},
	{
		path: '/reports/sales',
		element: (
			<LayoutWrapper title="Relatório de Vendas">
				<div className="p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">
						Relatório de Vendas
					</h1>
					<div className="bg-white rounded-lg shadow p-6">
						<p className="text-gray-600">
							Relatório de vendas em desenvolvimento...
						</p>
					</div>
				</div>
			</LayoutWrapper>
		),
	},
	{
		path: '/reports/inventory',
		element: (
			<LayoutWrapper title="Relatório de Estoque">
				<div className="p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">
						Relatório de Estoque
					</h1>
					<div className="bg-white rounded-lg shadow p-6">
						<p className="text-gray-600">
							Relatório de estoque em desenvolvimento...
						</p>
					</div>
				</div>
			</LayoutWrapper>
		),
	},
	{
		path: '/settings',
		element: (
			<LayoutWrapper title="Configurações">
				<div className="p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">
						Configurações
					</h1>
					<div className="bg-white rounded-lg shadow p-6">
						<p className="text-gray-600">
							Página de configurações em desenvolvimento...
						</p>
					</div>
				</div>
			</LayoutWrapper>
		),
	},
	{
		path: '*',
		element: (
			<LayoutWrapper title="Página não encontrada">
				<div className="p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">
						404 - Página não encontrada
					</h1>
					<div className="bg-white rounded-lg shadow p-6">
						<p className="text-gray-600">
							A página que você está procurando não existe.
						</p>
					</div>
				</div>
			</LayoutWrapper>
		),
	},
]);
