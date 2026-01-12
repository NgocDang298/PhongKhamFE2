import React, { TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export default function Textarea({
    label,
    error,
    helperText,
    fullWidth,
    className,
    ...props
}: TextareaProps) {
    return (
        <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
            {label && (
                <label className={styles.label} htmlFor={props.id}>
                    {label}
                    {props.required && <span className={styles.required}>*</span>}
                </label>
            )}
            <textarea
                className={cn(
                    styles.textarea,
                    error && styles.error,
                    className
                )}
                {...props}
            />
            {error && <span className={styles.errorText}>{error}</span>}
            {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
        </div>
    );
}

