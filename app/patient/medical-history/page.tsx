'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
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

export default function PatientMedicalHistoryPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [medicalHistory, setMedicalHistory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role !== 'patient') {
            router.push('/login');
            return;
        }
        loadMedicalHistory();
    }, [user, isAuthenticated, authLoading, router]);

    const loadMedicalHistory = async () => {
        try {
            setLoading(true);
            const response: any = await profileService.getMedicalHistory();
            const history = response.data || response || null;
            setMedicalHistory(history);
        } catch (error) {
            console.error('Error loading medical history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout navItems={navItems} title="Lịch sử khám bệnh">
                <div className={styles.loading}>Đang tải...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Lịch sử khám bệnh">
            <Card>
                <CardHeader>
                    <CardTitle>Hồ sơ y tế</CardTitle>
                </CardHeader>
                <CardBody>
                    {medicalHistory ? (
                        <div className={styles.medicalProfile}>
                            <div className={styles.section}>
                                <h3>Thông tin cơ bản</h3>
                                <div className={styles.infoGrid}>
                                    <div>
                                        <strong>Nhóm máu:</strong> {medicalHistory.bloodType || 'Chưa cập nhật'}
                                    </div>
                                </div>
                            </div>

                            {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
                                <div className={styles.section}>
                                    <h3>Dị ứng</h3>
                                    <ul>
                                        {medicalHistory.allergies.map((allergy: string, index: number) => (
                                            <li key={index}>{allergy}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {medicalHistory.chronicDiseases && medicalHistory.chronicDiseases.length > 0 && (
                                <div className={styles.section}>
                                    <h3>Bệnh mãn tính</h3>
                                    <ul>
                                        {medicalHistory.chronicDiseases.map((disease: string, index: number) => (
                                            <li key={index}>{disease}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {medicalHistory.medications && medicalHistory.medications.length > 0 && (
                                <div className={styles.section}>
                                    <h3>Thuốc đang dùng</h3>
                                    <ul>
                                        {medicalHistory.medications.map((med: string, index: number) => (
                                            <li key={index}>{med}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {medicalHistory.surgeries && medicalHistory.surgeries.length > 0 && (
                                <div className={styles.section}>
                                    <h3>Phẫu thuật</h3>
                                    <ul>
                                        {medicalHistory.surgeries.map((surgery: string, index: number) => (
                                            <li key={index}>{surgery}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {medicalHistory.familyHistory && medicalHistory.familyHistory.length > 0 && (
                                <div className={styles.section}>
                                    <h3>Tiền sử gia đình</h3>
                                    <ul>
                                        {medicalHistory.familyHistory.map((history: string, index: number) => (
                                            <li key={index}>{history}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {medicalHistory.notes && (
                                <div className={styles.section}>
                                    <h3>Ghi chú</h3>
                                    <p>{medicalHistory.notes}</p>
                                </div>
                            )}

                            {medicalHistory.examinations && medicalHistory.examinations.length > 0 && (
                                <div className={styles.section}>
                                    <h3>Lịch sử khám bệnh</h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ngày khám</TableHead>
                                                <TableHead>Bác sĩ</TableHead>
                                                <TableHead>Chẩn đoán</TableHead>
                                                <TableHead>Điều trị</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {medicalHistory.examinations.map((exam: any) => (
                                                <TableRow key={exam._id}>
                                                    <TableCell>
                                                        {format(new Date(exam.examDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {typeof exam.doctorId === 'object' && exam.doctorId
                                                            ? exam.doctorId.fullName
                                                            : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>{exam.diagnosis || '-'}</TableCell>
                                                    <TableCell>{exam.treatment || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.empty}>Chưa có thông tin lịch sử khám bệnh</div>
                    )}
                </CardBody>
            </Card>
        </DashboardLayout>
    );
}

