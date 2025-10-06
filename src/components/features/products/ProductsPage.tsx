import type React from 'react';
import { useEffect, useState } from 'react';
import toastService, { TOAST_MESSAGES } from '../../../services/ToastService';
import type { Product } from '../../../types';
import { AutoCodeService } from '../../../utils';
import PriceCalculationService from '../../../utils/priceCalculationService';
import Button from '../../common/Button';
import type { CheckboxOption } from '../../common/CheckboxGroup';
import CheckboxGroup from '../../common/CheckboxGroup';
import Input from '../../common/Input';
import type { SelectOption } from '../../common/Select';
import Select from '../../common/Select';

type TabType = 'list' | 'register';
type SubTabType = 'basic' | 'pricesStock';

const ProductsPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabType>('list');
	const [activeSubTab, setActiveSubTab] = useState<SubTabType>('basic');

	// Initialize price calculation service
	const priceCalculationService = new PriceCalculationService();

	const [products] = useState<Product[]>([
		{
			id: '1',
			code: 'PRD001',
			name: 'Produto Exemplo 1',
			description: 'Descrição do produto exemplo 1',
			unit: 'pc',
			stock: 100,
			category: 'Categoria A',
			saleType: 'unit' as const,
			purchasePrice: 20.0,
			salePrice: 29.99,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '2',
			code: 'PRD002',
			name: 'Produto Exemplo 2',
			description: 'Descrição do produto exemplo 2',
			unit: 'kg',
			stock: 50,
			category: 'Categoria B',
			saleType: 'fractional' as const,
			purchasePrice: 30.0,
			salePrice: 45.5,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	// Initialize auto code service with existing product codes
	useEffect(() => {
		const existingCodes = products.map((p) => p.code);
		AutoCodeService.initializeFromExisting('product', existingCodes);
	}, [products]);

	// Options for dropdowns
	const unitOptions: SelectOption[] = [
		{ value: 'pc', label: 'Peça (PC)' },
		{ value: 'un', label: 'Unidade (UN)' },
		{ value: 'kg', label: 'Quilograma (KG)' },
		{ value: 'g', label: 'Grama (G)' },
		{ value: 'l', label: 'Litro (L)' },
	];

	const saleTypeOptions: CheckboxOption[] = [
		{
			value: 'unit',
			label: 'Venda por Unidade',
			description: 'Produto vendido em unidades inteiras',
		},
		{
			value: 'fractional',
			label: 'Venda Fracionada',
			description: 'Produto vendido em frações (peso, volume, etc.)',
		},
	];

	const [formData, setFormData] = useState({
		code: '',
		name: '',
		description: '',
		unit: 'un',
		stock: '',
		saleType: 'unit' as 'unit' | 'fractional',
		purchasePrice: '',
		salePrice: '',
	});

	const handleInputChange = (field: string) => (value: string) => {
		setFormData((prev) => {
			const updated = { ...prev, [field]: value };

			// Auto-suggest sale price when purchase price changes
			if (field === 'purchasePrice' && value) {
				const purchasePrice = priceCalculationService.parsePrice(value);
				if (purchasePrice > 0) {
					const suggestedPrice =
						priceCalculationService.calculateSuggestedPrice(purchasePrice);
					// Only auto-fill if sale price is empty
					if (!prev.salePrice) {
						updated.salePrice = suggestedPrice.toFixed(2);
					}
				}
			}

			return updated;
		});
	};

	// Generate new product code when switching to register tab
	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		if (tab === 'register' && !formData.code) {
			const newCode = AutoCodeService.generateCode('product');
			setFormData((prev) => ({ ...prev, code: newCode }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Dados do produto:', formData);
		// Show success toast
		toastService.success(TOAST_MESSAGES.product.created);
		// Aqui implementaria a lógica de salvamento
		// Reset form after submit
		setFormData({
			code: '',
			name: '',
			description: '',
			unit: 'pc',
			stock: '',
			saleType: 'unit' as 'unit' | 'fractional',
			purchasePrice: '',
			salePrice: '',
		});
	};

	// Functions for product operations
	const handleEditProduct = (product: Product) => {
		toastService.info(`Editando produto: ${product.name}`);
		// TODO: Implement edit functionality
	};

	const handleDeleteProduct = (product: Product) => {
		if (confirm(TOAST_MESSAGES.product.deleteConfirm)) {
			toastService.success(`Produto ${product.name} excluído com sucesso!`);
			// TODO: Implement delete functionality
		}
	};

	const renderTabContent = () => {
		if (activeTab === 'list') {
			return (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-800">
							Produtos Cadastrados
						</h2>
						<span className="text-sm text-gray-500">
							{products.length} produtos
						</span>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{products.map((product) => (
							<div
								key={product.id}
								className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex justify-between items-start mb-2">
									<div>
										<h3 className="font-semibold text-gray-900">
											{product.name}
										</h3>
										<p className="text-sm text-gray-600">
											Código: {product.code}
										</p>
									</div>
									<div className="text-right">
										<p className="text-lg font-bold text-green-600">
											R$ {product.salePrice.toFixed(2)}
										</p>
										<p className="text-sm text-gray-500">{product.unit}</p>
									</div>
								</div>

								<p className="text-gray-700 text-sm mb-3">
									{product.description}
								</p>

								<div className="flex justify-between items-center">
									<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
										{product.category}
									</span>
									<div className="flex items-center space-x-4">
										<span className="text-sm text-gray-600">
											Estoque:{' '}
											<span className="font-semibold">{product.stock}</span>
										</span>
										<div className="flex space-x-2">
											<button
												type="button"
												className="text-blue-600 hover:text-blue-800 text-sm"
												onClick={() => handleEditProduct(product)}
											>
												Editar
											</button>
											<button
												type="button"
												className="text-red-600 hover:text-red-800 text-sm"
												onClick={() => handleDeleteProduct(product)}
											>
												Excluir
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{products.length === 0 && (
						<div className="text-center py-8">
							<p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
						</div>
					)}
				</div>
			);
		}

		const renderSubTabContent = () => {
			if (activeSubTab === 'basic') {
				return (
					<div className="space-y-6">
						{/* First row: Code and Product Name */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label="Código"
								value={formData.code}
								onChange={handleInputChange('code')}
								placeholder="Código auto-gerado"
								readOnly
								className="w-1/3"
								required
							/>

							<Input
								label="Nome do Produto"
								value={formData.name}
								onChange={handleInputChange('name')}
								placeholder="Digite o nome do produto"
								required
							/>
						</div>

						{/* Second row: Unit and Sale Type */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Select
								label="Unidade de Medida"
								value={formData.unit}
								onChange={handleInputChange('unit')}
								options={unitOptions}
								placeholder="Selecione a unidade"
								size="sm"
								required
							/>

							<CheckboxGroup
								label="Tipo de Venda"
								value={formData.saleType}
								onChange={handleInputChange('saleType')}
								options={saleTypeOptions}
								direction="horizontal"
								required
							/>
						</div>

						{/* Description */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Descrição (Opcional)
							</label>
							<textarea
								value={formData.description}
								onChange={(e) =>
									handleInputChange('description')(e.target.value)
								}
								placeholder="Descrição detalhada do produto"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								rows={4}
							/>
						</div>
					</div>
				);
			}

			if (activeSubTab === 'pricesStock') {
				return (
					<div className="space-y-6">
						{/* Prices Section */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4">Preços</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Input
									label="Preço de Compra"
									type="number"
									step="0.01"
									value={formData.purchasePrice}
									onChange={handleInputChange('purchasePrice')}
									placeholder="0,00"
									min="0"
									required
								/>

								<div className="relative">
									<Input
										label="Preço de Venda"
										type="number"
										step="0.01"
										value={formData.salePrice}
										onChange={handleInputChange('salePrice')}
										placeholder="0,00"
										min="0"
										required
									/>
									{formData.purchasePrice && (
										<p className="text-xs text-gray-500 mt-1">
											Sugestão: R${' '}
											{priceCalculationService
												.calculateSuggestedPrice(
													priceCalculationService.parsePrice(
														formData.purchasePrice,
													),
												)
												.toFixed(2)}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Stock Section */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Estoque
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Input
									label="Estoque Inicial"
									type="number"
									value={formData.stock}
									onChange={handleInputChange('stock')}
									placeholder="0"
									min="0"
									required
								/>
							</div>
						</div>
					</div>
				);
			}

			return null;
		};

		return (
			<div className="w-full">
				{/* Sub Tabs */}
				<div className="mb-6">
					<div className="border-b border-gray-200">
						<nav className="-mb-px flex space-x-8" aria-label="Sub Tabs">
							<button
								type="button"
								onClick={() => setActiveSubTab('basic')}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
									activeSubTab === 'basic'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Informações Básicas
							</button>
							<button
								type="button"
								onClick={() => setActiveSubTab('pricesStock')}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
									activeSubTab === 'pricesStock'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Preços e Estoque
							</button>
						</nav>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* Sub Tab Content */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						{renderSubTabContent()}
					</div>

					{/* Botões de Ação */}
					<div className="flex justify-end space-x-3">
						<Button
							type="button"
							variant="secondary"
							onClick={() => {
								setFormData({
									code: '',
									name: '',
									description: '',
									unit: 'pc',
									stock: '',
									saleType: 'unit' as 'unit' | 'fractional',
									purchasePrice: '',
									salePrice: '',
								});
								setActiveSubTab('basic');
							}}
						>
							Limpar
						</Button>
						<Button type="submit" variant="primary">
							Cadastrar Produto
						</Button>
					</div>
				</form>
			</div>
		);
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-gray-900 mb-6">Produtos</h1>

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

export default ProductsPage;
