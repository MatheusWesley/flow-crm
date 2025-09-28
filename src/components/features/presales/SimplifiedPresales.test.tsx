import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SimplifiedPresales from './SimplifiedPresales';

describe('SimplifiedPresales', () => {
	it('renders presales development message', () => {
		render(<SimplifiedPresales />);
		expect(screen.getByText('Pré-vendas')).toBeInTheDocument();
		expect(
			screen.getByText('Página de pré-vendas em desenvolvimento...'),
		).toBeInTheDocument();
	});
});
