import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SimplifiedPage from './SimplifiedPage';

describe('SimplifiedPage', () => {
	it('renders the title correctly', () => {
		render(<SimplifiedPage title="Test Page" />);
		expect(screen.getByText('Test Page')).toBeInTheDocument();
	});

	it('renders default development message', () => {
		render(<SimplifiedPage title="Test Page" />);
		expect(
			screen.getByText('Página em desenvolvimento...'),
		).toBeInTheDocument();
	});

	it('renders custom message when provided', () => {
		render(
			<SimplifiedPage title="Test Page" message="de teste em construção..." />,
		);
		expect(
			screen.getByText('Página de teste em construção...'),
		).toBeInTheDocument();
	});

	it('applies correct CSS classes', () => {
		render(<SimplifiedPage title="Test Page" />);
		const title = screen.getByText('Test Page');
		const container = title.closest('div');

		expect(title).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'mb-6');
		expect(container).toHaveClass('p-6');
	});
});
