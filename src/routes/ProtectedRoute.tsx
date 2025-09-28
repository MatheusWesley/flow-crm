import type React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

/**
 * ProtectedRoute component that checks authentication status
 * and redirects to login page if user is not authenticated.
 *
 * When redirecting to login, it preserves the current location
 * so the user can be redirected back after successful authentication.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
					<p className="text-gray-600">Verificando autenticação...</p>
				</div>
			</div>
		);
	}

	// Redirect to login if not authenticated, preserving the intended location
	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Render protected content if authenticated
	return <>{children}</>;
};

export default ProtectedRoute;
