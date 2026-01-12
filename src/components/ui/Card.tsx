import React, { ReactNode } from 'react';
import styles from './Card.module.css';
import { cn } from '@/lib/utils';

interface CardProps {
    children: ReactNode;
    className?: string;
    glass?: boolean;
    hover?: boolean;
}

export function Card({ children, className, glass, hover }: CardProps) {
    return (
        <div
            className={cn(
                styles.card,
                glass && styles.glass,
                hover && styles.hover,
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return <div className={cn(styles.header, className)}>{children}</div>;
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return <h3 className={cn(styles.title, className)}>{children}</h3>;
}

interface CardDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return <p className={cn(styles.description, className)}>{children}</p>;
}

interface CardBodyProps {
    children: ReactNode;
    className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
    return <div className={cn(styles.body, className)}>{children}</div>;
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return <div className={cn(styles.footer, className)}>{children}</div>;
}
