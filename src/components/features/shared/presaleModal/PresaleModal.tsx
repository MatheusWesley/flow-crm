import { Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useId, useMemo, useState } from 'react';
import { mockPaymentMethodService } from '../../../../data/mockPaymentMethodService';
import toastService from '../../../../services/ToastService';
import type {
	Customer,
	PaymentMethod,
	PreSale,
	PreSaleItem,
	Product,
} from '../../../../types';
import Button from '../../../common/Button';
import InPageModal from '../../../common/InPageModal';
import Select from '../../../common/Select';

interface PresaleModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (presaleData: Omit<PreSale, 'id' | 'createdAt' | 'updatedAt'>) => void;
	customers: Customer[];
	products: Product[];
	editingPresale?: PreSale | null;
	title?: string;
}

const PresaleModal: React.FC<PresaleModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	customers,
	products,
	editingPresale = null,
	title = 'Nova Pré-venda',
}) => {
	const formId = useId();
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

	// Form state
	const [formData, setFormData] = useState({
		customerId: '',
		paymentMethodId: '',
		notes: '',
		discount: '',
		discountType: 'percentage' as 'percentage' | 'fixed',
	});

	const [formItems, setFormItems] = useState<
		Omit<PreSaleItem, 'id' | 'totalPrice'>[]
	>([]);

	// New item form state
	const [newItemForm, setNewItemForm] = useState({
		productCode: '',
		productDescription: '',
		quantity: 1,
		unitPrice: 0,
		selectedProduct: null as Product | null,
	});

	// Dropdown states
	const [showProductDropdown, setShowProductDropdown] = useState(false);
	const [customerSearchTerm, setCustomerSearchTerm] = useState('');
	const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

	// Load payment methods on component mount
	useEffect(() => {
		const loadPaymentMethods = async () => {
			try {
				const data = await mockPaymentMethodService.getAll();
				setPaymentMethods(data);
			} catch (error) {
				console.error('Error loading payment methods:', error);
				toastService.error('Erro ao carregar formas de pagamento');
			}
		};

		loadPaymentMethods();
	}, []);

	// Initialize form when editing
	useEffect(() => {
		if (editingPresale) {
			setFormData({
				customerId: editingPresale.customer.id,
				paymentMethodId: editingPresale.paymentMethodId || '1',
				notes: editingPresale.notes || '',
				discount: editingPresale.discount?.toString() || '',
				discountType: editingPresale.discountType || 'percentage',
			});

			setCustomerSearchTerm(editingPresale.customer.name);

			setFormItems(
				editingPresale.items.map((item) => ({
					product: item.product,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
					notes: item.notes || '',
				})),
			);
		}
	}, [editingPresale]);

	// Select options
	const paymentMethodOptions = paymentMethods.map((method) => ({
		value: method.id,
		label: method.description,
	}));

	const discountTypeOptions = [
		{ value: 'percentage', label: 'Percentual (%)' },
		{ value: 'fixed', label: 'Valor Fixo (R$)' },
	];

	// Filter customers for search
	const filteredCustomers = useMemo(() => {
		if (!customerSearchTerm) return [];
		return customers.filter(
			(customer) =>
				customer.name
					.toLowerCase()
					.includes(customerSearchTerm.toLowerCase()) ||
				customer.email
					.toLowerCase()
					.includes(customerSearchTerm.toLowerCase()) ||
				customer.cpf?.includes(customerSearchTerm),
		);
	}, [customers, customerSearchTerm]);

	// Filter products for dropdown
	const filteredProductsForDropdown = products.filter(
		(product) =>
			product.name
				.toLowerCase()
				.includes(newItemForm.productDescription.toLowerCase()) ||
			product.code
				.toLowerCase()
				.includes(newItemForm.productDescription.toLowerCase()),
	);

	const handleInputChange = (field: string) => (value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Handle customer search
	const handleCustomerSearch = (searchTerm: string) => {
		setCustomerSearchTerm(searchTerm);
		setShowCustomerDropdown(searchTerm.length > 0);

		// Find matching customer
		const matchingCustomer = customers.find(
			(customer) =>
				customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				customer.cpf?.includes(searchTerm),
		);

		if (matchingCustomer) {
			setFormData((prev) => ({ ...prev, customerId: matchingCustomer.id }));
		} else {
			setFormData((prev) => ({ ...prev, customerId: '' }));
		}
	};

	// Handle customer selection from dropdown
	const handleCustomerSelect = (customer: Customer) => {
		setCustomerSearchTerm(customer.name);
		setFormData((prev) => ({ ...prev, customerId: customer.id }));
		setShowCustomerDropdown(false);
	};

	// Handle product description search and auto-fill code
	const handleProductDescriptionChange = (description: string) => {
		setNewItemForm((prev) => ({
			...prev,
			productDescription: description,
		}));

		// Show/hide dropdown based on input
		setShowProductDropdown(description.length > 0);

		// Find product by description
		const matchingProduct = products.find(
			(product) =>
				product.name.toLowerCase().includes(description.toLowerCase()) ||
				product.code.toLowerCase().includes(description.toLowerCase()),
		);

		if (matchingProduct && description.length > 2) {
			setNewItemForm((prev) => ({
				...prev,
				productCode: matchingProduct.code,
				unitPrice: matchingProduct.salePrice,
				selectedProduct: matchingProduct,
			}));
		} else if (!description) {
			// Clear fields when description is empty
			setNewItemForm((prev) => ({
				...prev,
				productCode: '',
				unitPrice: 0,
				selectedProduct: null,
			}));
		}
	};

	// Handle product selection from dropdown
	const handleProductSelect = (product: Product) => {
		setNewItemForm({
			productCode: product.code,
			productDescription: product.name,
			quantity: newItemForm.quantity,
			unitPrice: product.salePrice,
			selectedProduct: product,
		});
		setShowProductDropdown(false);
	};

	// Add item from the new inline form
	const handleAddItemFromForm = () => {
		if (!newItemForm.selectedProduct) {
			toastService.error('Selecione um produto válido!');
			return;
		}

		if (newItemForm.quantity <= 0) {
			toastService.error('Quantidade deve ser maior que zero!');
			return;
		}

		if (newItemForm.unitPrice <= 0) {
			toastService.error('Valor unitário deve ser maior que zero!');
			return;
		}

		// Check if product is already in the list
		const existingItemIndex = formItems.findIndex(
			(item) => item.product.id === newItemForm.selectedProduct!.id,
		);

		if (existingItemIndex >= 0) {
			// If product already exists, update quantity and price
			setFormItems((prev) =>
				prev.map((item, index) =>
					index === existingItemIndex
						? {
								...item,
								quantity: item.quantity + newItemForm.quantity,
								unitPrice: newItemForm.unitPrice,
							}
						: item,
				),
			);
			toastService.info(
				`"${newItemForm.selectedProduct.name}" atualizado na lista!`,
			);
		} else {
			// Add new product to the list
			setFormItems((prev) => [
				...prev,
				{
					product: newItemForm.selectedProduct!,
					quantity: newItemForm.quantity,
					unitPrice: newItemForm.unitPrice,
					notes: '',
				},
			]);
			toastService.success(
				`"${newItemForm.selectedProduct.name}" adicionado aos itens!`,
			);
		}

		// Clear the form
		setNewItemForm({
			productCode: '',
			productDescription: '',
			quantity: 1,
			unitPrice: 0,
			selectedProduct: null,
		});
	};

	const removeItemFromForm = (index: number) => {
		setFormItems((prev) => prev.filter((_, i) => i !== index));
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

	const resetForm = () => {
		setFormData({
			customerId: '',
			paymentMethodId: '',
			notes: '',
			discount: '',
			discountType: 'percentage',
		});
		setFormItems([]);
		setNewItemForm({
			productCode: '',
			productDescription: '',
			quantity: 1,
			unitPrice: 0,
			selectedProduct: null,
		});
		setCustomerSearchTerm('');
		setShowCustomerDropdown(false);
		setShowProductDropdown(false);
	};

	const handleSubmitForm = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.customerId) {
			toastService.error('Selecione um cliente!');
			return;
		}

		if (!formData.paymentMethodId) {
			toastService.error('Selecione uma forma de pagamento!');
			return;
		}

		if (formItems.length === 0) {
			toastService.error('Adicione pelo menos um item à pré-venda!');
			return;
		}

		const selectedCustomer = customers.find(
			(c) => c.id === formData.customerId,
		);
		if (!selectedCustomer) return;

		const presaleData: Omit<PreSale, 'id' | 'createdAt' | 'updatedAt'> = {
			customer: selectedCustomer,
			items: formItems.map((item, index) => ({
				id: `item-${index}`,
				...item,
				totalPrice: calculateItemTotal(item.quantity, item.unitPrice),
			})),
			total: calculateFormTotal(),
			status: editingPresale ? editingPresale.status : 'pending',
			notes: formData.notes || undefined,
			discount: Number(formData.discount) || undefined,
			discountType: formData.discountType,
			paymentMethodId: formData.paymentMethodId,
			salesperson: editingPresale ? editingPresale.salesperson : 'Current User',
		};

		onSubmit(presaleData);
		resetForm();
		onClose();
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<InPageModal
			isOpen={isOpen}
			onClose={handleClose}
			title={title}
		>
			<div className="px-6 py-6">
				<form onSubmit={handleSubmitForm} className="space-y-6">
					{/* Customer Search Field - Full width at the top */}
					<div className="relative">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Cliente *
						</label>
						<input
							type="text"
							value={customerSearchTerm}
							onChange={(e) => handleCustomerSearch(e.target.value)}
							onFocus={() =>
								setShowCustomerDropdown(customerSearchTerm.length > 0)
							}
							placeholder="Digite o nome do cliente..."
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						{/* Customer dropdown */}
						{showCustomerDropdown && (
							<div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
								{filteredCustomers.length === 0 ? (
									<div className="px-3 py-2 text-gray-500 text-center">
										{customerSearchTerm
											? 'Nenhum cliente encontrado'
											: 'Digite para buscar clientes'}
									</div>
								) : (
									filteredCustomers.map((customer) => (
										<div
											key={customer.id}
											onClick={() => handleCustomerSelect(customer)}
											className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
										>
											<div className="font-medium text-gray-900">
												{customer.name}
											</div>
											<div className="text-sm text-gray-500">
												{customer.email} • {customer.cpf}
											</div>
										</div>
									))
								)}
							</div>
						)}
					</div>

					{/* Add Item Form - Campos lado a lado */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h3 className="text-sm font-medium text-gray-700 mb-3">
							Adicionar Item
						</h3>
						<div className="grid grid-cols-12 gap-3 items-end">
							{/* Código do Produto */}
							<div className="col-span-2">
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Cód. Prod
								</label>
								<input
									type="text"
									value={newItemForm.productCode}
									readOnly
									placeholder="Auto"
									className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
								/>
							</div>

							{/* Descrição do Produto */}
							<div className="col-span-4 relative">
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Descrição
								</label>
								<input
									type="text"
									value={newItemForm.productDescription}
									onChange={(e) =>
										handleProductDescriptionChange(e.target.value)
									}
									onFocus={() => setShowProductDropdown(true)}
									onBlur={() => {
										// Delay hiding dropdown to allow clicking on items
										setTimeout(() => setShowProductDropdown(false), 150);
									}}
									placeholder="Clique para buscar produto..."
									className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
								/>

								{/* Product Dropdown */}
								{showProductDropdown && (
									<div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
										{filteredProductsForDropdown.length > 0 ? (
											filteredProductsForDropdown
												.slice(0, 8)
												.map((product) => (
													<div
														key={product.id}
														onMouseDown={() => handleProductSelect(product)}
														className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
													>
														<div>
															<p className="font-medium text-gray-900 text-sm">
																{product.name}
															</p>
															<p className="text-xs text-gray-600">
																Código: {product.code}
															</p>
														</div>
														<div className="text-right">
															<p className="font-medium text-green-600 text-sm">
																R$ {product.salePrice.toFixed(2)}
															</p>
															<p className="text-xs text-gray-500">
																Estoque: {product.stock}
															</p>
														</div>
													</div>
												))
										) : (
											<div className="p-3 text-sm text-gray-500 text-center">
												{newItemForm.productDescription
													? 'Nenhum produto encontrado'
													: 'Digite para buscar produtos'}
											</div>
										)}
									</div>
								)}
							</div>

							{/* Quantidade */}
							<div className="col-span-2">
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Quantidade
								</label>
								<input
									type="number"
									step="0.01"
									min="0.01"
									value={newItemForm.quantity}
									onChange={(e) =>
										setNewItemForm((prev) => ({
											...prev,
											quantity: Number(e.target.value),
										}))
									}
									className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
								/>
							</div>

							{/* Valor Unitário */}
							<div className="col-span-2">
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Valor Unitário
								</label>
								<input
									type="number"
									step="0.01"
									min="0"
									value={newItemForm.unitPrice}
									onChange={(e) =>
										setNewItemForm((prev) => ({
											...prev,
											unitPrice: Number(e.target.value),
										}))
									}
									className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
								/>
							</div>

							{/* Botão Adicionar */}
							<div className="col-span-2">
								<label className="block text-xs font-medium text-gray-600 mb-1">
									&nbsp;
								</label>
								<Button
									type="button"
									variant="primary"
									size="sm"
									onClick={handleAddItemFromForm}
									className="w-full h-[38px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					{/* Items Section */}
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-sm font-medium text-gray-700">
								Itens da Pré-venda*
							</h3>
						</div>

						{/* Items Header */}
						{formItems.length > 0 && (
							<div className="bg-white border border-gray-200 rounded-lg mb-2">
								<div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 rounded-t-lg border-b border-gray-200 text-xs font-medium text-gray-700">
									<div className="col-span-4">Descrição do Item</div>
									<div className="col-span-2 text-right">Valor</div>
									<div className="col-span-2 text-right">Quantidade</div>
									<div className="col-span-2 text-right">Preço Unit.</div>
									<div className="col-span-1 text-right">Total</div>
									<div className="col-span-1"></div>
								</div>
							</div>
						)}

						{/* Items List */}
						{formItems.map((item, index) => (
							<div
								key={index}
								className="bg-white border border-gray-200 rounded-lg mb-2"
							>
								<div className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
									{/* Product Name - Disabled after adding */}
									<div className="col-span-4">
										<div className="text-sm text-gray-900 font-medium bg-gray-100 px-3 py-2 rounded border border-gray-200">
											<div>
												<div className="font-semibold">{item.product.name}</div>
												<div className="text-xs text-gray-600">Cód: {item.product.code}</div>
											</div>
										</div>
									</div>

									{/* Value Display */}
									<div className="col-span-2 text-right text-sm font-medium">
										{calculateItemTotal(
											item.quantity,
											item.unitPrice,
										).toFixed(2)}
									</div>

									{/* Quantity Input - Disabled after adding */}
									<div className="col-span-2">
										<input
											type="number"
											step="0.01"
											min="0.01"
											value={item.quantity}
											readOnly={true}
											className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right bg-gray-100 cursor-not-allowed opacity-60"
											title="Campo bloqueado após adição do item"
										/>
									</div>

									{/* Unit Price Input - Disabled after adding */}
									<div className="col-span-2">
										<input
											type="number"
											step="0.01"
											min="0"
											value={item.unitPrice}
											readOnly={true}
											className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right bg-gray-100 cursor-not-allowed opacity-60"
											title="Campo bloqueado após adição do item"
										/>
									</div>

									{/* Total Display */}
									<div className="col-span-1 text-right text-sm font-semibold">
										{calculateItemTotal(
											item.quantity,
											item.unitPrice,
										).toFixed(2)}
									</div>

									{/* Delete Button */}
									<div className="col-span-1 text-center">
										<button
											type="button"
											onClick={() => removeItemFromForm(index)}
											className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
											title="Remover item"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>
						))}

						{/* Total Summary */}
						{formItems.length > 0 && (
							<div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-gray-700">
										Total dos itens:
									</span>
									<span className="text-lg font-bold text-green-600">
										R$ {calculateFormTotal().toFixed(2)}
									</span>
								</div>
							</div>
						)}
					</div>

					{/* Payment Method, Discount and Notes Section */}
					<div className="space-y-4">
						{/* Payment Method and Discount in same row */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Select
								label="Forma de Pagamento *"
								value={formData.paymentMethodId}
								onChange={(value) =>
									handleInputChange('paymentMethodId')(value)
								}
								options={paymentMethodOptions}
								placeholder="Selecione a forma de pagamento"
								required
							/>
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
									placeholder="0.00"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<Select
								label="Tipo de Desconto"
								value={formData.discountType}
								onChange={(value) =>
									handleInputChange('discountType')(value)
								}
								options={discountTypeOptions}
							/>
						</div>

						{/* Observations - Full width */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Observações
							</label>
							<textarea
								value={formData.notes}
								onChange={(e) => handleInputChange('notes')(e.target.value)}
								placeholder="Observações sobre a pré-venda..."
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
							/>
						</div>
					</div>

					{/* Total Summary */}
					{formItems.length > 0 && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex justify-between items-center text-lg font-semibold">
								<span className="text-gray-700">Total Geral:</span>
								<span className="text-blue-700">
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
							onClick={handleClose}
						>
							Cancelar
						</Button>
						<Button
							id={`${formId}-submit-presale-button`}
							type="submit"
							variant="primary"
						>
							{editingPresale ? 'Atualizar Pré-venda' : 'Criar Pré-venda'}
						</Button>
					</div>
				</form>
			</div>
		</InPageModal>
	);
};

export default PresaleModal;