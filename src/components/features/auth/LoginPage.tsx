import { AlertCircle, Lock, Mail, ShoppingCart } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button';
import Input from '../../common/Input';

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

	// Form state
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	// Local validation errors
	const [validationErrors, setValidationErrors] = useState({
		email: '',
		password: '',
	});

	// Get the intended destination from location state, default to dashboard
	const from =
		(location.state as { from?: { pathname: string } })?.from?.pathname ||
		'/dashboard';

	// Redirect if already authenticated
	if (isAuthenticated) {
		return <Navigate to={from} replace />;
	}

	// Clear errors when component mounts or form data changes
	useEffect(() => {
		if (error) {
			clearError();
		}
	}, [formData, clearError]);

	// Handle input changes
	const handleInputChange =
		(field: keyof typeof formData) => (value: string) => {
			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));

			// Clear field-specific validation error
			if (validationErrors[field]) {
				setValidationErrors((prev) => ({
					...prev,
					[field]: '',
				}));
			}
		};

	// Form validation
	const validateForm = (): boolean => {
		const errors = {
			email: '',
			password: '',
		};

		if (!formData.email) {
			errors.email = 'Email é obrigatório';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			errors.email = 'Email inválido';
		}

		if (!formData.password) {
			errors.password = 'Senha é obrigatória';
		} else if (formData.password.length < 3) {
			errors.password = 'Senha deve ter pelo menos 3 caracteres';
		}

		setValidationErrors(errors);
		return !errors.email && !errors.password;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			await login(formData);
			navigate(from, { replace: true });
		} catch (loginError) {
			// Error is handled by the context and displayed via the error state
			console.error('Login failed:', loginError);
		}
	};

	// Handle key press for accessibility
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSubmit(e as unknown as React.FormEvent);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo and Header */}
				<div className="text-center mb-8">
					<div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
						<ShoppingCart className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Flow CRM</h1>
					<p className="text-gray-600">Sistema de Gestão de Vendas</p>
				</div>

				{/* Login Form Card */}
				<div className="bg-white rounded-xl shadow-lg p-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
						Fazer Login
					</h2>

					{/* Global Error Display */}
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
							<AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
							<div>
								<p className="text-red-800 font-medium">Erro no login</p>
								<p className="text-red-700 text-sm mt-1">{error.message}</p>
							</div>
						</div>
					)}

					{/* Demo Credentials Info */}
					<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-blue-800 font-medium text-sm mb-2">
							Credenciais de demonstração:
						</p>
						<div className="text-blue-700 text-sm space-y-1">
							<p>
								<strong>Email:</strong> admin@flowcrm.com
							</p>
							<p>
								<strong>Senha:</strong> admin123
							</p>
						</div>
					</div>

					{/* Login Form */}
					<form
						onSubmit={handleSubmit}
						className="space-y-6"
						onKeyPress={handleKeyPress}
					>
						{/* Email Field */}
						<div>
							<Input
								type="email"
								label="Email"
								placeholder="Digite seu email"
								value={formData.email}
								onChange={handleInputChange('email')}
								error={validationErrors.email}
								required
								disabled={isLoading}
								autoComplete="username"
								autoFocus
							/>
						</div>

						{/* Password Field */}
						<div>
							<Input
								type="password"
								label="Senha"
								placeholder="Digite sua senha"
								value={formData.password}
								onChange={handleInputChange('password')}
								error={validationErrors.password}
								required
								disabled={isLoading}
								autoComplete="current-password"
							/>
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							variant="primary"
							size="lg"
							className="w-full"
							loading={isLoading}
							disabled={isLoading}
						>
							{isLoading ? 'Entrando...' : 'Entrar'}
						</Button>
					</form>

					{/* Footer */}
					<div className="mt-8 text-center">
						<p className="text-sm text-gray-600">
							Desenvolvido com ❤️ para gestão de vendas
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
