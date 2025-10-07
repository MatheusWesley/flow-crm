import { SquarePen, Trash2 } from 'lucide-react';
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
			code: 'PROD0000001',
			name: 'Pilhas Alcalinas AA de Longa Duração (Pacote Econômico com 4 Unidades)',
			description:
				'Pacote com 4 unidades de pilhas alcalinas AA - Compra de emergência para controles, relógios e pequenos brinquedos. Longa duração garantida para não deixar seus dispositivos na mão nos momentos mais importantes do dia a dia.',
			unit: 'pc',
			stock: 50,
			saleType: 'unit' as const,
			purchasePrice: 12.0,
			salePrice: 18.0,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '2',
			code: 'PROD0000002',
			name: 'Pão de Alho Congelado Tradicional (4un)',
			description: '',
			unit: 'un',
			stock: 35,
			saleType: 'unit' as const,
			purchasePrice: 8.5,
			salePrice: 12.9,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '3',
			code: 'PROD0000003',
			name: 'Saco de Gelo Purificado (33kg)',
			description:
				'Gelo em cubos, saco de 3 kg, ideal para festas, bebidas geladas e resfriamento rápido. Gelo de água potável, pronto para uso imediato em grandes quantidades.',
			unit: 'pc',
			stock: 0,
			saleType: 'unit' as const,
			purchasePrice: 5.0,
			salePrice: 8.0,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '4',
			code: 'PROD0000004',
			name: 'Molho de Tomate Extrato Concentrado (Lata 340g)',
			description:
				'Extrato de tomate lata 340g - Item básico de reposição rápida. Concentrado e essencial para o preparo de massas, molhos e refogados com sabor intenso e cor vibrante.',
			unit: 'un',
			stock: 120,
			saleType: 'unit' as const,
			purchasePrice: 2.5,
			salePrice: 3.99,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '5',
			code: 'PROD0000005',
			name: 'Lâmpada LED Econômica 9W Bivolt',
			description: '',
			unit: 'un',
			stock: 0,
			saleType: 'unit' as const,
			purchasePrice: 10.0,
			salePrice: 14.5,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '6',
			code: 'PROD0000006',
			name: 'Salgadinho Crocante de Queijo Cheddar (Pacote 100g)',
			description:
				'Pacote de salgadinho sabor queijo 100g. Este snack crocante é perfeito para aquele momento de conveniência, seja assistindo a um filme, fazendo uma pausa no trabalho ou complementando a lancheira. Possui um sabor intenso e irresistível de queijo temperado, sendo um dos itens de maior giro no ponto de venda por ser uma compra por impulso. Sua embalagem metalizada garante frescor e crocância por mais tempo, tornando-o a escolha ideal para satisfazer aquela vontade súbita de petiscar.',
			unit: 'un',
			stock: 80,
			saleType: 'unit' as const,
			purchasePrice: 4.0,
			salePrice: 6.5,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '7',
			code: 'PROD0000007',
			name: 'Touca de Banho Descartável de Plástico',
			description:
				'Touca de banho de plástico (unidade) - Ideal para clientes de hotel ou para quem esqueceu a sua. Garante a proteção total dos cabelos durante o banho ou em procedimentos de beleza.',
			unit: 'un',
			stock: 0,
			saleType: 'unit' as const,
			purchasePrice: 1.0,
			salePrice: 2.5,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '8',
			code: 'PROD0000008',
			name: 'Salsicha Congelada Tipo Viena (Pacote 1kg)',
			description: '',
			unit: 'kg',
			stock: 15,
			saleType: 'unit' as const,
			purchasePrice: 11.0,
			salePrice: 17.9,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '9',
			code: 'PROD0000009',
			name: 'Goma de Mascar Menta Refrescante Sem Açúcar (Caixa Display com 10 Unidades)',
			description:
				'Caixa c/ 10 unidades de chiclete sem açúcar - Próximo ao caixa. Sabor refrescante de menta que ajuda a manter o hálito fresco.',
			unit: 'cx',
			stock: 15,
			saleType: 'unit' as const,
			purchasePrice: 8.0,
			salePrice: 13.9,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '10',
			code: 'PROD0000010',
			name: 'Bateria de Lítio CR2032 Pequena',
			description: '',
			unit: 'un',
			stock: 60,
			saleType: 'unit' as const,
			purchasePrice: 3.0,
			salePrice: 5.0,
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
		markup: '',
		salePrice: '',
	});

	const handleInputChange = (field: string) => (value: string) => {
		setFormData((prev) => {
			const updated = { ...prev, [field]: value };

			// Note: Price calculation is now handled in the render function
			// to show real-time suggestions without auto-filling the field

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
			markup: '',
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
								className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col h-full" // Adicionado flex flex-col h-full
							>
								<div className="flex justify-between items-start mb-2">
									<div className="flex-grow pr-2">
										<h3 className="font-semibold text-gray-900 line-clamp-1">
											{product.name}
										</h3>
										<p className="text-xs text-gray-600">
											Código Interno: {product.code}
										</p>
									</div>
									<div className="text-right flex-shrink-0">
										<p className="text-lg font-bold text-green-600 whitespace-nowrap">
											R$ {product.salePrice.toFixed(2)}
										</p>
										<p className="text-sm text-gray-500">{product.unit}</p>
									</div>
								</div>
								<div className="text-gray-700 text-sm mb-3">
									{product.description ? (
										<p className="line-clamp-2">{product.description}</p>
									) : (
										<p className="italic text-gray-400 min-h-[3.5rem]">
											Sem Descrição
										</p>
									)}
								</div>
								<div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
									{product.stock > 0 ? (
										<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
											Estoque:{' '}
											<span className="font-semibold">{product.stock}</span>
										</span>
									) : (
										<span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
											Estoque:{' '}
											<span className="font-semibold">{product.stock}</span>
										</span>
									)}
									<div className="flex space-x-2">
										<button
											type="button"
											className="text-blue-600 hover:text-blue-800 text-sm"
											onClick={() => handleEditProduct(product)}
										>
											<SquarePen size={16} />
										</button>
										<button
											type="button"
											className="text-red-600 hover:text-red-800 text-sm"
											onClick={() => handleDeleteProduct(product)}
										>
											<Trash2 size={16} />
										</button>
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
								maxLength={50}
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
								placeholder="Descrição resumida do produto."
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								rows={2}
								maxLength={150}
							/>

							<div className="flex justify-end mt-1">
								<span
									className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
										formData.description.length >= 140
											? 'bg-red-100 text-red-800'
											: 'bg-green-100 text-green-800'
									}`}
								>
									{formData.description.length} / 150
								</span>
							</div>
						</div>
					</div>
				);
			}

			if (activeSubTab === 'pricesStock') {
				// Calculate suggested price based on purchase price and markup
				const calculateSuggestedPrice = () => {
					const purchasePrice = priceCalculationService.parsePrice(
						formData.purchasePrice || '0',
					);
					const markupPercent = parseFloat(formData.markup || '0');

					if (purchasePrice > 0) {
						if (markupPercent > 0) {
							// Use custom markup
							return purchasePrice * (1 + markupPercent / 100);
						} else {
							// Use default suggestion from service
							return priceCalculationService.calculateSuggestedPrice(
								purchasePrice,
							);
						}
					}
					return 0;
				};

				const suggestedPrice = calculateSuggestedPrice();

				const applySuggestedPrice = () => {
					if (suggestedPrice > 0) {
						setFormData((prev) => ({
							...prev,
							salePrice: suggestedPrice.toFixed(2),
						}));
					}
				};

				return (
					<div className="space-y-6">
						{/* Prices Section */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4">Preços</h3>
							<div className="grid grid-cols-3 md:grid-cols-3 gap-6">
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

								<Input
									label="Markup (%)"
									type="number"
									step="0.01"
									value={formData.markup}
									onChange={handleInputChange('markup')}
									placeholder="Ex: 50 (para 50%)"
									min="0"
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
									{suggestedPrice > 0 && (
										<div className="mt-2">
											<button
												type="button"
												onClick={applySuggestedPrice}
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
											>
												Sugestão: R$ {suggestedPrice.toFixed(2)}
											</button>
										</div>
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
									markup: '',
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
