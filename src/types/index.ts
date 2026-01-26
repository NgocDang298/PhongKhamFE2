// TypeScript Type Definitions for Clinic Management System

// ============= User & Authentication =============
export type UserRole = 'patient' | 'doctor' | 'staff' | 'lab_nurse' | 'admin';

export interface User {
  _id: string;
  email?: string;
  cccd: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  status: boolean;
  token: string;
  user: User & {
    fullName?: string;
  };
  message?: string;
}

export interface LoginRequest {
  cccd: string;
  password: string;
}

export interface RegisterRequest {
  password: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  address: string;
  role: UserRole;
  cccd?: string;
  specialty?: string;
  degree?: string;
  birthYear?: number;
  workExperience?: number;
}

// ============= Profile =============
export interface Patient {
  _id: string;
  userId: string | { _id: string;[key: string]: any };
  fullName: string;
  phone: string;
  cccd: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  address: string;
  email?: string;
}

export interface Doctor {
  _id: string;
  userId: string | { _id: string;[key: string]: any };
  fullName: string;
  specialty: string;
  degree?: string;
  birthYear?: number;
  workExperience?: number;
  phone?: string;
  email?: string;
}

export interface Staff {
  _id: string;
  userId: string | { _id: string;[key: string]: any };
  fullName: string;
  phone?: string;
  email?: string;
  cccd?: string;
}

export interface LabNurse {
  _id: string;
  userId: string | { _id: string;[key: string]: any };
  fullName: string;
  phone?: string;
  email?: string;
  cccd?: string;
}

// ============= Appointments =============
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  _id: string;
  patientId: Patient | string;
  doctorId?: Doctor | string;
  appointmentDate: string;
  status: AppointmentStatus;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlot {
  time: string;
  doctorId: string;
}

export interface CreateAppointmentRequest {
  doctorId?: string;
  appointmentDate: string;
  note?: string;
  patientId?: string;
}

// ============= Medical Profile =============
export type BloodType = 'A' | 'B' | 'AB' | 'O';

export interface MedicalProfile {
  _id: string;
  patientId: string;
  bloodType?: BloodType;
  allergies: string[];
  chronicDiseases: string[];
  medications: string[];
  surgeries: string[];
  familyHistory: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============= Examinations =============
export type ExaminationStatus = 'processing' | 'done';

export interface Examination {
  _id: string;
  appointmentId: Appointment | string;
  patientId: Patient | string;
  doctorId: Doctor | string;
  staffId?: Staff | string;
  serviceId?: Service | string;
  examDate: string;
  diagnosis?: string;
  treatment?: string;
  doctorNote?: string;
  resultSummary?: string;
  status: ExaminationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface StartExaminationRequest {
  appointmentId: string;
  staffId?: string; // Optional - can be null if appointment doesn't have confirmedBy
  serviceId: string;
}

export interface UpdateExaminationRequest {
  diagnosis?: string;
  treatment?: string;
  doctorNote?: string;
  resultSummary?: string;
}

// ============= Test Requests =============
export type TestRequestStatus = 'waiting' | 'processing' | 'completed';

export interface TestRequest {
  _id: string;
  examId: Examination | string;
  serviceId: Service | string;
  testType: string;
  labNurseId: LabNurse | string;
  status: TestRequestStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTestRequestRequest {
  examId: string;
  serviceId: string;
  testType: string;
  labNurseId: string;
}

// ============= Test Results =============
export interface TestResult {
  _id: string;
  testRequestId: TestRequest | string;
  labNurseId: LabNurse | string;
  resultData: Record<string, any>;
  notes?: string;
  images?: string[];
  performedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTestResultRequest {
  testRequestId: string;
  resultData: Record<string, any>;
}

// ============= Services =============
export type ServiceType = 'examination' | 'test' | 'other';

export interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  serviceType: ServiceType;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price: number;
  serviceType: ServiceType;
}

// ============= Invoices =============
export type InvoiceStatus = 'paid' | 'unpaid';

export interface InvoiceItem {
  type: 'service' | 'test';
  referenceId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Invoice {
  _id: string;
  examinationId: Examination | string;
  patientId: Patient | string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  paidAt?: string;
  paidBy?: User | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvoiceRequest {
  examinationId: string;
  items: Array<{
    type: 'service' | 'test';
    referenceId: string;
    quantity: number;
  }>;
}

export interface RevenueStatistics {
  totalRevenue: number;
  paidAmount: number;
  unpaidAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  byPeriod: Array<{
    month?: string;
    day?: string;
    year?: string;
    total: number;
    paid: number;
    unpaid: number;
    count: number;
  }>;
}

// ============= Work Schedules =============
export interface WorkSchedule {
  _id: string;
  doctorId?: Doctor | string;
  labNurseId?: LabNurse | string;
  dayOfWeek: number; // 0-6, 0 = Sunday
  shiftStart: string; // HH:mm
  shiftEnd: string; // HH:mm
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkScheduleRequest {
  doctorId?: string;
  labNurseId?: string;
  dayOfWeek: number;
  shiftStart: string;
  shiftEnd: string;
  note?: string;
}

// ============= API Response Types =============
export interface ApiResponse<T = any> {
  status: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  status: boolean;
  data: T[];
  total: number;
  limit: number;
  skip: number;
}

// ============= Profile Management =============
export interface ProfileData {
  user: User;
  profile: Patient | Doctor | Staff | LabNurse;
  stats?: {
    totalAppointments?: number;
    totalExaminations?: number;
    upcomingAppointments?: number;
  };
}

export interface MedicalHistory {
  medicalProfile: MedicalProfile;
  examinations: Examination[];
  patientInfo: Patient;
}
