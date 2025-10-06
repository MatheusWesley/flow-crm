import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

	it('should render children when authenticated', async () => {
		const mockUser = {
			id: '1',
			name: 'Test User',
			email: 'test@example.com',
			role: 'admin',
		};

		// Mock authenticated state
		vi.doMock('../context/AuthContext', () => ({
			useAuth: () => ({
				user: mockUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				login: vi.fn(),
				logout: vi.fn(),
				clearError: vi.fn(),
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
});
