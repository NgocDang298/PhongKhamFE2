'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ROUTES } from '@/lib/constants';
import * as examinationService from '@/lib/services/examinations';
import * as appointmentService from '@/lib/services/appointments';
import styles from './page.module.css';

const navItems = [
    {
        label: 'Tổng quan',
        path: ROUTES.DOCTOR_DASHBOARD,
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
        path: ROUTES.DOCTOR_APPOINTMENTS,
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
        label: 'Ca khám',
        path: ROUTES.DOCTOR_EXAMINATIONS,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
    },
];

export default function DoctorDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        todayAppointments: 0,
        processingExaminations: 0,
        completedExaminations: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Đợi auth loading hoàn tất trước khi check
        if (authLoading) return;

        if (!isAuthenticated || user?.role !== 'doctor') {
            router.push('/login');
            return;
        }
        loadStats();
    }, [user, isAuthenticated, authLoading, router]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            console.log('Loading dashboard stats for doctor:', user?._id);

            const [appointmentsRes, processingRes, completedRes] = await Promise.all([
                appointmentService.getAppointments({ status: 'confirmed' }),
                examinationService.getExaminations({ status: 'processing', doctorId: user?._id }),
                examinationService.getExaminations({ status: 'done', doctorId: user?._id, limit: 1 }),
            ]);

            console.log('Dashboard raw responses:', { appointmentsRes, processingRes, completedRes });

            // Handle unwrapped responses with multiple possible structures
            let appointments: any[] = [];
            if (Array.isArray(appointmentsRes)) {
                appointments = appointmentsRes;
            } else if (appointmentsRes?.appointments && Array.isArray(appointmentsRes.appointments)) {
                appointments = appointmentsRes.appointments;
            } else if (appointmentsRes?.data) {
                if (Array.isArray(appointmentsRes.data)) {
                    appointments = appointmentsRes.data;
                } else if (appointmentsRes.data?.appointments) {
                    appointments = appointmentsRes.data.appointments;
                }
            }

            // Backend API already filters by current doctor, just filter by today's date
            const todayApts = appointments.filter((apt: any) => {
                const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
                return aptDate === today;
            }) || [];

            const processingCount = processingRes?.examinations?.length ||
                processingRes?.data?.examinations?.length ||
                (Array.isArray(processingRes) ? processingRes.length : 0);

            const completedCount = completedRes?.total ||
                completedRes?.data?.total ||
                0;

            console.log('Dashboard stats:', {
                todayAppointments: todayApts.length,
                processingExaminations: processingCount,
                completedExaminations: completedCount
            });

            setStats({
                todayAppointments: todayApts.length,
                processingExaminations: processingCount,
                completedExaminations: completedCount,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
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
                                <div className={styles.statValue}>{stats.todayAppointments}</div>
                                <div className={styles.statLabel}>Lịch hẹn hôm nay</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className={styles.statCard}>
                    <CardBody>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.statValue}>{stats.processingExaminations}</div>
                                <div className={styles.statLabel}>Ca khám đang xử lý</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className={styles.statCard}>
                    <CardBody>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.statValue}>{stats.completedExaminations}</div>
                                <div className={styles.statLabel}>Ca khám đã hoàn thành</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </DashboardLayout>
    );
}

