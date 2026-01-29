import { get, post, put, del } from '../api';
import type { ApiResponse, Appointment, TimeSlot, CreateAppointmentRequest } from '@/types';

// 2.1. Tạo Lịch Hẹn
export async function createAppointment(data: CreateAppointmentRequest): Promise<ApiResponse<Appointment>> {
    return post('/appointments', data);
}

// 2.2. Danh Sách Lịch Hẹn (của user hiện tại)
export async function getAppointments(params?: {
    status?: 'pending' | 'confirmed' | 'cancelled';
}): Promise<ApiResponse<Appointment[]>> {
    return get('/appointments', params);
}

export async function getAvailableSlots(params: {
    date: string; // YYYY-MM-DD
    doctorId?: string;
    specialty?: string;
}): Promise<ApiResponse<TimeSlot[]>> {
    return get('/appointments/slots', params);
}

// 2.4. Xác Nhận Lịch Hẹn
export async function confirmAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return post(`/appointments/${id}/confirm`);
}

// 2.5. Hủy Lịch Hẹn
export async function cancelAppointment(id: string): Promise<ApiResponse<Appointment & { suggestedSlots?: TimeSlot[] }>> {
    return post(`/appointments/${id}/cancel`);
}

// 2.6. Từ Chối Lịch Hẹn
export async function rejectAppointment(id: string, reason?: string): Promise<ApiResponse<Appointment & { suggestedSlots?: TimeSlot[] }>> {
    return post(`/appointments/${id}/reject`, { reason });
}

// 2.7. Lấy Slots Gợi Ý
export async function getSuggestedSlots(id: string, limit = 5): Promise<ApiResponse<TimeSlot[]>> {
    return get(`/appointments/${id}/suggested-slots`, { limit });
}

// 2.8. Danh Sách Bác Sĩ
export async function getDoctors(): Promise<ApiResponse<any[]>> {
    return get('/appointments/doctors');
}

// 2.9. Ngày Trống Theo Bác Sĩ
export async function getAvailableDates(doctorId: string): Promise<ApiResponse<string[]>> {
    return get('/appointments/doctors/available-dates', { doctorId });
}

// 2.9a. Lấy Danh Sách Chuyên Khoa
export async function getSpecialties(): Promise<ApiResponse<string[]>> {
    return get('/appointments/specialties');
}

// 2.10. Slots Trống Theo Bác Sĩ và Ngày
export async function getDoctorAvailableSlots(params: {
    doctorId: string;
    date: string; // YYYY-MM-DD
}): Promise<ApiResponse<TimeSlot[]>> {
    return get('/appointments/doctors/available-slots', params);
}

// 2.11. Tạo Lịch Hẹn Theo Bác Sĩ
export async function createDoctorAppointment(data: CreateAppointmentRequest & { doctorId: string }): Promise<ApiResponse<Appointment>> {
    return post('/appointments/doctors', data);
}

// 2.12. Tạo Lịch Hẹn Tự Động (Hệ thống chọn bác sĩ)
export async function autoAssignAppointment(data: {
    appointmentDate: string;
    specialty?: string;
    note?: string;
    patientId?: string; // Optional - for staff/admin to book for other patients
}): Promise<ApiResponse<Appointment>> {
    return post('/appointments/auto-assign', data);
}


// Helper: Get all slots with booking status
export async function getAllSlotsWithStatus(params: {
    doctorId: string;
    date: string; // YYYY-MM-DD
}): Promise<ApiResponse<Array<TimeSlot & { isBooked: boolean }>>> {
    try {
        // Get available slots - response is already unwrapped by interceptor
        const availableResponse: any = await getDoctorAvailableSlots(params);
        const availableSlots = availableResponse.data || availableResponse || [];

        // Get all appointments for this doctor on this date
        const appointmentsResponse: any = await getAppointments({});
        const allAppointments = appointmentsResponse.data || appointmentsResponse || [];

        // Filter appointments for this doctor and date
        const dateStart = new Date(params.date + 'T00:00:00');
        const dateEnd = new Date(params.date + 'T23:59:59');

        const bookedSlots = allAppointments
            .filter((apt: any) => {
                const aptDate = new Date(apt.appointmentDate);
                const doctorMatches = typeof apt.doctorId === 'object'
                    ? apt.doctorId._id === params.doctorId
                    : apt.doctorId === params.doctorId;
                const dateMatches = aptDate >= dateStart && aptDate <= dateEnd;
                const notCancelled = apt.status !== 'cancelled';
                return doctorMatches && dateMatches && notCancelled;
            })
            .map((apt: any) => apt.appointmentDate);

        // Create a set of booked times for quick lookup
        const bookedTimes = new Set(bookedSlots);

        // Mark available slots
        const slotsWithStatus = availableSlots.map((slot: any) => ({
            ...slot,
            isBooked: bookedTimes.has(slot.time)
        }));

        // Add booked slots that might not be in available slots
        bookedSlots.forEach((bookedTime: string) => {
            if (!slotsWithStatus.find((s: any) => s.time === bookedTime)) {
                slotsWithStatus.push({
                    time: bookedTime,
                    doctorId: params.doctorId,
                    isBooked: true
                });
            }
        });

        // Sort by time
        slotsWithStatus.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

        return {
            status: true,
            data: slotsWithStatus
        };
    } catch (error) {
        console.error('Error getting all slots with status:', error);
        throw error;
    }
}

// 13.5. Cập Nhật Lịch Hẹn
export async function updateAppointment(id: string, data: {
    appointmentDate?: string;
    note?: string;
    doctorId?: string;
}): Promise<ApiResponse<Appointment>> {
    return put(`/appointments/${id}`, data);
}

// 13.6. Xóa Lịch Hẹn
export async function deleteAppointment(id: string): Promise<ApiResponse> {
    return del(`/appointments/${id}`);
}
