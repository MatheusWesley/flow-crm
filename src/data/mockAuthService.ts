import type {
	AuditLog,
	AuthError,
	AuthUser,
	UserCredentials,
	UserPermissions,
} from '../types';
import { mockUserManagementService } from './mockUserManagementService';

// Local storage keys for authentication data
const AUTH_STORAGE_KEY = 'flowcrm_auth';
const AUDIT_LOGS_STORAGE_KEY = 'flowcrm_audit_logs';
const FAILED_ATTEMPTS_KEY = 'flowcrm_failed_attempts';
const LOCKOUT_KEY = 'flowcrm_lockout';

// Security constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15; // minutes

/**
 * Simulates a network delay for more realistic testing
 */
const delay = (ms: number = 800): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates a unique ID for audit logs
 */
const generateId = (): string => {
	return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

/**
 * Gets audit logs from localStorage
 */
const getStoredAuditLogs = (): AuditLog[] => {
	try {
		const storedLogs = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
		if (storedLogs) {
			const logs = JSON.parse(storedLogs) as AuditLog[];
			// Convert date strings back to Date objects
			return logs.map((log) => ({
				...log,
				createdAt: new Date(log.createdAt),
				updatedAt: new Date(log.updatedAt),
			}));
		}
	} catch (error) {
		console.warn('Failed to retrieve stored audit logs:', error);
	}
	return [];
};

/**
 * Saves audit logs to localStorage
 */
const saveAuditLogs = (logs: AuditLog[]): void => {
	try {
		localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
	} catch (error) {
		console.warn('Failed to save audit logs:', error);
	}
};

/**
 * Adds an audit log entry
 */
const addAuditLog = (
	userId: string,
	userName: string,
	action: AuditLog['action'],
	resource: string,
	resourceId?: string,
	details?: string,
): void => {
	const logs = getStoredAuditLogs();
	const newLog: AuditLog = {
		id: generateId(),
		userId,
		userName,
		action,
		resource,
		resourceId,
		details,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	logs.push(newLog);
	saveAuditLogs(logs);
};

/**
 * Gets failed login attempts for an email
 */
const getFailedAttempts = (email: string): number => {
	try {
		const attempts = localStorage.getItem(`${FAILED_ATTEMPTS_KEY}_${email}`);
		return attempts ? parseInt(attempts, 10) : 0;
	} catch {
		return 0;
	}
};

/**
 * Increments failed login attempts for an email
 */
const incrementFailedAttempts = (email: string): void => {
	const attempts = getFailedAttempts(email) + 1;
	localStorage.setItem(`${FAILED_ATTEMPTS_KEY}_${email}`, attempts.toString());

	// Set lockout if max attempts reached
	if (attempts >= MAX_FAILED_ATTEMPTS) {
		const lockoutUntil = new Date();
		lockoutUntil.setMinutes(lockoutUntil.getMinutes() + LOCKOUT_DURATION);
		localStorage.setItem(`${LOCKOUT_KEY}_${email}`, lockoutUntil.toISOString());
	}
};

/**
 * Clears failed login attempts for an email
 */
const clearFailedAttempts = (email: string): void => {
	localStorage.removeItem(`${FAILED_ATTEMPTS_KEY}_${email}`);
	localStorage.removeItem(`${LOCKOUT_KEY}_${email}`);
};

/**
 * Checks if an email is currently locked out
 */
const isLockedOut = (email: string): boolean => {
	try {
		const lockoutUntil = localStorage.getItem(`${LOCKOUT_KEY}_${email}`);
		if (!lockoutUntil) return false;

		const lockoutDate = new Date(lockoutUntil);
		const now = new Date();

		if (now < lockoutDate) {
			return true;
		} else {
			// Lockout expired, clear it
			clearFailedAttempts(email);
			return false;
		}
	} catch {
		return false;
	}
};

/**
 * Gets remaining lockout time in minutes
 */
const getRemainingLockoutTime = (email: string): number => {
	try {
		const lockoutUntil = localStorage.getItem(`${LOCKOUT_KEY}_${email}`);
		if (!lockoutUntil) return 0;

		const lockoutDate = new Date(lockoutUntil);
		const now = new Date();

		if (now < lockoutDate) {
			return Math.ceil((lockoutDate.getTime() - now.getTime()) / (1000 * 60));
		}

		return 0;
	} catch {
		return 0;
	}
};

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

		const email = credentials.email.toLowerCase();

		// Check if account is locked out
		if (isLockedOut(email)) {
			const remainingTime = getRemainingLockoutTime(email);
			const error: AuthError = {
				message: `Conta bloqueada devido a muitas tentativas de login falharam. Tente novamente em ${remainingTime} minutos.`,
				code: 'ACCOUNT_LOCKED',
			};

			// Log failed attempt
			addAuditLog(
				'unknown',
				email,
				'login',
				'auth',
				undefined,
				`Tentativa de login em conta bloqueada`
			);

			throw error;
		}

		// Get all users from the user management service
		const users = await mockUserManagementService.getAllUsers();

		// Find user by email
		const user = users.find((u) => u.email.toLowerCase() === email);

		// Validate credentials
		if (!user || user.password !== credentials.password) {
			// Increment failed attempts
			incrementFailedAttempts(email);

			// Log failed attempt
			addAuditLog(
				user?.id || 'unknown',
				user?.name || email,
				'login',
				'auth',
				undefined,
				`Tentativa de login falhada - credenciais inválidas`
			);

			const attempts = getFailedAttempts(email);
			const remainingAttempts = MAX_FAILED_ATTEMPTS - attempts;

			let message = 'Email ou senha inválidos';
			if (remainingAttempts <= 2 && remainingAttempts > 0) {
				message += `. Você tem ${remainingAttempts} tentativa(s) restante(s) antes do bloqueio.`;
			} else if (remainingAttempts <= 0) {
				message = `Conta bloqueada devido a muitas tentativas falhadas. Tente novamente em ${LOCKOUT_DURATION} minutos.`;
			}

			const error: AuthError = {
				message,
				code: 'INVALID_CREDENTIALS',
			};
			throw error;
		}

		// Check if user is active
		if (!user.isActive) {
			const error: AuthError = {
				message: 'Usuário inativo. Entre em contato com o administrador.',
				code: 'USER_INACTIVE',
			};

			// Log inactive user attempt
			addAuditLog(
				user.id,
				user.name,
				'login',
				'auth',
				undefined,
				`Tentativa de login com usuário inativo`
			);

			throw error;
		}

		// Clear failed attempts on successful login
		clearFailedAttempts(email);

		// Create authenticated user with login timestamp
		const authenticatedUser: AuthUser = {
			...user,
			lastLoginAt: new Date(),
		};

		// Store in localStorage for session persistence
		try {
			localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
			localStorage.setItem('flowcrm_last_activity', new Date().toISOString());
		} catch (error) {
			console.warn('Failed to store authentication data:', error);
		}

		// Log the successful login activity
		addAuditLog(
			user.id,
			user.name,
			'login',
			'auth',
			undefined,
			`Login realizado com sucesso`
		);

		return authenticatedUser;
	},

	/**
	 * Logs out the current user
	 * Clears authentication data from localStorage
	 */
	logout(): void {
		// Get current user for audit log
		const currentUser = this.getStoredUser();

		try {
			localStorage.removeItem(AUTH_STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear authentication data:', error);
		}

		// Log the logout activity
		if (currentUser) {
			addAuditLog(
				currentUser.id,
				currentUser.name,
				'logout',
				'auth',
				undefined,
				`Logout realizado`
			);
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

	/**
	 * Checks if the current user has a specific permission
	 * @param permission - Permission string in format "module.action" or "presales.action"
	 * @returns boolean indicating if user has the permission
	 */
	hasPermission(permission: string): boolean {
		const user = this.getStoredUser();
		if (!user) return false;

		const [module, action] = permission.split('.');

		if (module === 'modules') {
			return user.permissions.modules[action as keyof typeof user.permissions.modules] || false;
		}

		if (module === 'presales') {
			return user.permissions.presales[action as keyof typeof user.permissions.presales] || false;
		}

		return false;
	},

	/**
	 * Gets the current user's permissions
	 * @returns UserPermissions object or null if not authenticated
	 */
	getUserPermissions(): UserPermissions | null {
		const user = this.getStoredUser();
		return user ? user.permissions : null;
	},

	/**
	 * Logs user activity for audit purposes
	 * @param action - Action performed
	 * @param resource - Resource affected
	 * @param details - Additional details about the action
	 */
	logActivity(action: string, resource: string, details?: string): void {
		const user = this.getStoredUser();
		if (user) {
			addAuditLog(
				user.id,
				user.name,
				action as AuditLog['action'],
				resource,
				undefined,
				details
			);
		}
	},

	/**
	 * Checks if current user is an admin
	 * @returns boolean indicating if user is admin
	 */
	isAdmin(): boolean {
		const user = this.getStoredUser();
		return user?.userType === 'admin' || false;
	},

	/**
	 * Checks if current user is an employee
	 * @returns boolean indicating if user is employee
	 */
	isEmployee(): boolean {
		const user = this.getStoredUser();
		return user?.userType === 'employee' || false;
	},

	/**
	 * Checks if user can access a specific module
	 * @param module - Module name to check access for
	 * @returns boolean indicating if user can access the module
	 */
	canAccessModule(module: string): boolean {
		const user = this.getStoredUser();
		if (!user) return false;

		if (module === 'presales') {
			return user.permissions.presales.canCreate || user.permissions.presales.canViewOwn;
		}

		return user.permissions.modules[module as keyof typeof user.permissions.modules] || false;
	},
};

export default mockAuthService;
