import { get, post, put, del } from '../api';
import type { ApiResponse, TestRequest, CreateTestRequestRequest } from '@/types';

// 6.1. Tạo Yêu Cầu Xét Nghiệm
export async function createTestRequest(data: CreateTestRequestRequest): Promise<ApiResponse<TestRequest>> {
    return post('/test-requests', data);
}

// 6.2. Lấy Yêu Cầu Xét Nghiệm Theo Ca Khám
export async function getTestRequestsByExamination(examId: string): Promise<ApiResponse<TestRequest[]>> {
    return get(`/examinations/${examId}/test-requests`);
}

// 6.3. Lấy Chi Tiết Yêu Cầu Xét Nghiệm
export async function getTestRequest(id: string): Promise<ApiResponse<TestRequest>> {
    return get(`/test-requests/${id}`);
}

// 6.4. Cập Nhật Trạng Thái Yêu Cầu
export async function updateTestRequestStatus(id: string, status: 'waiting' | 'processing' | 'completed'): Promise<ApiResponse<TestRequest>> {
    return put(`/test-requests/${id}/status`, { status });
}

// 6.5. Danh Sách Yêu Cầu Xét Nghiệm
export async function getTestRequests(params?: {
    status?: 'waiting' | 'processing' | 'completed';
    labNurseId?: string;
    examId?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    skip?: number;
}): Promise<ApiResponse<{
    testRequests: TestRequest[];
    total: number;
    limit: number;
    skip: number;
}>> {
    return get('/test-requests', params);
}

// 13.8. Cập Nhật Yêu Cầu Xét Nghiệm
export async function updateTestRequest(id: string, data: {
    testType?: string;
    labNurseId?: string;
    serviceId?: string;
}): Promise<ApiResponse<TestRequest>> {
    return put(`/test-requests/${id}`, data);
}

// 13.9. Xóa Yêu Cầu Xét Nghiệm
export async function deleteTestRequest(id: string): Promise<ApiResponse> {
    return del(`/test-requests/${id}`);
}
