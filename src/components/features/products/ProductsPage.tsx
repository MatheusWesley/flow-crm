import type React from 'react';
import { useEffect, useState } from 'react';
import { mockProductService } from '../../../data/mockProductService';
import type { Product, ProductInput } from '../../../types';
import { Products } from './Products';

const ProductsPage: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadProducts();
	}, []);

	const loadProducts = async () => {
		try {
			setLoading(true);
			const data = await mockProductService.getProducts();
			setProducts(data);
		} catch (error) {
			console.error('Error loading products:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async (product: ProductInput) => {
		try {
			const newProduct = await mockProductService.createProduct(product);
			setProducts((prev) => [...prev, newProduct]);
		} catch (error) {
			console.error('Error saving product:', error);
			throw error;
		}
	};

	const handleUpdate = async (id: string, product: ProductInput) => {
		try {
			const updatedProduct = await mockProductService.updateProduct(
				id,
				product,
			);
			setProducts((prev) =>
				prev.map((p) => (p.id === id ? updatedProduct : p)),
			);
		} catch (error) {
			console.error('Error updating product:', error);
			throw error;
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await mockProductService.deleteProduct(id);
			setProducts((prev) => prev.filter((p) => p.id !== id));
		} catch (error) {
			console.error('Error deleting product:', error);
			throw error;
		}
	};

	return (
		<Products
			products={products}
			onSave={handleSave}
			onUpdate={handleUpdate}
			onDelete={handleDelete}
			loading={loading}
		/>
	);
};

export default ProductsPage;
