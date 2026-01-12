import { post } from './api';
import { STORAGE_KEYS, ROUTES } from './constants';
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User,
    ApiResponse,
    UserRole,
} from '@/types';

// ============= Authentication Functions =============

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/auth/login', credentials);

    if (response.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    }

    return response;
}

export async function register(data: RegisterRequest): Promise<ApiResponse> {
    return post<ApiResponse>('/auth/register', data);
}

export async function logout(): Promise<void> {
    try {
        await post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        window.location.href = ROUTES.LOGIN;
    }
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<ApiResponse> {
    return put<ApiResponse>('/auth/change-password', {
        currentPassword,
        newPassword,
    });
}

// ============= Token Management =============

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

// ============= User Session =============

export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return null;

    try {
        return JSON.parse(userData);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

export function setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

// ============= Role-Based Access =============

export function hasRole(role: UserRole): boolean {
    const user = getCurrentUser();
    return user?.role === role;
}

export function hasAnyRole(roles: UserRole[]): boolean {
    const user = getCurrentUser();
    return user ? roles.includes(user.role) : false;
}

export function getDashboardRoute(role: UserRole): string {
    const dashboardRoutes: Record<UserRole, string> = {
        patient: ROUTES.PATIENT_DASHBOARD,
        doctor: ROUTES.DOCTOR_DASHBOARD,
        staff: ROUTES.STAFF_DASHBOARD,
        lab_nurse: ROUTES.LAB_DASHBOARD,
        admin: ROUTES.ADMIN_DASHBOARD,
    };

    return dashboardRoutes[role] || ROUTES.LOGIN;
}

export function getDefaultRoute(): string {
    const user = getCurrentUser();
    if (!user) return ROUTES.LOGIN;
    return getDashboardRoute(user.role);
}
