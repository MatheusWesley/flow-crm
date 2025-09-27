import { AlertCircle, Package, Search } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { mockProductService } from '../../../data/mockProductService';
import type { Product } from '../../../types';

interface ProductSearchProps {
	onProductSelect: (product: Product) => void;
	selectedProduct?: Product | null;
	className?: string;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
	onProductSelect,
	selectedProduct,
	className = '',
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [suggestions, setSuggestions] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);

	const searchInputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	// Search for products based on query
	const searchProducts = async (query: string) => {
		if (!query.trim()) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const products = await mockProductService.searchProducts(query);
			setSuggestions(products);
			setShowSuggestions(true);
			setHighlightedIndex(-1);
		} catch (err) {
			setError('Failed to search products');
			setSuggestions([]);
			setShowSuggestions(false);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle input change with debouncing
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			searchProducts(searchQuery);
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery]);

	// Handle product selection
	const handleProductSelect = (product: Product) => {
		// Validate product availability
		if (product.stock <= 0) {
			setError(`Product "${product.name}" is out of stock`);
			return;
		}

		setSearchQuery(product.code);
		setShowSuggestions(false);
		setError(null);
		onProductSelect(product);
	};

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!showSuggestions || suggestions.length === 0) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				setHighlightedIndex((prev) =>
					prev < suggestions.length - 1 ? prev + 1 : 0,
				);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setHighlightedIndex((prev) =>
					prev > 0 ? prev - 1 : suggestions.length - 1,
				);
				break;
			case 'Enter':
				e.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
					handleProductSelect(suggestions[highlightedIndex]);
				}
				break;
			case 'Escape':
				setShowSuggestions(false);
				setHighlightedIndex(-1);
				break;
		}
	};

	// Handle click outside to close suggestions
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node) &&
				searchInputRef.current &&
				!searchInputRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Clear search
	const clearSearch = () => {
		setSearchQuery('');
		setSuggestions([]);
		setShowSuggestions(false);
		setError(null);
		onProductSelect(null as any);
	};

	return (
		<div className={`relative ${className}`}>
			{/* Search Input */}
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search className="h-5 w-5 text-gray-400" />
				</div>
				<input
					ref={searchInputRef}
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					onFocus={() => {
						if (suggestions.length > 0) {
							setShowSuggestions(true);
						}
					}}
					placeholder="Search product by code or name..."
					className={`
            block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm
            focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
				/>
				{searchQuery && (
					<button
						onClick={clearSearch}
						className="absolute inset-y-0 right-0 pr-3 flex items-center"
					>
						<span className="text-gray-400 hover:text-gray-600">×</span>
					</button>
				)}
				{isLoading && (
					<div className="absolute inset-y-0 right-8 flex items-center">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
					</div>
				)}
			</div>

			{/* Error Message */}
			{error && (
				<div className="mt-2 flex items-center text-sm text-red-600">
					<AlertCircle className="h-4 w-4 mr-1" />
					{error}
				</div>
			)}

			{/* Suggestions Dropdown */}
			{showSuggestions && suggestions.length > 0 && (
				<div
					ref={suggestionsRef}
					className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
				>
					{suggestions.map((product, index) => (
						<div
							key={product.id}
							onClick={() => handleProductSelect(product)}
							className={`
                px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0
                ${highlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'}
                ${product.stock <= 0 ? 'opacity-50' : ''}
              `}
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center">
										<Package className="h-4 w-4 text-gray-400 mr-2" />
										<span className="font-medium text-gray-900">
											{product.code}
										</span>
										{product.stock <= 0 && (
											<span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
												Out of Stock
											</span>
										)}
										{product.stock > 0 && product.stock <= 5 && (
											<span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
												Low Stock
											</span>
										)}
									</div>
									<div className="mt-1 text-sm text-gray-600">
										{product.name}
									</div>
									{product.description && (
										<div className="mt-1 text-xs text-gray-500">
											{product.description}
										</div>
									)}
								</div>
								<div className="ml-4 text-right">
									<div className="text-sm font-medium text-gray-900">
										${product.price.toFixed(2)}
									</div>
									<div className="text-xs text-gray-500">
										Stock: {product.stock} {product.unit}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* No Results */}
			{showSuggestions &&
				suggestions.length === 0 &&
				searchQuery.trim() &&
				!isLoading && (
					<div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
						<div className="px-4 py-3 text-sm text-gray-500 text-center">
							No products found for "{searchQuery}"
						</div>
					</div>
				)}

			{/* Selected Product Display */}
			{selectedProduct && (
				<div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center">
								<Package className="h-5 w-5 text-blue-600 mr-2" />
								<span className="font-medium text-blue-900">
									{selectedProduct.code} - {selectedProduct.name}
								</span>
							</div>
							{selectedProduct.description && (
								<div className="mt-1 text-sm text-blue-700">
									{selectedProduct.description}
								</div>
							)}
							<div className="mt-2 flex items-center space-x-4 text-sm">
								<span className="text-blue-700">
									Price:{' '}
									<span className="font-medium">
										${selectedProduct.price.toFixed(2)}
									</span>
								</span>
								<span className="text-blue-700">
									Stock:{' '}
									<span className="font-medium">
										{selectedProduct.stock} {selectedProduct.unit}
									</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductSearch;
