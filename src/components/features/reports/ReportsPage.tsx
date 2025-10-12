import React, { useCallback, useEffect, useState } from 'react';
import { usePermissions } from '../../../hooks/usePermissions';
import AccessDenied from '../../common/AccessDenied';
import Breadcrumb from '../../common/Breadcrumb';
import ErrorBoundary from '../../common/ErrorBoundary';
import PaymentMethodsReport from './PaymentMethodsReport';

interface ReportsPageProps {
	className?: string;
}

interface ReportsPageState {
	activeReport: 'payment-methods';
	isLoading: boolean;
	error: string | null;
}

/**
 * ReportsPage - Container component for the reports section
 * Handles navigation, permissions, and error boundaries for all reports
 */
const ReportsPage: React.FC<ReportsPageProps> = React.memo(
	({ className = '' }) => {
		const permissions = usePermissions();
		const [state, setState] = useState<ReportsPageState>({
			activeReport: 'payment-methods',
			isLoading: true,
			error: null,
		});

		// Check if user has permission to access reports
		const canAccessReports = permissions.canAccessReports();

		// Initialize component
		useEffect(() => {
			const initializeReports = async () => {
				try {
					setState((prev) => ({ ...prev, isLoading: true, error: null }));

					// Small delay to show loading state
					await new Promise((resolve) => setTimeout(resolve, 300));

					setState((prev) => ({ ...prev, isLoading: false }));
				} catch (error) {
					console.error('Failed to initialize reports:', error);
					setState((prev) => ({
						...prev,
						isLoading: false,
						error: 'Falha ao carregar a página de relatórios',
					}));
				}
			};

			if (canAccessReports) {
				initializeReports();
			}
		}, [canAccessReports]);

		// Memoized error retry handler
		const handleRetry = useCallback(() => {
			setState((prev) => ({ ...prev, error: null, isLoading: true }));
			// Re-trigger initialization
			setTimeout(() => {
				setState((prev) => ({ ...prev, isLoading: false }));
			}, 300);
		}, []);

		// If user doesn't have permission, show access denied
		if (!canAccessReports) {
			return (
				<AccessDenied
					message="Você não tem permissão para acessar os relatórios."
					showBackButton={true}
					redirectTo="/dashboard"
				/>
			);
		}

		// Loading state
		if (state.isLoading) {
			return (
				<div className={`min-h-screen bg-gray-50 ${className}`}>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="flex items-center justify-center min-h-96">
							<div className="flex flex-col items-center space-y-4">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
								<p className="text-gray-600">Carregando relatórios...</p>
							</div>
						</div>
					</div>
				</div>
			);
		}

		// Error state
		if (state.error) {
			return (
				<div className={`min-h-screen bg-gray-50 ${className}`}>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="flex items-center justify-center min-h-96">
							<div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
								<div className="mb-6">
									<svg
										className="mx-auto h-16 w-16 text-red-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-label="Ícone de erro"
									>
										<title>Ícone de erro</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
										/>
									</svg>
								</div>
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									Erro ao Carregar Relatórios
								</h2>
								<p className="text-gray-600 mb-6">{state.error}</p>
								<button
									type="button"
									onClick={handleRetry}
									className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Tentar Novamente
								</button>
							</div>
						</div>
					</div>
				</div>
			);
		}

		// Main reports page content
		return (
			<ErrorBoundary
				fallback={
					<div className="min-h-screen bg-gray-50 flex items-center justify-center">
						<div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
							<h2 className="text-xl font-bold text-gray-900 mb-4">
								Erro nos Relatórios
							</h2>
							<p className="text-gray-600 mb-6">
								Ocorreu um erro inesperado ao carregar os relatórios.
							</p>
							<button
								type="button"
								onClick={() => window.location.reload()}
								className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Recarregar Página
							</button>
						</div>
					</div>
				}
			>
				<div className={`min-h-screen bg-gray-50 ${className}`}>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
						{/* Breadcrumb Navigation */}
						<div className="mb-4 sm:mb-6">
							<Breadcrumb />
						</div>

						{/* Page Header */}
						<div className="mb-6 sm:mb-8">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
								<div className="flex-1 min-w-0">
									<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
										Relatórios
									</h1>
									<p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
										Visualize e analise dados de vendas e performance
									</p>
								</div>

								{/* Future: Report type selector can go here */}
								<div className="flex items-center space-x-4">
									<div className="text-xs sm:text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border">
										<span className="hidden sm:inline">Relatório: </span>
										<span className="font-medium text-gray-900">
											Formas de Pagamento
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Report Content Area */}
						{state.activeReport === 'payment-methods' && (
							<PaymentMethodsReport />
						)}
					</div>
				</div>
			</ErrorBoundary>
		);
	},
);

export default ReportsPage;
