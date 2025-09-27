import { type Product, type ProductInput, ProductUnit } from '../types';

// Mock data
let mockProducts: Product[] = [
	{
		id: '1',
		code: 'PRD001',
		name: 'Wireless Headphones',
		price: 99.99,
		unit: ProductUnit.PIECE,
		description: 'High-quality wireless headphones with noise cancellation',
		stock: 25,
		createdAt: new Date('2024-01-15'),
		updatedAt: new Date('2024-01-15'),
	},
	{
		id: '2',
		code: 'PRD002',
		name: 'Coffee Beans',
		price: 12.5,
		unit: ProductUnit.KILOGRAM,
		description: 'Premium arabica coffee beans from Colombia',
		stock: 100,
		createdAt: new Date('2024-01-16'),
		updatedAt: new Date('2024-01-16'),
	},
	{
		id: '3',
		code: 'PRD003',
		name: 'Notebook',
		price: 3.99,
		unit: ProductUnit.PIECE,
		description: 'A5 lined notebook with hardcover',
		stock: 5, // Low stock
		createdAt: new Date('2024-01-17'),
		updatedAt: new Date('2024-01-17'),
	},
	{
		id: '4',
		code: 'PRD004',
		name: 'Olive Oil',
		price: 8.75,
		unit: ProductUnit.LITER,
		description: 'Extra virgin olive oil from Italy',
		stock: 0, // Out of stock
		createdAt: new Date('2024-01-18'),
		updatedAt: new Date('2024-01-18'),
	},
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const mockProductService = {
	// Get all products
	async getProducts(): Promise<Product[]> {
		await delay(300); // Simulate network delay
		return [...mockProducts];
	},

	// Get product by ID
	async getProductById(id: string): Promise<Product | null> {
		await delay(200);
		return mockProducts.find((product) => product.id === id) || null;
	},

	// Create new product
	async createProduct(productData: ProductInput): Promise<Product> {
		await delay(500);

		// Check if product code already exists
		const existingProduct = mockProducts.find(
			(p) => p.code === productData.code,
		);
		if (existingProduct) {
			throw new Error(`Product with code "${productData.code}" already exists`);
		}

		const newProduct: Product = {
			...productData,
			id: generateId(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockProducts.push(newProduct);
		return newProduct;
	},

	// Update existing product
	async updateProduct(id: string, productData: ProductInput): Promise<Product> {
		await delay(500);

		const productIndex = mockProducts.findIndex((p) => p.id === id);
		if (productIndex === -1) {
			throw new Error(`Product with ID "${id}" not found`);
		}

		// Check if product code already exists (excluding current product)
		const existingProduct = mockProducts.find(
			(p) => p.code === productData.code && p.id !== id,
		);
		if (existingProduct) {
			throw new Error(`Product with code "${productData.code}" already exists`);
		}

		const updatedProduct: Product = {
			...mockProducts[productIndex],
			...productData,
			updatedAt: new Date(),
		};

		mockProducts[productIndex] = updatedProduct;
		return updatedProduct;
	},

	// Delete product
	async deleteProduct(id: string): Promise<void> {
		await delay(300);

		const productIndex = mockProducts.findIndex((p) => p.id === id);
		if (productIndex === -1) {
			throw new Error(`Product with ID "${id}" not found`);
		}

		mockProducts.splice(productIndex, 1);
	},

	// Search products
	async searchProducts(query: string): Promise<Product[]> {
		await delay(200);

		if (!query.trim()) {
			return [...mockProducts];
		}

		const searchTerm = query.toLowerCase();
		return mockProducts.filter(
			(product) =>
				product.name.toLowerCase().includes(searchTerm) ||
				product.code.toLowerCase().includes(searchTerm) ||
				product.description?.toLowerCase().includes(searchTerm),
		);
	},

	// Get products with low stock
	async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
		await delay(200);
		return mockProducts.filter((product) => product.stock <= threshold);
	},

	// Update product stock
	async updateProductStock(id: string, newStock: number): Promise<Product> {
		await delay(300);

		const productIndex = mockProducts.findIndex((p) => p.id === id);
		if (productIndex === -1) {
			throw new Error(`Product with ID "${id}" not found`);
		}

		if (newStock < 0) {
			throw new Error('Stock cannot be negative');
		}

		mockProducts[productIndex] = {
			...mockProducts[productIndex],
			stock: newStock,
			updatedAt: new Date(),
		};

		return mockProducts[productIndex];
	},

	// Bulk update stock (for sales/purchases)
	async bulkUpdateStock(
		updates: { id: string; quantity: number }[],
	): Promise<Product[]> {
		await delay(400);

		const updatedProducts: Product[] = [];

		for (const update of updates) {
			const productIndex = mockProducts.findIndex((p) => p.id === update.id);
			if (productIndex === -1) {
				throw new Error(`Product with ID "${update.id}" not found`);
			}

			const newStock = mockProducts[productIndex].stock + update.quantity;
			if (newStock < 0) {
				throw new Error(
					`Insufficient stock for product "${mockProducts[productIndex].name}"`,
				);
			}

			mockProducts[productIndex] = {
				...mockProducts[productIndex],
				stock: newStock,
				updatedAt: new Date(),
			};

			updatedProducts.push(mockProducts[productIndex]);
		}

		return updatedProducts;
	},

	// Reset to initial data (for testing)
	resetData(): void {
		mockProducts = [
			{
				id: '1',
				code: 'PRD001',
				name: 'Wireless Headphones',
				price: 99.99,
				unit: ProductUnit.PIECE,
				description: 'High-quality wireless headphones with noise cancellation',
				stock: 25,
				createdAt: new Date('2024-01-15'),
				updatedAt: new Date('2024-01-15'),
			},
			{
				id: '2',
				code: 'PRD002',
				name: 'Coffee Beans',
				price: 12.5,
				unit: ProductUnit.KILOGRAM,
				description: 'Premium arabica coffee beans from Colombia',
				stock: 100,
				createdAt: new Date('2024-01-16'),
				updatedAt: new Date('2024-01-16'),
			},
			{
				id: '3',
				code: 'PRD003',
				name: 'Notebook',
				price: 3.99,
				unit: ProductUnit.PIECE,
				description: 'A5 lined notebook with hardcover',
				stock: 5,
				createdAt: new Date('2024-01-17'),
				updatedAt: new Date('2024-01-17'),
			},
			{
				id: '4',
				code: 'PRD004',
				name: 'Olive Oil',
				price: 8.75,
				unit: ProductUnit.LITER,
				description: 'Extra virgin olive oil from Italy',
				stock: 0,
				createdAt: new Date('2024-01-18'),
				updatedAt: new Date('2024-01-18'),
			},
		];
	},
};
