import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';
import type { ApiResponse } from '@/types';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error: AxiosError<ApiResponse>) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            // Don't redirect if it's a login or register attempt
            const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

            if (typeof window !== 'undefined' && !isAuthRequest) {
                localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER_DATA);

                // Dispatch custom event for soft redirect
                window.dispatchEvent(new Event('auth:unauthorized'));
            }
        }

        // Extract error message
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Đã xảy ra lỗi, vui lòng thử lại';

        return Promise.reject(new Error(errorMessage));
    }
);

export default api;

// ============= API Methods =============

// Generic GET request
export async function get<T>(url: string, params?: any): Promise<T> {
    return api.get(url, { params });
}

// Generic POST request
export async function post<T>(url: string, data?: any): Promise<T> {
    const config = data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
    return api.post(url, data, config);
}

// Generic PUT request
export async function put<T>(url: string, data?: any): Promise<T> {
    // Handle FormData for file uploads
    const config = data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
    return api.put(url, data, config);
}

// Generic DELETE request
export async function del<T>(url: string): Promise<T> {
    return api.delete(url);
}

// Generic PATCH request
export async function patch<T>(url: string, data?: any): Promise<T> {
    return api.patch(url, data);
}

// Helper function to extract data from API response
// The interceptor returns response.data, but sometimes the backend wraps it in { data: ... }
export function extractData<T>(response: any): T {
    // If response has a data property, use it; otherwise use the response itself
    return response?.data !== undefined ? response.data : response;
}
