import { get, post, put, del } from '../api';
import type { ApiResponse, TestResult, CreateTestResultRequest } from '@/types';

// 7.1. Tạo Kết Quả Xét Nghiệm
export async function createTestResult(data: CreateTestResultRequest & { images?: string[] }): Promise<ApiResponse<TestResult>> {
    return post('/test-results', data);
}

// 7.2. Lấy Kết Quả Theo Test Request
export async function getTestResultByRequest(testRequestId: string): Promise<ApiResponse<TestResult>> {
    return get(`/test-results/${testRequestId}`);
}

// 7.3. Cập Nhật Kết Quả Xét Nghiệm
export async function updateTestResult(id: string, data: { resultData: Record<string, any>; images?: string[] }): Promise<ApiResponse<TestResult>> {
    return put(`/test-results/${id}`, data);
}

// 7.4. Kết Quả Xét Nghiệm Của Ca Khám
export async function getTestResultsByExamination(examId: string): Promise<ApiResponse<TestResult[]>> {
    return get(`/test-results/examination/${examId}`);
}

// 7.5. Lịch Sử Xét Nghiệm Của Bệnh Nhân
export async function getPatientTestResults(patientId: string, params?: {
    limit?: number;
    skip?: number;
    fromDate?: string;
    toDate?: string;
}): Promise<ApiResponse<{
    results: TestResult[];
    total: number;
    limit: number;
    skip: number;
}>> {
    return get(`/test-results/patient/${patientId}`, params);
}

// 13.10. Xóa Kết Quả Xét Nghiệm
export async function deleteTestResult(id: string): Promise<ApiResponse> {
    return del(`/test-results/${id}`);
}
