'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import type { UserRole } from '@/types';
import styles from '../login/login.module.css';

// Chỉ cho phép đăng ký Patient - các role khác chỉ admin mới tạo được
const ROLE_OPTIONS = [
    { value: 'patient', label: 'Bệnh nhân', icon: '👤' },
];

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
    const [formData, setFormData] = useState({
        // Common fields
        fullName: '',
        email: '',
        phone: '',
        gender: 'male' as 'male' | 'female' | 'other',
        dateOfBirth: '',
        address: '',
        password: '',
        confirmPassword: '',
        // Patient fields
        cccd: '',
        // Doctor fields
        specialty: '',
        degree: '',
        birthYear: '',
        workExperience: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setStep(2);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const registerData: any = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
                address: formData.address,
                password: formData.password,
                role: selectedRole,
            };

            // Chỉ cho phép đăng ký patient
            registerData.cccd = formData.cccd;

            await register(registerData);

            // Redirect patients to medical profile page
            if (selectedRole === 'patient') {
                router.push('/patient/medical-profile?required=true');
            }
            // Redirect is handled by AuthContext for other roles
        } catch (err: any) {
            setError(err.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.background}>
                <div className={styles.gradientOrb1}></div>
                <div className={styles.gradientOrb2}></div>
                <div className={styles.gradientOrb3}></div>
            </div>

            <div className={styles.content}>
                <Card className={styles.card} glass>
                    <CardHeader>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                            </div>
                            <CardTitle>Đăng Ký Tài Khoản</CardTitle>
                            <CardDescription>
                                {step === 1 ? 'Chọn vai trò của bạn' : 'Điền thông tin cá nhân'}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardBody>
                        {step === 1 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {ROLE_OPTIONS.map((role) => (
                                    <button
                                        key={role.value}
                                        onClick={() => handleRoleSelect(role.value as UserRole)}
                                        style={{
                                            padding: 'var(--spacing-lg)',
                                            border: '2px solid var(--border-color)',
                                            borderRadius: 'var(--radius-lg)',
                                            background: 'var(--bg-primary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-md)',
                                            fontSize: 'var(--font-size-lg)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            transition: 'all var(--transition-base)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{role.icon}</span>
                                        <span>{role.label}</span>
                                    </button>
                                ))}
                                <Link href="/login" style={{ textDecoration: 'none', marginTop: 'var(--spacing-md)' }}>
                                    <Button variant="ghost" fullWidth>
                                        Đã có tài khoản? Đăng nhập
                                    </Button>
                                </Link>
                            </div>
                        ) : (
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

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                        Giới tính <span style={{ color: 'var(--color-error)' }}>*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            fontSize: 'var(--font-size-base)',
                                            border: '2px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>

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
                                    required
                                    fullWidth
                                />

                                <Input
                                    label="Mật khẩu"
                                    name="password"
                                    type="password"
                                    placeholder="Ít nhất 6 ký tự"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />

                                <Input
                                    label="Xác nhận mật khẩu"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />

                                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                    <Button type="button" variant="outline" onClick={() => setStep(1)} fullWidth>
                                        Quay lại
                                    </Button>
                                    <Button type="submit" fullWidth loading={loading}>
                                        Đăng ký
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardBody>
                </Card>

                <p className={styles.footer}>
                    © 2024 Clinic Management System. All rights reserved.
                </p>
            </div>
        </div>
    );
}
