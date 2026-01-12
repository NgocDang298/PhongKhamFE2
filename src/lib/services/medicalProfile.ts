import { post, put } from '../api';
import type { ApiResponse, MedicalProfile } from '@/types';

// 4.1. Tạo/Lấy Hồ Sơ Khám Bệnh (Patient)
export async function createOrGetMedicalProfile(data?: {
    bloodType?: 'A' | 'B' | 'AB' | 'O';
    allergies?: string[];
    chronicDiseases?: string[];
    medications?: string[];
    surgeries?: string[];
    familyHistory?: string[];
    notes?: string;
}): Promise<ApiResponse<MedicalProfile>> {
    return post('/medical-profile', data || {});
}

// 4.2. Tạo/Lấy Hồ Sơ Cho Bệnh Nhân (Staff/Admin)
export async function createOrGetPatientMedicalProfile(
    patientId: string,
    data?: {
        bloodType?: 'A' | 'B' | 'AB' | 'O';
        allergies?: string[];
        chronicDiseases?: string[];
        medications?: string[];
        surgeries?: string[];
        familyHistory?: string[];
        notes?: string;
    }
): Promise<ApiResponse<MedicalProfile>> {
    return post(`/patients/${patientId}/medical-profile`, data || {});
}

// 13.3. Cập Nhật Hồ Sơ Y Tế (Patient)
export async function updateMedicalProfile(data: {
    bloodType?: 'A' | 'B' | 'AB' | 'O';
    allergies?: string[];
    chronicDiseases?: string[];
    medications?: string[];
    surgeries?: string[];
    familyHistory?: string[];
    notes?: string;
}): Promise<ApiResponse<MedicalProfile>> {
    return put('/medical-profile', data);
}

// 13.4. Cập Nhật Hồ Sơ Y Tế Cho Bệnh Nhân (Staff/Admin)
export async function updatePatientMedicalProfile(
    patientId: string,
    data: {
        bloodType?: 'A' | 'B' | 'AB' | 'O';
        allergies?: string[];
        chronicDiseases?: string[];
        medications?: string[];
        surgeries?: string[];
        familyHistory?: string[];
        notes?: string;
    }
): Promise<ApiResponse<MedicalProfile>> {
    return put(`/patients/${patientId}/medical-profile`, data);
}

