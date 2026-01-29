export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const USER_ROLES = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    STAFF: 'staff',
    LAB_NURSE: 'lab_nurse',
    ADMIN: 'admin',
} as const;

export const ROLE_LABELS = {
    patient: 'Bệnh nhân',
    doctor: 'Bác sĩ',
    staff: 'Nhân viên',
    lab_nurse: 'Y tá xét nghiệm',
    admin: 'Quản trị viên',
} as const;

export const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
} as const;

export const APPOINTMENT_STATUS_LABELS = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    'in-progress': 'Đang khám',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành',
} as const;

export const APPOINTMENT_STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#10b981',
    'in-progress': '#3b82f6',
    cancelled: '#ef4444',
    completed: '#8b5cf6',
} as const;

export const EXAMINATION_STATUS = {
    PROCESSING: 'processing',
    DONE: 'done',
} as const;

export const EXAMINATION_STATUS_LABELS = {
    processing: 'Đang khám',
    done: 'Hoàn thành',
} as const;

export const TEST_REQUEST_STATUS = {
    WAITING: 'waiting',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
} as const;

export const TEST_REQUEST_STATUS_LABELS = {
    waiting: 'Chờ xử lý',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
} as const;

export const INVOICE_STATUS = {
    PAID: 'paid',
    UNPAID: 'unpaid',
    CANCELLED: 'cancelled',
} as const;

export const INVOICE_STATUS_LABELS = {
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    cancelled: 'Đã hủy',
} as const;

export const INVOICE_STATUS_COLORS = {
    paid: '#10b981',
    unpaid: '#ef4444',
    cancelled: '#6b7280',
} as const;

// ============= Gender =============
export const GENDER_OPTIONS = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
] as const;

export const GENDER_LABELS = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
} as const;

// ============= Blood Types =============
export const BLOOD_TYPE_OPTIONS = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'AB', label: 'AB' },
    { value: 'O', label: 'O' },
] as const;

// ============= Service Types =============
export const SERVICE_TYPE_OPTIONS = [
    { value: 'examination', label: 'Khám bệnh' },
    { value: 'test', label: 'Xét nghiệm' },
    { value: 'other', label: 'Khác' },
] as const;

export const SERVICE_TYPE_LABELS = {
    examination: 'Khám bệnh',
    test: 'Xét nghiệm',
    other: 'Khác',
} as const;

// ============= Days of Week =============
export const DAYS_OF_WEEK = [
    { value: 0, label: 'Chủ nhật' },
    { value: 1, label: 'Thứ hai' },
    { value: 2, label: 'Thứ ba' },
    { value: 3, label: 'Thứ tư' },
    { value: 4, label: 'Thứ năm' },
    { value: 5, label: 'Thứ sáu' },
    { value: 6, label: 'Thứ bảy' },
] as const;

export const DAY_LABELS = {
    0: 'Chủ nhật',
    1: 'Thứ hai',
    2: 'Thứ ba',
    3: 'Thứ tư',
    4: 'Thứ năm',
    5: 'Thứ sáu',
    6: 'Thứ bảy',
} as const;

// ============= Route Paths =============
export const ROUTES = {
    // Auth
    LOGIN: '/login',
    REGISTER: '/register',

    // Patient
    PATIENT_DASHBOARD: '/patient/dashboard',
    PATIENT_APPOINTMENTS: '/patient/appointments',
    PATIENT_BOOK_APPOINTMENT: '/patient/appointments/book',
    PATIENT_MEDICAL_HISTORY: '/patient/medical-history',
    PATIENT_MEDICAL_PROFILE: '/patient/medical-profile',
    PATIENT_INVOICES: '/patient/invoices',
    PATIENT_PROFILE: '/patient/profile',

    // Doctor
    DOCTOR_DASHBOARD: '/doctor/dashboard',
    DOCTOR_APPOINTMENTS: '/doctor/appointments',
    DOCTOR_EXAMINATIONS: '/doctor/examinations',

    // Staff
    STAFF_DASHBOARD: '/staff/dashboard',
    STAFF_APPOINTMENTS: '/staff/appointments',
    STAFF_PATIENTS: '/staff/patients',
    STAFF_INVOICES: '/staff/invoices',
    STAFF_SERVICES: '/staff/services',

    // Lab Nurse
    LAB_DASHBOARD: '/lab/dashboard',
    LAB_TEST_REQUESTS: '/lab/test-requests',
    LAB_TEST_RESULTS: '/lab/test-results',

    // Admin
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_SERVICES: '/admin/services',
    ADMIN_SCHEDULES: '/admin/schedules',
    ADMIN_STATISTICS: '/admin/statistics',
} as const;

// ============= Local Storage Keys =============
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'clinic_auth_token',
    USER_DATA: 'clinic_user_data',
    THEME: 'clinic_theme',
} as const;

// ============= Pagination =============
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ============= Date/Time Formats =============
export const DATE_FORMAT = 'dd/MM/yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const API_DATE_FORMAT = 'yyyy-MM-dd';
export const API_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
