import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../types';

// Mock the auth service
const mockAuthService = {
	login: vi.fn(),
	logout: vi.fn(),
	getStoredUser: vi.fn(),
	isAuthenticated: vi.fn(),
};

vi.mock('../data/mockAuthService', () => ({
	mockAuthService,
}));

describe('ProtectedRoute', () => {
	const mockAdminUser: AuthUser = {
		id: '1',
		name: 'Admin User',
		email: 'admin@example.com',
		password: 'hashedpassword',
		userType: 'admin',
		permissions: {
			modules: {
				products: true,
				customers: true,
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
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const mockEmployeeUser: AuthUser = {
		id: '2',
		name: 'Employee User',
		email: 'employee@example.com',
		password: 'hashedpassword',
		userType: 'employee',
		permissions: {
			modules: {
				products: true,
				customers: true,
				reports: false,
				paymentMethods: false,
				userManagement: false,
			},
			presales: {
				canCreate: true,
				canViewOwn: true,
				canViewAll: false,
			},
		},
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it('should show loading spinner when authentication is loading', async () => {
		// Mock loading state
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: null,
				isAuthenticated: false,
				isLoading: true,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: vi.fn(),
				permissions: {},
				isAdmin: false,
				isEmployee: false,
			}),
		}));

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		render(
			<MemoryRouter initialEntries={['/dashboard']}>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
		expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
	});

	it('should redirect to login when not authenticated', async () => {
		// Mock unauthenticated state
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: vi.fn(),
				permissions: {},
				isAdmin: false,
				isEmployee: false,
			}),
		}));

		vi.doMock('react-router-dom', async () => {
			const actual = await vi.importActual('react-router-dom');
			return {
				...actual,
				Navigate: ({ to, state }: { to: string; state?: any }) => (
					<div data-testid="navigate-to-login">
						Redirecting to {to} with state: {JSON.stringify(state)}
					</div>
				),
				useLocation: () => ({
					pathname: '/dashboard',
					search: '',
					hash: '',
					state: null,
					key: 'default',
				}),
			};
		});

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		render(
			<MemoryRouter initialEntries={['/dashboard']}>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		const redirectElement = screen.getByTestId('navigate-to-login');
		expect(redirectElement).toBeInTheDocument();
		expect(redirectElement).toHaveTextContent('Redirecting to /login');
		expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
	});

	it('should render children when authenticated without permission requirements', async () => {
		// Mock authenticated state
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: mockAdminUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: vi.fn(() => true),
				permissions: mockAdminUser.permissions,
				isAdmin: true,
				isEmployee: false,
			}),
		}));

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		render(
			<MemoryRouter initialEntries={['/dashboard']}>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		expect(screen.getByText('Protected Content')).toBeInTheDocument();
		expect(
			screen.queryByText('Verificando autenticação...'),
		).not.toBeInTheDocument();
	});

	it('should render children when user has required permission', async () => {
		const mockHasPermission = vi.fn((permission: string) => {
			return permission === 'modules.products';
		});

		// Mock authenticated state with permission
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: mockEmployeeUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: mockHasPermission,
				permissions: mockEmployeeUser.permissions,
				isAdmin: false,
				isEmployee: true,
			}),
		}));

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		render(
			<MemoryRouter initialEntries={['/products']}>
				<ProtectedRoute requiredPermission="modules.products">
					<div>Products Page</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		expect(screen.getByText('Products Page')).toBeInTheDocument();
		expect(mockHasPermission).toHaveBeenCalledWith('modules.products');
	});

	it('should show access denied when user lacks required permission', async () => {
		const mockHasPermission = vi.fn((permission: string) => {
			return permission !== 'modules.userManagement';
		});

		// Mock authenticated state without required permission
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: mockEmployeeUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: mockHasPermission,
				permissions: mockEmployeeUser.permissions,
				isAdmin: false,
				isEmployee: true,
			}),
		}));

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		render(
			<MemoryRouter initialEntries={['/users']}>
				<ProtectedRoute requiredPermission="modules.userManagement">
					<div>User Management Page</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
		expect(screen.queryByText('User Management Page')).not.toBeInTheDocument();
		expect(mockHasPermission).toHaveBeenCalledWith('modules.userManagement');
	});

	it('should render children when user has required user type', async () => {
		// Mock authenticated admin state
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: mockAdminUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: vi.fn(() => true),
				permissions: mockAdminUser.permissions,
				isAdmin: true,
				isEmployee: false,
			}),
		}));

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		render(
			<MemoryRouter initialEntries={['/admin']}>
				<ProtectedRoute requiredUserType="admin">
					<div>Admin Only Content</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
	});

	it('should show access denied when user lacks required user type', async () => {
		// Mock authenticated employee state
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: mockEmployeeUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: vi.fn(() => true),
				permissions: mockEmployeeUser.permissions,
				isAdmin: false,
				isEmployee: true,
			}),
		}));

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		render(
			<MemoryRouter initialEntries={['/admin']}>
				<ProtectedRoute requiredUserType="admin">
					<div>Admin Only Content</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
		expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
	});

	it('should use custom fallback when provided', async () => {
		const mockHasPermission = vi.fn(() => false);

		// Mock authenticated state without permission
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: mockEmployeeUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: mockHasPermission,
				permissions: mockEmployeeUser.permissions,
				isAdmin: false,
				isEmployee: true,
			}),
		}));

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		const CustomFallback = () => <div>Custom Access Denied Message</div>;

		render(
			<MemoryRouter initialEntries={['/restricted']}>
				<ProtectedRoute
					requiredPermission="modules.restricted"
					fallback={<CustomFallback />}
				>
					<div>Restricted Content</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		expect(
			screen.getByText('Custom Access Denied Message'),
		).toBeInTheDocument();
		expect(screen.queryByText('Acesso Negado')).not.toBeInTheDocument();
		expect(screen.queryByText('Restricted Content')).not.toBeInTheDocument();
	});

	it('should preserve location state when redirecting to login', async () => {
		// Mock unauthenticated state with location
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: vi.fn(),
				permissions: {},
				isAdmin: false,
				isEmployee: false,
			}),
		}));

		const mockLocation = {
			pathname: '/dashboard',
			search: '?tab=analytics',
			hash: '#section1',
			state: null,
			key: 'test',
		};

		vi.doMock('react-router-dom', async () => {
			const actual = await vi.importActual('react-router-dom');
			return {
				...actual,
				Navigate: ({ to, state }: { to: string; state?: any }) => (
					<div data-testid="navigate-with-state">
						{JSON.stringify({ to, state })}
					</div>
				),
				useLocation: () => mockLocation,
			};
		});

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		render(
			<MemoryRouter initialEntries={['/dashboard?tab=analytics#section1']}>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		const navigateElement = screen.getByTestId('navigate-with-state');
		expect(navigateElement).toBeInTheDocument();

		const { to, state } = JSON.parse(navigateElement.textContent || '{}');
		expect(to).toBe('/login');
		expect(state.from).toEqual(mockLocation);
	});

	it('should handle both permission and user type requirements', async () => {
		const mockHasPermission = vi.fn((permission: string) => {
			return permission === 'modules.userManagement';
		});

		// Mock authenticated admin state
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: mockAdminUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
				hasPermission: mockHasPermission,
				permissions: mockAdminUser.permissions,
				isAdmin: true,
				isEmployee: false,
			}),
		}));

		const ProtectedRoute = (await import('./ProtectedRoute')).default;

		render(
			<MemoryRouter initialEntries={['/users']}>
				<ProtectedRoute
					requiredUserType="admin"
					requiredPermission="modules.userManagement"
				>
					<div>User Management Page</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		expect(screen.getByText('User Management Page')).toBeInTheDocument();
		expect(mockHasPermission).toHaveBeenCalledWith('modules.userManagement');
	});
});
