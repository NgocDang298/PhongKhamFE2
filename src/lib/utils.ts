import { type ClassValue } from 'clsx';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

// ============= Class Name Utilities =============
export function cn(...inputs: ClassValue[]): string {
    return inputs.filter(Boolean).join(' ');
}

// ============= Date Formatting =============
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr, { locale: vi });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
}

export function formatDateTime(date: string | Date): string {
    return formatDate(date, 'dd/MM/yyyy HH:mm');
}

export function formatTime(date: string | Date): string {
    return formatDate(date, 'HH:mm');
}

export function formatDateForAPI(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

export function formatDateTimeForAPI(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

// ============= Currency Formatting =============
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('vi-VN').format(num);
}

// ============= Validation Helpers =============
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function isValidCCCD(cccd: string): boolean {
    const cccdRegex = /^[0-9]{12}$/;
    return cccdRegex.test(cccd);
}

// ============= String Utilities =============
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// ============= Array Utilities =============
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

// ============= Object Utilities =============
export function omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
}

export function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

// ============= Debounce =============
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============= Sleep =============
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============= Get Initials =============
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// ============= Color Utilities =============
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: '#f59e0b',
        confirmed: '#10b981',
        cancelled: '#ef4444',
        completed: '#6366f1',
        processing: '#3b82f6',
        done: '#10b981',
        waiting: '#f59e0b',
        paid: '#10b981',
        unpaid: '#ef4444',
    };
    return colors[status] || '#6b7280';
}

// ============= File Size Formatting =============
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============= Generate Random ID =============
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}
