import type React from 'react';
import { useState } from 'react';
import type { Product } from '../../../types';
import Button from '../../common/Button';
import Input from '../../common/Input';

type TabType = 'list' | 'register';
type SubTabType = 'basic' | 'control' | 'prices';

const ProductsPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabType>('list');
	const [activeSubTab, setActiveSubTab] = useState<SubTabType>('basic');
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

	const [formData, setFormData] = useState({
		code: '',
		name: '',
		description: '',
		unit: 'pc',
		stock: '',
		saleType: 'unit' as 'unit' | 'fractional',
		purchasePrice: '',
		salePrice: '',
	});

	const handleInputChange = (field: string) => (value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Dados do produto:', formData);
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
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label="Código*"
								value={formData.code}
								onChange={handleInputChange('code')}
								placeholder="Digite o código do produto"
								required
							/>

							<Input
								label="Nome do Produto*"
								value={formData.name}
								onChange={handleInputChange('name')}
								placeholder="Digite o nome do produto"
								required
							/>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Unid. de Medida*
								</label>
								<select
									value={formData.unit}
									onChange={(e) => handleInputChange('unit')(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								>
									<option value="">Selecione</option>
									<option value="pc">Peça (pc)</option>
									<option value="un">Unidade (un)</option>
									<option value="kg">Quilograma (kg)</option>
									<option value="g">Grama (g)</option>
									<option value="l">Litro (l)</option>
									<option value="ml">Mililitro (ml)</option>
									<option value="m">Metro (m)</option>
									<option value="cm">Centímetro (cm)</option>
									

								</select>
							</div>
						</div>

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

			if (activeSubTab === 'control') {
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label="Estoque Atual*"
								type="number"
								value={formData.stock}
								onChange={handleInputChange('stock')}
								placeholder="0"
								min="0"
								required
							/>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3">
									Tipo de Venda*
								</label>
								<div className="flex gap-4">
									<button
										type="button"
										onClick={() => handleInputChange('saleType')('unit')}
										className={`px-6 py-3 rounded-lg font-medium transition-colors ${
											formData.saleType === 'unit'
												? 'bg-blue-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										Venda por Unidade
									</button>
									<button
										type="button"
										onClick={() => handleInputChange('saleType')('fractional')}
										className={`px-6 py-3 rounded-lg font-medium transition-colors ${
											formData.saleType === 'fractional'
												? 'bg-blue-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										Venda Fracionada
									</button>
								</div>
							</div>
						</div>
					</div>
				);
			}

			if (activeSubTab === 'prices') {
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label="Preço de Compra*"
								type="number"
								step="0.01"
								value={formData.purchasePrice}
								onChange={handleInputChange('purchasePrice')}
								placeholder="0,00"
								min="0"
								required
							/>

							<Input
								label="Preço de Venda*"
								type="number"
								step="0.01"
								value={formData.salePrice}
								onChange={handleInputChange('salePrice')}
								placeholder="0,00"
								min="0"
								required
							/>
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
								onClick={() => setActiveSubTab('control')}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
									activeSubTab === 'control'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Controle e Tipo de Venda
							</button>
							<button
								type="button"
								onClick={() => setActiveSubTab('prices')}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
									activeSubTab === 'prices'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Preços
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

			{/* Tab Content */}
			<div className="mt-6">{renderTabContent()}</div>
		</div>
	);
};

export default ProductsPage;
