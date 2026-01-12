'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ROUTES } from '@/lib/constants';
import * as profileService from '@/lib/services/profile';
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

export default function PatientProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        email: '',
    });

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role !== 'patient') {
            router.push('/login');
            return;
        }
        loadProfile();
    }, [user, isAuthenticated, authLoading, router]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response: any = await profileService.getProfile();
            const profileData = response.data || response || null;
            setProfile(profileData);
            setFormData({
                fullName: profileData?.fullName || '',
                phone: profileData?.phone || '',
                address: profileData?.address || '',
                email: profileData?.email || '',
            });
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await profileService.updateProfile(formData);
            setIsEditing(false);
            loadProfile();
            alert('Cập nhật thông tin thành công!');
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        }
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout navItems={navItems} title="Hồ sơ của tôi">
                <div className={styles.loading}>Đang tải...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Hồ sơ của tôi">
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardBody>
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className={styles.form}>
                            <Input
                                label="Họ và tên"
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                fullWidth
                            />
                            <Input
                                label="Số điện thoại"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                fullWidth
                            />
                            <Input
                                label="Địa chỉ"
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                fullWidth
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                fullWidth
                            />
                            <div className={styles.formActions}>
                                <Button type="submit">Lưu thay đổi</Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className={styles.profileInfo}>
                            <div className={styles.infoRow}>
                                <strong>Họ và tên:</strong> {profile?.fullName || '-'}
                            </div>
                            <div className={styles.infoRow}>
                                <strong>Số điện thoại:</strong> {profile?.phone || '-'}
                            </div>
                            <div className={styles.infoRow}>
                                <strong>Địa chỉ:</strong> {profile?.address || '-'}
                            </div>
                            <div className={styles.infoRow}>
                                <strong>Email:</strong> {profile?.email || '-'}
                            </div>
                            <div className={styles.infoRow}>
                                <strong>CCCD:</strong> {profile?.cccd || '-'}
                            </div>
                            {profile?.dateOfBirth && (
                                <div className={styles.infoRow}>
                                    <strong>Ngày sinh:</strong>{' '}
                                    {format(new Date(profile.dateOfBirth), 'dd/MM/yyyy', { locale: vi })}
                                </div>
                            )}
                            <div className={styles.infoRow}>
                                <strong>Giới tính:</strong>{' '}
                                {profile?.gender === 'male'
                                    ? 'Nam'
                                    : profile?.gender === 'female'
                                        ? 'Nữ'
                                        : profile?.gender || '-'}
                            </div>
                            <div className={styles.actions}>
                                <Button onClick={() => setIsEditing(true)}>Chỉnh sửa thông tin</Button>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </DashboardLayout>
    );
}

