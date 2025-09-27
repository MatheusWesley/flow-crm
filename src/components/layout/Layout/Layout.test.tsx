import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../../../types';
import Layout from './Layout';

// Mock the child components
vi.mock('../Sidebar', () => ({
	default: ({ isCollapsed, onToggleCollapse, className }: any) => (
		<div data-testid="sidebar" className={className}>
			<button onClick={onToggleCollapse} data-testid="sidebar-toggle">
				{isCollapsed ? 'Expand' : 'Collapse'}
			</button>
		</div>
	),
}));

vi.mock('../Header', () => ({
	default: ({ title, user, onSearch, className }: any) => (
		<div data-testid="header" className={className}>
			<span data-testid="header-title">{title}</span>
			{user && <span data-testid="header-user">{user.name}</span>}
			{onSearch && (
				<button onClick={() => onSearch('test')} data-testid="header-search">
					Search
				</button>
			)}
		</div>
	),
}));

describe('Layout', () => {
	const mockUser: User = {
		id: '1',
		name: 'John Doe',
		email: 'john@example.com',
		role: 'admin',
	};

	const defaultProps = {
		children: <div data-testid="content">Test Content</div>,
	};

	// Mock window.innerWidth
	const mockInnerWidth = (width: number) => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: width,
		});
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Default to desktop size
		mockInnerWidth(1024);
	});

	afterEach(() => {
		// Clean up any event listeners
		window.removeEventListener('resize', vi.fn());
	});

	it('renders layout with children', () => {
		render(<Layout {...defaultProps} />);

		expect(screen.getByTestId('sidebar')).toBeInTheDocument();
		expect(screen.getByTestId('header')).toBeInTheDocument();
		expect(screen.getByTestId('content')).toBeInTheDocument();
	});

	it('renders with default title', () => {
		render(<Layout {...defaultProps} />);

		expect(screen.getByTestId('header-title')).toHaveTextContent('Dashboard');
	});

	it('renders with custom title', () => {
		render(<Layout {...defaultProps} title="Custom Title" />);

		expect(screen.getByTestId('header-title')).toHaveTextContent(
			'Custom Title',
		);
	});

	it('passes user to header when provided', () => {
		render(<Layout {...defaultProps} user={mockUser} />);

		expect(screen.getByTestId('header-user')).toHaveTextContent('John Doe');
	});

	it('passes onSearch to header when provided', () => {
		const mockOnSearch = vi.fn();
		render(<Layout {...defaultProps} onSearch={mockOnSearch} />);

		const searchButton = screen.getByTestId('header-search');
		fireEvent.click(searchButton);

		expect(mockOnSearch).toHaveBeenCalledWith('test');
	});

	it('toggles sidebar collapse on desktop', () => {
		render(<Layout {...defaultProps} />);

		const sidebarToggle = screen.getByTestId('sidebar-toggle');

		// Initially not collapsed
		expect(sidebarToggle).toHaveTextContent('Collapse');

		// Click to collapse
		fireEvent.click(sidebarToggle);

		expect(sidebarToggle).toHaveTextContent('Expand');
	});

	it('handles mobile responsive behavior', async () => {
		// Start with desktop
		render(<Layout {...defaultProps} />);

		// Initially not collapsed on desktop
		expect(screen.getByTestId('sidebar-toggle')).toHaveTextContent('Collapse');

		// Change to mobile size
		mockInnerWidth(600);
		fireEvent(window, new Event('resize'));

		await waitFor(() => {
			// On mobile, the sidebar should be collapsed (auto-collapsed)
			// But the mock doesn't update automatically, so let's check the CSS classes instead
			const sidebar = document.querySelector('.fixed.top-0.left-0');
			expect(sidebar).toHaveClass('-translate-x-full'); // Mobile sidebar hidden
		});
	});

	it('shows mobile overlay when sidebar is open on mobile', async () => {
		mockInnerWidth(600);
		render(<Layout {...defaultProps} />);

		// Trigger mobile sidebar open
		const sidebarToggle = screen.getByTestId('sidebar-toggle');
		fireEvent.click(sidebarToggle);

		await waitFor(() => {
			// Check if overlay exists (it should have the overlay classes)
			const overlay = document.querySelector('.bg-black.bg-opacity-50');
			expect(overlay).toBeInTheDocument();
		});
	});

	it('closes mobile sidebar when overlay is clicked', async () => {
		mockInnerWidth(600);
		render(<Layout {...defaultProps} />);

		// Open mobile sidebar
		const sidebarToggle = screen.getByTestId('sidebar-toggle');
		fireEvent.click(sidebarToggle);

		await waitFor(() => {
			const overlay = document.querySelector('.bg-black.bg-opacity-50');
			expect(overlay).toBeInTheDocument();
		});

		// Click overlay to close
		const overlay = document.querySelector('.bg-black.bg-opacity-50');
		fireEvent.click(overlay!);

		await waitFor(() => {
			const overlayAfter = document.querySelector('.bg-black.bg-opacity-50');
			expect(overlayAfter).not.toBeInTheDocument();
		});
	});

	it('applies custom className', () => {
		const { container } = render(
			<Layout {...defaultProps} className="custom-class" />,
		);

		expect(container.firstChild).toHaveClass('custom-class');
	});

	it('adjusts main content margin based on sidebar state', () => {
		render(<Layout {...defaultProps} />);

		const mainContent = document.querySelector('.transition-all.duration-300');
		expect(mainContent).toHaveClass('ml-64'); // Expanded sidebar

		// Collapse sidebar
		const sidebarToggle = screen.getByTestId('sidebar-toggle');
		fireEvent.click(sidebarToggle);

		expect(mainContent).toHaveClass('ml-16'); // Collapsed sidebar
	});

	it('sets main content margin to 0 on mobile', async () => {
		mockInnerWidth(600);
		render(<Layout {...defaultProps} />);

		await waitFor(() => {
			const mainContent = document.querySelector(
				'.transition-all.duration-300',
			);
			expect(mainContent).toHaveClass('ml-0'); // Mobile layout
		});
	});

	it('makes header sticky', () => {
		render(<Layout {...defaultProps} />);

		const header = screen.getByTestId('header');
		expect(header).toHaveClass('sticky', 'top-0');
	});

	it('wraps content in max-width container', () => {
		render(<Layout {...defaultProps} />);

		const contentContainer = document.querySelector('.max-w-7xl.mx-auto');
		expect(contentContainer).toBeInTheDocument();
		expect(contentContainer).toContainElement(screen.getByTestId('content'));
	});

	it('handles window resize events', async () => {
		render(<Layout {...defaultProps} />);

		// Start with desktop - sidebar should be visible
		const mainContent = document.querySelector('.transition-all.duration-300');
		expect(mainContent).toHaveClass('ml-64'); // Expanded sidebar margin

		// Resize to mobile
		mockInnerWidth(500);
		fireEvent(window, new Event('resize'));

		await waitFor(() => {
			// On mobile, main content should have no left margin
			expect(mainContent).toHaveClass('ml-0');
		});

		// Resize back to desktop
		mockInnerWidth(1200);
		fireEvent(window, new Event('resize'));

		await waitFor(() => {
			// Back to desktop, but sidebar should remain collapsed due to mobile auto-collapse
			expect(mainContent).toHaveClass('ml-16'); // Collapsed sidebar margin
		});
	});
});
