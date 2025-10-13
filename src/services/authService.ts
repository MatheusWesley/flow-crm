import { authDebugLog } from '../config/environment';
import type {
    LoginRequest,
    LoginResponse,
    RefreshTokenResponse,
    User,
} from '../types/api';
import { tokenStorage } from '../utils/tokenStorage';
import { httpClient } from './httpClient';

export class AuthService {
    private static instance: AuthService;

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Authenticate user with email and password
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            authDebugLog('Attempting login for user:', credentials.email);

            // Try with fetch first as a fallback
            const apiUrl = 'https://flow-crm-backend-58ub.onrender.com/api/auth/login';

            console.log('Making direct fetch request to:', apiUrl);

            const fetchResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            console.log('Fetch response status:', fetchResponse.status);

            if (!fetchResponse.ok) {
                throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
            }

            const responseData = await fetchResponse.json();
            console.log('Fetch response data:', responseData);

            // Handle response format from backend (wrapped in data property)
            const loginData = responseData.data as LoginResponse;

            const { token, refreshToken, user } = loginData;

            // Store tokens using the HTTP client's token manager
            // If refreshToken is not provided, use empty string as fallback
            httpClient.setAuthTokens(token, refreshToken || '');

            authDebugLog('Login successful for user:', user.email);

            return loginData;
        } catch (error) {
            authDebugLog('Login failed:', error);

            // If fetch fails, try with httpClient as fallback
            try {
                console.log('Fetch failed, trying with httpClient...');

                const response = await httpClient.post<LoginResponse>(
                    '/auth/login',
                    credentials,
                );

                // Handle response format from backend (wrapped in data property)
                const loginData = (response as any).data as LoginResponse;

                const { token, refreshToken, user } = loginData;

                // Store tokens using the HTTP client's token manager
                httpClient.setAuthTokens(token, refreshToken || '');

                authDebugLog('Login successful with httpClient for user:', user.email);

                return loginData;
            } catch (httpClientError) {
                authDebugLog('Both fetch and httpClient failed:', httpClientError);
                throw error; // Throw original fetch error
            }
        }
    }

    /**
     * Log out the current user
     */
    async logout(): Promise<void> {
        try {
            authDebugLog('Attempting logout');

            // Call the logout endpoint to invalidate the token on the server
            await httpClient.post('/auth/logout');

            authDebugLog('Server logout successful');
        } catch (error) {
            // Even if server logout fails, we should clear local tokens
            authDebugLog('Server logout failed, but clearing local tokens:', error);
        } finally {
            // Always clear local tokens
            httpClient.clearAuthTokens();

            // Dispatch logout event for components to react
            window.dispatchEvent(
                new CustomEvent('auth:logout', {
                    detail: { reason: 'user_initiated' },
                }),
            );

            authDebugLog('Local logout completed');
        }
    }

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<User> {
        try {
            authDebugLog('Fetching current user profile');

            const response = await httpClient.get<{ data: User }>('/auth/me');

            authDebugLog('User profile fetched successfully:', response.data.email);
            return response.data;
        } catch (error) {
            authDebugLog('Failed to fetch user profile:', error);
            throw error;
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(): Promise<string> {
        try {
            authDebugLog('Refreshing authentication token');

            const response =
                await httpClient.post<{ data: RefreshTokenResponse }>('/auth/refresh');

            const { token } = response.data;
            authDebugLog('Token refresh successful');
            return token;
        } catch (error) {
            authDebugLog('Token refresh failed:', error);

            // Clear tokens on refresh failure
            httpClient.clearAuthTokens();

            // Dispatch logout event
            window.dispatchEvent(
                new CustomEvent('auth:logout', {
                    detail: { reason: 'token_refresh_failed' },
                }),
            );

            throw error;
        }
    }

    /**
     * Check if user is currently authenticated
     */
    isAuthenticated(): boolean {
        const token = tokenStorage.getToken();

        if (!token) {
            return false;
        }

        try {
            // Parse JWT token to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            // Check if token is not expired
            const isValid = payload.exp > currentTime;

            authDebugLog('Token validation result:', {
                isValid,
                expiresAt: new Date(payload.exp * 1000),
            });

            return isValid;
        } catch (error) {
            authDebugLog('Token validation error:', error);
            return false;
        }
    }

    /**
     * Get current user from stored token (without API call)
     */
    getCurrentUserFromToken(): User | null {
        const token = tokenStorage.getToken();

        if (!token) {
            return null;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Extract user information from token payload
            if (payload.user) {
                return payload.user as User;
            }

            return null;
        } catch (error) {
            authDebugLog('Error extracting user from token:', error);
            return null;
        }
    }

    /**
     * Validate current session and refresh if needed
     */
    async validateSession(): Promise<boolean> {
        try {
            if (!this.isAuthenticated()) {
                authDebugLog('No valid token found');
                return false;
            }

            // Try to fetch current user to validate session
            await this.getCurrentUser();
            authDebugLog('Session validation successful');
            return true;
        } catch (error) {
            authDebugLog('Session validation failed:', error);

            // Clear invalid tokens
            httpClient.clearAuthTokens();

            return false;
        }
    }

    /**
     * Initialize authentication state on app startup
     */
    async initializeAuth(): Promise<User | null> {
        try {
            authDebugLog('Initializing authentication state');

            // Check if we have a token
            const token = tokenStorage.getToken();
            authDebugLog('Token found in storage:', token ? 'YES' : 'NO');

            if (!this.isAuthenticated()) {
                authDebugLog('No valid authentication found (token expired or missing)');
                return null;
            }

            authDebugLog('Token is valid, fetching user profile from server...');

            // Validate session with server
            const user = await this.getCurrentUser();
            authDebugLog('Authentication initialized successfully', { userId: user.id, email: user.email });
            return user;
        } catch (error) {
            authDebugLog('Authentication initialization failed:', error);
            authDebugLog('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });

            // Clear invalid tokens
            httpClient.clearAuthTokens();

            return null;
        }
    }
}

// Export singleton instance
export const authService = AuthService.getInstance();
