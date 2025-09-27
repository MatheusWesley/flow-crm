import { Edit, Search, Trash2 } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { Customer, TableColumn } from '../../../types';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { Modal } from '../../common/Modal';
import { Table } from '../../common/Table';

interface CustomerListProps {
	customers: Customer[];
	onEdit: (customer: Customer) => void;
	onDelete: (id: string) => void;
	loading?: boolean;
}

interface DeleteConfirmationModalProps {
	isOpen: boolean;
	customer: Customer | null;
	onConfirm: () => void;
	onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
	isOpen,
	customer,
	onConfirm,
	onCancel,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onCancel} title="Confirm Delete">
			<div className="space-y-4">
				<p className="text-sm text-gray-500">
					Are you sure you want to delete the customer "{customer?.name}"? This
					action cannot be undone.
				</p>
				<div className="flex justify-end space-x-3">
					<Button variant="secondary" onClick={onCancel}>
						Cancel
					</Button>
					<Button variant="danger" onClick={onConfirm}>
						Delete Customer
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export const CustomerList: React.FC<CustomerListProps> = ({
	customers,
	onEdit,
	onDelete,
	loading = false,
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		customer: Customer | null;
	}>({
		isOpen: false,
		customer: null,
	});

	// Filter customers based on search query
	const filteredCustomers = useMemo(() => {
		if (!searchQuery.trim()) return customers;

		const query = searchQuery.toLowerCase();
		return customers.filter(
			(customer) =>
				customer.name.toLowerCase().includes(query) ||
				customer.email.toLowerCase().includes(query) ||
				customer.phone.includes(query) ||
				customer.cpf.includes(query) ||
				customer.address?.city?.toLowerCase().includes(query) ||
				customer.address?.state?.toLowerCase().includes(query),
		);
	}, [customers, searchQuery]);

	const handleDeleteClick = (customer: Customer) => {
		setDeleteModal({
			isOpen: true,
			customer,
		});
	};

	const handleDeleteConfirm = () => {
		if (deleteModal.customer) {
			onDelete(deleteModal.customer.id);
			setDeleteModal({
				isOpen: false,
				customer: null,
			});
		}
	};

	const handleDeleteCancel = () => {
		setDeleteModal({
			isOpen: false,
			customer: null,
		});
	};

	const formatCPF = (cpf: string): string => {
		// Add formatting to CPF for display
		return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
	};

	const formatPhone = (phone: string): string => {
		// Remove any existing formatting
		const cleanPhone = phone.replace(/\D/g, '');

		// Apply formatting based on length
		if (cleanPhone.length === 10) {
			return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
		} else if (cleanPhone.length === 11) {
			return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
		}

		return phone; // Return original if it doesn't match expected patterns
	};

	const formatDate = (date: Date): string => {
		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		}).format(new Date(date));
	};

	const columns: TableColumn<Customer>[] = [
		{
			key: 'name',
			title: 'Name',
			sortable: true,
		},
		{
			key: 'email',
			title: 'Email',
			sortable: true,
		},
		{
			key: 'phone',
			title: 'Phone',
			sortable: false,
			render: (value: string) => formatPhone(value),
		},
		{
			key: 'cpf',
			title: 'CPF',
			sortable: false,
			render: (value: string) => formatCPF(value),
		},
		{
			key: 'address',
			title: 'City',
			sortable: true,
			render: (value: Customer['address']) => value?.city || '-',
		},
		{
			key: 'createdAt',
			title: 'Created',
			sortable: true,
			render: (value: Date) => formatDate(value),
		},
		{
			key: 'id',
			title: 'Actions',
			sortable: false,
			render: (_value: string, customer: Customer) => (
				<div className="flex space-x-2">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onEdit(customer);
						}}
						className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
						title="Edit customer"
					>
						<Edit className="w-4 h-4" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleDeleteClick(customer);
						}}
						className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
						title="Delete customer"
					>
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			),
		},
	];

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<div className="flex items-center space-x-4">
				<div className="flex-1 relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search className="h-5 w-5 text-gray-400" />
					</div>
					<Input
						type="text"
						placeholder="Search customers by name, email, phone, CPF, or city..."
						value={searchQuery}
						onChange={setSearchQuery}
					/>
				</div>
			</div>

			{/* Results Summary */}
			{searchQuery && (
				<div className="text-sm text-gray-600">
					{filteredCustomers.length === 0 ? (
						<span>No customers found matching "{searchQuery}"</span>
					) : (
						<span>
							Found {filteredCustomers.length} customer
							{filteredCustomers.length !== 1 ? 's' : ''}
							{filteredCustomers.length !== customers.length &&
								` out of ${customers.length}`}
						</span>
					)}
				</div>
			)}

			{/* Customer Table */}
			<div className="bg-white shadow rounded-lg">
				<Table
					columns={columns}
					data={filteredCustomers}
					loading={loading}
					sortable={true}
					pagination={true}
					pageSize={10}
				/>
			</div>

			{/* Empty State */}
			{!loading && customers.length === 0 && (
				<div className="text-center py-12">
					<div className="mx-auto h-12 w-12 text-gray-400">
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1}
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					</div>
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						No customers
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						Get started by creating your first customer.
					</p>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={deleteModal.isOpen}
				customer={deleteModal.customer}
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
			/>
		</div>
	);
};
