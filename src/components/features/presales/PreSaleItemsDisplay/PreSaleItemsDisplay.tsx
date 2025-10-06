import { Package } from 'lucide-react';
import type React from 'react';
import type { PreSaleItem } from '../../../../types';
import { formatCurrency } from '../../../../utils';

interface PreSaleItemsDisplayProps {
	items: PreSaleItem[];
}

const PreSaleItemsDisplay: React.FC<PreSaleItemsDisplayProps> = ({ items }) => {
	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-gray-500">
				<Package className="h-12 w-12 text-gray-300 mb-3" />
				<p className="text-sm">Nenhum item encontrado</p>
			</div>
		);
	}

	return (
		<div className="w-full">
			{/* Mobile Card Layout (< md) */}
			<div
				className="block md:hidden space-y-3"
				role="list"
				aria-label="Itens da pré-venda"
			>
				{items.map((item, index) => (
					<div
						key={item.id}
						className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 transition-shadow duration-200"
						role="listitem"
						tabIndex={0}
						aria-label={`Item ${index + 1}: ${item.product.name}, ${item.quantity} ${item.product.unit}, ${formatCurrency(item.totalPrice)}`}
					>
						<div className="flex justify-between items-start mb-3">
							<div className="flex-1 min-w-0">
								<h4 className="font-semibold text-gray-900 truncate">
									{item.product.name}
								</h4>
								<p className="text-sm text-gray-500 mt-1">
									Código: {item.product.code}
								</p>
							</div>
							<div className="ml-3 text-right">
								<p className="font-bold text-lg text-green-600 tabular-nums">
									{formatCurrency(item.totalPrice)}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-600">Quantidade:</span>
								<div className="mt-1">
									<span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
										{item.quantity} {item.product.unit}
									</span>
								</div>
							</div>
							<div className="text-right">
								<span className="text-gray-600">Preço Unit.:</span>
								<p className="font-medium tabular-nums mt-1">
									{formatCurrency(item.unitPrice)}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Desktop Table Layout (≥ md) */}
			<div className="hidden md:block">
				<div
					className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
					role="table"
					aria-label="Itens da pré-venda"
				>
					{/* Table Header */}
					<div
						className="bg-gray-50 px-6 py-3 border-b border-gray-200"
						role="rowgroup"
					>
						<div
							className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-700 uppercase tracking-wider"
							role="row"
						>
							<div className="col-span-5" role="columnheader" aria-sort="none">
								Produto
							</div>
							<div
								className="col-span-2 text-center"
								role="columnheader"
								aria-sort="none"
							>
								Quantidade
							</div>
							<div
								className="col-span-2 text-right"
								role="columnheader"
								aria-sort="none"
							>
								Preço Unit.
							</div>
							<div
								className="col-span-3 text-right"
								role="columnheader"
								aria-sort="none"
							>
								Total
							</div>
						</div>
					</div>

					{/* Table Body */}
					<div className="divide-y divide-gray-200" role="rowgroup">
						{items.map((item, index) => (
							<div
								key={item.id}
								className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 transition-colors duration-150 ${
									index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
								}`}
								role="row"
								tabIndex={0}
								aria-label={`Item ${index + 1}: ${item.product.name}, ${item.quantity} ${item.product.unit}, ${formatCurrency(item.totalPrice)}`}
							>
								{/* Product Info */}
								<div className="col-span-5 flex items-center min-w-0">
									<div className="flex-1 min-w-0">
										<h4 className="font-semibold text-gray-900 truncate">
											{item.product.name}
										</h4>
										<p className="text-sm text-gray-500 truncate">
											{item.product.code}
										</p>
									</div>
								</div>

								{/* Quantity */}
								<div className="col-span-2 flex items-center justify-center">
									<span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
										{item.quantity} {item.product.unit}
									</span>
								</div>

								{/* Unit Price */}
								<div className="col-span-2 flex items-center justify-end">
									<span className="font-medium tabular-nums text-gray-900">
										{formatCurrency(item.unitPrice)}
									</span>
								</div>

								{/* Total Price */}
								<div className="col-span-3 flex items-center justify-end">
									<span className="font-bold text-lg tabular-nums text-green-600">
										{formatCurrency(item.totalPrice)}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PreSaleItemsDisplay;
