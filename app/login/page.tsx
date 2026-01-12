'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        cccd: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData);
            // Redirect is handled by AuthContext
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
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
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </div>
                            <CardTitle>Đăng Nhập</CardTitle>
                            <CardDescription>
                                Chào mừng bạn đến với Hệ thống Quản lý Phòng khám
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardBody>
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
                                label="Số CCCD"
                                name="cccd"
                                type="text"
                                placeholder="Nhập số CCCD (12 số)"
                                value={formData.cccd}
                                onChange={handleChange}
                                required
                                fullWidth
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="16" rx="2" />
                                        <line x1="7" y1="8" x2="17" y2="8" />
                                        <line x1="7" y1="12" x2="17" y2="12" />
                                        <line x1="7" y1="16" x2="13" y2="16" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Mật khẩu"
                                name="password"
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                fullWidth
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                }
                            />

                            <Button type="submit" fullWidth loading={loading} size="lg">
                                Đăng nhập
                            </Button>

                            <div className={styles.divider}>
                                <span>hoặc</span>
                            </div>

                            <Link href="/register" className={styles.registerLink}>
                                <Button type="button" variant="outline" fullWidth>
                                    Tạo tài khoản mới
                                </Button>
                            </Link>
                        </form>
                    </CardBody>
                </Card>

                <p className={styles.footer}>
                    © 2024 Clinic Management System. All rights reserved.
                </p>
            </div>
        </div>
    );
}
