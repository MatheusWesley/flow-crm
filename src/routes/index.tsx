import { createHashRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../components/features/auth';
import { Customers } from '../components/features/customers';
import Dashboard from '../components/features/dashboard';
import InventoryPage from '../components/features/inventory/InventoryPage';
import { PaymentMethodsPage } from '../components/features/paymentMethods';
import { Presales } from '../components/features/presales';
import ProductsPage from '../components/features/products/ProductsPage';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Layout wrapper component that uses the authenticated user
const LayoutWrapper = ({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}) => {
	const { user } = useAuth();

	// This should only be rendered when user is authenticated (inside ProtectedRoute)
	if (!user) {
		return null;
	}

	const handleSearch = (query: string) => {
		console.log('Search query:', query);
		// TODO: Implement search functionality
	};

	return (
		<Layout title={title} user={user} onSearch={handleSearch}>
			{children}
		</Layout>
	);
};

export const router = createHashRouter([
	{
		path: '/',
		element: <Navigate to="/dashboard" replace />,
	},
	{
		path: '/login',
		element: <LoginPage />,
	},
	{
		path: '/dashboard',
		element: (
			<ProtectedRoute>
				<LayoutWrapper title="Dashboard">
					<Dashboard />
				</LayoutWrapper>
			</ProtectedRoute>
		),
	},
	{
		path: '/presales',
		element: (
			<ProtectedRoute>
				<LayoutWrapper title="Pré-vendas">
					<Presales />
				</LayoutWrapper>
			</ProtectedRoute>
		),
	},
	{
		path: '/products',
		element: (
			<ProtectedRoute>
				<LayoutWrapper title="Produtos">
					<ProductsPage />
				</LayoutWrapper>
			</ProtectedRoute>
		),
	},
	{
		path: '/customers',
		element: (
			<ProtectedRoute>
				<LayoutWrapper title="Clientes">
					<Customers />
				</LayoutWrapper>
			</ProtectedRoute>
		),
	},
	{
		path: '/payment-methods',
		element: (
			<ProtectedRoute>
				<LayoutWrapper title="Formas de Pagamento">
					<PaymentMethodsPage />
				</LayoutWrapper>
			</ProtectedRoute>
		),
	},
	{
		path: '/inventory',
		element: (
			<ProtectedRoute>
				<LayoutWrapper title="Estoque">
					<InventoryPage />
				</LayoutWrapper>
			</ProtectedRoute>
		),
	},
	{
		path: '/settings',
		element: (
			<ProtectedRoute>
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
			</ProtectedRoute>
		),
	},
	{
		path: '*',
		element: (
			<ProtectedRoute>
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
			</ProtectedRoute>
		),
	},
]);
