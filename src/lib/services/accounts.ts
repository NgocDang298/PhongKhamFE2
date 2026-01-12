import { get } from '../api';
import type { ApiResponse } from '@/types';

// 12.1. Lấy Danh Sách Tất Cả Tài Khoản
export async function getAccounts(params?: {
    role?: 'patient' | 'doctor' | 'staff' | 'labNurse' | 'admin';
    search?: string;
}): Promise<ApiResponse<Array<{
    _id: string;
    cccd: string;
    email: string;
    sdt: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    profile: any;
}>>> {
    return get('/accounts', params);
}

// 12.2. Lấy Thông Tin Chi Tiết Một Tài Khoản
export async function getAccount(id: string): Promise<ApiResponse<{
    _id: string;
    cccd: string;
    email: string;
    sdt: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    profile: any;
}>> {
    return get(`/accounts/${id}`);
}
