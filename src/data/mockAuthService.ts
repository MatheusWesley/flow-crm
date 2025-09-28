import avatarPNG from '../assets/avatar.jpg';
import type { AuthError, AuthUser, UserCredentials } from '../types';

// Local storage key for authentication data
const AUTH_STORAGE_KEY = 'flowcrm_auth';

// Mock credentials - in a real app this would be handled by the backend
const VALID_CREDENTIALS = {
	email: 'admin@flowcrm.com',
	password: 'admin123',
};

// Mock user data that gets returned after successful login
const MOCK_AUTH_USER: AuthUser = {
	id: '1',
	name: 'Administrador',
	email: 'admin@flowcrm.com',
	role: 'admin',
	avatar: avatarPNG,
};

/**
 * Simulates a network delay for more realistic testing
 */
const delay = (ms: number = 800): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock authentication service
 * Simulates backend authentication with localStorage persistence
 */
export const mockAuthService = {
	/**
	 * Attempts to login with provided credentials
	 * @param credentials - User email and password
	 * @returns Promise that resolves with authenticated user or rejects with AuthError
	 */
	async login(credentials: UserCredentials): Promise<AuthUser> {
		// Simulate network delay
		await delay();

		// Validate credentials
		if (
			credentials.email !== VALID_CREDENTIALS.email ||
			credentials.password !== VALID_CREDENTIALS.password
		) {
			const error: AuthError = {
				message: 'Email ou senha inválidos',
				code: 'INVALID_CREDENTIALS',
			};
			throw error;
		}

		// Create authenticated user with login timestamp
		const authenticatedUser: AuthUser = {
			...MOCK_AUTH_USER,
			lastLoginAt: new Date(),
		};

		// Store in localStorage for session persistence
		try {
			localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
		} catch (error) {
			console.warn('Failed to store authentication data:', error);
		}

		return authenticatedUser;
	},

	/**
	 * Logs out the current user
	 * Clears authentication data from localStorage
	 */
	logout(): void {
		try {
			localStorage.removeItem(AUTH_STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear authentication data:', error);
		}
	},

	/**
	 * Retrieves stored user data from localStorage
	 * Used for session restoration on app initialization
	 * @returns AuthUser if valid session exists, null otherwise
	 */
	getStoredUser(): AuthUser | null {
		try {
			const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
			if (!storedData) {
				return null;
			}

			const user = JSON.parse(storedData) as AuthUser;

			// Basic validation of stored data
			if (!user.id || !user.email || !user.name) {
				console.warn('Invalid stored user data, clearing...');
				localStorage.removeItem(AUTH_STORAGE_KEY);
				return null;
			}

			// Convert lastLoginAt string back to Date if it exists
			if (user.lastLoginAt && typeof user.lastLoginAt === 'string') {
				user.lastLoginAt = new Date(user.lastLoginAt);
			}

			return user;
		} catch (error) {
			console.warn('Failed to retrieve stored user data:', error);
			// Clear corrupted data
			try {
				localStorage.removeItem(AUTH_STORAGE_KEY);
			} catch (clearError) {
				console.warn('Failed to clear corrupted data:', clearError);
			}
			return null;
		}
	},

	/**
	 * Checks if there's a valid stored session
	 * @returns boolean indicating if user is authenticated
	 */
	isAuthenticated(): boolean {
		return this.getStoredUser() !== null;
	},
};

export default mockAuthService;
