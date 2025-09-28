import { Search } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { Product, StockAdjustment } from '../../../types';
import Button from '../../common/Button';
import Input from '../../common/Input';

type TabType = 'adjustment' | 'history';

const InventoryPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabType>('adjustment');
	// Mock products data
	const [products] = useState<Product[]>([
		{
			id: '1',
			code: 'PRD001',
			name: 'Produto Exemplo 1',
			description: 'Descrição do produto exemplo 1',
			stock: 100,
			unit: 'pc',
			saleType: 'unit' as const,
			purchasePrice: 15.0,
			salePrice: 25.0,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '2',
			code: 'PRD002',
			name: 'Produto Exemplo 2',
			description: 'Descrição do produto exemplo 2',
			stock: 50,
			unit: 'kg',
			saleType: 'fractional' as const,
			purchasePrice: 20.0,
			salePrice: 35.0,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	const [adjustments, setAdjustments] = useState<StockAdjustment[]>([
		{
			id: '1',
			productCode: 'PRD001',
			productName: 'Produto Exemplo 1',
			adjustmentType: 'add' as const,
			quantity: 20,
			reason: 'Compra de mercadoria',
			date: '2024-01-15',
			createdAt: new Date('2024-01-15'),
			updatedAt: new Date('2024-01-15'),
		},
	]);

	const [formData, setFormData] = useState({
		productCode: '',
		quantity: '',
		adjustmentType: 'add' as 'add' | 'remove',
		reason: '',
	});

	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showProductSearch, setShowProductSearch] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const handleInputChange = (field: string) => (value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// When product code changes, search for the product
		if (field === 'productCode') {
			const product = products.find(
				(p) => p.code.toLowerCase() === value.toLowerCase(),
			);
			setSelectedProduct(product || null);
		}
	};

	const handleProductSelect = (product: Product) => {
		setFormData((prev) => ({ ...prev, productCode: product.code }));
		setSelectedProduct(product);
		setShowProductSearch(false);
		setSearchTerm('');
	};

	const filteredProducts = products.filter(
		(product) =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.code.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedProduct) {
			alert('Produto não encontrado!');
			return;
		}

		if (!formData.quantity || !formData.reason) {
			alert('Preencha todos os campos obrigatórios!');
			return;
		}

		const newAdjustment: StockAdjustment = {
			id: Date.now().toString(),
			productCode: selectedProduct.code,
			productName: selectedProduct.name,
			adjustmentType: formData.adjustmentType,
			quantity: Number(formData.quantity),
			reason: formData.reason,
			date: new Date().toISOString().split('T')[0],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setAdjustments((prev) => [newAdjustment, ...prev]);

		// Reset form
		setFormData({
			productCode: '',
			quantity: '',
			adjustmentType: 'add',
			reason: '',
		});
		setSelectedProduct(null);
	};

	const renderTabContent = () => {
		if (activeTab === 'adjustment') {
			return (
				<div className="w-full">
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Buscar Produto */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-6">
								Buscar Produto
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Código do Produto */}
								<div className="relative">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Código do Produto*
									</label>
									<div className="flex space-x-2">
										<Input
											value={formData.productCode}
											onChange={handleInputChange('productCode')}
											placeholder="Digite o código do produto"
											required
										/>
										<Button
											type="button"
											variant="secondary"
											onClick={() => setShowProductSearch(true)}
										>
											<Search size={16} />
										</Button>
									</div>
								</div>
							</div>

							{/* Descrição do Produto */}
							<div className="mt-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Descrição do Produto
								</label>
								<div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
									{selectedProduct ? (
										<div>
											<p className="font-medium">{selectedProduct.name}</p>
											<p className="text-sm text-gray-600 mt-1">
												{selectedProduct.description}
											</p>
											<p className="text-sm text-blue-600 mt-2">
												Estoque atual: {selectedProduct.stock}{' '}
												{selectedProduct.unit}
											</p>
										</div>
									) : (
										<p className="text-gray-500 italic">
											Digite o código do produto para ver as informações
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Detalhes do Ajuste */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-6">
								Detalhes do Ajuste
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Input
									label="Quantidade*"
									type="number"
									value={formData.quantity}
									onChange={handleInputChange('quantity')}
									placeholder="0"
									min="1"
									required
								/>

								{/* Tipo de Ajuste */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-3">
										Tipo de Ajuste*
									</label>
									<div className="flex gap-4">
										<button
											type="button"
											onClick={() => handleInputChange('adjustmentType')('add')}
											className={`px-6 py-3 rounded-lg font-medium transition-colors ${
												formData.adjustmentType === 'add'
													? 'bg-green-600 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											Adicionar ao Estoque
										</button>
										<button
											type="button"
											onClick={() =>
												handleInputChange('adjustmentType')('remove')
											}
											className={`px-6 py-3 rounded-lg font-medium transition-colors ${
												formData.adjustmentType === 'remove'
													? 'bg-red-600 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											Remover do Estoque
										</button>
									</div>
								</div>
							</div>

							{/* Motivo */}
							<div className="mt-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Motivo do Ajuste*
								</label>
								<textarea
									value={formData.reason}
									onChange={(e) => handleInputChange('reason')(e.target.value)}
									placeholder="Ex: Compra de mercadoria, Perda, Devolução..."
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
									rows={4}
									required
								/>
							</div>
						</div>

						{/* Botões de Ação */}
						<div className="flex justify-end space-x-3 pt-4">
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									setFormData({
										productCode: '',
										quantity: '',
										adjustmentType: 'add',
										reason: '',
									});
									setSelectedProduct(null);
								}}
							>
								Limpar
							</Button>
							<Button type="submit" variant="primary">
								{formData.adjustmentType === 'add'
									? 'Adicionar ao Estoque'
									: 'Remover do Estoque'}
							</Button>
						</div>
					</form>

					{/* Modal de Busca de Produtos */}
					{showProductSearch && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
							<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Buscar Produto
								</h3>

								<Input
									value={searchTerm}
									onChange={setSearchTerm}
									placeholder="Digite o nome ou código do produto..."
									autoFocus
								/>

								<div className="mt-4 max-h-64 overflow-y-auto">
									{filteredProducts.map((product) => (
										<div
											key={product.id}
											onClick={() => handleProductSelect(product)}
											className="p-3 hover:bg-gray-100 cursor-pointer rounded-lg border-b last:border-b-0"
										>
											<div className="flex justify-between items-start">
												<div>
													<p className="font-medium text-gray-900">
														{product.name}
													</p>
													<p className="text-sm text-gray-600">
														Código: {product.code}
													</p>
													<p className="text-sm text-gray-500">
														{product.description}
													</p>
												</div>
												<div className="text-right">
													<p className="text-sm font-medium text-blue-600">
														{product.stock} {product.unit}
													</p>
												</div>
											</div>
										</div>
									))}

									{filteredProducts.length === 0 && searchTerm && (
										<p className="text-gray-500 text-center py-4">
											Nenhum produto encontrado
										</p>
									)}
								</div>

								<div className="flex justify-end space-x-3 mt-4">
									<Button
										variant="secondary"
										onClick={() => {
											setShowProductSearch(false);
											setSearchTerm('');
										}}
									>
										Cancelar
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			);
		}

		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold text-gray-800">
						Histórico de Ajustes
					</h2>
					<span className="text-sm text-gray-500">
						{adjustments.length} ajustes
					</span>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{adjustments.map((adjustment) => (
						<div
							key={adjustment.id}
							className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
						>
							<div className="flex justify-between items-start mb-2">
								<div>
									<h3 className="font-semibold text-gray-900">
										{adjustment.productName}
									</h3>
									<p className="text-sm text-gray-600">
										Código: {adjustment.productCode}
									</p>
								</div>
								<div className="text-right">
									<span
										className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
											adjustment.adjustmentType === 'add'
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800'
										}`}
									>
										{adjustment.adjustmentType === 'add' ? '+' : '-'}
										{adjustment.quantity}
									</span>
								</div>
							</div>

							<p className="text-gray-700 text-sm mb-2">{adjustment.reason}</p>

							<div className="flex justify-between items-center">
								<span className="text-xs text-gray-500">
									{new Date(adjustment.date).toLocaleDateString('pt-BR')}
								</span>
								<span
									className={`text-sm font-medium ${
										adjustment.adjustmentType === 'add'
											? 'text-green-600'
											: 'text-red-600'
									}`}
								>
									{adjustment.adjustmentType === 'add'
										? 'Adicionado'
										: 'Removido'}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-gray-900 mb-6">
				Controle de Estoque
			</h1>

			{/* Tabs */}
			<div className="mb-6">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8" aria-label="Tabs">
						<button
							onClick={() => setActiveTab('adjustment')}
							className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === 'adjustment'
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}`}
						>
							Ajuste
						</button>
						<button
							onClick={() => setActiveTab('history')}
							className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === 'history'
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}`}
						>
							Histórico
						</button>
					</nav>
				</div>
			</div>

			{/* Tab Content */}
			<div className="mt-6">{renderTabContent()}</div>
		</div>
	);
};

export default InventoryPage;
