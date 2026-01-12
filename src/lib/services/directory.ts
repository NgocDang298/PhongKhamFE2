import { get } from '../api';
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

