'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { ROUTES, SERVICE_TYPE_OPTIONS, SERVICE_TYPE_LABELS } from '@/lib/constants';
import * as serviceService from '@/lib/services/services';
import { formatCurrency } from '@/lib/utils';
import styles from './page.module.css';

const navItems = [
    {
        label: 'Tổng quan',
        path: ROUTES.ADMIN_DASHBOARD,
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
        label: 'Quản lý tài khoản',
        path: ROUTES.ADMIN_USERS,
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
        label: 'Quản lý dịch vụ',
        path: ROUTES.ADMIN_SERVICES,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
            </svg>
        ),
    },
    {
        label: 'Quản lý lịch làm việc',
        path: ROUTES.ADMIN_SCHEDULES,
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
        label: 'Thống kê',
        path: ROUTES.ADMIN_STATISTICS,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
    },
];

export default function AdminServicesPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        serviceType: 'examination' as 'examination' | 'test' | 'other',
        price: '',
        description: '',
        isActive: true,
    });

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role !== 'admin') {
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await serviceService.createService({
                name: formData.name,
                serviceType: formData.serviceType,
                price: Number(formData.price),
                description: formData.description,
            });
            setIsModalOpen(false);
            setFormData({ name: '', serviceType: 'examination', price: '', description: '', isActive: true });
            loadServices();
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;
        try {
            await serviceService.updateService(selectedService._id, {
                name: formData.name,
                serviceType: formData.serviceType,
                price: Number(formData.price),
                description: formData.description,
                isActive: formData.isActive,
            });
            setIsEditModalOpen(false);
            setSelectedService(null);
            setFormData({ name: '', serviceType: 'examination', price: '', description: '', isActive: true });
            loadServices();
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
            return;
        }
        try {
            await serviceService.deleteService(id);
            loadServices();
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleOpenEditModal = (service: any) => {
        setSelectedService(service);
        setFormData({
            name: service.name,
            serviceType: service.serviceType,
            price: String(service.price),
            description: service.description || '',
            isActive: service.isActive !== false,
        });
        setIsEditModalOpen(true);
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout navItems={navItems} title="Quản lý dịch vụ">
                <div className={styles.loading}>Đang tải...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Quản lý dịch vụ">
            <div className={styles.header}>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    }
                >
                    Tạo dịch vụ mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách dịch vụ</CardTitle>
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
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Thao tác</TableHead>
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
                                        <TableCell>
                                            <span
                                                className={styles.statusBadge}
                                                style={{
                                                    backgroundColor: service.isActive !== false ? '#10b98120' : '#ef444420',
                                                    color: service.isActive !== false ? '#10b981' : '#ef4444',
                                                }}
                                            >
                                                {service.isActive !== false ? 'Hoạt động' : 'Vô hiệu'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className={styles.actions}>
                                                <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(service)}>
                                                    Sửa
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(service._id)}>
                                                    Xóa
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormData({ name: '', serviceType: 'examination', price: '', description: '', isActive: true });
                }}
                title="Tạo dịch vụ mới"
                size="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setFormData({ name: '', serviceType: 'examination', price: '', description: '', isActive: true });
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleCreate}>Tạo dịch vụ</Button>
                    </>
                }
            >
                <form onSubmit={handleCreate} className={styles.form}>
                    <Input
                        label="Tên dịch vụ"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        fullWidth
                    />
                    <Select
                        label="Loại dịch vụ"
                        name="serviceType"
                        options={SERVICE_TYPE_OPTIONS}
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as any })}
                        required
                        fullWidth
                    />
                    <Input
                        label="Giá (VND)"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        fullWidth
                    />
                    <Textarea
                        label="Mô tả"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
                        rows={3}
                    />
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedService(null);
                    setFormData({ name: '', serviceType: 'examination', price: '', description: '', isActive: true });
                }}
                title="Sửa dịch vụ"
                size="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setSelectedService(null);
                                setFormData({ name: '', serviceType: 'examination', price: '', description: '', isActive: true });
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleUpdate}>Cập nhật</Button>
                    </>
                }
            >
                <form onSubmit={handleUpdate} className={styles.form}>
                    <Input
                        label="Tên dịch vụ"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        fullWidth
                    />
                    <Select
                        label="Loại dịch vụ"
                        name="serviceType"
                        options={SERVICE_TYPE_OPTIONS}
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as any })}
                        required
                        fullWidth
                    />
                    <Input
                        label="Giá (VND)"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        fullWidth
                    />
                    <Textarea
                        label="Mô tả"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
                        rows={3}
                    />
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <span>Hoạt động</span>
                        </label>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}

