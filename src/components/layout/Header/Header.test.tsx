import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../../../types';
import Header from './Header';

describe('Header', () => {
	const mockUser: User = {
		id: '1',
		name: 'John Doe',
		email: 'john@example.com',
		password: 'admin123',
		userType: 'admin',
		permissions: {
			modules: {
				products: true,
				customers: true,
				reports: true,
				paymentMethods: true,
				userManagement: true,
			},
			presales: {
				canCreate: true,
				canViewOwn: true,
				canViewAll: true,
			},
		},
		isActive: true,
		avatar: 'https://example.com/avatar.jpg',
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const defaultProps = {
		title: 'Dashboard',
		onSearch: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders header with title', () => {
		render(<Header {...defaultProps} />);

		expect(screen.getByText('Dashboard')).toBeInTheDocument();
	});

	it('renders search input', () => {
		render(<Header {...defaultProps} />);

		const searchInputs = screen.getAllByPlaceholderText(
			'Buscar produtos, clientes...',
		);
		expect(searchInputs).toHaveLength(2); // Desktop and mobile versions
		expect(searchInputs[0]).toBeInTheDocument();
	});

	it('handles search form submission', () => {
		render(<Header {...defaultProps} />);

		const searchInput = screen.getAllByPlaceholderText(
			'Buscar produtos, clientes...',
		)[0];
		const form = searchInput.closest('form');

		fireEvent.change(searchInput, { target: { value: 'test search' } });
		fireEvent.submit(form!);

		expect(defaultProps.onSearch).toHaveBeenCalledWith('test search');
	});

	it('does not call onSearch with empty query', () => {
		render(<Header {...defaultProps} />);

		const searchInput = screen.getAllByPlaceholderText(
			'Buscar produtos, clientes...',
		)[0];
		const form = searchInput.closest('form');

		fireEvent.change(searchInput, { target: { value: '   ' } });
		fireEvent.submit(form!);

		expect(defaultProps.onSearch).not.toHaveBeenCalled();
	});

	it('renders user information when user is provided', () => {
		render(<Header {...defaultProps} user={mockUser} />);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('admin')).toBeInTheDocument();
	});

	it('renders user avatar when provided', () => {
		render(<Header {...defaultProps} user={mockUser} />);

		const avatar = screen.getByAltText('John Doe');
		expect(avatar).toBeInTheDocument();
		expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
	});

	it('renders default user icon when no avatar is provided', () => {
		const userWithoutAvatar = { ...mockUser, avatar: undefined };
		render(<Header {...defaultProps} user={userWithoutAvatar} />);

		expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument();
		// Check for the default user icon container
		expect(screen.getByLabelText('User menu')).toBeInTheDocument();
	});

	it('toggles user menu when clicked', async () => {
		render(<Header {...defaultProps} user={mockUser} />);

		const userMenuButton = screen.getByLabelText('User menu');

		// Menu should not be visible initially
		expect(screen.queryByText('Perfil')).not.toBeInTheDocument();

		// Click to open menu
		fireEvent.click(userMenuButton);

		await waitFor(() => {
			expect(screen.getByText('Perfil')).toBeInTheDocument();
			expect(screen.getByText('Configurações')).toBeInTheDocument();
			expect(screen.getByText('Sair')).toBeInTheDocument();
		});

		// Click to close menu
		fireEvent.click(userMenuButton);

		await waitFor(() => {
			expect(screen.queryByText('Perfil')).not.toBeInTheDocument();
		});
	});

	it('closes user menu when menu item is clicked', async () => {
		render(<Header {...defaultProps} user={mockUser} />);

		const userMenuButton = screen.getByLabelText('User menu');

		// Open menu
		fireEvent.click(userMenuButton);

		await waitFor(() => {
			expect(screen.getByText('Perfil')).toBeInTheDocument();
		});

		// Click menu item
		fireEvent.click(screen.getByText('Perfil'));

		await waitFor(() => {
			expect(screen.queryByText('Perfil')).not.toBeInTheDocument();
		});
	});

	it('renders notifications button', () => {
		render(<Header {...defaultProps} />);

		expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
	});

	it('renders mobile search button', () => {
		render(<Header {...defaultProps} />);

		expect(screen.getByLabelText('Search')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(
			<Header {...defaultProps} className="custom-class" />,
		);

		expect(container.firstChild).toHaveClass('custom-class');
	});

	it('handles search input changes', () => {
		render(<Header {...defaultProps} />);

		const searchInput = screen.getAllByPlaceholderText(
			'Buscar produtos, clientes...',
		)[0];

		fireEvent.change(searchInput, { target: { value: 'new search' } });

		expect(searchInput).toHaveValue('new search');
	});

	it('renders both desktop and mobile search inputs', () => {
		render(<Header {...defaultProps} />);

		const searchInputs = screen.getAllByPlaceholderText(
			'Buscar produtos, clientes...',
		);
		expect(searchInputs).toHaveLength(2); // One for desktop, one for mobile
	});

	it('works without onSearch callback', () => {
		const propsWithoutSearch = { title: 'Dashboard' };
		render(<Header {...propsWithoutSearch} />);

		const searchInput = screen.getAllByPlaceholderText(
			'Buscar produtos, clientes...',
		)[0];
		const form = searchInput.closest('form');

		fireEvent.change(searchInput, { target: { value: 'test' } });

		// Should not throw error
		expect(() => fireEvent.submit(form!)).not.toThrow();
	});

	it('works without user', () => {
		render(<Header {...defaultProps} />);

		expect(screen.queryByLabelText('User menu')).not.toBeInTheDocument();
		expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
	});
});
