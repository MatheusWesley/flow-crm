import type { Customer, CustomerInput } from '../types';

// Mock customer data
const mockCustomers: Customer[] = [
	{
		id: '1',
		name: 'João Silva',
		email: 'joao.silva@email.com',
		phone: '11987654321',
		cpf: '12345678900',
		address: {
			street: 'Rua das Flores',
			number: '123',
			complement: 'Apto 45',
			neighborhood: 'Centro',
			city: 'São Paulo',
			state: 'SP',
			zipCode: '01234567',
		},
		createdAt: new Date('2024-01-15T10:30:00'),
		updatedAt: new Date('2024-01-15T10:30:00'),
	},
	{
		id: '2',
		name: 'Maria Santos',
		email: 'maria.santos@email.com',
		phone: '11876543210',
		cpf: '98765432100',
		address: {
			street: 'Avenida Paulista',
			number: '1000',
			neighborhood: 'Bela Vista',
			city: 'São Paulo',
			state: 'SP',
			zipCode: '01310100',
		},
		createdAt: new Date('2024-01-10T14:20:00'),
		updatedAt: new Date('2024-01-10T14:20:00'),
	},
	{
		id: '3',
		name: 'Pedro Oliveira',
		email: 'pedro.oliveira@email.com',
		phone: '11765432109',
		cpf: '11122233344',
		address: {
			street: 'Rua Augusta',
			number: '500',
			neighborhood: 'Consolação',
			city: 'São Paulo',
			state: 'SP',
			zipCode: '01305000',
		},
		createdAt: new Date('2024-01-20T09:15:00'),
		updatedAt: new Date('2024-01-20T09:15:00'),
	},
	{
		id: '4',
		name: 'Ana Costa',
		email: 'ana.costa@email.com',
		phone: '21987654321',
		cpf: '55566677788',
		address: {
			street: 'Rua Copacabana',
			number: '200',
			neighborhood: 'Copacabana',
			city: 'Rio de Janeiro',
			state: 'RJ',
			zipCode: '22070000',
		},
		createdAt: new Date('2024-01-25T16:45:00'),
		updatedAt: new Date('2024-01-25T16:45:00'),
	},
	{
		id: '5',
		name: 'Carlos Ferreira',
		email: 'carlos.ferreira@email.com',
		phone: '11654321098',
		cpf: '99988877766',
		createdAt: new Date('2024-02-01T11:00:00'),
		updatedAt: new Date('2024-02-01T11:00:00'),
	},
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate unique ID
const generateId = (): string => {
	return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export class MockCustomerService {
	private customers: Customer[] = [...mockCustomers];

	// Get all customers
	async getCustomers(): Promise<Customer[]> {
		await delay(300); // Simulate API delay
		return [...this.customers];
	}

	// Get customer by ID
	async getCustomerById(id: string): Promise<Customer | null> {
		await delay(200);
		const customer = this.customers.find((c) => c.id === id);
		return customer ? { ...customer } : null;
	}

	// Create new customer
	async createCustomer(customerData: CustomerInput): Promise<Customer> {
		await delay(500);

		const newCustomer: Customer = {
			id: generateId(),
			...customerData,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.customers.push(newCustomer);
		return { ...newCustomer };
	}

	// Update existing customer
	async updateCustomer(
		id: string,
		customerData: CustomerInput,
	): Promise<Customer> {
		await delay(500);

		const index = this.customers.findIndex((c) => c.id === id);
		if (index === -1) {
			throw new Error('Customer not found');
		}

		const updatedCustomer: Customer = {
			...this.customers[index],
			...customerData,
			updatedAt: new Date(),
		};

		this.customers[index] = updatedCustomer;
		return { ...updatedCustomer };
	}

	// Delete customer
	async deleteCustomer(id: string): Promise<void> {
		await delay(300);

		const index = this.customers.findIndex((c) => c.id === id);
		if (index === -1) {
			throw new Error('Customer not found');
		}

		this.customers.splice(index, 1);
	}

	// Search customers
	async searchCustomers(query: string): Promise<Customer[]> {
		await delay(200);

		if (!query.trim()) {
			return [...this.customers];
		}

		const searchTerm = query.toLowerCase();
		return this.customers.filter(
			(customer) =>
				customer.name.toLowerCase().includes(searchTerm) ||
				customer.email.toLowerCase().includes(searchTerm) ||
				customer.phone.includes(searchTerm) ||
				customer.cpf.includes(searchTerm) ||
				customer.address?.city?.toLowerCase().includes(searchTerm) ||
				customer.address?.state?.toLowerCase().includes(searchTerm),
		);
	}

	// Validate CPF (check if already exists)
	async validateCPF(cpf: string, excludeId?: string): Promise<boolean> {
		await delay(100);

		const cleanCPF = cpf.replace(/\D/g, '');
		const existingCustomer = this.customers.find(
			(c) => c.cpf.replace(/\D/g, '') === cleanCPF && c.id !== excludeId,
		);

		return !existingCustomer; // Returns true if CPF is available
	}

	// Validate email (check if already exists)
	async validateEmail(email: string, excludeId?: string): Promise<boolean> {
		await delay(100);

		const existingCustomer = this.customers.find(
			(c) =>
				c.email.toLowerCase() === email.toLowerCase() && c.id !== excludeId,
		);

		return !existingCustomer; // Returns true if email is available
	}

	// Get customer statistics
	async getCustomerStats(): Promise<{
		total: number;
		newThisMonth: number;
		byState: Record<string, number>;
	}> {
		await delay(200);

		const now = new Date();
		const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		const newThisMonth = this.customers.filter(
			(c) => new Date(c.createdAt) >= thisMonth,
		).length;

		const byState: Record<string, number> = {};
		this.customers.forEach((customer) => {
			const state = customer.address?.state || 'Unknown';
			byState[state] = (byState[state] || 0) + 1;
		});

		return {
			total: this.customers.length,
			newThisMonth,
			byState,
		};
	}
}

// Export singleton instance
export const customerService = new MockCustomerService();
