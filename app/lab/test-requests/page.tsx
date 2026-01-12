'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { ROUTES, TEST_REQUEST_STATUS_LABELS } from '@/lib/constants';
import * as testRequestService from '@/lib/services/testRequests';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import styles from './page.module.css';

const navItems = [
    {
        label: 'Tổng quan',
        path: ROUTES.LAB_DASHBOARD,
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
        label: 'Yêu cầu xét nghiệm',
        path: ROUTES.LAB_TEST_REQUESTS,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        ),
    },
    {
        label: 'Kết quả xét nghiệm',
        path: ROUTES.LAB_TEST_RESULTS,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
];

export default function LabTestRequestsPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [testRequests, setTestRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role !== 'lab_nurse') {
            router.push('/login');
            return;
        }
        loadTestRequests();
    }, [user, isAuthenticated, authLoading, statusFilter, router]);

    const loadTestRequests = async () => {
        try {
            setLoading(true);
            const params: any = {};

            if (statusFilter) {
                params.status = statusFilter;
            }

            // Find LabNurse profile ID corresponding to current User ID
            if (user?._id) {
                try {
                    const labNursesRes = await directoryService.getNurses();
                    const labNurses = Array.isArray(labNursesRes) ? labNursesRes : (labNursesRes as any).data || [];

                    const myProfile = labNurses.find((nurse: any) => {
                        const nurseUserId = typeof nurse.userId === 'object' ? nurse.userId._id : nurse.userId;
                        return nurseUserId === user._id;
                    });

                    if (myProfile) {
                        params.labNurseId = myProfile._id;
                    }
                } catch (err) {
                    console.warn('Could not load lab nurse profile:', err);
                }
            }

            const response: any = await testRequestService.getTestRequests(params);
            const testRequests = response.data?.testRequests || response.testRequests || response.data || response || [];
            setTestRequests(testRequests);
        } catch (error) {
            console.error('Error loading test requests:', error);
            setTestRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'waiting' | 'processing' | 'completed') => {
        try {
            await testRequestService.updateTestRequestStatus(id, status);
            loadTestRequests();
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return '#f59e0b';
            case 'processing':
                return '#3b82f6';
            case 'completed':
                return '#10b981';
            default:
                return '#6b7280';
        }
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout navItems={navItems} title="Yêu cầu xét nghiệm">
                <div className={styles.loading}>Đang tải...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Yêu cầu xét nghiệm">
            <div className={styles.filters}>
                <div style={{ maxWidth: '300px' }}>
                    <Select
                        label="Lọc theo trạng thái"
                        options={[
                            { value: '', label: 'Tất cả' },
                            { value: 'waiting', label: 'Chờ xử lý' },
                            { value: 'processing', label: 'Đang xử lý' },
                            { value: 'completed', label: 'Hoàn thành' },
                        ]}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        fullWidth
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách yêu cầu xét nghiệm</CardTitle>
                </CardHeader>
                <CardBody>
                    {testRequests.length === 0 ? (
                        <div className={styles.empty}>Chưa có yêu cầu xét nghiệm nào</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bệnh nhân</TableHead>
                                    <TableHead>Loại xét nghiệm</TableHead>
                                    <TableHead>Ngày yêu cầu</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {testRequests.map((request) => (
                                    <TableRow key={request._id}>
                                        <TableCell>
                                            {request.examId && typeof request.examId === 'object' && (request.examId as any).patientId
                                                ? (typeof (request.examId as any).patientId === 'object'
                                                    ? (request.examId as any).patientId.fullName
                                                    : 'N/A')
                                                : (typeof request.patientId === 'object' && request.patientId
                                                    ? request.patientId.fullName
                                                    : 'N/A')}
                                        </TableCell>
                                        <TableCell>
                                            {typeof request.testType === 'object' && request.testType
                                                ? request.testType.name
                                                : request.testType || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(request.createdAt || ''), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={styles.statusBadge}
                                                style={{
                                                    backgroundColor: getStatusColor(request.status) + '20',
                                                    color: getStatusColor(request.status),
                                                }}
                                            >
                                                {TEST_REQUEST_STATUS_LABELS[request.status as keyof typeof TEST_REQUEST_STATUS_LABELS]}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className={styles.actions}>
                                                {request.status === 'waiting' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(request._id, 'processing')}
                                                    >
                                                        Bắt đầu
                                                    </Button>
                                                )}
                                                {request.status === 'processing' && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(request._id, 'completed')}
                                                    >
                                                        Hoàn thành
                                                    </Button>
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
        </DashboardLayout>
    );
}

