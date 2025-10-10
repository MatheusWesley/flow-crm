import { SquarePen, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { mockPaymentMethodService } from '../../../data/mockPaymentMethodService';
import type { PaymentMethod } from '../../../types';
import { AutoCodeService } from '../../../utils';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Switch from '../../common/Switch';

type TabType = 'list' | 'register';

const PaymentMethodsPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabType>('list');
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Load payment methods on component mount
	useEffect(() => {
		const loadPaymentMethods = async () => {
			setIsLoading(true);
			try {
				const data = await mockPaymentMethodService.getAll();
				setPaymentMethods(data);

				// Initialize auto code service with existing codes
				const existingCodes = data.map((pm) => pm.code);
				AutoCodeService.initializeFromExisting('paymentMethod', existingCodes);
			} catch (error) {
				console.error('Error loading payment methods:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPaymentMethods();
	}, []);

	const [formData, setFormData] = useState({
		code: '',
		description: '',
		isActive: true,
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.description.trim()) {
			alert('Por favor, preencha a descrição da forma de pagamento.');
			return;
		}

		setIsLoading(true);
		try {
			const newPaymentMethod = await mockPaymentMethodService.create({
				code: formData.code,
				description: formData.description.trim(),
				isActive: formData.isActive,
			});

			// Update local state
			setPaymentMethods((prev) => [...prev, newPaymentMethod]);

			// Reset form after submit
			setFormData({
				code: '',
				description: '',
				isActive: true,
			});

			// Switch to list tab to show the newly created item
			setActiveTab('list');

			console.log('Forma de pagamento criada:', newPaymentMethod);
		} catch (error) {
			console.error('Erro ao criar forma de pagamento:', error);
			alert('Erro ao criar forma de pagamento. Tente novamente.');
		} finally {
			setIsLoading(false);
		}
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
								className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col h-full"
							>
								<div className="flex justify-between items-start mb-2">
									<div className="flex-grow pr-2">
										<h3 className="font-semibold text-gray-900 line-clamp-1">
											{paymentMethod.description}
										</h3>
										<p className="text-xs text-gray-600">
											Código Interno: {paymentMethod.code}
										</p>
									</div>
									<div className="text-right flex-shrink-0">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												paymentMethod.isActive
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'
											}`}
										>
											{paymentMethod.isActive ? 'Ativo' : 'Inativo'}
										</span>
									</div>
								</div>
								<div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
									<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
										Disponível
									</span>
									<div className="flex space-x-2">
										<button
											type="button"
											className="text-blue-600 hover:text-blue-800 text-sm"
										>
											<SquarePen size={16} />
										</button>
										<button
											type="button"
											className="text-red-600 hover:text-red-800 text-sm"
										>
											<Trash2 size={16} />
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

						<div className="pt-4 border-t border-gray-200">
							<Switch
								checked={formData.isActive}
								onChange={(checked) =>
									setFormData((prev) => ({ ...prev, isActive: checked }))
								}
								label="Forma de pagamento ativa"
								description="Quando ativa, esta forma de pagamento estará disponível para uso nas vendas"
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
								isActive: true,
							});
						}}
					>
						Limpar
					</Button>
					<Button type="submit" variant="primary" disabled={isLoading}>
						{isLoading ? 'Salvando...' : 'Cadastrar Forma de Pagamento'}
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
