import type React from 'react';
import { useState } from 'react';
import toastService, { TOAST_MESSAGES } from '../../../services/ToastService';
import { formatCPF, validateCPF } from '../../../utils';
import Button from '../../common/Button';
import Input from '../../common/Input';

type TabType = 'list' | 'register';
// All fields are now consolidated into a single form - no subtabs needed

// Mock customer data interface for the component
interface MockCustomer {
	id: string;
	name: string;
	email: string;
	phone: string;
	cpf: string;
	city: string;
	state: string;
}

// Functions for customer operations
const handleEditCustomer = (customer: MockCustomer) => {
	toastService.info(`Editando cliente: ${customer.name}`);
	// TODO: Implement edit functionality
};

const handleDeleteCustomer = (customer: MockCustomer) => {
	if (confirm(TOAST_MESSAGES.customer.deleteConfirm)) {
		toastService.success(`Cliente ${customer.name} excluído com sucesso!`);
		// TODO: Implement delete functionality
	}
};

const SimplifiedCustomers: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabType>('list');
	const [customers] = useState<MockCustomer[]>([
		{
			id: '1',
			name: 'João Silva',
			email: 'joao@email.com',
			phone: '(11) 99999-9999',
			cpf: '123.456.789-01',
			city: 'São Paulo',
			state: 'SP',
		},
		{
			id: '2',
			name: 'Maria Santos',
			email: 'maria@email.com',
			phone: '(11) 88888-8888',
			cpf: '987.654.321-00',
			city: 'Rio de Janeiro',
			state: 'RJ',
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
								className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex justify-between items-start mb-2">
									<div>
										<h3 className="font-semibold text-gray-900">
											{customer.name}
										</h3>
										<p className="text-sm text-gray-600">{customer.email}</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium text-gray-700">
											{customer.phone}
										</p>
										<p className="text-sm text-gray-500">{customer.cpf}</p>
									</div>
								</div>

								<div className="flex justify-between items-center">
									<div className="flex items-center space-x-2">
										<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
											{customer.city} - {customer.state}
										</span>
									</div>
									<div className="flex space-x-2">
										<button
											className="text-blue-600 hover:text-blue-800 text-sm"
											onClick={() => handleEditCustomer(customer)}
										>
											Editar
										</button>
										<button
											className="text-red-600 hover:text-red-800 text-sm"
											onClick={() => handleDeleteCustomer(customer)}
										>
											Excluir
										</button>
									</div>
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
			<h1 className="text-2xl font-bold text-gray-900 mb-6">Clientes</h1>

			{/* Tabs */}
			<div className="mb-6">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8" aria-label="Tabs">
						<button
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

			{/* Tab Content */}
			<div className="mt-6">{renderTabContent()}</div>
		</div>
	);
};

export default SimplifiedCustomers;
