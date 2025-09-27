// Core data types for the sales management system

export interface Product {
	id: string;
	code: string;
	name: string;
	price: number;
	unit: string;
	description?: string;
	stock: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Customer {
	id: string;
	name: string;
	email: string;
	phone: string;
	cpf: string;
	address?: Address;
	createdAt: Date;
	updatedAt: Date;
}

export interface Address {
	street: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
	zipCode: string;
}

export interface PreSaleItem {
	id: string;
	productCode: string;
	productName: string;
	price: number;
	quantity: number;
	subtotal: number;
}

export interface PreSale {
	id: string;
	items: PreSaleItem[];
	subtotal: number;
	discount: number;
	total: number;
	status: PreSaleStatus;
	createdAt: Date;
}

// Constants for status values and enums
export const PreSaleStatus = {
	DRAFT: 'draft',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
} as const;

export type PreSaleStatus = (typeof PreSaleStatus)[keyof typeof PreSaleStatus];

export const ProductUnit = {
	PIECE: 'pc',
	KILOGRAM: 'kg',
	GRAM: 'g',
	LITER: 'l',
	MILLILITER: 'ml',
	METER: 'm',
	CENTIMETER: 'cm',
	PACKAGE: 'pkg',
	BOX: 'box',
} as const;

export type ProductUnit = (typeof ProductUnit)[keyof typeof ProductUnit];

export const StockAdjustmentReason = {
	PURCHASE: 'purchase',
	SALE: 'sale',
	LOSS: 'loss',
	DAMAGE: 'damage',
	CORRECTION: 'correction',
	RETURN: 'return',
} as const;

export type StockAdjustmentReason =
	(typeof StockAdjustmentReason)[keyof typeof StockAdjustmentReason];

export const ReportType = {
	SALES: 'sales',
	INVENTORY: 'inventory',
	CUSTOMERS: 'customers',
} as const;

export type ReportType = (typeof ReportType)[keyof typeof ReportType];

// Additional interfaces for inventory and reports
export interface StockAdjustment {
	id: string;
	productId: string;
	quantity: number;
	reason: StockAdjustmentReason;
	notes?: string;
	createdAt: Date;
	createdBy: string;
}

export interface InventoryItem {
	product: Product;
	currentStock: number;
	minimumStock?: number;
	isLowStock: boolean;
	lastAdjustment?: StockAdjustment;
}

export interface SalesReport {
	id: string;
	dateRange: DateRange;
	totalSales: number;
	totalRevenue: number;
	topProducts: ProductSalesData[];
	salesByDate: DailySalesData[];
}

export interface ProductSalesData {
	product: Product;
	quantitySold: number;
	revenue: number;
}

export interface DailySalesData {
	date: string;
	sales: number;
	revenue: number;
}

export interface DateRange {
	startDate: Date;
	endDate: Date;
}

// Common UI component prop types
export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	children: React.ReactNode;
	loading?: boolean;
}

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
	value: string;
	onChange: (value: string) => void;
	error?: string;
	label?: string;
}

export interface TableColumn<T = any> {
	key: keyof T | 'actions';
	title: string;
	sortable?: boolean;
	render?: (value: any, record: T) => React.ReactNode;
}

export interface TableProps<T = any> {
	columns: TableColumn<T>[];
	data: T[];
	onRowClick?: (row: T) => void;
	loading?: boolean;
}

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

// Utility types for form handling
export interface FormField<T = string> {
	value: T;
	error?: string;
	touched?: boolean;
}

export interface ValidationRule<T = any> {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	custom?: (value: T) => string | undefined;
}

export interface FormState<T extends Record<string, any>> {
	values: T;
	errors: Partial<Record<keyof T, string>>;
	touched: Partial<Record<keyof T, boolean>>;
	isValid: boolean;
	isSubmitting: boolean;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

// Input types for forms (without id and timestamps)
export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type CustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type PreSaleInput = Omit<PreSale, 'id' | 'createdAt'>;

// API response types
export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface ApiError {
	code: string;
	message: string;
	details?: Record<string, any>;
}

// Loading and UI state types
export interface LoadingState {
	isLoading: boolean;
	error?: string;
}

export interface AsyncState<T> extends LoadingState {
	data?: T;
}

// Search and filter types
export interface SearchFilters {
	query?: string;
	category?: string;
	dateRange?: DateRange;
	status?: string;
}

export interface SortConfig {
	field: string;
	direction: 'asc' | 'desc';
}

export interface PaginationConfig {
	page: number;
	limit: number;
}

// Navigation and menu types
export interface MenuItem {
	id: string;
	label: string;
	icon?: string;
	path?: string;
	children?: MenuItem[];
	isActive?: boolean;
}

export interface BreadcrumbItem {
	label: string;
	path?: string;
}

// Notification types
export interface Notification {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
	duration?: number;
	createdAt: Date;
}

// User and authentication types
export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatar?: string;
}

export const UserRole = {
	ADMIN: 'admin',
	MANAGER: 'manager',
	SALES: 'sales',
	VIEWER: 'viewer',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthState {
	user?: User;
	isAuthenticated: boolean;
	isLoading: boolean;
}
