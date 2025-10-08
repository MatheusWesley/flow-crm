import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../types';
import { usePermissions } from './usePermissions';

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
	useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe('usePermissions', () => {
	const mockAdminUser: AuthUser = {
		id: '1',
		name: 'Admin User',
		email: 'admin@test.com',
		password: 'hashedpassword',
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
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const mockEmployeeUser: AuthUser = {
		id: '2',
		name: 'Employee User',
		email: 'employee@test.com',
		password: 'hashedpassword',
		userType: 'employee',
		permissions: {
			modules: {
				products: true,
				customers: true,
				reports: false,
				paymentMethods: false,
				userManagement: false,
			},
			presales: {
				canCreate: true,
				canViewOwn: true,
				canViewAll: false,
			},
		},
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	it('should return admin permissions for admin user', () => {
		mockUseAuth.mockReturnValue({
			user: mockAdminUser,
			isAuthenticated: true,
			isLoading: false,
			error: null,
			login: vi.fn(),
			logout: vi.fn(),
			clearError: vi.fn(),
			permissions: mockAdminUser.permissions,
			hasPermission: vi.fn(),
			isAdmin: true,
			isEmployee: false,
		});

		const { result } = renderHook(() => usePermissions());

		expect(result.current.isAdmin()).toBe(true);
		expect(result.current.isEmployee()).toBe(false);
		expect(result.current.canAccessUserManagement()).toBe(true);
		expect(result.current.canViewAllPresales()).toBe(true);
		expect(result.current.hasPermission('modules.userManagement')).toBe(true);
	});

	it('should return employee permissions for employee user', () => {
		mockUseAuth.mockReturnValue({
			user: mockEmployeeUser,
			isAuthenticated: true,
			isLoading: false,
			error: null,
			login: vi.fn(),
			logout: vi.fn(),
			clearError: vi.fn(),
			permissions: mockEmployeeUser.permissions,
			hasPermission: vi.fn(),
			isAdmin: false,
			isEmployee: true,
		});

		const { result } = renderHook(() => usePermissions());

		expect(result.current.isAdmin()).toBe(false);
		expect(result.current.isEmployee()).toBe(true);
		expect(result.current.canAccessUserManagement()).toBe(false);
		expect(result.current.canViewAllPresales()).toBe(false);
		expect(result.current.canViewOwnPresales()).toBe(true);
		expect(result.current.hasPermission('modules.userManagement')).toBe(false);
		expect(result.current.hasPermission('modules.products')).toBe(true);
	});

	it('should return default permissions when no user is authenticated', () => {
		mockUseAuth.mockReturnValue({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			login: vi.fn(),
			logout: vi.fn(),
			clearError: vi.fn(),
			permissions: {
				modules: {
					products: false,
					customers: false,
					reports: false,
					paymentMethods: false,
					userManagement: false,
				},
				presales: {
					canCreate: false,
					canViewOwn: false,
					canViewAll: false,
				},
			},
			hasPermission: vi.fn(),
			isAdmin: false,
			isEmployee: false,
		});

		const { result } = renderHook(() => usePermissions());

		expect(result.current.isAdmin()).toBe(false);
		expect(result.current.isEmployee()).toBe(false);
		expect(result.current.canAccessUserManagement()).toBe(false);
		expect(result.current.canViewAllPresales()).toBe(false);
		expect(result.current.hasPermission('modules.products')).toBe(false);
	});

	it('should return correct navigation items for admin user', () => {
		mockUseAuth.mockReturnValue({
			user: mockAdminUser,
			isAuthenticated: true,
			isLoading: false,
			error: null,
			login: vi.fn(),
			logout: vi.fn(),
			clearError: vi.fn(),
			permissions: mockAdminUser.permissions,
			hasPermission: vi.fn(),
			isAdmin: true,
			isEmployee: false,
		});

		const { result } = renderHook(() => usePermissions());
		const navigationItems = result.current.getAccessibleNavigationItems();

		expect(navigationItems).toContain('dashboard');
		expect(navigationItems).toContain('presales');
		expect(navigationItems).toContain('products');
		expect(navigationItems).toContain('customers');
		expect(navigationItems).toContain('reports');
		expect(navigationItems).toContain('paymentMethods');
		expect(navigationItems).toContain('users');
	});

	it('should return limited navigation items for employee user', () => {
		mockUseAuth.mockReturnValue({
			user: mockEmployeeUser,
			isAuthenticated: true,
			isLoading: false,
			error: null,
			login: vi.fn(),
			logout: vi.fn(),
			clearError: vi.fn(),
			permissions: mockEmployeeUser.permissions,
			hasPermission: vi.fn(),
			isAdmin: false,
			isEmployee: true,
		});

		const { result } = renderHook(() => usePermissions());
		const navigationItems = result.current.getAccessibleNavigationItems();

		expect(navigationItems).toContain('dashboard');
		expect(navigationItems).toContain('presales');
		expect(navigationItems).toContain('products');
		expect(navigationItems).toContain('customers');
		expect(navigationItems).not.toContain('reports');
		expect(navigationItems).not.toContain('paymentMethods');
		expect(navigationItems).not.toContain('users');
	});

	it('should correctly check presale ownership permissions', () => {
		mockUseAuth.mockReturnValue({
			user: mockEmployeeUser,
			isAuthenticated: true,
			isLoading: false,
			error: null,
			login: vi.fn(),
			logout: vi.fn(),
			clearError: vi.fn(),
			permissions: mockEmployeeUser.permissions,
			hasPermission: vi.fn(),
			isAdmin: false,
			isEmployee: true,
		});

		const { result } = renderHook(() => usePermissions());

		// Employee can view their own presales
		expect(result.current.canViewPresale('2')).toBe(true);
		// Employee cannot view other users' presales
		expect(result.current.canViewPresale('1')).toBe(false);
	});
});
