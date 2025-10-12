import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { config } from '../config';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * HTTP Client Service
 * Provides a configured axios instance with authentication and error handling
 */
class HttpClient {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: config.apiBaseUrl,
            timeout: 15000, // Reduced timeout for better UX - reports should load quickly
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor for authentication
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = tokenStorage.getToken();

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error) => {
                // Handle 401 errors by clearing token
                if (error.response?.status === 401) {
                    tokenStorage.removeToken();
                    // Optionally redirect to login
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.put<T>(url, data, config);
        return response.data;
    }

    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.delete<T>(url, config);
        return response.data;
    }

    // Authentication token management
    setAuthTokens(token: string, refreshToken: string): void {
        tokenStorage.setToken(token);
        if (refreshToken) {
            tokenStorage.setRefreshToken(refreshToken);
        }
    }

    clearAuthTokens(): void {
        tokenStorage.removeToken();
        tokenStorage.removeRefreshToken();
    }

    // Get the axios instance for advanced usage
    getInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}

// Export singleton instance
export const httpClient = new HttpClient();
export default httpClient;