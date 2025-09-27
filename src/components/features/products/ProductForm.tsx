import type React from 'react';
import { useEffect, useState } from 'react';
import { type Product, type ProductInput, ProductUnit } from '../../../types';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';

interface ProductFormProps {
	product?: Product;
	onSave: (product: ProductInput) => void;
	onCancel: () => void;
}

interface FormData {
	code: string;
	name: string;
	price: string;
	unit: string;
	description: string;
	stock: string;
}

interface FormErrors {
	code?: string;
	name?: string;
	price?: string;
	unit?: string;
	stock?: string;
}

const UNIT_OPTIONS = [
	{ value: ProductUnit.PIECE, label: 'Piece (pc)' },
	{ value: ProductUnit.KILOGRAM, label: 'Kilogram (kg)' },
	{ value: ProductUnit.GRAM, label: 'Gram (g)' },
	{ value: ProductUnit.LITER, label: 'Liter (l)' },
	{ value: ProductUnit.MILLILITER, label: 'Milliliter (ml)' },
	{ value: ProductUnit.METER, label: 'Meter (m)' },
	{ value: ProductUnit.CENTIMETER, label: 'Centimeter (cm)' },
	{ value: ProductUnit.PACKAGE, label: 'Package (pkg)' },
	{ value: ProductUnit.BOX, label: 'Box (box)' },
];

export const ProductForm: React.FC<ProductFormProps> = ({
	product,
	onSave,
	onCancel,
}) => {
	const [formData, setFormData] = useState<FormData>({
		code: '',
		name: '',
		price: '',
		unit: ProductUnit.PIECE,
		description: '',
		stock: '0',
	});

	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Auto-generate product code
	const generateProductCode = (): string => {
		const timestamp = Date.now().toString().slice(-6);
		const random = Math.floor(Math.random() * 1000)
			.toString()
			.padStart(3, '0');
		return `PRD${timestamp}${random}`;
	};

	// Initialize form data
	useEffect(() => {
		if (product) {
			setFormData({
				code: product.code,
				name: product.name,
				price: product.price.toString(),
				unit: product.unit,
				description: product.description || '',
				stock: product.stock.toString(),
			});
		} else {
			// Auto-generate code for new products
			setFormData((prev) => ({
				...prev,
				code: generateProductCode(),
			}));
		}
	}, [product]);

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		// Required field validations
		if (!formData.name.trim()) {
			newErrors.name = 'Product name is required';
		}

		if (!formData.code.trim()) {
			newErrors.code = 'Product code is required';
		}

		if (!formData.price.trim()) {
			newErrors.price = 'Price is required';
		} else {
			const price = parseFloat(formData.price);
			if (isNaN(price) || price <= 0) {
				newErrors.price = 'Price must be a positive number';
			}
		}

		if (!formData.unit) {
			newErrors.unit = 'Unit is required';
		}

		if (!formData.stock.trim()) {
			newErrors.stock = 'Stock is required';
		} else {
			const stock = parseInt(formData.stock);
			if (isNaN(stock) || stock < 0) {
				newErrors.stock = 'Stock must be a non-negative number';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear error when user starts typing
		if (errors[field as keyof typeof errors]) {
			setErrors((prev) => ({
				...prev,
				[field]: undefined,
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			const productData: ProductInput = {
				code: formData.code.trim(),
				name: formData.name.trim(),
				price: parseFloat(formData.price),
				unit: formData.unit,
				description: formData.description.trim() || undefined,
				stock: parseInt(formData.stock),
			};

			await onSave(productData);
		} catch (error) {
			console.error('Error saving product:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGenerateNewCode = () => {
		const newCode = generateProductCode();
		handleInputChange('code', newCode);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Product Code */}
				<div className="space-y-2">
					<div className="flex gap-2">
						<Input
							id="product-code"
							type="text"
							label="Product Code"
							value={formData.code}
							onChange={(value) => handleInputChange('code', value)}
							error={errors.code}
							placeholder="Enter product code"
							required
						/>
						{!product && (
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={handleGenerateNewCode}
								className="whitespace-nowrap mt-6"
							>
								Generate
							</Button>
						)}
					</div>
				</div>

				{/* Product Name */}
				<div className="space-y-2">
					<Input
						id="product-name"
						type="text"
						label="Product Name"
						value={formData.name}
						onChange={(value) => handleInputChange('name', value)}
						error={errors.name}
						placeholder="Enter product name"
						required
					/>
				</div>

				{/* Price */}
				<div className="space-y-2">
					<Input
						id="product-price"
						type="number"
						label="Price"
						value={formData.price}
						onChange={(value) => handleInputChange('price', value)}
						error={errors.price}
						placeholder="0.00"
						required
					/>
				</div>

				{/* Unit */}
				<div className="space-y-2">
					<label
						htmlFor="product-unit"
						className="block text-sm font-medium text-gray-700"
					>
						Unit <span className="text-red-500 ml-1">*</span>
					</label>
					<select
						id="product-unit"
						value={formData.unit}
						onChange={(e) => handleInputChange('unit', e.target.value)}
						className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
							errors.unit ? 'border-red-500' : 'border-gray-300'
						}`}
						required
					>
						{UNIT_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					{errors.unit && <p className="text-sm text-red-600">{errors.unit}</p>}
				</div>

				{/* Stock */}
				<div className="space-y-2">
					<Input
						id="product-stock"
						type="number"
						label="Initial Stock"
						value={formData.stock}
						onChange={(value) => handleInputChange('stock', value)}
						error={errors.stock}
						placeholder="0"
						required
					/>
				</div>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<label
					htmlFor="product-description"
					className="block text-sm font-medium text-gray-700"
				>
					Description
				</label>
				<textarea
					id="product-description"
					value={formData.description}
					onChange={(e) => handleInputChange('description', e.target.value)}
					placeholder="Enter product description (optional)"
					rows={3}
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			{/* Form Actions */}
			<div className="flex justify-end space-x-3 pt-6 border-t">
				<Button
					type="button"
					variant="secondary"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					variant="primary"
					loading={isSubmitting}
					disabled={isSubmitting}
				>
					{product ? 'Update Product' : 'Create Product'}
				</Button>
			</div>
		</form>
	);
};
