import { get, post, put, del } from '../api';
import type { ApiResponse, Service, CreateServiceRequest } from '@/types';

// 8.1. Tạo Dịch Vụ Mới
export async function createService(data: CreateServiceRequest): Promise<ApiResponse<Service>> {
    return post('/services', data);
}

// 8.2. Danh Sách Dịch Vụ
export async function getServices(params?: {
    serviceType?: 'examination' | 'test' | 'other';
    isActive?: boolean;
    search?: string;
    limit?: number;
    skip?: number;
}): Promise<ApiResponse<{
    services: Service[];
    total: number;
    limit: number;
    skip: number;
}>> {
    return get('/services', params);
}

// 8.3. Chi Tiết Dịch Vụ
export async function getService(id: string): Promise<ApiResponse<Service>> {
    return get(`/services/${id}`);
}

// 8.4. Cập Nhật Dịch Vụ
export async function updateService(id: string, data: Partial<CreateServiceRequest> & { isActive?: boolean }): Promise<ApiResponse<Service>> {
    return put(`/services/${id}`, data);
}

// 8.5. Vô Hiệu Hóa Dịch Vụ
export async function deleteService(id: string): Promise<ApiResponse> {
    return del(`/services/${id}`);
}

// 8.6. Danh Sách Dịch Vụ Hoạt Động
export async function getActiveServices(params?: {
    serviceType?: 'examination' | 'test' | 'other';
}): Promise<ApiResponse<Service[]>> {
    return get('/services/active', params);
}

