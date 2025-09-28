import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SimplifiedCustomers from './SimplifiedCustomers';

describe('SimplifiedCustomers', () => {
	it('renders customers development message', () => {
		render(<SimplifiedCustomers />);
		expect(screen.getByText('Clientes')).toBeInTheDocument();
		expect(screen.getByText('Página de clientes em desenvolvimento...')).toBeInTheDocument();
	});
});