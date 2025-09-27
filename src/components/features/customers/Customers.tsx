import { Plus, Users } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { customerService } from '../../../data/mockCustomerService';
import type { Customer, CustomerInput } from '../../../types';
import { Button } from '../../common/Button';
// import { Modal } from '../../common/Modal';
import { CustomerForm } from './CustomerForm';
import { CustomerList } from './CustomerList';

type ViewMode = 'list' | 'form';

interface FormState {
	mode: 'create' | 'edit';
	customer?: Customer;
}

interface NotificationState {
	show: boolean;
	type: 'success' | 'error';
	message: string;
}

export const Customers: React.FC = () => {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [formState, setFormState] = useState<FormState>({ mode: 'create' });
	const [notification, setNotification] = useState<NotificationState>({
		show: false,
		type: 'success',
		message: '',
	});

	// Load customers on component mount
	useEffect(() => {
		loadCustomers();
	}, []);

	const loadCustomers = async () => {
		try {
			setLoading(true);
			const data = await customerService.getCustomers();
			setCustomers(data);
		} catch (error) {
			console.error('Error loading customers:', error);
			showNotification('error', 'Failed to load customers');
		} finally {
			setLoading(false);
		}
	};

	const showNotification = (type: 'success' | 'error', message: string) => {
		setNotification({ show: true, type, message });
		setTimeout(() => {
			setNotification((prev) => ({ ...prev, show: false }));
		}, 5000);
	};

	const handleCreateCustomer = () => {
		setFormState({ mode: 'create' });
		setViewMode('form');
	};

	const handleEditCustomer = (customer: Customer) => {
		setFormState({ mode: 'edit', customer });
		setViewMode('form');
	};

	const handleDeleteCustomer = async (id: string) => {
		try {
			await customerService.deleteCustomer(id);
			setCustomers((prev) => prev.filter((c) => c.id !== id));
			showNotification('success', 'Customer deleted successfully');
		} catch (error) {
			console.error('Error deleting customer:', error);
			showNotification('error', 'Failed to delete customer');
		}
	};

	const handleSaveCustomer = async (customerData: CustomerInput) => {
		try {
			if (formState.mode === 'create') {
				const newCustomer = await customerService.createCustomer(customerData);
				setCustomers((prev) => [newCustomer, ...prev]);
				showNotification('success', 'Customer created successfully');
			} else if (formState.mode === 'edit' && formState.customer) {
				const updatedCustomer = await customerService.updateCustomer(
					formState.customer.id,
					customerData,
				);
				setCustomers((prev) =>
					prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)),
				);
				showNotification('success', 'Customer updated successfully');
			}

			setViewMode('list');
			setFormState({ mode: 'create' });
		} catch (error) {
			console.error('Error saving customer:', error);
			showNotification('error', 'Failed to save customer');
		}
	};

	const handleCancelForm = () => {
		setViewMode('list');
		setFormState({ mode: 'create' });
	};

	const dismissNotification = () => {
		setNotification((prev) => ({ ...prev, show: false }));
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<Users className="h-8 w-8 text-blue-600" />
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							{viewMode === 'list'
								? 'Customers'
								: formState.mode === 'create'
									? 'New Customer'
									: 'Edit Customer'}
						</h1>
						<p className="text-sm text-gray-500">
							{viewMode === 'list'
								? 'Manage your customer database'
								: formState.mode === 'create'
									? 'Add a new customer to your database'
									: 'Update customer information'}
						</p>
					</div>
				</div>

				{viewMode === 'list' && (
					<Button
						variant="primary"
						onClick={handleCreateCustomer}
						className="flex items-center space-x-2"
					>
						<Plus className="h-4 w-4" />
						<span>Add Customer</span>
					</Button>
				)}
			</div>

			{/* Content */}
			<div className="bg-white shadow rounded-lg">
				{viewMode === 'list' ? (
					<div className="p-6">
						<CustomerList
							customers={customers}
							onEdit={handleEditCustomer}
							onDelete={handleDeleteCustomer}
							loading={loading}
						/>
					</div>
				) : (
					<div className="p-6">
						<CustomerForm
							customer={formState.customer}
							onSave={handleSaveCustomer}
							onCancel={handleCancelForm}
						/>
					</div>
				)}
			</div>

			{/* Notification Toast */}
			{notification.show && (
				<div className="fixed top-4 right-4 z-50">
					<div
						className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
							notification.type === 'success'
								? 'bg-green-50 border-green-200'
								: 'bg-red-50 border-red-200'
						}`}
					>
						<div className="p-4">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									{notification.type === 'success' ? (
										<svg
											className="h-6 w-6 text-green-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									) : (
										<svg
											className="h-6 w-6 text-red-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									)}
								</div>
								<div className="ml-3 w-0 flex-1 pt-0.5">
									<p
										className={`text-sm font-medium ${
											notification.type === 'success'
												? 'text-green-900'
												: 'text-red-900'
										}`}
									>
										{notification.message}
									</p>
								</div>
								<div className="ml-4 flex-shrink-0 flex">
									<button
										className={`rounded-md inline-flex ${
											notification.type === 'success'
												? 'text-green-500 hover:text-green-600 focus:ring-green-600'
												: 'text-red-500 hover:text-red-600 focus:ring-red-600'
										} focus:outline-none focus:ring-2 focus:ring-offset-2`}
										onClick={dismissNotification}
									>
										<span className="sr-only">Close</span>
										<svg
											className="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
