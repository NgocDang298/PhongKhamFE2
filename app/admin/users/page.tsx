'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPatients } from '@/lib/services/patients';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ROUTES, GENDER_OPTIONS } from '@/lib/constants';
import * as authLib from '@/lib/services/auth';
import * as directoryService from '@/lib/services/directory';
import type { UserRole, Doctor, Staff, LabNurse, Patient } from '@/types';
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
        label: 'Lịch làm việc',
        path: ROUTES.ADMIN_SCHEDULES,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
];

const ROLE_OPTIONS = [
    { value: 'doctor', label: 'Bác sĩ' },
    { value: 'staff', label: 'Nhân viên' },
    { value: 'lab_nurse', label: 'Y tá xét nghiệm' },
    { value: 'patient', label: 'Bệnh nhân' },
];

interface UserWithRole {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
    role: UserRole;
    specialty?: string;
    cccd?: string;
    userId: string | { _id: string;[key: string]: any };
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    address?: string;
    degree?: string;
    birthYear?: number;
    workExperience?: number;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
    const [loading, setLoading] = useState(false); // Used for create form
    const [error, setError] = useState('');
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [formData, setFormData] = useState({
        role: 'doctor' as UserRole,
        fullName: '',
        email: '',
        phone: '',
        gender: 'male' as 'male' | 'female' | 'other',
        dateOfBirth: '',
        address: '',
        password: '',
        cccd: '',
        // Doctor fields
        specialty: '',
        degree: '',
        birthYear: '',
        workExperience: '',
    });

    const handleViewUser = (user: UserWithRole) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    useEffect(() => {
        // Đợi auth loading hoàn tất trước khi check
        if (authLoading) return;

        if (!isAuthenticated || user?.role !== 'admin') {
            router.push('/login');
            return;
        }

        // Fetch users list
        fetchUsers();
    }, [user, isAuthenticated, authLoading, router]);

    const fetchUsers = async () => {
        setFetchLoading(true);
        setFetchError('');

        try {
            const [doctorsRes, staffsRes, nursesRes, patientsRes] = await Promise.all([
                directoryService.getDoctors(),
                directoryService.getStaffs(),
                directoryService.getNurses(),
                getPatients(),
            ]);

            console.log('Doctors:', doctorsRes);
            console.log('Staffs:', staffsRes);
            console.log('Nurses:', nursesRes);
            console.log('Patients:', patientsRes);

            const mapUserWithRole = (item: any, role: UserRole): UserWithRole => {
                const account = typeof item.userId === 'object' ? item.userId : {};
                return {
                    ...item,
                    role,
                    email: item.email || account.email || '',
                    cccd: item.cccd || account.cccd || '',
                    phone: item.phone || account.phone || account.sdt || '',
                    fullName: item.fullName || account.fullName || '',
                    gender: item.gender || account.gender || 'other',
                    dateOfBirth: item.dateOfBirth || account.dateOfBirth || '',
                    address: item.address || account.address || '',
                };
            };

            const allUsers: UserWithRole[] = [
                ...(doctorsRes.data || []).map((doc: Doctor) => mapUserWithRole(doc, 'doctor')),
                ...(staffsRes.data || []).map((staff: Staff) => mapUserWithRole(staff, 'staff')),
                ...(nursesRes.data || []).map((nurse: LabNurse) => mapUserWithRole(nurse, 'lab_nurse')),
                ...(patientsRes.data || []).map((patient: Patient) => mapUserWithRole(patient, 'patient')),
            ];

            console.log('Processed Users:', allUsers);

            setUsers(allUsers);
        } catch (err: any) {
            setFetchError(err.message || 'Không thể tải danh sách tài khoản');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as UserRole;
        setFormData({
            ...formData,
            role: newRole,
            // Reset role-specific fields
            specialty: '',
            degree: '',
            birthYear: '',
            workExperience: '',
            cccd: '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const registerData: any = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
                address: formData.address,
                password: formData.password || '123456', // Default password
                role: formData.role,
            };

            // Add CCCD for all roles
            if (formData.cccd) {
                registerData.cccd = formData.cccd;
            }

            // Add doctor-specific fields
            if (formData.role === 'doctor') {
                registerData.specialty = formData.specialty;
                if (formData.degree) registerData.degree = formData.degree;
                if (formData.birthYear) registerData.birthYear = parseInt(formData.birthYear);
                if (formData.workExperience) registerData.workExperience = parseInt(formData.workExperience);
            }

            await authLib.register(registerData);
            setIsModalOpen(false);
            resetForm();
            // Refresh users list
            fetchUsers();
            alert('Tạo tài khoản thành công!');
        } catch (err: any) {
            setError(err.message || 'Tạo tài khoản thất bại');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            role: 'doctor',
            fullName: '',
            email: '',
            phone: '',
            gender: 'male',
            dateOfBirth: '',
            address: '',
            password: '',
            cccd: '',
            specialty: '',
            degree: '',
            birthYear: '',
            workExperience: '',
        });
        setError('');
    };

    // Helper to get Account ID safely
    const getAccountId = (user: UserWithRole) => {
        if (typeof user.userId === 'object' && user.userId) {
            return user.userId._id;
        }
        return user.userId;
    };

    // Helper to get Profile ID label
    const getProfileIdLabel = (role: string) => {
        switch (role) {
            case 'doctor': return 'Mã bác sĩ';
            case 'staff': return 'Mã nhân viên';
            case 'lab_nurse': return 'Mã y tá';
            case 'patient': return 'Mã bệnh nhân';
            default: return 'Mã hồ sơ';
        }
    };

    return (
        <DashboardLayout navItems={navItems} title="Quản lý tài khoản">
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
                    Tạo tài khoản mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách tài khoản</CardTitle>
                </CardHeader>
                <CardBody>
                    {fetchLoading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Đang tải danh sách tài khoản...</p>
                        </div>
                    ) : fetchError ? (
                        <div className={styles.error}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {fetchError}
                            <Button onClick={fetchUsers} variant="outline" size="sm">
                                Thử lại
                            </Button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className={styles.empty}>
                            <p>Chưa có tài khoản nào trong hệ thống.</p>
                            <p>Hãy tạo tài khoản mới bằng nút "Tạo tài khoản mới" ở trên.</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.tableHeader}>
                                <div className={styles.tableInfo}>
                                    <span className={styles.badge}>{users.length} tài khoản</span>
                                </div>
                                <Button
                                    onClick={fetchUsers}
                                    variant="outline"
                                    size="sm"
                                    icon={
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="23 4 23 10 17 10" />
                                            <polyline points="1 20 1 14 7 14" />
                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                        </svg>
                                    }
                                >
                                    Làm mới
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vai trò</TableHead>
                                        <TableHead>Họ và tên</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Số điện thoại</TableHead>
                                        <TableHead>Thông tin khác</TableHead>
                                        <TableHead>Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell>
                                                <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                                                    {user.role === 'doctor' ? 'Bác sĩ' :
                                                        user.role === 'staff' ? 'Nhân viên' :
                                                            user.role === 'lab_nurse' ? 'Y tá xét nghiệm' :
                                                                'Bệnh nhân'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell>{user.email || '-'}</TableCell>
                                            <TableCell>{user.phone || '-'}</TableCell>
                                            <TableCell>
                                                {user.role === 'doctor' && user.specialty ? (
                                                    <span className={styles.specialty}>{user.specialty}</span>
                                                ) : user.cccd ? (
                                                    <span className={styles.cccd}>CCCD: {user.cccd}</span>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewUser(user)}
                                                    icon={
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                    }
                                                >
                                                    Xem
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    )}
                </CardBody>
            </Card>
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Chi tiết tài khoản"
                size="lg"
                footer={
                    <Button onClick={() => setIsDetailModalOpen(false)}>
                        Đóng
                    </Button>
                }
            >
                {selectedUser && (
                    <div className={styles.detailContainer}>
                        <div className={styles.detailSection}>
                            <h3 className={styles.detailTitle}>Thông tin chung</h3>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>{getProfileIdLabel(selectedUser.role)}</span>
                                    <span className={styles.detailValue} title={selectedUser._id}>{selectedUser._id}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Mã tài khoản (User ID)</span>
                                    <span className={styles.detailValue} title={getAccountId(selectedUser)}>{getAccountId(selectedUser)}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Họ và tên</span>
                                    <span className={styles.detailValue}>{selectedUser.fullName}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Vai trò</span>
                                    <span className={styles.detailValue}>
                                        <span className={`${styles.roleBadge} ${styles[selectedUser.role]}`}>
                                            {selectedUser.role === 'doctor' ? 'Bác sĩ' :
                                                selectedUser.role === 'staff' ? 'Nhân viên' :
                                                    selectedUser.role === 'patient' ? 'Bệnh nhân' :
                                                        'Y tá xét nghiệm'}
                                        </span>
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Email</span>
                                    <span className={styles.detailValue}>{selectedUser.email || '-'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Số điện thoại</span>
                                    <span className={styles.detailValue}>{selectedUser.phone || '-'}</span>
                                </div>

                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Giới tính</span>
                                    <span className={styles.detailValue}>
                                        {selectedUser.gender === 'male' ? 'Nam' :
                                            selectedUser.gender === 'female' ? 'Nữ' :
                                                selectedUser.gender === 'other' ? 'Khác' : '-'}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Ngày sinh</span>
                                    <span className={styles.detailValue}>
                                        {selectedUser.dateOfBirth
                                            ? new Date(selectedUser.dateOfBirth).toLocaleDateString('vi-VN')
                                            : '-'}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>CCCD</span>
                                    <span className={styles.detailValue}>{selectedUser.cccd || '-'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Địa chỉ</span>
                                    <span className={styles.detailValue}>{selectedUser.address || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {selectedUser.role === 'doctor' && (
                            <div className={styles.detailSection}>
                                <h3 className={styles.detailTitle}>Thông tin bác sĩ</h3>
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Chuyên khoa</span>
                                        <span className={styles.detailValue}>{selectedUser.specialty || '-'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Bằng cấp</span>
                                        <span className={styles.detailValue}>{selectedUser.degree || '-'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Năm sinh</span>
                                        <span className={styles.detailValue}>{selectedUser.birthYear || '-'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Kinh nghiệm</span>
                                        <span className={styles.detailValue}>
                                            {selectedUser.workExperience ? `${selectedUser.workExperience} năm` : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title="Tạo tài khoản mới"
                size="lg"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} loading={loading}>
                            Tạo tài khoản
                        </Button>
                    </>
                }
            >
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
                        label="Vai trò"
                        name="role"
                        options={ROLE_OPTIONS}
                        value={formData.role}
                        onChange={handleRoleChange}
                        required
                        fullWidth
                    />

                    <Input
                        label="Họ và tên"
                        name="fullName"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <Input
                        label="Số điện thoại"
                        name="phone"
                        type="tel"
                        placeholder="0987654321"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <Select
                        label="Giới tính"
                        name="gender"
                        options={GENDER_OPTIONS}
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <Input
                        label="Ngày sinh"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <Input
                        label="Địa chỉ"
                        name="address"
                        type="text"
                        placeholder="123 Đường ABC, Quận XYZ"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <Input
                        label="Số CCCD"
                        name="cccd"
                        type="text"
                        placeholder="12 số"
                        value={formData.cccd}
                        onChange={handleChange}
                        fullWidth
                        helperText="CCCD dùng để đăng nhập"
                    />

                    {formData.role === 'doctor' && (
                        <>
                            <Input
                                label="Chuyên khoa"
                                name="specialty"
                                type="text"
                                placeholder="Nội khoa, Ngoại khoa..."
                                value={formData.specialty}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                            <Input
                                label="Bằng cấp"
                                name="degree"
                                type="text"
                                placeholder="Bác sĩ, Thạc sĩ, Tiến sĩ..."
                                value={formData.degree}
                                onChange={handleChange}
                                fullWidth
                            />
                            <Input
                                label="Năm sinh"
                                name="birthYear"
                                type="number"
                                placeholder="1980"
                                value={formData.birthYear}
                                onChange={handleChange}
                                fullWidth
                            />
                            <Input
                                label="Số năm kinh nghiệm"
                                name="workExperience"
                                type="number"
                                placeholder="10"
                                value={formData.workExperience}
                                onChange={handleChange}
                                fullWidth
                            />
                        </>
                    )}

                    <Input
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        placeholder="Để trống sẽ dùng mật khẩu mặc định: 123456"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        helperText="Nếu để trống, mật khẩu mặc định là: 123456"
                    />
                </form>
            </Modal>
        </DashboardLayout>
    );
}

