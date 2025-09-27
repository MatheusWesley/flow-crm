import { AlertCircle, DollarSign, Hash, Package, Plus } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { PreSaleItem, Product } from '../../../types';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';

interface PreSalesFormProps {
	selectedProduct: Product | null;
	onAddItem: (item: PreSaleItem) => void;
	existingItems: PreSaleItem[];
	className?: string;
}

interface FormData {
	quantity: string;
	price: string;
	discount: string;
}

interface FormErrors {
	quantity?: string;
	price?: string;
	discount?: string;
	general?: string;
}

export const PreSalesForm: React.FC<PreSalesFormProps> = ({
	selectedProduct,
	onAddItem,
	existingItems,
	className = '',
}) => {
	const [formData, setFormData] = useState<FormData>({
		quantity: '1',
		price: '',
		discount: '0',
	});

	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Update price when product changes
	useEffect(() => {
		if (selectedProduct) {
			setFormData((prev) => ({
				...prev,
				price: selectedProduct.price.toString(),
			}));
			setErrors({});
		}
	}, [selectedProduct]);

	// Calculate subtotal and total
	const quantity = parseFloat(formData.quantity) || 0;
	const price = parseFloat(formData.price) || 0;
	const discount = parseFloat(formData.discount) || 0;
	const subtotal = quantity * price;
	const discountAmount = (subtotal * discount) / 100;
	const total = subtotal - discountAmount;

	// Validate form data
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!selectedProduct) {
			newErrors.general = 'Please select a product first';
			setErrors(newErrors);
			return false;
		}

		// Validate quantity
		if (!formData.quantity || quantity <= 0) {
			newErrors.quantity = 'Quantity must be greater than 0';
		} else if (quantity > selectedProduct.stock) {
			newErrors.quantity = `Only ${selectedProduct.stock} ${selectedProduct.unit} available in stock`;
		}

		// Validate price
		if (!formData.price || price <= 0) {
			newErrors.price = 'Price must be greater than 0';
		}

		// Validate discount
		if (discount < 0 || discount > 100) {
			newErrors.discount = 'Discount must be between 0 and 100%';
		}

		// Check if product already exists in items
		const existingItem = existingItems.find(
			(item) => item.productCode === selectedProduct.code,
		);
		if (existingItem) {
			const totalQuantity = existingItem.quantity + quantity;
			if (totalQuantity > selectedProduct.stock) {
				newErrors.quantity = `Total quantity would exceed stock. Current in cart: ${existingItem.quantity}, Available: ${selectedProduct.stock}`;
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Create new item
			const newItem: PreSaleItem = {
				id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				productCode: selectedProduct!.code,
				productName: selectedProduct!.name,
				price: price,
				quantity: quantity,
				subtotal: Math.round(total * 100) / 100, // Round to 2 decimal places
			};

			onAddItem(newItem);

			// Reset form
			setFormData({
				quantity: '1',
				price: selectedProduct!.price.toString(),
				discount: '0',
			});
			setErrors({});
		} catch (error) {
			setErrors({ general: 'Failed to add item. Please try again.' });
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle input changes
	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear specific field error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	// Reset form when no product is selected
	useEffect(() => {
		if (!selectedProduct) {
			setFormData({
				quantity: '1',
				price: '',
				discount: '0',
			});
			setErrors({});
		}
	}, [selectedProduct]);

	if (!selectedProduct) {
		return (
			<div
				className={`p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center ${className}`}
			>
				<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					No Product Selected
				</h3>
				<p className="text-gray-500">
					Search and select a product above to add it to your pre-sale
				</p>
			</div>
		);
	}

	return (
		<div
			className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
		>
			<div className="flex items-center mb-4">
				<Plus className="h-5 w-5 text-blue-600 mr-2" />
				<h3 className="text-lg font-medium text-gray-900">
					Add Item to Pre-Sale
				</h3>
			</div>

			{/* General Error */}
			{errors.general && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
					<div className="flex items-center">
						<AlertCircle className="h-4 w-4 text-red-500 mr-2" />
						<span className="text-sm text-red-700">{errors.general}</span>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Product Info Display */}
				<div className="bg-blue-50 border border-blue-200 rounded-md p-4">
					<div className="flex items-center justify-between">
						<div>
							<h4 className="font-medium text-blue-900">
								{selectedProduct.code} - {selectedProduct.name}
							</h4>
							<p className="text-sm text-blue-700 mt-1">
								Available: {selectedProduct.stock} {selectedProduct.unit}
							</p>
						</div>
						<div className="text-right">
							<div className="text-lg font-semibold text-blue-900">
								${selectedProduct.price.toFixed(2)}
							</div>
							<div className="text-sm text-blue-700">
								per {selectedProduct.unit}
							</div>
						</div>
					</div>
				</div>

				{/* Form Fields */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Quantity */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<Hash className="h-4 w-4 inline mr-1" />
							Quantity
						</label>
						<Input
							type="number"
							value={formData.quantity}
							onChange={(value) => handleInputChange('quantity', value)}
							error={errors.quantity}
							placeholder="Enter quantity"
							min="0.01"
							step="0.01"
						/>
					</div>

					{/* Unit Price */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<DollarSign className="h-4 w-4 inline mr-1" />
							Unit Price
						</label>
						<Input
							type="number"
							value={formData.price}
							onChange={(value) => handleInputChange('price', value)}
							error={errors.price}
							placeholder="Enter price"
							min="0.01"
							step="0.01"
						/>
					</div>

					{/* Discount */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Discount (%)
						</label>
						<Input
							type="number"
							value={formData.discount}
							onChange={(value) => handleInputChange('discount', value)}
							error={errors.discount}
							placeholder="0"
							min="0"
							max="100"
							step="0.01"
						/>
					</div>
				</div>

				{/* Calculation Preview */}
				<div className="bg-gray-50 border border-gray-200 rounded-md p-4">
					<h4 className="font-medium text-gray-900 mb-3">Item Preview</h4>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-600">Subtotal:</span>
							<span className="font-medium">${subtotal.toFixed(2)}</span>
						</div>
						{discount > 0 && (
							<div className="flex justify-between">
								<span className="text-gray-600">Discount ({discount}%):</span>
								<span className="font-medium text-red-600">
									-${discountAmount.toFixed(2)}
								</span>
							</div>
						)}
						<div className="flex justify-between border-t border-gray-300 pt-2">
							<span className="font-medium text-gray-900">Total:</span>
							<span className="font-semibold text-lg text-blue-600">
								${total.toFixed(2)}
							</span>
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<div className="flex justify-end">
					<Button
						type="submit"
						variant="primary"
						disabled={isSubmitting || !selectedProduct}
						loading={isSubmitting}
					>
						<Plus className="h-4 w-4 mr-2" />
						Add to Pre-Sale
					</Button>
				</div>
			</form>
		</div>
	);
};

export default PreSalesForm;
