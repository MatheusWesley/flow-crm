import type React from 'react';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
} from 'react';
import { mockAuthService } from '../data/mockAuthService';
import type {
	AuthContextType,
	AuthError,
	AuthUser,
	UserCredentials,
} from '../types';

// Auth state interface for reducer
interface AuthState {
	user: AuthUser | null;
	isLoading: boolean;
	error: AuthError | null;
	isInitialized: boolean;
}

// Auth actions for reducer
type AuthAction =
	| { type: 'INIT_START' }
	| { type: 'INIT_SUCCESS'; payload: AuthUser | null }
	| { type: 'LOGIN_START' }
	| { type: 'LOGIN_SUCCESS'; payload: AuthUser }
	| { type: 'LOGIN_ERROR'; payload: AuthError }
	| { type: 'LOGOUT' }
	| { type: 'CLEAR_ERROR' };

// Initial auth state
const initialState: AuthState = {
	user: null,
	isLoading: true,
	error: null,
	isInitialized: false,
};

// Auth reducer for state management
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
	switch (action.type) {
		case 'INIT_START':
			return {
				...state,
				isLoading: true,
				error: null,
			};

		case 'INIT_SUCCESS':
			return {
				...state,
				user: action.payload,
				isLoading: false,
				isInitialized: true,
				error: null,
			};

		case 'LOGIN_START':
			return {
				...state,
				isLoading: true,
				error: null,
			};

		case 'LOGIN_SUCCESS':
			return {
				...state,
				user: action.payload,
				isLoading: false,
				error: null,
			};

		case 'LOGIN_ERROR':
			return {
				...state,
				user: null,
				isLoading: false,
				error: action.payload,
			};

		case 'LOGOUT':
			return {
				...state,
				user: null,
				isLoading: false,
				error: null,
			};

		case 'CLEAR_ERROR':
			return {
				...state,
				error: null,
			};

		default:
			return state;
	}
};

// Create AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use AuthContext
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

// AuthProvider component props
interface AuthProviderProps {
	children: React.ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

	// Initialize auth state from localStorage on mount
	useEffect(() => {
		const initializeAuth = async () => {
			dispatch({ type: 'INIT_START' });

			try {
				// Small delay to show loading state
				await new Promise((resolve) => setTimeout(resolve, 300));

				const storedUser = mockAuthService.getStoredUser();
				dispatch({ type: 'INIT_SUCCESS', payload: storedUser });
			} catch (error) {
				console.error('Failed to initialize authentication:', error);
				dispatch({ type: 'INIT_SUCCESS', payload: null });
			}
		};

		initializeAuth();
	}, []);

	// Login function
	const login = useCallback(async (credentials: UserCredentials) => {
		dispatch({ type: 'LOGIN_START' });

		try {
			const user = await mockAuthService.login(credentials);
			dispatch({ type: 'LOGIN_SUCCESS', payload: user });
		} catch (error) {
			const authError: AuthError = error as AuthError;
			dispatch({ type: 'LOGIN_ERROR', payload: authError });
			throw authError; // Re-throw for component handling
		}
	}, []);

	// Logout function
	const logout = useCallback(() => {
		mockAuthService.logout();
		dispatch({ type: 'LOGOUT' });
	}, []);

	// Clear error function
	const clearError = useCallback(() => {
		dispatch({ type: 'CLEAR_ERROR' });
	}, []);

	// Computed values
	const isAuthenticated = state.user !== null;

	// Context value
	const contextValue: AuthContextType = {
		user: state.user,
		isAuthenticated,
		isLoading: state.isLoading,
		error: state.error,
		login,
		logout,
		clearError,
	};

	// Show loading screen during initialization
	if (!state.isInitialized) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
					<p className="text-gray-600">Carregando...</p>
				</div>
			</div>
		);
	}

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};

export default AuthContext;
