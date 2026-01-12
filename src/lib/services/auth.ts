import { post, put } from '../api';
import type { ApiResponse, User, LoginRequest, RegisterRequest, AuthResponse, UserRole } from '@/types';
import { STORAGE_KEYS, ROUTES } from '../constants';

// 1.1. Đăng Ký Tài Khoản
export async function register(data: RegisterRequest): Promise<ApiResponse<{
    user: any;
    profile: any;
}>> {
    const endpoint = data.role === 'patient' ? '/auth/register/patient' : '/auth/register';
    return post(endpoint, data);
}

// 1.2. Đăng Nhập
export async function login(data: LoginRequest): Promise<AuthResponse> {
    return post('/auth/login', data);
}

// 1.3. Đổi Mật Khẩu
export async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
}): Promise<ApiResponse<{ message: string }>> {
    return put('/auth/change-password', data);
}

// 1.4. Đăng Xuất
export async function logout(): Promise<ApiResponse<{ message: string }>> {
    return post('/auth/logout');
}
// 1.5. Lấy danh sách tài khoản (Admin)
// ...existing code...

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
