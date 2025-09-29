// Simplified core data types for the sales management system

// Base entity interface
export interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

// Basic entity interfaces for future development
export interface Product extends BaseEntity {
	name: string;
	code: string;
	unit: string;
	description?: string;
	stock: number;
	saleType: 'unit' | 'fractional';
	purchasePrice: number;
	salePrice: number;
	suggestedSalePrice?: number;
	category?: string;
}

// Tipos auxiliares para cálculo de preços
export interface PriceCalculation {
	purchasePrice: number;
	markupPercentage: number;
	suggestedPrice: number;
	finalPrice: number;
}

export interface SaleTypeOption {
	value: 'unit' | 'fractional';
	label: string;
	description: string;
}

export interface Customer extends BaseEntity {
	name: string;
	email: string;
	phone: string;
	cpf: string;
}

export interface PreSale extends BaseEntity {
	customer: Customer;
	items: PreSaleItem[];
	total: number;
	status: 'draft' | 'pending' | 'approved' | 'cancelled' | 'converted';
	notes?: string;
	discount?: number;
	discountType?: 'percentage' | 'fixed';
	salesperson?: string;
}

export interface PreSaleItem {
	id: string;
	product: Product;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
	discount?: number;
	notes?: string;
}

export interface StockAdjustment extends BaseEntity {
	productCode: string;
	productName: string;
	adjustmentType: 'add' | 'remove';
	quantity: number;
	reason: string;
	date: string;
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

export interface TableColumn<T = Record<string, unknown>> {
	key: keyof T | 'actions';
	title: string;
	sortable?: boolean;
	render?: (value: unknown, record: T) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
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

// Navigation and menu types
export interface MenuItem {
	id: string;
	label: string;
	icon?: string;
	path?: string;
	children?: MenuItem[];
	isActive?: boolean;
}

// Search and filter types
export interface SortConfig {
	field: string;
	direction: 'asc' | 'desc';
}

// User and authentication types
export interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	avatar?: string;
}

// Authentication credentials for login
export interface UserCredentials {
	email: string;
	password: string;
}

// Extended user type for authentication context
export interface AuthUser extends User {
	lastLoginAt?: Date;
}

// Authentication error type
export interface AuthError {
	message: string;
	code?: 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
}

// Authentication context type
export interface AuthContextType {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: AuthError | null;
	login: (credentials: UserCredentials) => Promise<void>;
	logout: () => void;
	clearError: () => void;
}

export interface AuthState {
	user?: User;
	isAuthenticated: boolean;
	isLoading: boolean;
}
