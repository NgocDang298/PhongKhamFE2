'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import * as appointmentService from '@/lib/services/appointments';
import * as patientService from '@/lib/services/patients';
import * as invoiceService from '@/lib/services/invoices';
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
    {
        label: 'Bệnh nhân',
        path: ROUTES.STAFF_PATIENTS,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        label: 'Hóa đơn',
        path: ROUTES.STAFF_INVOICES,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        ),
    },
    {
        label: 'Dịch vụ',
        path: ROUTES.STAFF_SERVICES,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
            </svg>
        ),
    },
];

export default function StaffDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        pendingAppointments: 0,
        totalPatients: 0,
        unpaidInvoices: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Đợi auth loading hoàn tất trước khi check
        if (authLoading) return;

        if (!isAuthenticated || (user?.role !== 'staff' && user?.role !== 'admin')) {
            router.push('/login');
            return;
        }
        loadStats();
    }, [user, isAuthenticated, authLoading, router]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [appointmentsRes, patientsRes, invoicesRes] = await Promise.all([
                appointmentService.getAppointments({ status: 'pending' }),
                patientService.getPatients(),
                invoiceService.getInvoices({ status: 'unpaid' }),
            ]);

            setStats({
                pendingAppointments: appointmentsRes.data?.length || 0,
                totalPatients: patientsRes.data?.length || 0,
                unpaidInvoices: invoicesRes.data?.invoices?.length || 0,
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
                            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.statValue}>{stats.pendingAppointments}</div>
                                <div className={styles.statLabel}>Lịch hẹn chờ xác nhận</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className={styles.statCard}>
                    <CardBody>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.statValue}>{stats.totalPatients}</div>
                                <div className={styles.statLabel}>Tổng bệnh nhân</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className={styles.statCard}>
                    <CardBody>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.statValue}>{stats.unpaidInvoices}</div>
                                <div className={styles.statLabel}>Hóa đơn chưa thanh toán</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className={styles.quickActions}>
                <Card>
                    <CardHeader>
                        <CardTitle>Thao tác nhanh</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className={styles.actionsGrid}>
                            <Button
                                onClick={() => router.push(ROUTES.STAFF_APPOINTMENTS)}
                                variant="outline"
                                fullWidth
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                }
                            >
                                Quản lý lịch hẹn
                            </Button>
                            <Button
                                onClick={() => router.push(ROUTES.STAFF_PATIENTS)}
                                variant="outline"
                                fullWidth
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                }
                            >
                                Quản lý bệnh nhân
                            </Button>
                            <Button
                                onClick={() => router.push(ROUTES.STAFF_INVOICES)}
                                variant="outline"
                                fullWidth
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                }
                            >
                                Quản lý hóa đơn
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </DashboardLayout>
    );
}

