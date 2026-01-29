import { get, put } from '../api';
import type { ApiResponse, Doctor, Staff, LabNurse } from '@/types';

// 3.3. Danh Sách Bác Sĩ
export async function getDoctors(): Promise<ApiResponse<Doctor[]>> {
    return get('/doctors');
}

// 3.4. Danh Sách Nhân Viên
export async function getStaffs(): Promise<ApiResponse<Staff[]>> {
    return get('/staffs');
}

// 3.5. Danh Sách Y Tá
export async function getNurses(): Promise<ApiResponse<LabNurse[]>> {
    return get('/nurses');
}

// Cập nhật Bác sĩ
export async function updateDoctor(id: string, data: Partial<Doctor>): Promise<ApiResponse<Doctor>> {
    return put(`/doctors/${id}`, data);
}

// Cập nhật Nhân viên
export async function updateStaff(id: string, data: Partial<Staff>): Promise<ApiResponse<Staff>> {
    return put(`/staffs/${id}`, data);
}

// Cập nhật Y tá
export async function updateNurse(id: string, data: Partial<LabNurse>): Promise<ApiResponse<LabNurse>> {
    return put(`/nurses/${id}`, data);
}

