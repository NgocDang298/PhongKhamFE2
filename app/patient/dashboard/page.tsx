'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ROUTES } from '@/lib/constants';
import * as profileService from '@/lib/services/profile';
import * as appointmentService from '@/lib/services/appointments';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import styles from './page.module.css';

const navItems = [
    {
        label: 'Tổng quan',
        path: ROUTES.PATIENT_DASHBOARD,
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
        path: ROUTES.PATIENT_APPOINTMENTS,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        label: 'Đặt lịch',
        path: ROUTES.PATIENT_BOOK_APPOINTMENT,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        ),
    },
    {
        label: 'Lịch sử khám',
        path: ROUTES.PATIENT_MEDICAL_HISTORY,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
    },
    {
        label: 'Hóa đơn',
        path: ROUTES.PATIENT_INVOICES,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        ),
    },
    {
        label: 'Hồ sơ',
        path: ROUTES.PATIENT_PROFILE,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

export default function PatientDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        totalAppointments: 0,
        upcomingAppointments: 0,
        totalExaminations: 0,
    });
    const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Đợi auth loading hoàn tất trước khi check
        if (authLoading) return;

        if (!isAuthenticated || user?.role !== 'patient') {
            router.push('/login');
            return;
        }

        loadData();
    }, [user, isAuthenticated, authLoading, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [profileRes, appointmentsRes] = await Promise.all([
                profileService.getProfile(),
                profileService.getMyAppointments({ limit: 5 }),
            ]);

            if (profileRes.data?.stats) {
                setStats(profileRes.data.stats);
            }

            if (appointmentsRes.data?.appointments) {
                setRecentAppointments(appointmentsRes.data.appointments);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout navItems={navItems} title="Tổng quan">
                <div className={styles.loading}>Đang tải...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Tổng quan">
            <div className={styles.grid}>
                <Card className={styles.statCard}>
                    <CardBody>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.statValue}>{stats.totalAppointments}</div>
                                <div className={styles.statLabel}>Tổng lịch hẹn</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className={styles.statCard}>
                    <CardBody>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.statValue}>{stats.upcomingAppointments}</div>
                                <div className={styles.statLabel}>Lịch hẹn sắp tới</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className={styles.statCard}>
                    <CardBody>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.statValue}>{stats.totalExaminations}</div>
                                <div className={styles.statLabel}>Ca khám</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <Card className={styles.recentCard}>
                <CardHeader>
                    <CardTitle>Lịch hẹn gần đây</CardTitle>
                </CardHeader>
                <CardBody>
                    {recentAppointments.length === 0 ? (
                        <div className={styles.empty}>Chưa có lịch hẹn nào</div>
                    ) : (
                        <div className={styles.appointmentList}>
                            {recentAppointments.map((apt) => (
                                <div key={apt._id} className={styles.appointmentItem}>
                                    <div className={styles.appointmentInfo}>
                                        <div className={styles.appointmentDate}>
                                            {format(new Date(apt.appointmentDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </div>
                                        <div className={styles.appointmentStatus}>
                                            <span className={styles.statusBadge} data-status={apt.status}>
                                                {apt.status === 'pending' && 'Chờ xác nhận'}
                                                {apt.status === 'confirmed' && 'Đã xác nhận'}
                                                {apt.status === 'cancelled' && 'Đã hủy'}
                                            </span>
                                        </div>
                                    </div>
                                    {typeof apt.doctorId === 'object' && apt.doctorId && (
                                        <div className={styles.appointmentDoctor}>
                                            Bác sĩ: {apt.doctorId.fullName}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ marginTop: '1rem' }}>
                        <button
                            className={styles.viewAllButton}
                            onClick={() => router.push(ROUTES.PATIENT_APPOINTMENTS)}
                        >
                            Xem tất cả lịch hẹn
                        </button>
                    </div>
                </CardBody>
            </Card>
        </DashboardLayout>
    );
}

