import { get, post, put, del } from '../api';
import type { ApiResponse, Patient } from '@/types';

// 3.1. Tạo Bệnh Nhân Walk-in
export async function createWalkInPatient(data: {
    fullName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    address: string;
    phone: string;
    cccd: string;
    email?: string;
    password?: string;
}): Promise<ApiResponse<{ user: any; patient: Patient }>> {
    return post('/patients', data);
}

// 3.2. Danh Sách Bệnh Nhân
export async function getPatients(params?: {
    search?: string;
}): Promise<ApiResponse<Patient[]>> {
    return get('/patients', params);
}

// 13.1. Cập Nhật Thông Tin Bệnh Nhân
export async function updatePatient(id: string, data: {
    fullName?: string;
    phone?: string;
    address?: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    cccd?: string;
    email?: string;
}): Promise<ApiResponse<Patient>> {
    return put(`/patients/${id}`, data);
}

// 13.2. Xóa Bệnh Nhân
export async function deletePatient(id: string): Promise<ApiResponse> {
    return del(`/patients/${id}`);
}

