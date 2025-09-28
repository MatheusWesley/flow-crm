import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProductsPage from './ProductsPage';

describe('ProductsPage', () => {
	it('renders products page with tabs and content', () => {
		render(<ProductsPage />);
		expect(screen.getByText('Produtos')).toBeInTheDocument();
		expect(screen.getByText('Listagem')).toBeInTheDocument();
		expect(screen.getByText('Cadastro')).toBeInTheDocument();
		expect(screen.getByText('Produtos Cadastrados')).toBeInTheDocument();
	});
});
