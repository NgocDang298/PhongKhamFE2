import React, { SelectHTMLAttributes, ReactNode } from 'react';
import styles from './Select.module.css';
import { cn } from '@/lib/utils';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: ReactNode;
    fullWidth?: boolean;
    options: readonly SelectOption[] | SelectOption[];
    placeholder?: string;
}

export default function Select({
    label,
    error,
    helperText,
    icon,
    fullWidth,
    options,
    placeholder,
    className,
    ...props
}: SelectProps) {
    return (
        <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
            {label && (
                <label className={styles.label} htmlFor={props.id}>
                    {label}
                    {props.required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={styles.selectWrapper}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <select
                    className={cn(
                        styles.select,
                        icon && styles.withIcon,
                        error && styles.error,
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
            {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
        </div>
    );
}

