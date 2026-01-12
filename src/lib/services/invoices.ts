import { get, post, put, del } from '../api';
import type { ApiResponse, Invoice, CreateInvoiceRequest, RevenueStatistics } from '@/types';

// 9.1. Tạo Hóa Đơn
export async function createInvoice(data: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    return post('/invoices', data);
}

// 9.2. Danh Sách Hóa Đơn
export async function getInvoices(params?: {
    patientId?: string;
    status?: 'paid' | 'unpaid';
    fromDate?: string;
    toDate?: string;
    limit?: number;
    skip?: number;
}): Promise<ApiResponse<{
    invoices: Invoice[];
    total: number;
    limit: number;
    skip: number;
}>> {
    return get('/invoices', params);
}

// 9.3. Chi Tiết Hóa Đơn
export async function getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return get(`/invoices/${id}`);
}

// 9.4. Thanh Toán Hóa Đơn
export async function payInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return put(`/invoices/${id}/pay`);
}

// 9.5. Lịch Sử Hóa Đơn Của Bệnh Nhân
export async function getPatientInvoices(patientId: string, params?: {
    status?: 'paid' | 'unpaid';
    limit?: number;
    skip?: number;
}): Promise<ApiResponse<{
    invoices: Invoice[];
    total: number;
    limit: number;
    skip: number;
}>> {
    return get(`/invoices/patient/${patientId}`, params);
}

// 9.6. Thống Kê Doanh Thu
export async function getRevenueStatistics(params?: {
    period?: 'daily' | 'monthly' | 'yearly';
    fromDate?: string;
    toDate?: string;
}): Promise<ApiResponse<RevenueStatistics>> {
    return get('/invoices/statistics', params);
}

// 13.11. Cập Nhật Hóa Đơn
export async function updateInvoice(id: string, data: {
    items: Array<{
        type: 'service' | 'test';
        referenceId: string;
        quantity: number;
    }>;
}): Promise<ApiResponse<Invoice>> {
    return put(`/invoices/${id}`, data);
}

// 13.12. Xóa Hóa Đơn
export async function deleteInvoice(id: string): Promise<ApiResponse> {
    return del(`/invoices/${id}`);
}
