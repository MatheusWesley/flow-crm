import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PresalesPage from './PresalesPage';

describe('PresalesPage', () => {
	it('renders presales page with main elements', () => {
		render(<PresalesPage />);
		expect(screen.getByRole('heading', { name: 'Pré-vendas', level: 1 })).toBeInTheDocument();
		expect(screen.getByText('Nova Pré-venda')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Buscar por cliente ou ID...')).toBeInTheDocument();
		expect(screen.getByText('Todos os Status')).toBeInTheDocument();
	});

	it('displays mock pre-sales data', () => {
		render(<PresalesPage />);
		expect(screen.getByText('2 pré-vendas encontradas')).toBeInTheDocument();
		expect(screen.getByText('João Silva')).toBeInTheDocument();
		expect(screen.getByText('Maria Santos')).toBeInTheDocument();
	});

	it('shows different status colors and labels', () => {
		render(<PresalesPage />);
		// Check for status labels in the status badges
		const statusElements = screen.getAllByText('Pendente');
		expect(statusElements).toHaveLength(2); // One in filter, one in status badge
		const approvedElements = screen.getAllByText('Aprovada');
		expect(approvedElements).toHaveLength(2); // One in filter, one in status badge
	});
});
