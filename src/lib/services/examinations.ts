import { get, post, put, del } from '../api';
import type { ApiResponse, Examination, StartExaminationRequest, UpdateExaminationRequest } from '@/types';

// 5.1. Bắt Đầu Ca Khám
export async function startExamination(data: StartExaminationRequest): Promise<ApiResponse<Examination>> {
    return post('/examinations/start', data);
}

// 5.2. Lấy Thông Tin Ca Khám
export async function getExamination(id: string): Promise<ApiResponse<Examination>> {
    return get(`/examinations/${id}`);
}

// 5.3. Lấy Ca Khám Theo Appointment
export async function getExaminationByAppointment(appointmentId: string): Promise<ApiResponse<Examination>> {
    return get(`/examinations/appointment/${appointmentId}`);
}

// 5.4. Danh Sách Ca Khám
export async function getExaminations(params?: {
    status?: 'processing' | 'done';
    doctorId?: string;
    patientId?: string;
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
    return get('/examinations', params);
}

// 5.5. Cập Nhật Ca Khám
export async function updateExamination(id: string, data: UpdateExaminationRequest): Promise<ApiResponse<Examination>> {
    return put(`/examinations/${id}`, data);
}

// 5.6. Hoàn Thành Ca Khám
export async function completeExamination(id: string, data?: UpdateExaminationRequest): Promise<ApiResponse<Examination>> {
    return put(`/examinations/${id}/complete`, data || {});
}

// 13.7. Xóa Ca Khám
export async function deleteExamination(id: string): Promise<ApiResponse> {
    return del(`/examinations/${id}`);
}
