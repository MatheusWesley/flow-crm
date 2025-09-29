import { Calculator, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { Customer, PreSale, PreSaleItem, Product } from '../../../types';
import Button from '../../common/Button';
import InPageModal from '../../common/InPageModal';

const PresalesPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedPreSale, setSelectedPreSale] = useState<PreSale | null>(null);
	const [showViewModal, setShowViewModal] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [statusFilter, setStatusFilter] = useState<PreSale['status'] | 'all'>(
		'all',
	);

	// Mock data for customers
	const [customers] = useState<Customer[]>([
		{
			id: '1',
			name: 'João Silva',
			email: 'joao@email.com',
			phone: '(11) 99999-9999',
			cpf: '123.456.789-01',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: '2',
			name: 'Maria Santos',
			email: 'maria@email.com',
			phone: '(11) 88888-8888',
			cpf: '987.654.321-00',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	// Mock data for products
	const [products] = useState<Product[]>([
		{
			id: '1',
			code: 'PRD001',
			name: 'Produto Exemplo 1',
			description: 'Descrição do produto exemplo 1',
			unit: 'pc',
			stock: 100,
			category: 'Categoria A',
			saleType: 'unit',
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
			saleType: 'fractional',
			purchasePrice: 30.0,
			salePrice: 45.5,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	// Mock data for pre-sales
	const [preSales, setPreSales] = useState<PreSale[]>([
		{
			id: '1',
			customer: customers[0],
			items: [
				{
					id: '1',
					product: products[0],
					quantity: 2,
					unitPrice: 29.99,
					totalPrice: 59.98,
				},
				{
					id: '2',
					product: products[1],
					quantity: 1.5,
					unitPrice: 45.5,
					totalPrice: 68.25,
				},
			],
			total: 128.23,
			status: 'pending',
			notes: 'Entrega urgente solicitada',
			validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			salesperson: 'Vendedor A',
			createdAt: new Date('2024-01-15'),
			updatedAt: new Date('2024-01-15'),
		},
		{
			id: '2',
			customer: customers[1],
			items: [
				{
					id: '3',
					product: products[0],
					quantity: 5,
					unitPrice: 29.99,
					totalPrice: 149.95,
				},
			],
			total: 149.95,
			status: 'approved',
			validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
			salesperson: 'Vendedor B',
			createdAt: new Date('2024-01-10'),
			updatedAt: new Date('2024-01-12'),
		},
	]);

	// Form state for creating new pre-sale
	const [formData, setFormData] = useState({
		customerId: '',
		notes: '',
		validUntil: '',
		discount: '',
		discountType: 'percentage' as 'percentage' | 'fixed',
	});

	const [formItems, setFormItems] = useState<
		Omit<PreSaleItem, 'id' | 'totalPrice'>[]
	>([]);

	const getStatusLabel = (status: PreSale['status']) => {
		const statusLabels = {
			draft: 'Rascunho',
			pending: 'Pendente',
			approved: 'Aprovada',
			cancelled: 'Cancelada',
			converted: 'Convertida',
		};
		return statusLabels[status];
	};

	const getStatusColor = (status: PreSale['status']) => {
		const statusColors = {
			draft: 'bg-gray-100 text-gray-800',
			pending: 'bg-yellow-100 text-yellow-800',
			approved: 'bg-green-100 text-green-800',
			cancelled: 'bg-red-100 text-red-800',
			converted: 'bg-blue-100 text-blue-800',
		};
		return statusColors[status];
	};

	const filteredPreSales = preSales.filter((preSale) => {
		const matchesSearch =
			preSale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			preSale.id.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === 'all' || preSale.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const handleViewPreSale = (preSale: PreSale) => {
		setSelectedPreSale(preSale);
		setShowViewModal(true);
	};

	const handleDeletePreSale = (id: string) => {
		if (confirm('Tem certeza que deseja excluir esta pré-venda?')) {
			setPreSales((prev) => prev.filter((preSale) => preSale.id !== id));
		}
	};

	const handleEditPreSale = (preSale: PreSale) => {
		setSelectedPreSale(preSale);
		// Populate form with existing data
		setFormData({
			customerId: preSale.customer.id,
			notes: preSale.notes || '',
			validUntil: preSale.validUntil
				? preSale.validUntil.toISOString().split('T')[0]
				: '',
			discount: preSale.discount?.toString() || '',
			discountType: preSale.discountType || 'percentage',
		});
		setFormItems(
			preSale.items.map((item) => ({
				product: item.product,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				notes: item.notes || '',
			})),
		);
		setShowEditModal(true);
	};

	const handleStatusChange = (preSale: PreSale) => {
		setSelectedPreSale(preSale);
		setShowStatusModal(true);
	};

	const updatePreSaleStatus = (newStatus: PreSale['status']) => {
		if (!selectedPreSale) return;

		setPreSales((prev) =>
			prev.map((preSale) =>
				preSale.id === selectedPreSale.id
					? { ...preSale, status: newStatus, updatedAt: new Date() }
					: preSale,
			),
		);
		setShowStatusModal(false);
		alert(`Status da pré-venda alterado para ${getStatusLabel(newStatus)}`);
	};

	const handleInputChange = (field: string) => (value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const addItemToForm = () => {
		setFormItems((prev) => [
			...prev,
			{
				product: products[0],
				quantity: 1,
				unitPrice: products[0].salePrice,
				notes: '',
			},
		]);
	};

	const removeItemFromForm = (index: number) => {
		setFormItems((prev) => prev.filter((_, i) => i !== index));
	};

	const updateFormItem = (
		index: number,
		field: keyof Omit<PreSaleItem, 'id' | 'totalPrice'>,
		value: any,
	) => {
		setFormItems((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
		);
	};

	const calculateItemTotal = (quantity: number, unitPrice: number) => {
		return quantity * unitPrice;
	};

	const calculateFormTotal = () => {
		const itemsTotal = formItems.reduce(
			(sum, item) => sum + calculateItemTotal(item.quantity, item.unitPrice),
			0,
		);
		const discountAmount =
			formData.discountType === 'percentage'
				? (itemsTotal * (Number(formData.discount) || 0)) / 100
				: Number(formData.discount) || 0;
		return itemsTotal - discountAmount;
	};

	const handleSubmitForm = (e: React.FormEvent, isEdit = false) => {
		e.preventDefault();

		if (!formData.customerId || formItems.length === 0) {
			alert('Selecione um cliente e adicione pelo menos um item!');
			return;
		}

		const selectedCustomer = customers.find(
			(c) => c.id === formData.customerId,
		);
		if (!selectedCustomer) return;

		const preSaleData: PreSale = {
			id:
				isEdit && selectedPreSale ? selectedPreSale.id : Date.now().toString(),
			customer: selectedCustomer,
			items: formItems.map((item, index) => ({
				id: `item-${index}`,
				...item,
				totalPrice: calculateItemTotal(item.quantity, item.unitPrice),
			})),
			total: calculateFormTotal(),
			status: isEdit && selectedPreSale ? selectedPreSale.status : 'draft',
			notes: formData.notes || undefined,
			validUntil: formData.validUntil
				? new Date(formData.validUntil)
				: undefined,
			discount: Number(formData.discount) || undefined,
			discountType: formData.discountType,
			salesperson:
				isEdit && selectedPreSale
					? selectedPreSale.salesperson
					: 'Current User',
			createdAt:
				isEdit && selectedPreSale ? selectedPreSale.createdAt : new Date(),
			updatedAt: new Date(),
		};

		if (isEdit && selectedPreSale) {
			setPreSales((prev) =>
				prev.map((preSale) =>
					preSale.id === selectedPreSale.id ? preSaleData : preSale,
				),
			);
		} else {
			setPreSales((prev) => [preSaleData, ...prev]);
		}

		// Reset form
		setFormData({
			customerId: '',
			notes: '',
			validUntil: '',
			discount: '',
			discountType: 'percentage',
		});
		setFormItems([]);
		setSelectedPreSale(null);
		setShowCreateModal(false);
		setShowEditModal(false);
		alert(
			isEdit
				? 'Pré-venda atualizada com sucesso!'
				: 'Pré-venda criada com sucesso!',
		);
	};

	const renderTabContent = () => {
		return (
			<div className="space-y-6">
				{/* Search Bar and Filters */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-4 flex-1">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<input
								type="text"
								placeholder="Buscar por cliente ou ID..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<select
							value={statusFilter}
							onChange={(e) =>
								setStatusFilter(e.target.value as PreSale['status'] | 'all')
							}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="all">Todos os Status</option>
							<option value="draft">Rascunho</option>
							<option value="pending">Pendente</option>
							<option value="approved">Aprovada</option>
							<option value="cancelled">Cancelada</option>
							<option value="converted">Convertida</option>
						</select>
					</div>
					<Button
						variant="primary"
						onClick={() => setShowCreateModal(true)}
						className="flex items-center space-x-2"
					>
						<Plus className="h-4 w-4" />
						<span>Nova Pré-venda</span>
					</Button>
				</div>

				{/* Pre-sales List */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-800">Pré-vendas</h2>
						<span className="text-sm text-gray-500">
							{filteredPreSales.length} pré-vendas encontradas
						</span>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredPreSales.map((preSale) => (
							<div
								key={preSale.id}
								className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex justify-between items-start mb-3">
									<div>
										<h3 className="font-semibold text-gray-900">
											#{preSale.id}
										</h3>
										<p className="text-sm text-gray-600">
											{preSale.customer.name}
										</p>
										<p className="text-xs text-gray-500">
											{preSale.customer.email}
										</p>
									</div>
									<span
										className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(preSale.status)}`}
									>
										{getStatusLabel(preSale.status)}
									</span>
								</div>

								<div className="mb-3">
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Total:</span>
										<span className="text-lg font-bold text-green-600">
											R$ {preSale.total.toFixed(2)}
										</span>
									</div>
									<div className="flex justify-between items-center mt-1">
										<span className="text-sm text-gray-600">Itens:</span>
										<span className="text-sm font-medium text-gray-700">
											{preSale.items.length}
										</span>
									</div>
									{preSale.validUntil && (
										<div className="flex justify-between items-center mt-1">
											<span className="text-sm text-gray-600">Válida até:</span>
											<span className="text-sm text-gray-700">
												{preSale.validUntil.toLocaleDateString('pt-BR')}
											</span>
										</div>
									)}
								</div>

								<div className="flex justify-between items-center pt-3 border-t border-gray-200">
									<div className="flex items-center space-x-2 text-xs text-gray-500">
										<span>{preSale.createdAt.toLocaleDateString('pt-BR')}</span>
										{preSale.salesperson && (
											<>
												<span>•</span>
												<span>{preSale.salesperson}</span>
											</>
										)}
									</div>
									<div className="flex space-x-1">
										<button
											type="button"
											onClick={() => handleViewPreSale(preSale)}
											className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
											title="Visualizar"
										>
											<Eye className="h-4 w-4" />
										</button>
										{(preSale.status === 'draft' ||
											preSale.status === 'pending') && (
											<button
												type="button"
												onClick={() => handleEditPreSale(preSale)}
												className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
												title="Editar"
											>
												<Edit className="h-4 w-4" />
											</button>
										)}
										<button
											type="button"
											onClick={() => handleStatusChange(preSale)}
											className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded"
											title="Alterar Status"
										>
											⚙️
										</button>
										{preSale.status !== 'converted' && (
											<button
												type="button"
												onClick={() => handleDeletePreSale(preSale.id)}
												className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
												title="Excluir"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{filteredPreSales.length === 0 && (
						<div className="text-center py-12">
							<Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500 text-lg">
								{searchTerm
									? 'Nenhuma pré-venda encontrada'
									: 'Nenhuma pré-venda cadastrada ainda.'}
							</p>
							{!searchTerm && (
								<Button
									variant="primary"
									onClick={() => setShowCreateModal(true)}
									className="mt-4"
								>
									Criar primeira pré-venda
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-gray-900 mb-6">Pré-vendas</h1>

			{/* Tab Content */}
			<div className="mt-6">{renderTabContent()}</div>

			{/* View Pre-sale Modal */}
			{showViewModal && selectedPreSale && (
				<InPageModal
					isOpen={showViewModal}
					onClose={() => setShowViewModal(false)}
					title={`Pré-venda #${selectedPreSale.id}`}
				>
					<div className="space-y-6">
						{/* Customer Info */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Nome:</span>
									<p className="font-medium">{selectedPreSale.customer.name}</p>
								</div>
								<div>
									<span className="text-gray-600">Email:</span>
									<p className="font-medium">
										{selectedPreSale.customer.email}
									</p>
								</div>
								<div>
									<span className="text-gray-600">Telefone:</span>
									<p className="font-medium">
										{selectedPreSale.customer.phone}
									</p>
								</div>
								<div>
									<span className="text-gray-600">CPF:</span>
									<p className="font-medium">{selectedPreSale.customer.cpf}</p>
								</div>
							</div>
						</div>

						{/* Items */}
						<div>
							<h4 className="font-medium text-gray-900 mb-2">Itens</h4>
							<div className="border rounded-lg overflow-hidden">
								<table className="w-full">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
												Produto
											</th>
											<th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
												Qtd
											</th>
											<th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
												Preço Unit.
											</th>
											<th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
												Total
											</th>
										</tr>
									</thead>
									<tbody>
										{selectedPreSale.items.map((item) => (
											<tr key={item.id} className="border-t">
												<td className="px-4 py-2">
													<div>
														<p className="font-medium text-sm">
															{item.product.name}
														</p>
														<p className="text-xs text-gray-600">
															{item.product.code}
														</p>
													</div>
												</td>
												<td className="px-4 py-2 text-right text-sm">
													{item.quantity} {item.product.unit}
												</td>
												<td className="px-4 py-2 text-right text-sm">
													R$ {item.unitPrice.toFixed(2)}
												</td>
												<td className="px-4 py-2 text-right text-sm font-medium">
													R$ {item.totalPrice.toFixed(2)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Summary */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="flex justify-between items-center">
								<span className="text-lg font-medium">Total Geral:</span>
								<span className="text-xl font-bold text-green-600">
									R$ {selectedPreSale.total.toFixed(2)}
								</span>
							</div>
							<div className="mt-2 text-sm text-gray-600">
								<div className="flex justify-between">
									<span>Status:</span>
									<span
										className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedPreSale.status)}`}
									>
										{getStatusLabel(selectedPreSale.status)}
									</span>
								</div>
								{selectedPreSale.validUntil && (
									<div className="flex justify-between mt-1">
										<span>Válida até:</span>
										<span>
											{selectedPreSale.validUntil.toLocaleDateString('pt-BR')}
										</span>
									</div>
								)}
								{selectedPreSale.salesperson && (
									<div className="flex justify-between mt-1">
										<span>Vendedor:</span>
										<span>{selectedPreSale.salesperson}</span>
									</div>
								)}
							</div>
							{selectedPreSale.notes && (
								<div className="mt-3 pt-3 border-t border-gray-200">
									<span className="text-sm text-gray-600">Observações:</span>
									<p className="text-sm mt-1">{selectedPreSale.notes}</p>
								</div>
							)}
						</div>
					</div>
				</InPageModal>
			)}

			{/* Create Pre-sale Modal */}
			{showCreateModal && (
				<InPageModal
					isOpen={showCreateModal}
					onClose={() => setShowCreateModal(false)}
					title="Nova Pré-venda"
				>
					<div className="px-6 py-6">
						<form onSubmit={handleSubmitForm} className="space-y-6">
							{/* Customer Selection */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Cliente*
								</label>
								<select
									value={formData.customerId}
									onChange={(e) =>
										handleInputChange('customerId')(e.target.value)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								>
									<option value="">Selecione um cliente</option>
									{customers.map((customer) => (
										<option key={customer.id} value={customer.id}>
											{customer.name} - {customer.email}
										</option>
									))}
								</select>
							</div>

							{/* Items */}
							<div>
								<div className="flex justify-between items-center mb-2">
									<label className="block text-sm font-medium text-gray-700">
										Itens*
									</label>
									<Button
										type="button"
										variant="secondary"
										onClick={addItemToForm}
									>
										<Plus className="h-4 w-4 mr-1" />
										Adicionar Item
									</Button>
								</div>

								{formItems.map((item, index) => (
									<div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
										<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													Produto
												</label>
												<select
													id={`product-select-${index}`}
													value={item.product.id}
													onChange={(e) => {
														const product = products.find(
															(p) => p.id === e.target.value,
														);
														if (product) {
															updateFormItem(index, 'product', product);
															updateFormItem(
																index,
																'unitPrice',
																product.salePrice,
															);
														}
													}}
													onKeyDown={(e) => {
														if (e.key === 'Enter') {
															e.preventDefault();
															const quantityInput = document.getElementById(`quantity-input-${index}`);
															if (quantityInput) {
																quantityInput.focus();
																quantityInput.select();
															}
														}
													}}
													className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
												>
													{products.map((product) => (
														<option key={product.id} value={product.id}>
															{product.name}
														</option>
													))}
												</select>
											</div>
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													Quantidade
												</label>
												<input
													id={`quantity-input-${index}`}
													type="number"
													step="0.01"
													min="0.01"
													value={item.quantity}
													onChange={(e) =>
														updateFormItem(
															index,
															'quantity',
															Number(e.target.value),
														)
													}
													onKeyDown={(e) => {
														if (e.key === 'Enter') {
															e.preventDefault();
															const unitPriceInput = document.getElementById(`unit-price-input-${index}`);
															if (unitPriceInput) {
																unitPriceInput.focus();
																unitPriceInput.select();
															}
														}
													}}
													className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
												/>
											</div>
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													Preço Unit.
												</label>
												<input
													id={`unit-price-input-${index}`}
													type="number"
													step="0.01"
													min="0"
													value={item.unitPrice}
													onChange={(e) =>
														updateFormItem(
															index,
															'unitPrice',
															Number(e.target.value),
														)
													}
													onKeyDown={(e) => {
														if (e.key === 'Enter') {
															e.preventDefault();
															// Se existir próximo item, vai para o produto do próximo
															if (index + 1 < formItems.length) {
																const nextProductSelect = document.getElementById(`product-select-${index + 1}`);
																if (nextProductSelect) {
																	nextProductSelect.focus();
																}
															} else {
																// Se é o último item, vai para o campo de desconto
																const discountInput = document.getElementById('discount-input');
																if (discountInput) {
																	discountInput.focus();
																	discountInput.select();
																}
															}
														}
													}}
													className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
												/>
											</div>
											<div className="flex items-end">
												<div className="flex-1">
													<label className="block text-xs text-gray-600 mb-1">
														Total
													</label>
													<input
														type="text"
														value={`R$ ${calculateItemTotal(item.quantity, item.unitPrice).toFixed(2)}`}
														readOnly
														className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
													/>
												</div>
												<Button
													type="button"
													variant="danger"
													onClick={() => removeItemFromForm(index)}
													className="ml-2 p-1"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Discount */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Desconto
									</label>
									<input
										id="discount-input"
										type="number"
										step="0.01"
										min="0"
										value={formData.discount}
										onChange={(e) =>
											handleInputChange('discount')(e.target.value)
										}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												const discountTypeSelect = document.getElementById('discount-type-select');
												if (discountTypeSelect) {
													discountTypeSelect.focus();
												}
											}
										}}
										placeholder="0.00"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Tipo de Desconto
									</label>
									<select
										id="discount-type-select"
										value={formData.discountType}
										onChange={(e) =>
											handleInputChange('discountType')(e.target.value)
										}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												const validUntilInput = document.getElementById('valid-until-input');
												if (validUntilInput) {
													validUntilInput.focus();
												}
											}
										}}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									>
										<option value="percentage">Percentual (%)</option>
										<option value="fixed">Valor Fixo (R$)</option>
									</select>
								</div>
							</div>

							{/* Valid Until */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Válida até
								</label>
								<input
									id="valid-until-input"
									type="date"
									value={formData.validUntil}
									onChange={(e) =>
										handleInputChange('validUntil')(e.target.value)
									}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											const notesTextarea = document.getElementById('notes-textarea');
											if (notesTextarea) {
												notesTextarea.focus();
											}
										}
									}}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							{/* Notes */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Observações
								</label>
								<textarea
									id="notes-textarea"
									value={formData.notes}
									onChange={(e) => handleInputChange('notes')(e.target.value)}
									placeholder="Observações sobre a pré-venda..."
									rows={3}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && e.ctrlKey) {
											e.preventDefault();
											const submitButton = document.getElementById('submit-presale-button');
											if (submitButton) {
												submitButton.focus();
											}
										}
									}}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								/>
							</div>

							{/* Total Summary */}
							{formItems.length > 0 && (
								<div className="bg-blue-50 p-4 rounded-lg">
									<div className="flex justify-between items-center text-lg font-semibold">
										<span>Total Geral:</span>
										<span className="text-blue-600">
											R$ {calculateFormTotal().toFixed(2)}
										</span>
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="flex justify-end space-x-3 pt-4">
								<Button
									type="button"
									variant="secondary"
									onClick={() => setShowCreateModal(false)}
								>
									Cancelar
								</Button>
								<Button id="submit-presale-button" type="submit" variant="primary">
									Criar Pré-venda
								</Button>
							</div>
						</form>
					</div>
				</InPageModal>
			)}

			{/* Edit Pre-sale Modal */}
			{showEditModal && selectedPreSale && (
				<InPageModal
					isOpen={showEditModal}
					onClose={() => {
						setShowEditModal(false);
						setSelectedPreSale(null);
						setFormData({
							customerId: '',
							notes: '',
							validUntil: '',
							discount: '',
							discountType: 'percentage',
						});
						setFormItems([]);
					}}
					title={`Editar Pré-venda #${selectedPreSale.id}`}
				>
					<div className="px-6 py-6">
						<form
							onSubmit={(e) => handleSubmitForm(e, true)}
							className="space-y-6"
						>
							{/* Same form content as create modal */}
							{/* Customer Selection */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Cliente*
								</label>
								<select
									value={formData.customerId}
									onChange={(e) =>
										handleInputChange('customerId')(e.target.value)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								>
									<option value="">Selecione um cliente</option>
									{customers.map((customer) => (
										<option key={customer.id} value={customer.id}>
											{customer.name} - {customer.email}
										</option>
									))}
								</select>
							</div>

							{/* Items - Same as create modal */}
							<div>
								<div className="flex justify-between items-center mb-2">
									<label className="block text-sm font-medium text-gray-700">
										Itens*
									</label>
									<Button
										type="button"
										variant="secondary"
										onClick={addItemToForm}
									>
										<Plus className="h-4 w-4 mr-1" />
										Adicionar Item
									</Button>
								</div>

								{formItems.map((item, index) => (
									<div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
										<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													Produto
												</label>
												<select
													value={item.product.id}
													onChange={(e) => {
														const product = products.find(
															(p) => p.id === e.target.value,
														);
														if (product) {
															updateFormItem(index, 'product', product);
															updateFormItem(
																index,
																'unitPrice',
																product.salePrice,
															);
														}
													}}
													className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
												>
													{products.map((product) => (
														<option key={product.id} value={product.id}>
															{product.name}
														</option>
													))}
												</select>
											</div>
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													Quantidade
												</label>
												<input
													type="number"
													step="0.01"
													min="0.01"
													value={item.quantity}
													onChange={(e) =>
														updateFormItem(
															index,
															'quantity',
															Number(e.target.value),
														)
													}
													className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
												/>
											</div>
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													Preço Unit.
												</label>
												<input
													type="number"
													step="0.01"
													min="0"
													value={item.unitPrice}
													onChange={(e) =>
														updateFormItem(
															index,
															'unitPrice',
															Number(e.target.value),
														)
													}
													className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
												/>
											</div>
											<div className="flex items-end">
												<div className="flex-1">
													<label className="block text-xs text-gray-600 mb-1">
														Total
													</label>
													<input
														type="text"
														value={`R$ ${calculateItemTotal(item.quantity, item.unitPrice).toFixed(2)}`}
														readOnly
														className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
													/>
												</div>
												<Button
													type="button"
													variant="danger"
													onClick={() => removeItemFromForm(index)}
													className="ml-2 p-1"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Other fields same as create */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Desconto
									</label>
									<input
										type="number"
										step="0.01"
										min="0"
										value={formData.discount}
										onChange={(e) =>
											handleInputChange('discount')(e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Tipo de Desconto
									</label>
									<select
										value={formData.discountType}
										onChange={(e) =>
											handleInputChange('discountType')(e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									>
										<option value="percentage">Percentual (%)</option>
										<option value="fixed">Valor Fixo (R$)</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Válida até
								</label>
								<input
									type="date"
									value={formData.validUntil}
									onChange={(e) =>
										handleInputChange('validUntil')(e.target.value)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Observações
								</label>
								<textarea
									value={formData.notes}
									onChange={(e) => handleInputChange('notes')(e.target.value)}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								/>
							</div>

							{/* Total Summary */}
							{formItems.length > 0 && (
								<div className="bg-blue-50 p-4 rounded-lg">
									<div className="flex justify-between items-center text-lg font-semibold">
										<span>Total Geral:</span>
										<span className="text-blue-600">
											R$ {calculateFormTotal().toFixed(2)}
										</span>
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="flex justify-end space-x-3 pt-4">
								<Button
									type="button"
									variant="secondary"
									onClick={() => {
										setShowEditModal(false);
										setSelectedPreSale(null);
										setFormData({
											customerId: '',
											notes: '',
											validUntil: '',
											discount: '',
											discountType: 'percentage',
										});
										setFormItems([]);
									}}
								>
									Cancelar
								</Button>
								<Button type="submit" variant="primary">
									Atualizar Pré-venda
								</Button>
							</div>
						</form>
					</div>
				</InPageModal>
			)}

			{/* Status Change Modal */}
			{showStatusModal && selectedPreSale && (
				<InPageModal
					isOpen={showStatusModal}
					onClose={() => setShowStatusModal(false)}
					title={`Alterar Status - Pré-venda #${selectedPreSale.id}`}
				>
					<div className="space-y-4">
						<div className="text-center">
							<p className="text-gray-600 mb-4">
								Status atual:{' '}
								<span
									className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedPreSale.status)}`}
								>
									{getStatusLabel(selectedPreSale.status)}
								</span>
							</p>
							<p className="text-sm text-gray-500 mb-6">
								Selecione o novo status para esta pré-venda:
							</p>
						</div>

						<div className="grid grid-cols-1 gap-3">
							{(
								[
									'pending',
									'approved',
									'cancelled',
									'converted',
								] as PreSale['status'][]
							).map((status) => (
								<button
									key={status}
									onClick={() => updatePreSaleStatus(status)}
									disabled={selectedPreSale.status === status}
									className={`w-full p-3 rounded-lg border text-left transition-colors ${
										selectedPreSale.status === status
											? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
											: 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="font-medium">
											{getStatusLabel(status)}
										</span>
										<span
											className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}
										>
											{status}
										</span>
									</div>
									<p className="text-sm text-gray-500 mt-1">
										{status === 'pending' && 'Aguardando aprovação do cliente'}
										{status === 'approved' && 'Cliente aprovou a proposta'}
										{status === 'cancelled' && 'Pré-venda foi cancelada'}
										{status === 'converted' && 'Convertida em venda final'}
									</p>
								</button>
							))}
						</div>
					</div>
				</InPageModal>
			)}
		</div>
	);
};

export default PresalesPage;
