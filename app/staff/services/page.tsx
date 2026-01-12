'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ROUTES, SERVICE_TYPE_LABELS } from '@/lib/constants';
import * as serviceService from '@/lib/services/services';
import { formatCurrency } from '@/lib/utils';
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

export default function StaffServicesPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || (user?.role !== 'staff' && user?.role !== 'admin')) {
            router.push('/login');
            return;
        }
        loadServices();
    }, [user, isAuthenticated, authLoading, router]);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response: any = await serviceService.getServices({});
            const services = response.data?.services || response.data || response || [];
            setServices(services);
        } catch (error) {
            console.error('Error loading services:', error);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout navItems={navItems} title="Danh sách dịch vụ">
                <div className={styles.loading}>Đang tải...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Danh sách dịch vụ">
            <Card>
                <CardHeader>
                    <CardTitle>Dịch vụ khám bệnh</CardTitle>
                </CardHeader>
                <CardBody>
                    {services.length === 0 ? (
                        <div className={styles.empty}>Chưa có dịch vụ nào</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tên dịch vụ</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Giá</TableHead>
                                    <TableHead>Mô tả</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.map((service) => (
                                    <TableRow key={service._id}>
                                        <TableCell>{service.name}</TableCell>
                                        <TableCell>
                                            {SERVICE_TYPE_LABELS[service.serviceType as keyof typeof SERVICE_TYPE_LABELS]}
                                        </TableCell>
                                        <TableCell>{formatCurrency(service.price)}</TableCell>
                                        <TableCell>{service.description || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>
        </DashboardLayout>
    );
}

