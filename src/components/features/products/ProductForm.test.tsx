import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Product, ProductUnit } from '../../../types';
import { ProductForm } from './ProductForm';

const mockProduct: Product = {
	id: '1',
	code: 'PRD001',
	name: 'Test Product',
	price: 10.99,
	unit: ProductUnit.PIECE,
	description: 'Test description',
	stock: 100,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe('ProductForm', () => {
	const mockOnSave = vi.fn();
	const mockOnCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders form fields correctly', () => {
		render(<ProductForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		expect(screen.getByLabelText(/product code/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/initial stock/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
	});

	it('auto-generates product code for new products', () => {
		render(<ProductForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const codeInput = screen.getByLabelText(
			/product code/i,
		) as HTMLInputElement;
		expect(codeInput.value).toMatch(/^PRD\d{9}$/);
	});

	it('populates form with existing product data', () => {
		render(
			<ProductForm
				product={mockProduct}
				onSave={mockOnSave}
				onCancel={mockOnCancel}
			/>,
		);

		expect(screen.getByDisplayValue('PRD001')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
		expect(screen.getByDisplayValue('10.99')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
		expect(screen.getByDisplayValue('100')).toBeInTheDocument();
	});

	it('validates required fields', async () => {
		render(<ProductForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Clear the auto-generated code and try to submit
		const codeInput = screen.getByLabelText(/product code/i);
		fireEvent.change(codeInput, { target: { value: '' } });

		const submitButton = screen.getByRole('button', {
			name: /create product/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/product code is required/i)).toBeInTheDocument();
			expect(screen.getByText(/product name is required/i)).toBeInTheDocument();
			expect(screen.getByText(/price is required/i)).toBeInTheDocument();
		});

		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it('validates price format', async () => {
		render(<ProductForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const priceInput = screen.getByLabelText(/price/i);
		fireEvent.change(priceInput, { target: { value: 'invalid' } });

		const submitButton = screen.getByRole('button', {
			name: /create product/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/price must be a positive number/i),
			).toBeInTheDocument();
		});

		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it('validates stock format', async () => {
		render(<ProductForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const stockInput = screen.getByLabelText(/initial stock/i);
		fireEvent.change(stockInput, { target: { value: '-5' } });

		const submitButton = screen.getByRole('button', {
			name: /create product/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/stock must be a non-negative number/i),
			).toBeInTheDocument();
		});

		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it('submits form with valid data', async () => {
		render(<ProductForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Fill in the form
		const nameInput = screen.getByLabelText(/product name/i);
		const priceInput = screen.getByLabelText(/price/i);
		const stockInput = screen.getByLabelText(/initial stock/i);
		const descriptionInput = screen.getByLabelText(/description/i);

		fireEvent.change(nameInput, { target: { value: 'New Product' } });
		fireEvent.change(priceInput, { target: { value: '15.99' } });
		fireEvent.change(stockInput, { target: { value: '50' } });
		fireEvent.change(descriptionInput, {
			target: { value: 'New description' },
		});

		const submitButton = screen.getByRole('button', {
			name: /create product/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith({
				code: expect.stringMatching(/^PRD\d{9}$/),
				name: 'New Product',
				price: 15.99,
				unit: ProductUnit.PIECE,
				description: 'New description',
				stock: 50,
			});
		});
	});

	it('generates new product code when button is clicked', () => {
		render(<ProductForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const codeInput = screen.getByLabelText(
			/product code/i,
		) as HTMLInputElement;
		const originalCode = codeInput.value;

		const generateButton = screen.getByRole('button', { name: /generate/i });
		fireEvent.click(generateButton);

		expect(codeInput.value).not.toBe(originalCode);
		expect(codeInput.value).toMatch(/^PRD\d{9}$/);
	});

	it('calls onCancel when cancel button is clicked', () => {
		render(<ProductForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		const cancelButton = screen.getByRole('button', { name: /cancel/i });
		fireEvent.click(cancelButton);

		expect(mockOnCancel).toHaveBeenCalled();
	});

	it('clears errors when user starts typing', async () => {
		render(<ProductForm onSave={mockOnSave} onCancel={mockOnCancel} />);

		// Clear name field and submit to trigger error
		const nameInput = screen.getByLabelText(/product name/i);
		fireEvent.change(nameInput, { target: { value: '' } });

		const submitButton = screen.getByRole('button', {
			name: /create product/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/product name is required/i)).toBeInTheDocument();
		});

		// Start typing to clear error
		fireEvent.change(nameInput, { target: { value: 'New' } });

		await waitFor(() => {
			expect(
				screen.queryByText(/product name is required/i),
			).not.toBeInTheDocument();
		});
	});
});
