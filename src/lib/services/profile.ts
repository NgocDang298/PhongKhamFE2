import { get, put, post } from '../api';
import type { ApiResponse, ProfileData, MedicalHistory, Appointment, Examination } from '@/types';

// 11.1. Lấy Thông Tin Profile
export async function getProfile(): Promise<ApiResponse<ProfileData>> {
    return get('/profile/me');
}

// 11.2. Cập Nhật Profile
export async function updateProfile(data: {
    fullName?: string;
    phone?: string;
    address?: string;
    email?: string;
    emergencyPhone?: string;
    gender?: string;
    dateOfBirth?: string;
}): Promise<ApiResponse<ProfileData>> {
    return put('/profile/me', data);
}

// 11.3. Upload Avatar (Not implemented - returns 501)
export async function uploadAvatar(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    // Note: API returns 501 - feature not implemented
    return put('/profile/avatar', formData);
}

// 11.4. Lấy Lịch Sử Khám Bệnh
export async function getMedicalHistory(): Promise<ApiResponse<MedicalHistory>> {
    return get('/profile/medical-history');
}

// 11.5. Lấy Danh Sách Lịch Hẹn Của Mình
export async function getMyAppointments(params?: {
    status?: 'pending' | 'confirmed' | 'cancelled';
    limit?: number;
    skip?: number;
}): Promise<ApiResponse<{
    appointments: Appointment[];
    total: number;
    limit: number;
    skip: number;
}>> {
    return get('/profile/appointments', params);
}

// 11.6. Lấy Danh Sách Ca Khám Của Mình
export async function getMyExaminations(params?: {
    status?: 'processing' | 'done';
    fromDate?: string;
    toDate?: string;
    limit?: number;
    skip?: number;
}): Promise<ApiResponse<{
    examinations: Examination[];
    total: number;
    limit: number;
    skip: number;
}>> {
    return get('/profile/examinations', params);
}

