import React from 'react';
import styles from './Badge.module.css';
import { cn } from '@/lib/utils';
import type { AppointmentStatus, ExaminationStatus, TestRequestStatus, InvoiceStatus } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    status?: AppointmentStatus | ExaminationStatus | TestRequestStatus | InvoiceStatus;
    className?: string;
}

function getVariantFromStatus(
    status: AppointmentStatus | ExaminationStatus | TestRequestStatus | InvoiceStatus
): BadgeVariant {
    const statusMap: Record<string, BadgeVariant> = {
        // Appointment
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'error',
        completed: 'info',
        // Examination
        processing: 'info',
        done: 'success',
        // Test Request
        waiting: 'warning',
        // Invoice
        paid: 'success',
        unpaid: 'error',
    };

    return statusMap[status] || 'default';
}

export default function Badge({ children, variant, status, className }: BadgeProps) {
    const badgeVariant = status ? getVariantFromStatus(status) : variant || 'default';

    return (
        <span className={cn(styles.badge, styles[badgeVariant], className)}>
            {children}
        </span>
    );
}
