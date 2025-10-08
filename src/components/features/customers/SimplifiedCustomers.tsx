import { SquarePen, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import toastService, { TOAST_MESSAGES } from '../../../services/ToastService';
import type { Customer } from '../../../types';
import { formatCPF, validateCPF } from '../../../utils';
import Button from '../../common/Button';
import Input from '../../common/Input';

type TabType = 'list' | 'register';
// All fields are now consolidated into a single form - no subtabs needed

// Functions for customer operations
const handleEditCustomer = (customer: Customer) => {
	toastService.info(`Editando cliente: ${customer.name}`);
	// TODO: Implement edit functionality
};

const handleDeleteCustomer = (customer: Customer) => {
	if (confirm(TOAST_MESSAGES.customer.deleteConfirm)) {
		toastService.success(`Cliente ${customer.name} excluído com sucesso!`);
		// TODO: Implement delete functionality
	}
};

const SimplifiedCustomers: React.FC = () => {
	const { isAdmin, isEmployee, hasPermission, user } = useAuth();
	const [activeTab, setActiveTab] = useState<TabType>('list');
	const [customers] = useState<Customer[]>([
		{
			id: '1',
			name: 'João Silva',
			email: 'joao.silva@email.com',
			phone: '(11) 99999-9999',
			cpf: '123.456.789-01',
			address: 'Rua Teste, 123',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '2',
			name: 'Maria Oliveira',
			email: 'maria.oliveira@email.com',
			phone: '(21) 98888-8888',
			cpf: '234.567.890-12',
			address: 'Avenida Central, 456',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '3',
			name: 'Carlos Souza',
			email: 'carlos.souza@email.com',
			phone: '(31) 97777-7777',
			cpf: '345.678.901-23',
			address: 'Rua das Flores, 789',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '4',
			name: 'Ana Costa',
			email: 'ana.costa@email.com',
			phone: '(41) 96666-6666',
			cpf: '456.789.012-34',
			address: 'Avenida Paulista, 1000',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '5',
			name: 'Pedro Santos',
			email: 'pedro.santos@email.com',
			phone: '(51) 95555-5555',
			cpf: '567.890.123-45',
			address: 'Rua do Sol, 250',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '6',
			name: 'Juliana Lima',
			email: 'juliana.lima@email.com',
			phone: '(61) 94444-4444',
			cpf: '678.901.234-56',
			address: 'Travessa das Árvores, 78',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '7',
			name: 'Ricardo Almeida',
			email: 'ricardo.almeida@email.com',
			phone: '(71) 93333-3333',
			cpf: '789.012.345-67',
			address: 'Praça das Nações, 12',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '8',
			name: 'Fernanda Ribeiro',
			email: 'fernanda.ribeiro@email.com',
			phone: '(81) 92222-2222',
			cpf: '890.123.456-78',
			address: 'Rua Verde, 900',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '9',
			name: 'Lucas Barbosa',
			email: 'lucas.barbosa@email.com',
			phone: '(91) 91111-1111',
			cpf: '901.234.567-89',
			address: 'Rua Azul, 45',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '10',
			name: 'Patrícia Gomes',
			email: 'patricia.gomes@email.com',
			phone: '(85) 90000-0000',
			cpf: '012.345.678-90',
			address: 'Avenida Nova, 300',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	const [formData, setFormData] = useState({
		name: '',
		cpf: '',
		email: '',
		phone: '',
		address: '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleInputChange = (field: string) => (value: string) => {
		let processedValue = value;

		// Format CPF as user types
		if (field === 'cpf') {
			processedValue = formatCPF(value);
		}

		// Format phone as user types
		if (field === 'phone') {
			processedValue = value
				.replace(/\D/g, '')
				.replace(/(\d{2})(\d)/, '($1) $2')
				.replace(/(\d{5})(\d)/, '$1-$2')
				.replace(/(-\d{4})\d+?$/, '$1');
		}

		setFormData((prev) => ({ ...prev, [field]: processedValue }));

		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Nome é obrigatório';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email é obrigatório';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Email inválido';
		}

		if (!formData.cpf.trim()) {
			newErrors.cpf = 'CPF é obrigatório';
		} else if (!validateCPF(formData.cpf)) {
			newErrors.cpf = 'CPF inválido';
		}

		if (!formData.phone.trim()) {
			newErrors.phone = 'Telefone é obrigatório';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (validateForm()) {
			console.log('Dados do cliente:', formData);
			// Show success toast
			toastService.success(TOAST_MESSAGES.customer.created);
			// Reset form after submit
			setFormData({
				name: '',
				cpf: '',
				email: '',
				phone: '',
				address: '',
			});
			setErrors({});
		}
	};

	const renderTabContent = () => {
		if (activeTab === 'list') {
			return (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-800">
							Clientes Cadastrados
						</h2>
						<span className="text-sm text-gray-500">
							{customers.length} clientes
						</span>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{customers.map((customer) => (
							<div
								key={customer.id}
								className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col h-full"
							>
								<div className="flex justify-between items-start mb-2">
									<div className="flex-grow pr-2">
										<h3 className="font-semibold text-gray-900 line-clamp-1">
											{customer.name}
										</h3>
										<p className="text-xs text-gray-600">CPF: {customer.cpf}</p>
									</div>
									<div className="text-right flex-shrink-0">
										<p className="text-sm font-medium text-gray-700 whitespace-nowrap">
											{customer.phone}
										</p>
									</div>
								</div>
								<div className="text-gray-700 text-sm mb-3">
									<p className="line-clamp-1">{customer.email}</p>
									<p className="text-xs text-gray-500 mt-1">
										{customer.address}
									</p>
								</div>
								<div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
									<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
										Ativo
									</span>
									{(isAdmin || hasPermission('modules.customers')) && (
										<div className="flex space-x-2">
											<button
												type="button"
												className="text-blue-600 hover:text-blue-800 text-sm"
												onClick={() => handleEditCustomer(customer)}
												title="Editar cliente"
											>
												<SquarePen size={16} />
											</button>
											<button
												type="button"
												className="text-red-600 hover:text-red-800 text-sm"
												onClick={() => handleDeleteCustomer(customer)}
												title="Excluir cliente"
											>
												<Trash2 size={16} />
											</button>
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					{customers.length === 0 && (
						<div className="text-center py-8">
							<p className="text-gray-500">Nenhum cliente cadastrado ainda.</p>
						</div>
					)}
				</div>
			);
		}

		// Register tab: consolidated form with all fields
		return (
			<form onSubmit={handleSubmit} className="space-y-8">
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h3 className="text-lg font-medium text-gray-900 mb-6">
						Informações Pessoais
					</h3>
					<div className="space-y-6">
						{/* First row: Name and CPF */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label="Nome Completo*"
								value={formData.name}
								onChange={handleInputChange('name')}
								placeholder="Digite o nome completo"
								error={errors.name}
								required
							/>

							<Input
								label="CPF/CNPJ*"
								value={formData.cpf}
								onChange={handleInputChange('cpf')}
								placeholder="000.000.000-00"
								error={errors.cpf}
								maxLength={14}
								required
							/>
						</div>

						{/* Second row: Email and Phone */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label="E-mail*"
								type="email"
								value={formData.email}
								onChange={handleInputChange('email')}
								placeholder="exemplo@email.com"
								error={errors.email}
								required
							/>

							<Input
								label="Telefone*"
								value={formData.phone}
								onChange={handleInputChange('phone')}
								placeholder="(11) 99999-9999"
								error={errors.phone}
								maxLength={15}
								required
							/>
						</div>

						{/* Third row: Address */}
						<div>
							<Input
								label="Endereço"
								value={formData.address}
								onChange={handleInputChange('address')}
								placeholder="Rua, número, bairro, cidade - UF"
							/>
						</div>
					</div>
				</div>

				{/* Botões de Ação */}
				<div className="flex justify-end space-x-3">
					<Button
						type="button"
						variant="secondary"
						onClick={() => {
							setFormData({
								name: '',
								cpf: '',
								email: '',
								phone: '',
								address: '',
							});
							setErrors({});
						}}
					>
						Limpar
					</Button>
					<Button type="submit" variant="primary">
						Cadastrar Cliente
					</Button>
				</div>
			</form>
		);
	};

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
				<p className="text-gray-600 mt-1">
					{isAdmin
						? 'Gerencie todos os clientes do sistema'
						: hasPermission('modules.customers')
							? `Cadastre e edite clientes - ${user?.name}`
							: 'Acesso limitado aos clientes'}
				</p>
				{isEmployee && !hasPermission('modules.customers') && (
					<p className="text-sm text-red-600 mt-1">
						Você não tem permissão para acessar o módulo de clientes
					</p>
				)}
			</div>

			{/* Tabs */}
			{isAdmin || hasPermission('modules.customers') ? (
				<div className="mb-6">
					<div className="border-b border-gray-200">
						<nav className="-mb-px flex space-x-8" aria-label="Tabs">
							<button
								type="button"
								onClick={() => setActiveTab('list')}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
									activeTab === 'list'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Listagem
							</button>
							<button
								type="button"
								onClick={() => setActiveTab('register')}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
									activeTab === 'register'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Cadastro
							</button>
						</nav>
					</div>
				</div>
			) : (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-700 text-center">
						Você não tem permissão para acessar o módulo de clientes.
					</p>
					<p className="text-red-600 text-sm text-center mt-1">
						Entre em contato com o administrador para solicitar acesso.
					</p>
				</div>
			)}

			{/* Tab Content */}
			{(isAdmin || hasPermission('modules.customers')) && (
				<div className="mt-6">{renderTabContent()}</div>
			)}
		</div>
	);
};

export default SimplifiedCustomers;
