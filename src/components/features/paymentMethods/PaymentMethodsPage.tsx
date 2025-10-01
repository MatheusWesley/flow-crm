import type React from 'react';
import { useState, useEffect } from 'react';
import type { PaymentMethod } from '../../../types';
import { AutoCodeService } from '../../../utils';
import Button from '../../common/Button';
import Input from '../../common/Input';

type TabType = 'list' | 'register';

const PaymentMethodsPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabType>('list');
	const [paymentMethods] = useState<PaymentMethod[]>([
		{
			id: '1',
			code: 'PAG001',
			description: 'Dinheiro',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '2',
			code: 'PAG002',
			description: 'Cartão de Crédito',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '3',
			code: 'PAG003',
			description: 'PIX',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	// Initialize auto code service with existing payment method codes
	useEffect(() => {
		const existingCodes = paymentMethods.map((pm) => pm.code);
		AutoCodeService.initializeFromExisting('paymentMethod', existingCodes);
	}, [paymentMethods]);

	const [formData, setFormData] = useState({
		code: '',
		description: '',
	});

	const handleInputChange = (field: string) => (value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Generate new payment method code when switching to register tab
	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		if (tab === 'register' && !formData.code) {
			const newCode = AutoCodeService.generateCode('paymentMethod');
			setFormData((prev) => ({ ...prev, code: newCode }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Dados da forma de pagamento:', formData);
		// Here would implement the save logic
		// Reset form after submit
		setFormData({
			code: '',
			description: '',
		});
	};

	const renderTabContent = () => {
		if (activeTab === 'list') {
			return (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-800">
							Formas de Pagamento Cadastradas
						</h2>
						<span className="text-sm text-gray-500">
							{paymentMethods.length} formas de pagamento
						</span>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{paymentMethods.map((paymentMethod) => (
							<div
								key={paymentMethod.id}
								className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex justify-between items-start mb-2">
									<div>
										<h3 className="font-semibold text-gray-900">
											{paymentMethod.description}
										</h3>
										<p className="text-sm text-gray-600">
											Código: {paymentMethod.code}
										</p>
									</div>
								</div>

								<div className="flex justify-end items-center">
									<div className="flex space-x-2">
										<button
											type="button"
											className="text-blue-600 hover:text-blue-800 text-sm"
										>
											Editar
										</button>
										<button
											type="button"
											className="text-red-600 hover:text-red-800 text-sm"
										>
											Excluir
										</button>
									</div>
								</div>
							</div>
						))}
					</div>

					{paymentMethods.length === 0 && (
						<div className="text-center py-8">
							<p className="text-gray-500">
								Nenhuma forma de pagamento cadastrada ainda.
							</p>
						</div>
					)}
				</div>
			);
		}

		// Register tab: form for creating new payment methods
		return (
			<form onSubmit={handleSubmit} className="space-y-8">
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label="Código*"
								value={formData.code}
								onChange={handleInputChange('code')}
								placeholder="Código auto-gerado"
								readOnly
								className="w-2/3"
								required
							/>

							<Input
								label="Descrição*"
								value={formData.description}
								onChange={handleInputChange('description')}
								placeholder="Digite a descrição da forma de pagamento"
								required
							/>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end space-x-3">
					<Button
						type="button"
						variant="secondary"
						onClick={() => {
							setFormData({
								code: '',
								description: '',
							});
						}}
					>
						Limpar
					</Button>
					<Button type="submit" variant="primary">
						Cadastrar Forma de Pagamento
					</Button>
				</div>
			</form>
		);
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-gray-900 mb-6">
				Formas de Pagamento
			</h1>

			{/* Tabs */}
			<div className="mb-6">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8" aria-label="Tabs">
						<button
							type="button"
							onClick={() => handleTabChange('list')}
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
							onClick={() => handleTabChange('register')}
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

export default PaymentMethodsPage;
