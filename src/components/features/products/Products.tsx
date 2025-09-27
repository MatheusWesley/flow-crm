import type React from 'react';
import { useCallback, useState } from 'react';
import type { Product, ProductInput } from '../../../types';
import { Modal } from '../../common/Modal';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';

interface ProductsProps {
	products: Product[];
	onSave: (product: ProductInput) => Promise<void>;
	onUpdate: (id: string, product: ProductInput) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	loading?: boolean;
}

type ViewMode = 'list' | 'add' | 'edit';

interface NotificationState {
	show: boolean;
	type: 'success' | 'error';
	message: string;
}

export const Products: React.FC<ProductsProps> = ({
	products,
	onSave,
	onUpdate,
	onDelete,
	loading = false,
}) => {
	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [, setIsSubmitting] = useState(false);
	const [notification, setNotification] = useState<NotificationState>({
		show: false,
		type: 'success',
		message: '',
	});

	// Show notification
	const showNotification = useCallback(
		(type: 'success' | 'error', message: string) => {
			setNotification({ show: true, type, message });
			setTimeout(() => {
				setNotification((prev) => ({ ...prev, show: false }));
			}, 5000);
		},
		[],
	);

	// Handle adding a new product
	const handleAdd = useCallback(() => {
		setEditingProduct(null);
		setViewMode('add');
	}, []);

	// Handle editing an existing product
	const handleEdit = useCallback((product: Product) => {
		setEditingProduct(product);
		setViewMode('edit');
	}, []);

	// Handle saving a product (create or update)
	const handleSave = useCallback(
		async (productData: ProductInput) => {
			setIsSubmitting(true);

			try {
				if (editingProduct) {
					// Update existing product
					await onUpdate(editingProduct.id, productData);
					showNotification(
						'success',
						`Product "${productData.name}" updated successfully!`,
					);
				} else {
					// Create new product
					await onSave(productData);
					showNotification(
						'success',
						`Product "${productData.name}" created successfully!`,
					);
				}

				// Return to list view
				setViewMode('list');
				setEditingProduct(null);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'An error occurred';
				showNotification('error', `Failed to save product: ${errorMessage}`);
			} finally {
				setIsSubmitting(false);
			}
		},
		[editingProduct, onSave, onUpdate, showNotification],
	);

	// Handle canceling form
	const handleCancel = useCallback(() => {
		setViewMode('list');
		setEditingProduct(null);
	}, []);

	// Handle deleting a product
	const handleDelete = useCallback(
		async (id: string) => {
			const product = products.find((p) => p.id === id);

			try {
				await onDelete(id);
				showNotification(
					'success',
					`Product "${product?.name || 'Unknown'}" deleted successfully!`,
				);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'An error occurred';
				showNotification('error', `Failed to delete product: ${errorMessage}`);
			}
		},
		[products, onDelete, showNotification],
	);

	// Render notification
	const renderNotification = () => {
		if (!notification.show) return null;

		return (
			<div className={`fixed top-4 right-4 z-50 max-w-sm w-full`}>
				<div
					className={`rounded-md p-4 shadow-lg ${
						notification.type === 'success'
							? 'bg-green-50 border border-green-200'
							: 'bg-red-50 border border-red-200'
					}`}
				>
					<div className="flex">
						<div className="flex-shrink-0">
							{notification.type === 'success' ? (
								<svg
									className="h-5 w-5 text-green-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
							) : (
								<svg
									className="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
							)}
						</div>
						<div className="ml-3">
							<p
								className={`text-sm font-medium ${
									notification.type === 'success'
										? 'text-green-800'
										: 'text-red-800'
								}`}
							>
								{notification.message}
							</p>
						</div>
						<div className="ml-auto pl-3">
							<div className="-mx-1.5 -my-1.5">
								<button
									type="button"
									className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
										notification.type === 'success'
											? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
											: 'text-red-500 hover:bg-red-100 focus:ring-red-600'
									}`}
									onClick={() =>
										setNotification((prev) => ({ ...prev, show: false }))
									}
								>
									<span className="sr-only">Dismiss</span>
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
		);
	};

	// Render form modal
	const renderFormModal = () => {
		if (viewMode === 'list') return null;

		return (
			<Modal
				isOpen={true}
				onClose={handleCancel}
				title={editingProduct ? 'Edit Product' : 'Add New Product'}
			>
				<ProductForm
					product={editingProduct || undefined}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</Modal>
		);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Main Content */}
				<ProductList
					products={products}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onAdd={handleAdd}
					loading={loading}
				/>

				{/* Form Modal */}
				{renderFormModal()}

				{/* Notification */}
				{renderNotification()}
			</div>
		</div>
	);
};
