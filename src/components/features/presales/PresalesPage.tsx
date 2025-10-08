import {
	Calculator,
	Calendar,
	Download,
	Edit,
	Eye,
	Plus,
	RotateCcw,
	Search,
	Trash2,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useId, useMemo, useState } from 'react';
import { mockPaymentMethodService } from '../../../data/mockPaymentMethodService';
import toastService, { TOAST_MESSAGES } from '../../../services/ToastService';
import type {
	Customer,
	PaymentMethod,
	PreSale,
	PreSaleItem,
	Product,
} from '../../../types';
import Button from '../../common/Button';
import InPageModal from '../../common/InPageModal';
import Select from '../../common/Select';
import SimpleModal from '../../common/SimpleModal';
import { PresaleModal } from '../shared/presaleModal';
import PreSaleItemsDisplay from './PreSaleItemsDisplay';

const PresalesPage: React.FC = () => {
	const editFormId = useId();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedPreSale, setSelectedPreSale] = useState<PreSale | null>(null);
	const [showViewModal, setShowViewModal] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [statusFilter, setStatusFilter] = useState<PreSale['status'] | 'all'>(
		'all',
	);
	// Initialize date filters to show today's presales by default
	// Use local date to avoid timezone issues
	const getLocalDateString = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};
	const today = getLocalDateString(new Date());
	const [startDate, setStartDate] = useState(today);
	const [endDate, setEndDate] = useState(today);

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
			salesperson: 'Vendedor B',
			createdAt: new Date('2024-01-10'),
			updatedAt: new Date('2024-01-12'),
		},
		{
			id: '3',
			customer: customers[0],
			items: [
				{
					id: '4',
					product: products[1],
					quantity: 3,
					unitPrice: 45.5,
					totalPrice: 136.5,
				},
			],
			total: 136.5,
			status: 'draft',
			salesperson: 'Vendedor A',
			createdAt: new Date('2024-02-20'),
			updatedAt: new Date('2024-02-20'),
		},
		{
			id: '4',
			customer: customers[1],
			items: [
				{
					id: '5',
					product: products[0],
					quantity: 1,
					unitPrice: 29.99,
					totalPrice: 29.99,
				},
			],
			total: 29.99,
			status: 'converted',
			salesperson: 'Vendedor C',
			createdAt: new Date('2024-03-05'),
			updatedAt: new Date('2024-03-07'),
		},
		{
			id: '5',
			customer: customers[0],
			items: [
				{
					id: '6',
					product: products[1],
					quantity: 2.5,
					unitPrice: 45.5,
					totalPrice: 113.75,
				},
			],
			total: 113.75,
			status: 'cancelled',
			salesperson: 'Vendedor B',
			createdAt: new Date('2024-12-01'),
			updatedAt: new Date('2024-12-02'),
		},
		{
			id: '6',
			customer: customers[1],
			items: [
				{
					id: '7',
					product: products[0],
					quantity: 10,
					unitPrice: 29.99,
					totalPrice: 299.9,
				},
			],
			total: 299.9,
			status: 'approved',
			salesperson: 'Vendedor A',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		// Mais pré-vendas para hoje (07/10/2025) para teste
		{
			id: '7',
			customer: customers[0],
			items: [
				{
					id: '8',
					product: products[1],
					quantity: 2,
					unitPrice: 45.5,
					totalPrice: 91.0,
				},
			],
			total: 91.0,
			status: 'pending',
			notes: 'Pré-venda de hoje',
			salesperson: 'Vendedor B',
			createdAt: new Date(2025, 9, 7, 10, 30), // October 7, 2025, 10:30 (month is 0-indexed)
			updatedAt: new Date(2025, 9, 7, 10, 30),
		},
		{
			id: '8',
			customer: customers[1],
			items: [
				{
					id: '9',
					product: products[0],
					quantity: 3,
					unitPrice: 29.99,
					totalPrice: 89.97,
				},
			],
			total: 89.97,
			status: 'draft',
			notes: 'Outra pré-venda de hoje',
			salesperson: 'Vendedor C',
			createdAt: new Date(2025, 9, 7, 14, 15), // October 7, 2025, 14:15 (month is 0-indexed)
			updatedAt: new Date(2025, 9, 7, 14, 15),
		},
		// Pré-vendas de ontem (06/10/2025)
		{
			id: '9',
			customer: customers[0],
			items: [
				{
					id: '10',
					product: products[0],
					quantity: 1,
					unitPrice: 29.99,
					totalPrice: 29.99,
				},
			],
			total: 29.99,
			status: 'approved',
			notes: 'Pré-venda de ontem',
			salesperson: 'Vendedor A',
			createdAt: new Date(2025, 9, 6, 16, 45), // October 6, 2025, 16:45 (month is 0-indexed)
			updatedAt: new Date(2025, 9, 6, 16, 45),
		},
		// Mais pré-vendas explicitamente para hoje (07/10/2025)
		{
			id: '10',
			customer: customers[1],
			items: [
				{
					id: '11',
					product: products[1],
					quantity: 1,
					unitPrice: 45.5,
					totalPrice: 45.5,
				},
			],
			total: 45.5,
			status: 'pending',
			notes: 'Teste filtro - hoje 07/10',
			salesperson: 'Vendedor D',
			createdAt: new Date(2025, 9, 7, 9, 0), // October 7, 2025, 09:00
			updatedAt: new Date(2025, 9, 7, 9, 0),
		},
	]);

	// Payment methods from centralized service
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

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

	// Select options

	const paymentMethodOptions = paymentMethods.map((method) => ({
		value: method.id,
		label: method.description,
	}));

	const statusOptions = [
		{ value: 'all', label: 'Todos os Status' },
		{ value: 'draft', label: 'Rascunho' },
		{ value: 'pending', label: 'Pendente' },
		{ value: 'approved', label: 'Aprovada' },
		{ value: 'cancelled', label: 'Cancelada' },
		{ value: 'converted', label: 'Convertida' },
	];

	const discountTypeOptions = [
		{ value: 'percentage', label: 'Percentual (%)' },
		{ value: 'fixed', label: 'Valor Fixo (R$)' },
	];

	// Form state for creating new pre-sale
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

	// Product dropdown state
	const [showProductDropdown, setShowProductDropdown] = useState(false);

	// Customer search state
	const [customerSearchTerm, setCustomerSearchTerm] = useState('');
	const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

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

		// Date filtering - usando string comparison para evitar problemas de fuso horário
		let matchesDateRange = true;
		if (startDate || endDate) {
			// Converte a data da pré-venda para string no formato YYYY-MM-DD usando timezone local
			const presaleDate = new Date(preSale.createdAt);
			const presaleDateString = getLocalDateString(presaleDate);

			// Debug temporário
			if (preSale.id === '7' || preSale.id === '8' || preSale.id === '10') {
				console.log(`[DEBUG] Pré-venda #${preSale.id}:`, {
					originalDate: preSale.createdAt,
					presaleDateString,
					startDate,
					endDate,
					comparison: presaleDateString >= startDate && presaleDateString <= endDate
				});
			}

			if (startDate) {
				matchesDateRange = matchesDateRange && presaleDateString >= startDate;
			}

			if (endDate) {
				matchesDateRange = matchesDateRange && presaleDateString <= endDate;
			}
		}

		return matchesSearch && matchesStatus && matchesDateRange;
	});

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

	const handleViewPreSale = (preSale: PreSale) => {
		setSelectedPreSale(preSale);
		setShowViewModal(true);
	};

	const handleDeletePreSale = (id: string) => {
		if (confirm(TOAST_MESSAGES.presale.deleteConfirm)) {
			setPreSales((prev) => prev.filter((preSale) => preSale.id !== id));
			toastService.success(TOAST_MESSAGES.presale.deleted);
		}
	};

	const handleEditPreSale = (preSale: PreSale) => {
		setSelectedPreSale(preSale);
		// Populate form with existing data
		setFormData({
			customerId: preSale.customer.id,
			paymentMethodId: preSale.paymentMethodId || '1', // Default to first payment method
			notes: preSale.notes || '',
			discount: preSale.discount?.toString() || '',
			discountType: preSale.discountType || 'percentage',
		});

		// Initialize customer search state
		setCustomerSearchTerm(preSale.customer.name);

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
		toastService.success(
			`Status da pré-venda alterado para ${getStatusLabel(newStatus)}`,
		);
	};

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

	// Clear date filters to show all dates
	const clearDateFilters = () => {
		setStartDate('');
		setEndDate('');
	};

	// Reset to today's filter
	const resetToToday = () => {
		const todayDate = getLocalDateString(new Date());
		setStartDate(todayDate);
		setEndDate(todayDate);
	};

	// Generate PDF function
	const handleGeneratePDF = (preSale: PreSale) => {
		// Simulated PDF generation
		toastService.success(
			`PDF da pré-venda #${preSale.id} será gerado em breve!`,
		);
		// TODO: Implement actual PDF generation using libraries like jsPDF or react-pdf
		console.log('Generating PDF for pre-sale:', preSale);
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

	const handleCreatePresale = (presaleData: Omit<PreSale, 'id' | 'createdAt' | 'updatedAt'>) => {
		const newPresale: PreSale = {
			...presaleData,
			id: Date.now().toString(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setPreSales((prev) => [newPresale, ...prev]);
		toastService.success(TOAST_MESSAGES.presale.created);
	};

	const handleUpdatePresale = (presaleData: Omit<PreSale, 'id' | 'createdAt' | 'updatedAt'>) => {
		if (!selectedPreSale) return;

		const updatedPresale: PreSale = {
			...presaleData,
			id: selectedPreSale.id,
			createdAt: selectedPreSale.createdAt,
			updatedAt: new Date(),
		};

		setPreSales((prev) =>
			prev.map((preSale) =>
				preSale.id === selectedPreSale.id ? updatedPresale : preSale,
			),
		);

		setSelectedPreSale(null);
		setShowEditModal(false);
		toastService.success(TOAST_MESSAGES.presale.updated);
	};

	const handleSubmitForm = (e: React.FormEvent, isEdit = false) => {
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
			status: isEdit && selectedPreSale ? selectedPreSale.status : 'pending',
			notes: formData.notes || undefined,
			discount: Number(formData.discount) || undefined,
			discountType: formData.discountType,
			paymentMethodId: formData.paymentMethodId,
			salesperson: isEdit && selectedPreSale ? selectedPreSale.salesperson : 'Current User',
		};

		if (isEdit) {
			handleUpdatePresale(presaleData);
		} else {
			handleCreatePresale(presaleData);
		}
	};



	const renderTabContent = () => {
		return (
			<div className="space-y-6">
				{/* Search Bar and Filters */}
				<div className="space-y-4">
					{/* First row - Search and Status */}
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
							<Select
								value={statusFilter}
								onChange={(value) =>
									setStatusFilter(value as PreSale['status'] | 'all')
								}
								options={statusOptions}
								size="sm"
								className="w-48"
							/>
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

					{/* Second row - Date filters */}
					<div className="bg-gray-50 rounded-lg p-4 space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm font-medium text-gray-700">
								<Calendar className="h-4 w-4" />
								<span>Filtros por Data de Abertura</span>
							</div>
							{/* Quick filter buttons */}
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={resetToToday}
									className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
										startDate === today && endDate === today
											? 'bg-blue-600 text-white'
											: 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
									}`}
								>
									Hoje
								</button>
								<button
									type="button"
									onClick={clearDateFilters}
									className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
										!startDate && !endDate
											? 'bg-blue-600 text-white'
											: 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
									}`}
								>
									Todas as Datas
								</button>
							</div>
						</div>
						
						{/* Date range inputs */}
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<label htmlFor="startDate" className="text-sm text-gray-600 min-w-[2rem]">
									De:
								</label>
								<input
									id="startDate"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
								/>
							</div>
							<div className="flex items-center gap-2">
								<label htmlFor="endDate" className="text-sm text-gray-600 min-w-[2.5rem]">
									Até:
								</label>
								<input
									id="endDate"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
								/>
							</div>
							
							{/* Current filter status */}
							<div className="text-xs text-gray-500 ml-auto">
								{!startDate && !endDate && 'Mostrando todas as datas'}
								{startDate && endDate && startDate === endDate && startDate === today && 'Mostrando apenas hoje'}
								{startDate && endDate && startDate === endDate && startDate !== today && `Mostrando apenas ${new Date(startDate).toLocaleDateString('pt-BR')}`}
								{startDate && endDate && startDate !== endDate && `Período: ${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}`}
								{startDate && !endDate && `A partir de ${new Date(startDate).toLocaleDateString('pt-BR')}`}
								{!startDate && endDate && `Até ${new Date(endDate).toLocaleDateString('pt-BR')}`}
							</div>
						</div>
					</div>
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
											className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors"
											title="Alterar Status"
										>
											<RotateCcw className="h-4 w-4" />
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

			{/* View Pre-sale Modal - Modern Design */}
			{showViewModal && selectedPreSale && (
				<InPageModal
					isOpen={showViewModal}
					onClose={() => setShowViewModal(false)}
					title={`Pré-venda #${selectedPreSale.id}`}
				>
					<div className="p-6 space-y-6">
						{/* Header com informações e ações */}
						<div className="flex items-center justify-between pb-4 border-b border-gray-200">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 rounded-lg">
									<Eye className="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<p className="text-sm text-gray-500">
										Criada em{' '}
										{selectedPreSale.createdAt.toLocaleDateString('pt-BR')}
									</p>
								</div>
							</div>
							<Button
								variant="primary"
								size="sm"
								onClick={() => handleGeneratePDF(selectedPreSale)}
								className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
							>
								<Download className="h-4 w-4" />
								<span>Gerar PDF</span>
							</Button>
						</div>
						{/* Cliente */}
						<section className="bg-blue-50 rounded-lg p-4 border border-blue-100">
							<h3 className="text-sm font-medium text-blue-900 mb-3">
								Cliente
							</h3>
							<dl className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<dt className="text-blue-700">Nome:</dt>
									<dd className="font-semibold text-blue-900">
										{selectedPreSale.customer.name}
									</dd>
								</div>
								<div>
									<dt className="text-blue-700">Email:</dt>
									<dd className="font-medium text-blue-900">
										{selectedPreSale.customer.email}
									</dd>
								</div>
								<div>
									<dt className="text-blue-700">Telefone:</dt>
									<dd className="font-medium text-blue-900">
										{selectedPreSale.customer.phone}
									</dd>
								</div>
								<div>
									<dt className="text-blue-700">CPF:</dt>
									<dd className="font-mono font-medium text-blue-900">
										{selectedPreSale.customer.cpf}
									</dd>
								</div>
							</dl>
						</section>

						{/* Itens */}
						<section>
							<h3 className="text-sm font-medium text-gray-900 mb-3">Itens</h3>
							<PreSaleItemsDisplay items={selectedPreSale.items} />
						</section>

						{/* Total */}
						<section className="bg-gray-50 p-4 rounded-lg space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-lg font-medium">Total Geral:</span>
								<span className="text-xl font-bold text-green-600">
									R$ {selectedPreSale.total.toFixed(2)}
								</span>
							</div>

							<div className="text-sm text-gray-600 space-y-1">
								<div className="flex justify-between">
									<span>Status:</span>
									<span
										className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
											selectedPreSale.status,
										)}`}
									>
										{getStatusLabel(selectedPreSale.status)}
									</span>
								</div>
							</div>

							{selectedPreSale.notes && (
								<div className="pt-3 border-t border-gray-200">
									<span className="text-sm text-gray-600">Observações:</span>
									<p className="text-sm mt-1">{selectedPreSale.notes}</p>
								</div>
							)}
						</section>
					</div>
				</InPageModal>
			)}
			{/* Create Pre-sale Modal */}
			<PresaleModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSubmit={handleCreatePresale}
				customers={customers}
				products={products}
				title="Nova Pré-venda"
			/>

			{/* Edit Pre-sale Modal - Using same layout as create modal */}
			{showEditModal && selectedPreSale && (
				<InPageModal
					isOpen={showEditModal}
					onClose={() => {
						setShowEditModal(false);
						setSelectedPreSale(null);
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
						// Reset customer search states
						setCustomerSearchTerm('');
						setShowCustomerDropdown(false);
						setShowProductDropdown(false);
					}}
					title={`Editar Pré-venda #${selectedPreSale.id}`}
				>
					<div className="px-6 py-6">
						<form
							onSubmit={(e) => handleSubmitForm(e, true)}
							className="space-y-6"
						>
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

							{/* Add Item Form - Same as create modal */}
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

							{/* Items Section - Same as create modal */}
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

							{/* Payment Method, Discount and Notes Section - Same as create modal */}
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
									onClick={() => {
										setShowEditModal(false);
										setSelectedPreSale(null);
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
										// Reset customer search states
										setCustomerSearchTerm('');
										setShowCustomerDropdown(false);
										setShowProductDropdown(false);
									}}
								>
									Cancelar
								</Button>
								<Button
									id={`${editFormId}-submit-presale-edit-button`}
									type="submit"
									variant="primary"
								>
									Atualizar Pré-venda
								</Button>
							</div>
						</form>
					</div>
				</InPageModal>
			)}

			{/* Status Change Modal - Compact Design */}
			{showStatusModal && selectedPreSale && (
				<SimpleModal
					isOpen={showStatusModal}
					onClose={() => setShowStatusModal(false)}
					title="Alterar Status"
				>
					<div className="space-y-5">
						{/* Header com ícone */}
						<div className="flex items-center gap-3 pb-4 border-b border-gray-200">
							<div className="p-2 bg-purple-100 rounded-lg">
								<RotateCcw className="h-5 w-5 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">
									Pré-venda #{selectedPreSale.id}
								</p>
							</div>
						</div>

						{/* Lista de Status */}
						<div className="space-y-4">
							<p className="text-sm text-gray-600 mb-1">Status atual:</p>
							<span
								className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPreSale.status)}`}
							>
								{getStatusLabel(selectedPreSale.status)}
							</span>
						</div>

						{/* Opções de Status - Cards Modernos */}
						<div>
							<p className="text-sm text-gray-600 mb-4 text-center">
								Selecione o novo status:
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{(
									[
										'draft',
										'pending',
										'approved',
										'cancelled',
										'converted',
									] as PreSale['status'][]
								).map((status) => {
									const isCurrent = selectedPreSale.status === status;
									const statusInfo = {
										draft: { icon: '📝', desc: 'Pré-venda em rascunho' },
										pending: {
											icon: '⏳',
											desc: 'Aguardando aprovação do cliente',
										},
										approved: {
											icon: '✅',
											desc: 'Cliente aprovou a proposta',
										},
										cancelled: { icon: '❌', desc: 'Pré-venda foi cancelada' },
										converted: {
											icon: '✨',
											desc: 'Convertida em venda final',
										},
									};

									return (
										<button
											key={status}
											onClick={() => updatePreSaleStatus(status)}
											disabled={isCurrent}
											className={`
												relative p-4 rounded-xl border-2 text-left transition-all duration-200 transform
												${
													isCurrent
														? 'bg-gray-50 border-gray-300 text-gray-400 cursor-not-allowed'
														: 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:scale-105 hover:shadow-md cursor-pointer'
												}
											`}
										>
											{isCurrent && (
												<div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
													Atual
												</div>
											)}

											<div className="flex items-center gap-3 mb-2">
												<span className="text-2xl">
													{statusInfo[status].icon}
												</span>
												<div>
													<div className="flex items-center gap-2">
														<span className="font-semibold text-gray-900">
															{getStatusLabel(status)}
														</span>
														<span
															className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(status)}`}
														>
															{status}
														</span>
													</div>
												</div>
											</div>
											<p className="text-sm text-gray-500 leading-relaxed">
												{statusInfo[status].desc}
											</p>
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</SimpleModal>
			)}
		</div>
	);
};

export default PresalesPage;
