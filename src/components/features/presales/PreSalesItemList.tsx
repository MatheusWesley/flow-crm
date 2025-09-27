import {
	CheckCircle,
	Package,
	Printer,
	ShoppingCart,
	Trash2,
} from 'lucide-react';
import type React from 'react';
import type { PreSaleItem } from '../../../types';
import { Button } from '../../common/Button';
import { Table } from '../../common/Table';

interface PreSalesItemListProps {
	items: PreSaleItem[];
	onRemoveItem: (itemId: string) => void;
	onPrint?: () => void;
	onFinalize?: () => void;
	discount?: number;
	className?: string;
}

export const PreSalesItemList: React.FC<PreSalesItemListProps> = ({
	items,
	onRemoveItem,
	onPrint,
	onFinalize,
	discount = 0,
	className = '',
}) => {
	// Calculate totals
	const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
	const discountAmount = (subtotal * discount) / 100;
	const total = subtotal - discountAmount;

	// Table columns configuration
	const columns = [
		{
			key: 'productCode' as keyof PreSaleItem,
			title: 'Code',
			sortable: false,
			render: (value: string) => (
				<div className="flex items-center">
					<Package className="h-4 w-4 text-gray-400 mr-2" />
					<span className="font-medium text-gray-900">{value}</span>
				</div>
			),
		},
		{
			key: 'productName' as keyof PreSaleItem,
			title: 'Product',
			sortable: false,
			render: (value: string) => <span className="text-gray-900">{value}</span>,
		},
		{
			key: 'price' as keyof PreSaleItem,
			title: 'Unit Price',
			sortable: false,
			render: (value: number) => (
				<span className="text-gray-900">${value.toFixed(2)}</span>
			),
		},
		{
			key: 'quantity' as keyof PreSaleItem,
			title: 'Quantity',
			sortable: false,
			render: (value: number) => <span className="text-gray-900">{value}</span>,
		},
		{
			key: 'subtotal' as keyof PreSaleItem,
			title: 'Subtotal',
			sortable: false,
			render: (value: number) => (
				<span className="font-medium text-gray-900">${value.toFixed(2)}</span>
			),
		},
		{
			key: 'actions' as keyof PreSaleItem,
			title: 'Actions',
			sortable: false,
			render: (_: any, record: PreSaleItem) => (
				<Button
					variant="danger"
					size="sm"
					onClick={() => onRemoveItem(record.id)}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			),
		},
	];

	// Empty state
	if (items.length === 0) {
		return (
			<div
				className={`bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`}
			>
				<ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					No Items Added
				</h3>
				<p className="text-gray-500 mb-4">
					Start by searching and adding products to your pre-sale
				</p>
				<div className="text-sm text-gray-400">
					Use the product search above to find and add items
				</div>
			</div>
		);
	}

	return (
		<div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
			{/* Header */}
			<div className="px-6 py-4 border-b border-gray-200">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
						<h3 className="text-lg font-medium text-gray-900">
							Pre-Sale Items ({items.length})
						</h3>
					</div>
					<div className="flex items-center space-x-2">
						{onPrint && (
							<Button
								variant="secondary"
								size="sm"
								onClick={onPrint}
								disabled={items.length === 0}
							>
								<Printer className="h-4 w-4 mr-2" />
								Print
							</Button>
						)}
						{onFinalize && (
							<Button
								variant="primary"
								size="sm"
								onClick={onFinalize}
								disabled={items.length === 0}
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								Finalize Sale
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Items Table */}
			<div className="overflow-x-auto">
				<Table columns={columns} data={items} loading={false} />
			</div>

			{/* Totals Section */}
			<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
				<div className="max-w-sm ml-auto">
					<div className="space-y-2">
						{/* Subtotal */}
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Subtotal:</span>
							<span className="font-medium text-gray-900">
								${subtotal.toFixed(2)}
							</span>
						</div>

						{/* Discount */}
						{discount > 0 && (
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Discount ({discount}%):</span>
								<span className="font-medium text-red-600">
									-${discountAmount.toFixed(2)}
								</span>
							</div>
						)}

						{/* Total */}
						<div className="flex justify-between text-lg font-semibold border-t border-gray-300 pt-2">
							<span className="text-gray-900">Total:</span>
							<span className="text-blue-600">${total.toFixed(2)}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Summary Stats */}
			<div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center space-x-4">
						<span className="text-blue-700">
							<strong>{items.length}</strong> item
							{items.length !== 1 ? 's' : ''}
						</span>
						<span className="text-blue-700">
							<strong>
								{items.reduce((sum, item) => sum + item.quantity, 0)}
							</strong>{' '}
							total quantity
						</span>
					</div>
					<div className="text-blue-700">
						Average:{' '}
						<strong>
							${items.length > 0 ? (total / items.length).toFixed(2) : '0.00'}
						</strong>{' '}
						per item
					</div>
				</div>
			</div>
		</div>
	);
};

export default PreSalesItemList;
