import { post } from '../api';
import type { ApiResponse } from '@/types';

// 14. Upload Hình Ảnh/Tài Liệu
export async function uploadFiles(files: File[]): Promise<ApiResponse<{ urls: string[] }>> {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    return post('/upload', formData);
}
