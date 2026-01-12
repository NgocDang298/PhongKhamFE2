'use client';

import React, { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS, ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import styles from './DashboardLayout.module.css';
import Button from '@/components/ui/Button';

interface NavItem {
    label: string;
    path: string;
    icon: ReactNode;
    roles?: string[];
}

interface DashboardLayoutProps {
    children: ReactNode;
    navItems: NavItem[];
    title: string;
}

export default function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const filteredNavItems = navItems.filter(
        (item) => !item.roles || (user && item.roles.includes(user.role))
    );

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className={styles.container}>
            <aside className={cn(styles.sidebar, sidebarOpen && styles.sidebarOpen)}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                        <span className={styles.logoText}>Clinic System</span>
                    </div>
                    <button
                        className={styles.sidebarToggle}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>

                <nav className={styles.nav}>
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                        return (
                            <button
                                key={item.path}
                                className={cn(styles.navItem, isActive && styles.navItemActive)}
                                onClick={() => router.push(item.path)}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={styles.navLabel}>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>{user?.fullName || 'User'}</div>
                            <div className={styles.userRole}>
                                {user ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : ''}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        }
                        fullWidth
                    >
                        Đăng xuất
                    </Button>
                </div>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                </header>
                <div className={styles.content}>{children}</div>
            </main>
        </div>
    );
}

