import { get, post, put, del } from '../api';
import type { ApiResponse, WorkSchedule, CreateWorkScheduleRequest } from '@/types';

// 10.1. Tạo Lịch Làm Việc
export async function createWorkSchedule(data: CreateWorkScheduleRequest): Promise<ApiResponse<WorkSchedule>> {
    return post('/work-schedules', data);
}

// 10.2. Lấy Lịch Làm Việc Của Bác Sĩ
export async function getDoctorSchedule(doctorId: string): Promise<ApiResponse<WorkSchedule[]>> {
    return get(`/work-schedules/doctor/${doctorId}`);
}

// 10.3. Lấy Lịch Làm Việc Của Y Tá
export async function getNurseSchedule(nurseId: string): Promise<ApiResponse<WorkSchedule[]>> {
    return get(`/work-schedules/nurse/${nurseId}`);
}

// 10.4. Cập Nhật Lịch Làm Việc
export async function updateWorkSchedule(id: string, data: Partial<CreateWorkScheduleRequest>): Promise<ApiResponse<WorkSchedule>> {
    return put(`/work-schedules/${id}`, data);
}

// 10.5. Xóa Lịch Làm Việc
export async function deleteWorkSchedule(id: string): Promise<ApiResponse> {
    return del(`/work-schedules/${id}`);
}

// 10.6. Tìm Nhân Viên Có Lịch Làm Việc
export async function getAvailableStaff(params: {
    dayOfWeek: number; // 0-6
    time: string; // HH:mm
    role: 'doctor' | 'nurse';
}): Promise<ApiResponse<any[]>> {
    return get('/work-schedules/available', params);
}

