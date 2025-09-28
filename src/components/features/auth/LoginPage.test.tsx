import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../../context/AuthContext';
import LoginPage from './LoginPage';

// Mock the auth service
vi.mock('../../../data/mockAuthService', () => ({
	mockAuthService: {
		login: vi.fn(),
		logout: vi.fn(),
		getStoredUser: vi.fn().mockReturnValue(null),
		isAuthenticated: vi.fn().mockReturnValue(false),
	},
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Test wrapper component
const TestWrapper = ({
	children,
	initialEntries = ['/login'],
}: {
	children: React.ReactNode;
	initialEntries?: string[];
}) => (
	<MemoryRouter initialEntries={initialEntries}>
		<AuthProvider>{children}</AuthProvider>
	</MemoryRouter>
);

describe('LoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render login form with all elements', async () => {
		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>,
		);

		// Wait for initialization to complete
		await waitFor(() => {
			expect(screen.getByText('Flow CRM')).toBeInTheDocument();
		});

		expect(screen.getByText('Sistema de Gestão de Vendas')).toBeInTheDocument();
		expect(screen.getByText('Fazer Login')).toBeInTheDocument();

		// Demo credentials section
		expect(
			screen.getByText('Credenciais de demonstração:'),
		).toBeInTheDocument();
		expect(screen.getByText('admin@flowcrm.com')).toBeInTheDocument();
		expect(screen.getByText('admin123')).toBeInTheDocument();

		// Form fields
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Senha')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
	});

	it('should show validation errors for empty fields', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>,
		);

		await waitFor(() => {
			expect(screen.getByText('Flow CRM')).toBeInTheDocument();
		});

		const submitButton = screen.getByRole('button', { name: /entrar/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
			expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
		});
	});

	it('should show validation error for invalid email format', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>,
		);

		await waitFor(() => {
			expect(screen.getByText('Flow CRM')).toBeInTheDocument();
		});

		const emailInput = screen.getByLabelText('Email');
		const submitButton = screen.getByRole('button', { name: /entrar/i });

		await user.type(emailInput, 'invalid-email');
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText('Email inválido')).toBeInTheDocument();
		});
	});

	it('should show validation error for short password', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>,
		);

		await waitFor(() => {
			expect(screen.getByText('Flow CRM')).toBeInTheDocument();
		});

		const emailInput = screen.getByLabelText('Email');
		const passwordInput = screen.getByLabelText('Senha');
		const submitButton = screen.getByRole('button', { name: /entrar/i });

		await user.type(emailInput, 'test@example.com');
		await user.type(passwordInput, '12');
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText('Senha deve ter pelo menos 3 caracteres'),
			).toBeInTheDocument();
		});
	});

	it('should clear field errors when user starts typing', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>,
		);

		await waitFor(() => {
			expect(screen.getByText('Flow CRM')).toBeInTheDocument();
		});

		const emailInput = screen.getByLabelText('Email');
		const submitButton = screen.getByRole('button', { name: /entrar/i });

		// Trigger validation error
		await user.click(submitButton);
		await waitFor(() => {
			expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
		});

		// Start typing - error should clear
		await user.type(emailInput, 'a');
		await waitFor(() => {
			expect(screen.queryByText('Email é obrigatório')).not.toBeInTheDocument();
		});
	});

	it('should handle successful login', async () => {
		const user = userEvent.setup();
		const { mockAuthService } = await import('../../../data/mockAuthService');

		// Mock successful login
		vi.mocked(mockAuthService.login).mockResolvedValue({
			id: '1',
			name: 'Administrador',
			email: 'admin@flowcrm.com',
			role: 'admin',
			lastLoginAt: new Date(),
		});

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>,
		);

		await waitFor(() => {
			expect(screen.getByText('Flow CRM')).toBeInTheDocument();
		});

		const emailInput = screen.getByLabelText('Email');
		const passwordInput = screen.getByLabelText('Senha');
		const submitButton = screen.getByRole('button', { name: /entrar/i });

		await user.type(emailInput, 'admin@flowcrm.com');
		await user.type(passwordInput, 'admin123');
		await user.click(submitButton);

		// Should show loading state
		await waitFor(() => {
			expect(screen.getByText('Entrando...')).toBeInTheDocument();
		});

		// Should call login with correct credentials
		expect(mockAuthService.login).toHaveBeenCalledWith({
			email: 'admin@flowcrm.com',
			password: 'admin123',
		});
	});

	it('should handle login error', async () => {
		const user = userEvent.setup();
		const { mockAuthService } = await import('../../../data/mockAuthService');

		// Mock login failure
		vi.mocked(mockAuthService.login).mockRejectedValue({
			message: 'Email ou senha inválidos',
			code: 'INVALID_CREDENTIALS',
		});

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>,
		);

		await waitFor(() => {
			expect(screen.getByText('Flow CRM')).toBeInTheDocument();
		});

		const emailInput = screen.getByLabelText('Email');
		const passwordInput = screen.getByLabelText('Senha');
		const submitButton = screen.getByRole('button', { name: /entrar/i });

		await user.type(emailInput, 'wrong@email.com');
		await user.type(passwordInput, 'wrongpassword');
		await user.click(submitButton);

		// Should show error message
		await waitFor(() => {
			expect(screen.getByText('Erro no login')).toBeInTheDocument();
			expect(screen.getByText('Email ou senha inválidos')).toBeInTheDocument();
		});
	});

	it('should handle Enter key press for form submission', async () => {
		const user = userEvent.setup();
		const { mockAuthService } = await import('../../../data/mockAuthService');

		vi.mocked(mockAuthService.login).mockResolvedValue({
			id: '1',
			name: 'Administrador',
			email: 'admin@flowcrm.com',
			role: 'admin',
			lastLoginAt: new Date(),
		});

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>,
		);

		await waitFor(() => {
			expect(screen.getByText('Flow CRM')).toBeInTheDocument();
		});

		const emailInput = screen.getByLabelText('Email');
		const passwordInput = screen.getByLabelText('Senha');

		await user.type(emailInput, 'admin@flowcrm.com');
		await user.type(passwordInput, 'admin123');

		// Press Enter key
		fireEvent.keyPress(passwordInput, {
			key: 'Enter',
			code: 'Enter',
			charCode: 13,
		});

		await waitFor(() => {
			expect(mockAuthService.login).toHaveBeenCalledWith({
				email: 'admin@flowcrm.com',
				password: 'admin123',
			});
		});
	});

	it('should disable form inputs during loading', async () => {
		const user = userEvent.setup();
		const { mockAuthService } = await import('../../../data/mockAuthService');

		// Mock login with delay
		vi.mocked(mockAuthService.login).mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(
						() =>
							resolve({
								id: '1',
								name: 'Administrador',
								email: 'admin@flowcrm.com',
								role: 'admin',
								lastLoginAt: new Date(),
							}),
						1000,
					),
				),
		);

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>,
		);

		await waitFor(() => {
			expect(screen.getByText('Flow CRM')).toBeInTheDocument();
		});

		const emailInput = screen.getByLabelText('Email');
		const passwordInput = screen.getByLabelText('Senha');
		const submitButton = screen.getByRole('button', { name: /entrar/i });

		await user.type(emailInput, 'admin@flowcrm.com');
		await user.type(passwordInput, 'admin123');
		await user.click(submitButton);

		// Should show loading state and disable inputs
		await waitFor(() => {
			expect(screen.getByText('Entrando...')).toBeInTheDocument();
			expect(emailInput).toBeDisabled();
			expect(passwordInput).toBeDisabled();
			expect(submitButton).toBeDisabled();
		});
	});
});
