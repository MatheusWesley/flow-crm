import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { TableColumn } from '../../../types';
import Table from './Table';

interface TestData {
	id: number;
	name: string;
	email: string;
	age: number;
}

const mockData: TestData[] = [
	{ id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
	{ id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
	{ id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
];

const mockColumns: TableColumn<TestData>[] = [
	{ key: 'id', title: 'ID', sortable: true },
	{ key: 'name', title: 'Name', sortable: true },
	{ key: 'email', title: 'Email', sortable: false },
	{ key: 'age', title: 'Age', sortable: true },
];

describe('Table Component', () => {
	it('renders table with data', () => {
		render(<Table columns={mockColumns} data={mockData} />);

		// Check headers
		expect(screen.getByText('ID')).toBeInTheDocument();
		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('Age')).toBeInTheDocument();

		// Check data
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('jane@example.com')).toBeInTheDocument();
		expect(screen.getByText('35')).toBeInTheDocument();
	});

	it('shows loading state', () => {
		render(<Table columns={mockColumns} data={[]} loading />);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
		expect(document.querySelector('.animate-spin')).toBeInTheDocument(); // Loading spinner
	});

	it('shows empty state when no data', () => {
		render(<Table columns={mockColumns} data={[]} />);

		expect(screen.getByText('No data available')).toBeInTheDocument();
	});

	it('handles row click', async () => {
		const handleRowClick = vi.fn();
		const user = userEvent.setup();

		render(
			<Table
				columns={mockColumns}
				data={mockData}
				onRowClick={handleRowClick}
			/>,
		);

		const firstRow = screen.getByText('John Doe').closest('tr');
		await user.click(firstRow!);

		expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
	});

	it('sorts data when column header is clicked', async () => {
		const user = userEvent.setup();

		render(<Table columns={mockColumns} data={mockData} />);

		const nameHeader = screen.getByText('Name').closest('th');
		await user.click(nameHeader!);

		// After sorting by name ascending, Bob should be first
		const rows = screen.getAllByRole('row');
		expect(rows[1]).toHaveTextContent('Bob Johnson'); // First data row (index 1, header is 0)
	});

	it('toggles sort direction on repeated clicks', async () => {
		const user = userEvent.setup();

		render(<Table columns={mockColumns} data={mockData} />);

		const ageHeader = screen.getByText('Age').closest('th');

		// First click - ascending
		await user.click(ageHeader!);
		let rows = screen.getAllByRole('row');
		expect(rows[1]).toHaveTextContent('Jane Smith'); // Age 25, youngest first

		// Second click - descending
		await user.click(ageHeader!);
		rows = screen.getAllByRole('row');
		expect(rows[1]).toHaveTextContent('Bob Johnson'); // Age 35, oldest first
	});

	it('does not sort non-sortable columns', async () => {
		const user = userEvent.setup();

		render(<Table columns={mockColumns} data={mockData} />);

		const emailHeader = screen.getByText('Email').closest('th');
		await user.click(emailHeader!);

		// Data should remain in original order
		const rows = screen.getAllByRole('row');
		expect(rows[1]).toHaveTextContent('John Doe'); // Original first row
	});

	it('disables sorting when sortable prop is false', async () => {
		const user = userEvent.setup();

		render(<Table columns={mockColumns} data={mockData} sortable={false} />);

		const nameHeader = screen.getByText('Name').closest('th');
		await user.click(nameHeader!);

		// Data should remain in original order
		const rows = screen.getAllByRole('row');
		expect(rows[1]).toHaveTextContent('John Doe'); // Original first row
	});

	it('handles pagination', async () => {
		const largeData = Array.from({ length: 25 }, (_, i) => ({
			id: i + 1,
			name: `User ${i + 1}`,
			email: `user${i + 1}@example.com`,
			age: 20 + i,
		}));

		const user = userEvent.setup();

		render(<Table columns={mockColumns} data={largeData} pageSize={10} />);

		// Should show first 10 items
		expect(screen.getByText('User 1')).toBeInTheDocument();
		expect(screen.getByText('User 10')).toBeInTheDocument();
		expect(screen.queryByText('User 11')).not.toBeInTheDocument();

		// Navigate to next page
		const nextButton = screen.getByRole('button', { name: /next/i });
		await user.click(nextButton);

		expect(screen.getByText('User 11')).toBeInTheDocument();
		expect(screen.queryByText('User 1')).not.toBeInTheDocument();
	});

	it('disables pagination when pagination prop is false', () => {
		const largeData = Array.from({ length: 25 }, (_, i) => ({
			id: i + 1,
			name: `User ${i + 1}`,
			email: `user${i + 1}@example.com`,
			age: 20 + i,
		}));

		render(<Table columns={mockColumns} data={largeData} pagination={false} />);

		// Should show all items
		expect(screen.getByText('User 1')).toBeInTheDocument();
		expect(screen.getByText('User 25')).toBeInTheDocument();

		// Should not show pagination controls
		expect(screen.queryByText('Previous')).not.toBeInTheDocument();
		expect(screen.queryByText('Next')).not.toBeInTheDocument();
	});

	it('handles row selection', async () => {
		const handleSelectionChange = vi.fn();
		const user = userEvent.setup();

		render(
			<Table
				columns={mockColumns}
				data={mockData}
				selectable
				onSelectionChange={handleSelectionChange}
			/>,
		);

		// Should show checkboxes
		const checkboxes = screen.getAllByRole('checkbox');
		expect(checkboxes).toHaveLength(4); // 3 data rows + 1 select all

		// Select first row
		await user.click(checkboxes[1]); // First data row checkbox

		expect(handleSelectionChange).toHaveBeenCalledWith([mockData[0]]);
	});

	it('handles select all functionality', async () => {
		const handleSelectionChange = vi.fn();
		const user = userEvent.setup();

		render(
			<Table
				columns={mockColumns}
				data={mockData}
				selectable
				onSelectionChange={handleSelectionChange}
			/>,
		);

		const selectAllCheckbox = screen.getAllByRole('checkbox')[0]; // Header checkbox
		await user.click(selectAllCheckbox);

		expect(handleSelectionChange).toHaveBeenCalledWith(mockData);
	});

	it('renders custom cell content with render function', () => {
		const columnsWithRender: TableColumn<TestData>[] = [
			{ key: 'name', title: 'Name' },
			{
				key: 'email',
				title: 'Contact',
				render: (value, record) => (
					<a href={`mailto:${value}`} className="text-blue-600">
						{record.name} ({value})
					</a>
				),
			},
		];

		render(<Table columns={columnsWithRender} data={mockData} />);

		const customCell = screen.getByText('John Doe (john@example.com)');
		expect(customCell).toBeInTheDocument();
		expect(customCell.closest('a')).toHaveAttribute(
			'href',
			'mailto:john@example.com',
		);
	});

	it('shows pagination info correctly', () => {
		const largeData = Array.from({ length: 25 }, (_, i) => ({
			id: i + 1,
			name: `User ${i + 1}`,
			email: `user${i + 1}@example.com`,
			age: 20 + i,
		}));

		render(<Table columns={mockColumns} data={largeData} pageSize={10} />);

		// Check that pagination controls exist
		expect(screen.getByText('Previous')).toBeInTheDocument();
		expect(screen.getByText('Next')).toBeInTheDocument();

		// Check that pagination buttons exist by role
		const pageButtons = screen.getAllByRole('button');
		const pageNumberButtons = pageButtons.filter((button) =>
			['1', '2', '3'].includes(button.textContent || ''),
		);
		expect(pageNumberButtons.length).toBeGreaterThan(0);
	});

	it('prevents row click when clicking on checkbox', async () => {
		const handleRowClick = vi.fn();
		const user = userEvent.setup();

		render(
			<Table
				columns={mockColumns}
				data={mockData}
				onRowClick={handleRowClick}
				selectable
			/>,
		);

		const checkbox = screen.getAllByRole('checkbox')[1]; // First data row checkbox
		await user.click(checkbox);

		expect(handleRowClick).not.toHaveBeenCalled();
	});

	it('applies responsive classes', () => {
		render(<Table columns={mockColumns} data={mockData} />);

		const tableContainer = screen.getByRole('table').closest('div');
		expect(tableContainer).toHaveClass('overflow-x-auto');
	});

	it('handles empty columns array', () => {
		render(<Table columns={[]} data={mockData} />);

		expect(screen.getByText('No data available')).toBeInTheDocument();
	});
});
