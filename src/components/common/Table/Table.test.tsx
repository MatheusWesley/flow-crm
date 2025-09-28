import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Table from './Table';

const mockData = [
	{ id: 1, name: 'John Doe', email: 'john@example.com' },
	{ id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

const mockColumns = [
	{ key: 'name' as const, title: 'Name' },
	{ key: 'email' as const, title: 'Email' },
];

describe('Table Component', () => {
	it('renders basic table', () => {
		render(<Table columns={mockColumns} data={mockData} />);

		// Check headers
		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();

		// Check data
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('jane@example.com')).toBeInTheDocument();
	});

	it('shows empty state when no data', () => {
		render(<Table columns={mockColumns} data={[]} />);
		expect(screen.getByText('No data available')).toBeInTheDocument();
	});
});
