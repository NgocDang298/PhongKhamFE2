'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { ROUTES, INVOICE_STATUS_LABELS } from '@/lib/constants';
import * as invoiceService from '@/lib/services/invoices';
import { formatCurrency } from '@/lib/utils';
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

export default function PatientInvoicesPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role !== 'patient') {
            router.push('/login');
            return;
        }
        loadInvoices();
    }, [user, isAuthenticated, authLoading, statusFilter, router]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            if (!user?._id) return;
            const params: any = {};
            if (statusFilter) {
                params.status = statusFilter;
            }
            const response: any = await invoiceService.getPatientInvoices(user._id, params);
            const invoices = response.data?.invoices || response.invoices || response.data || response || [];
            setInvoices(invoices);
        } catch (error) {
            console.error('Error loading invoices:', error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout navItems={navItems} title="Hóa đơn của tôi">
                <div className={styles.loading}>Đang tải...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Hóa đơn của tôi">
            <div className={styles.filters}>
                <div style={{ maxWidth: '300px' }}>
                    <Select
                        label="Lọc theo trạng thái"
                        options={[
                            { value: '', label: 'Tất cả' },
                            { value: 'paid', label: 'Đã thanh toán' },
                            { value: 'unpaid', label: 'Chưa thanh toán' },
                        ]}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        fullWidth
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách hóa đơn</CardTitle>
                </CardHeader>
                <CardBody>
                    {invoices.length === 0 ? (
                        <div className={styles.empty}>Chưa có hóa đơn nào</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã hóa đơn</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead>Số lượng dịch vụ</TableHead>
                                    <TableHead>Tổng tiền</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice._id}>
                                        <TableCell>#{invoice.invoiceNumber || invoice._id.slice(-8)}</TableCell>
                                        <TableCell>
                                            {format(new Date(invoice.createdAt || ''), 'dd/MM/yyyy', { locale: vi })}
                                        </TableCell>
                                        <TableCell>{invoice.items?.length || 0}</TableCell>
                                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                                        <TableCell>
                                            <span
                                                className={styles.statusBadge}
                                                style={{
                                                    backgroundColor:
                                                        invoice.status === 'paid' ? '#10b98120' : '#ef444420',
                                                    color: invoice.status === 'paid' ? '#10b981' : '#ef4444',
                                                }}
                                            >
                                                {INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS]}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => {
                                                    setSelectedInvoice(invoice);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Invoice Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedInvoice(null);
                }}
                title="Chi tiết hóa đơn"
                size="lg"
                footer={
                    <button
                        className={styles.closeButton}
                        onClick={() => {
                            setIsModalOpen(false);
                            setSelectedInvoice(null);
                        }}
                    >
                        Đóng
                    </button>
                }
            >
                {selectedInvoice && (
                    <div className={styles.invoiceDetail}>
                        <div className={styles.invoiceHeader}>
                            <div>
                                <strong>Mã hóa đơn:</strong> #{selectedInvoice.invoiceNumber || selectedInvoice._id.slice(-8)}
                            </div>
                            <div>
                                <strong>Ngày tạo:</strong>{' '}
                                {format(new Date(selectedInvoice.createdAt || ''), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </div>
                            <div>
                                <strong>Trạng thái:</strong>{' '}
                                <span
                                    className={styles.statusBadge}
                                    style={{
                                        backgroundColor:
                                            selectedInvoice.status === 'paid' ? '#10b98120' : '#ef444420',
                                        color: selectedInvoice.status === 'paid' ? '#10b981' : '#ef4444',
                                    }}
                                >
                                    {INVOICE_STATUS_LABELS[selectedInvoice.status as keyof typeof INVOICE_STATUS_LABELS]}
                                </span>
                            </div>
                        </div>
                        {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                            <div className={styles.invoiceItems}>
                                <h4>Chi tiết dịch vụ</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tên dịch vụ</TableHead>
                                            <TableHead>Số lượng</TableHead>
                                            <TableHead>Đơn giá</TableHead>
                                            <TableHead>Thành tiền</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedInvoice.items.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {typeof item.serviceId === 'object' && item.serviceId
                                                        ? item.serviceId.name
                                                        : item.serviceName || 'N/A'}
                                                </TableCell>
                                                <TableCell>{item.quantity || 1}</TableCell>
                                                <TableCell>{formatCurrency(item.price)}</TableCell>
                                                <TableCell>{formatCurrency((item.quantity || 1) * item.price)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <div className={styles.invoiceTotal}>
                            <strong>Tổng cộng: {formatCurrency(selectedInvoice.totalAmount)}</strong>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}

