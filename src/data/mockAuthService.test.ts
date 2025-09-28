import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserCredentials } from '../types';
import { mockAuthService } from './mockAuthService';

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

describe('mockAuthService', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
	});

	describe('login', () => {
		it('should authenticate with valid credentials', async () => {
			const validCredentials: UserCredentials = {
				email: 'admin@flowcrm.com',
				password: 'admin123',
			};

			const result = await mockAuthService.login(validCredentials);

			expect(result).toEqual({
				id: '1',
				name: 'Administrador',
				email: 'admin@flowcrm.com',
				role: 'admin',
				avatar: expect.any(String),
				lastLoginAt: expect.any(Date),
			});

			// Should store in localStorage
			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'flowcrm_auth',
				expect.stringContaining('"email":"admin@flowcrm.com"'),
			);
		});

		it('should reject with invalid email', async () => {
			const invalidCredentials: UserCredentials = {
				email: 'wrong@email.com',
				password: 'admin123',
			};

			await expect(mockAuthService.login(invalidCredentials)).rejects.toEqual({
				message: 'Email ou senha inválidos',
				code: 'INVALID_CREDENTIALS',
			});

			// Should not store in localStorage
			expect(localStorageMock.setItem).not.toHaveBeenCalled();
		});

		it('should reject with invalid password', async () => {
			const invalidCredentials: UserCredentials = {
				email: 'admin@flowcrm.com',
				password: 'wrongpassword',
			};

			await expect(mockAuthService.login(invalidCredentials)).rejects.toEqual({
				message: 'Email ou senha inválidos',
				code: 'INVALID_CREDENTIALS',
			});

			// Should not store in localStorage
			expect(localStorageMock.setItem).not.toHaveBeenCalled();
		});

		it('should handle localStorage errors gracefully', async () => {
			// Mock setItem to throw an error
			localStorageMock.setItem.mockImplementation(() => {
				throw new Error('Storage quota exceeded');
			});

			const validCredentials: UserCredentials = {
				email: 'admin@flowcrm.com',
				password: 'admin123',
			};

			// Should still return user even if localStorage fails
			const result = await mockAuthService.login(validCredentials);
			expect(result).toEqual(
				expect.objectContaining({
					email: 'admin@flowcrm.com',
				}),
			);
		});
	});

	describe('logout', () => {
		it('should remove auth data from localStorage', () => {
			mockAuthService.logout();

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('flowcrm_auth');
		});

		it('should handle localStorage errors gracefully', () => {
			// Mock removeItem to throw an error
			localStorageMock.removeItem.mockImplementation(() => {
				throw new Error('Storage error');
			});

			// Should not throw
			expect(() => mockAuthService.logout()).not.toThrow();
		});
	});

	describe('getStoredUser', () => {
		it('should return null when no data is stored', () => {
			localStorageMock.getItem.mockReturnValue(null);

			const result = mockAuthService.getStoredUser();

			expect(result).toBeNull();
			expect(localStorageMock.getItem).toHaveBeenCalledWith('flowcrm_auth');
		});

		it('should return user when valid data is stored', () => {
			const storedUser = {
				id: '1',
				name: 'Administrador',
				email: 'admin@flowcrm.com',
				role: 'admin',
				lastLoginAt: '2023-12-01T12:00:00.000Z',
			};

			localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser));

			const result = mockAuthService.getStoredUser();

			expect(result).toEqual({
				...storedUser,
				lastLoginAt: new Date('2023-12-01T12:00:00.000Z'),
			});
		});

		it('should return null and clear storage for invalid data', () => {
			const invalidData = { incomplete: 'data' };
			localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));

			const result = mockAuthService.getStoredUser();

			expect(result).toBeNull();
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('flowcrm_auth');
		});

		it('should handle corrupted JSON data', () => {
			localStorageMock.getItem.mockReturnValue('invalid json');

			const result = mockAuthService.getStoredUser();

			expect(result).toBeNull();
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('flowcrm_auth');
		});

		it('should handle localStorage access errors', () => {
			localStorageMock.getItem.mockImplementation(() => {
				throw new Error('Storage access denied');
			});

			const result = mockAuthService.getStoredUser();

			expect(result).toBeNull();
		});
	});

	describe('isAuthenticated', () => {
		it('should return true when valid user is stored', () => {
			const storedUser = {
				id: '1',
				name: 'Administrador',
				email: 'admin@flowcrm.com',
				role: 'admin',
			};

			localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser));

			expect(mockAuthService.isAuthenticated()).toBe(true);
		});

		it('should return false when no user is stored', () => {
			localStorageMock.getItem.mockReturnValue(null);

			expect(mockAuthService.isAuthenticated()).toBe(false);
		});

		it('should return false when invalid user data is stored', () => {
			localStorageMock.getItem.mockReturnValue('invalid json');

			expect(mockAuthService.isAuthenticated()).toBe(false);
		});
	});
});
