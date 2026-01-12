'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { ROUTES, BLOOD_TYPE_OPTIONS } from '@/lib/constants';
import * as medicalProfileService from '@/lib/services/medicalProfile';
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
];

export default function MedicalProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRequired = searchParams.get('required') === 'true';
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        bloodType: '' as '' | 'A' | 'B' | 'AB' | 'O',
        allergies: '',
        chronicDiseases: '',
        medications: '',
        surgeries: '',
        familyHistory: '',
        notes: '',
    });

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || user?.role !== 'patient') {
            router.push('/login');
            return;
        }
    }, [user, isAuthenticated, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const profileData: any = {};

            if (formData.bloodType) {
                profileData.bloodType = formData.bloodType;
            }

            // Convert comma-separated strings to arrays
            if (formData.allergies.trim()) {
                profileData.allergies = formData.allergies.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (formData.chronicDiseases.trim()) {
                profileData.chronicDiseases = formData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (formData.medications.trim()) {
                profileData.medications = formData.medications.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (formData.surgeries.trim()) {
                profileData.surgeries = formData.surgeries.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (formData.familyHistory.trim()) {
                profileData.familyHistory = formData.familyHistory.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (formData.notes.trim()) {
                profileData.notes = formData.notes;
            }

            await medicalProfileService.createOrGetMedicalProfile(profileData);

            // Redirect to dashboard after successful creation
            router.push(ROUTES.PATIENT_DASHBOARD);
        } catch (err: any) {
            setError(err.message || 'Không thể lưu hồ sơ y tế');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout navItems={navItems} title="Hồ sơ y tế">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {isRequired ? 'Hoàn thiện hồ sơ y tế' : 'Cập nhật hồ sơ y tế'}
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    {isRequired && (
                        <div className={styles.requiredNotice}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p>Vui lòng hoàn thiện hồ sơ y tế để tiếp tục sử dụng hệ thống.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <Select
                            label="Nhóm máu"
                            options={[
                                { value: '', label: 'Chọn nhóm máu (tùy chọn)' },
                                ...BLOOD_TYPE_OPTIONS
                            ]}
                            value={formData.bloodType}
                            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value as any })}
                            fullWidth
                        />

                        <Input
                            label="Dị ứng"
                            type="text"
                            placeholder="Ví dụ: Penicillin, Hải sản (phân cách bằng dấu phẩy)"
                            value={formData.allergies}
                            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                            helperText="Nhập các loại dị ứng, phân cách bằng dấu phẩy"
                            fullWidth
                        />

                        <Input
                            label="Bệnh mãn tính"
                            type="text"
                            placeholder="Ví dụ: Tiểu đường, Huyết áp cao (phân cách bằng dấu phẩy)"
                            value={formData.chronicDiseases}
                            onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                            helperText="Nhập các bệnh mãn tính, phân cách bằng dấu phẩy"
                            fullWidth
                        />

                        <Input
                            label="Thuốc đang dùng"
                            type="text"
                            placeholder="Ví dụ: Aspirin, Metformin (phân cách bằng dấu phẩy)"
                            value={formData.medications}
                            onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                            helperText="Nhập các loại thuốc đang sử dụng, phân cách bằng dấu phẩy"
                            fullWidth
                        />

                        <Input
                            label="Tiền sử phẫu thuật"
                            type="text"
                            placeholder="Ví dụ: Phẫu thuật ruột thừa 2020 (phân cách bằng dấu phẩy)"
                            value={formData.surgeries}
                            onChange={(e) => setFormData({ ...formData, surgeries: e.target.value })}
                            helperText="Nhập tiền sử phẫu thuật, phân cách bằng dấu phẩy"
                            fullWidth
                        />

                        <Input
                            label="Tiền sử gia đình"
                            type="text"
                            placeholder="Ví dụ: Cha bị tiểu đường, Mẹ bị huyết áp (phân cách bằng dấu phẩy)"
                            value={formData.familyHistory}
                            onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                            helperText="Nhập tiền sử bệnh trong gia đình, phân cách bằng dấu phẩy"
                            fullWidth
                        />

                        <Textarea
                            label="Ghi chú thêm"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Các thông tin y tế khác cần lưu ý..."
                            fullWidth
                        />

                        <div className={styles.actions}>
                            {!isRequired && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(ROUTES.PATIENT_DASHBOARD)}
                                >
                                    Hủy
                                </Button>
                            )}
                            <Button type="submit" loading={loading} fullWidth={isRequired}>
                                {isRequired ? 'Hoàn thành' : 'Lưu hồ sơ'}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </DashboardLayout>
    );
}
