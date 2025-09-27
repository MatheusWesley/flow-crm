import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { Product, TableColumn } from '../../../types';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { Modal } from '../../common/Modal';
import { Table } from '../../common/Table';

interface ProductListProps {
	products: Product[];
	onEdit: (product: Product) => void;
	onDelete: (id: string) => void;
	onAdd: () => void;
	loading?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
	products,
	onEdit,
	onDelete,
	onAdd,
	loading = false,
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [productToDelete, setProductToDelete] = useState<Product | null>(null);

	// Filter products based on search query
	const filteredProducts = useMemo(() => {
		if (!searchQuery.trim()) {
			return products;
		}

		const query = searchQuery.toLowerCase();
		return products.filter(
			(product) =>
				product.name.toLowerCase().includes(query) ||
				product.code.toLowerCase().includes(query) ||
				product.description?.toLowerCase().includes(query),
		);
	}, [products, searchQuery]);

	// Table columns configuration
	const columns: TableColumn<Product>[] = [
		{
			key: 'code',
			title: 'Code',
			sortable: true,
		},
		{
			key: 'name',
			title: 'Name',
			sortable: true,
		},
		{
			key: 'price',
			title: 'Price',
			sortable: true,
			render: (value: number) => `$${value.toFixed(2)}`,
		},
		{
			key: 'unit',
			title: 'Unit',
			sortable: true,
			render: (value: string) => value.toUpperCase(),
		},
		{
			key: 'stock',
			title: 'Stock',
			sortable: true,
			render: (value: number, _record: Product) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
						value <= 10
							? 'bg-red-100 text-red-800'
							: value <= 50
								? 'bg-yellow-100 text-yellow-800'
								: 'bg-green-100 text-green-800'
					}`}
				>
					{value}
				</span>
			),
		},
		{
			key: 'description',
			title: 'Description',
			render: (value: string | undefined) => (
				<span className="text-gray-600 truncate max-w-xs block">
					{value || 'No description'}
				</span>
			),
		},
		{
			key: 'actions',
			title: 'Actions',
			render: (_, record: Product) => (
				<div className="flex space-x-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={() => onEdit(record)}
						className="p-1"
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="danger"
						size="sm"
						onClick={() => handleDeleteClick(record)}
						className="p-1"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	const handleDeleteClick = (product: Product) => {
		setProductToDelete(product);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = () => {
		if (productToDelete) {
			onDelete(productToDelete.id);
			setDeleteModalOpen(false);
			setProductToDelete(null);
		}
	};

	const handleCancelDelete = () => {
		setDeleteModalOpen(false);
		setProductToDelete(null);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">Products</h2>
					<p className="text-gray-600">
						Manage your product inventory ({filteredProducts.length} products)
					</p>
				</div>
				<Button
					variant="primary"
					onClick={onAdd}
					className="flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					Add Product
				</Button>
			</div>

			{/* Search */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1 max-w-md">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							type="text"
							placeholder="Search products by name, code, or description..."
							value={searchQuery}
							onChange={setSearchQuery}
							className="pl-10"
						/>
					</div>
				</div>
			</div>

			{/* Products Table */}
			<div className="bg-white shadow-sm rounded-lg border">
				{filteredProducts.length === 0 && !loading ? (
					<div className="text-center py-12">
						<div className="text-gray-400 mb-4">
							<Search className="h-12 w-12 mx-auto" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{searchQuery ? 'No products found' : 'No products yet'}
						</h3>
						<p className="text-gray-600 mb-6">
							{searchQuery
								? 'Try adjusting your search criteria'
								: 'Get started by adding your first product'}
						</p>
						{!searchQuery && (
							<Button variant="primary" onClick={onAdd}>
								Add Product
							</Button>
						)}
					</div>
				) : (
					<Table columns={columns} data={filteredProducts} loading={loading} />
				)}
			</div>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={deleteModalOpen}
				onClose={handleCancelDelete}
				title="Delete Product"
			>
				<div className="space-y-4">
					<p className="text-gray-600">
						Are you sure you want to delete the product{' '}
						<span className="font-semibold text-gray-900">
							"{productToDelete?.name}"
						</span>
						? This action cannot be undone.
					</p>

					{productToDelete && productToDelete.stock > 0 && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
							<div className="flex">
								<div className="ml-3">
									<h3 className="text-sm font-medium text-yellow-800">
										Warning
									</h3>
									<div className="mt-2 text-sm text-yellow-700">
										This product has {productToDelete.stock} units in stock.
										Deleting it will remove all inventory records.
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="flex justify-end space-x-3 pt-4">
						<Button variant="secondary" onClick={handleCancelDelete}>
							Cancel
						</Button>
						<Button variant="danger" onClick={handleConfirmDelete}>
							Delete Product
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};
