'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { ROUTES, APPOINTMENT_STATUS_LABELS } from '@/lib/constants';
import * as appointmentService from '@/lib/services/appointments';
import * as patientService from '@/lib/services/patients';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import styles from './page.module.css';

const navItems = [
    {
        label: 'Tổng quan',
        path: ROUTES.STAFF_DASHBOARD,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        label: 'Lịch hẹn',
        path: ROUTES.STAFF_APPOINTMENTS,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
];

export default function StaffAppointmentsPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        note: '',
    });

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || (user?.role !== 'staff' && user?.role !== 'admin')) {
            router.push('/login');
            return;
        }
        loadData();
    }, [user, isAuthenticated, authLoading, statusFilter, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
                appointmentService.getAppointments(statusFilter ? { status: statusFilter as any } : {}),
                patientService.getPatients(),
                appointmentService.getDoctors(),
            ]);

            console.log('Staff Appointments - Raw responses:', {
                appointmentsRes,
                patientsRes,
                doctorsRes
            });

            // Handle different response formats - API interceptor may unwrap differently
            const appointmentsData = appointmentsRes?.data || appointmentsRes || [];
            const patientsData = patientsRes?.data || patientsRes || [];
            const doctorsData = doctorsRes?.data || doctorsRes || [];

            const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
            const patients = Array.isArray(patientsData) ? patientsData : [];
            const doctors = Array.isArray(doctorsData) ? doctorsData : [];

            console.log('Staff Appointments - Processed data:', {
                appointments: appointments.length,
                patients: patients.length,
                doctors: doctors.length,
                sampleAppointment: appointments[0],
                samplePatient: patients[0]
            });

            setAppointments(appointments);
            setPatients(patients);
            setDoctors(doctors);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id: string) => {
        try {
            await appointmentService.confirmAppointment(id);
            loadData();
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleReject = async (id: string, reason?: string) => {
        try {
            await appointmentService.rejectAppointment(id, reason);
            loadData();
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await appointmentService.createAppointment({
                patientId: formData.patientId,
                doctorId: formData.doctorId || undefined,
                appointmentDate: formData.appointmentDate,
                note: formData.note,
            });
            setIsCreateModalOpen(false);
            setFormData({ patientId: '', doctorId: '', appointmentDate: '', note: '' });
            loadData();
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#f59e0b';
            case 'confirmed':
                return '#10b981';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout navItems={navItems} title="Quản lý lịch hẹn">
                <div className={styles.loading}>Đang tải...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Quản lý lịch hẹn">
            <div className={styles.header}>
                <div className={styles.filters}>
                    <div style={{ maxWidth: '300px' }}>
                        <Select
                            label="Lọc theo trạng thái"
                            options={[
                                { value: '', label: 'Tất cả' },
                                { value: 'pending', label: 'Chờ xác nhận' },
                                { value: 'confirmed', label: 'Đã xác nhận' },
                                { value: 'cancelled', label: 'Đã hủy' },
                            ]}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            fullWidth
                        />
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        }
                    >
                        Tạo lịch hẹn mới
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách lịch hẹn</CardTitle>
                </CardHeader>
                <CardBody>
                    {appointments.length === 0 ? (
                        <div className={styles.empty}>Chưa có lịch hẹn nào</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bệnh nhân</TableHead>
                                    <TableHead>Bác sĩ</TableHead>
                                    <TableHead>Ngày giờ</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ghi chú</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.map((apt) => (
                                    <TableRow key={apt._id}>
                                        <TableCell>
                                            {typeof apt.patientId === 'object' && apt.patientId
                                                ? apt.patientId.fullName
                                                : patients.find(p => p._id === apt.patientId)?.fullName || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {typeof apt.doctorId === 'object' && apt.doctorId
                                                ? apt.doctorId.fullName
                                                : apt.doctorId || 'Chưa chọn'}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(apt.appointmentDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={styles.statusBadge}
                                                style={{
                                                    backgroundColor: getStatusColor(apt.status) + '20',
                                                    color: getStatusColor(apt.status),
                                                }}
                                            >
                                                {APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS]}
                                            </span>
                                        </TableCell>
                                        <TableCell>{apt.note || '-'}</TableCell>
                                        <TableCell>
                                            <div className={styles.actions}>
                                                {apt.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleConfirm(apt._id)}
                                                        >
                                                            Xác nhận
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedAppointment(apt);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Reject Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedAppointment(null);
                }}
                title="Từ chối lịch hẹn"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setSelectedAppointment(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                if (selectedAppointment) {
                                    handleReject(selectedAppointment._id);
                                    setIsModalOpen(false);
                                    setSelectedAppointment(null);
                                }
                            }}
                        >
                            Xác nhận từ chối
                        </Button>
                    </>
                }
            >
                <p>Bạn có chắc chắn muốn từ chối lịch hẹn này không?</p>
                {selectedAppointment && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem' }}>
                        <div>
                            <strong>Bệnh nhân:</strong>{' '}
                            {typeof selectedAppointment.patientId === 'object' && selectedAppointment.patientId
                                ? selectedAppointment.patientId.fullName
                                : patients.find(p => p._id === selectedAppointment.patientId)?.fullName || 'N/A'}
                        </div>
                        <div>
                            <strong>Ngày giờ:</strong>{' '}
                            {format(new Date(selectedAppointment.appointmentDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setFormData({ patientId: '', doctorId: '', appointmentDate: '', note: '' });
                }}
                title="Tạo lịch hẹn mới"
                size="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setFormData({ patientId: '', doctorId: '', appointmentDate: '', note: '' });
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleCreate}>Tạo lịch hẹn</Button>
                    </>
                }
            >
                <form onSubmit={handleCreate} className={styles.form}>
                    <Select
                        label="Chọn bệnh nhân"
                        name="patientId"
                        options={[
                            { value: '', label: 'Chọn bệnh nhân' },
                            ...patients.map((p) => ({ value: p._id, label: `${p.fullName} - ${p.phone}` })),
                        ]}
                        value={formData.patientId}
                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                        required
                        fullWidth
                    />
                    <Select
                        label="Chọn bác sĩ (tùy chọn)"
                        name="doctorId"
                        options={[
                            { value: '', label: 'Chưa chọn bác sĩ' },
                            ...doctors.map((d) => ({ value: d._id, label: d.fullName })),
                        ]}
                        value={formData.doctorId}
                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                        fullWidth
                    />
                    <Input
                        label="Ngày giờ hẹn"
                        name="appointmentDate"
                        type="datetime-local"
                        value={formData.appointmentDate}
                        onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                        required
                        fullWidth
                    />
                    <Input
                        label="Ghi chú (tùy chọn)"
                        name="note"
                        type="text"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        fullWidth
                    />
                </form>
            </Modal>
        </DashboardLayout>
    );
}

