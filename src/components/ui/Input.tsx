import React, { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, icon, fullWidth, className, ...props }, ref) => {
        return (
            <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
                {label && (
                    <label className={styles.label} htmlFor={props.id}>
                        {label}
                        {props.required && <span className={styles.required}>*</span>}
                    </label>
                )}
                <div className={styles.inputWrapper}>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    <input
                        ref={ref}
                        className={cn(
                            styles.input,
                            icon && styles.withIcon,
                            error && styles.error,
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <span className={styles.errorText}>{error}</span>}
                {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
